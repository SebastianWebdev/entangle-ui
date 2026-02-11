'use client';

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { cx } from '@/utils/cx';
import { assignInlineVars } from '@vanilla-extract/dynamic';
import type { PanelConfig, SplitPaneProps } from './SplitPane.types';
import {
  containerRecipe,
  dividerRecipe,
  dividerSizeVar,
} from './SplitPane.css';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Parse a PanelConfig defaultSize into a pixel value given the available space.
 * Returns `undefined` when no explicit default is given.
 */
function parseDefaultSize(
  defaultSize: PanelConfig['defaultSize'],
  availableSpace: number
): number | undefined {
  if (defaultSize === undefined) return undefined;
  if (typeof defaultSize === 'number') return defaultSize;
  // Handle percentage strings like "30%"
  if (defaultSize.endsWith('%')) {
    const pct = parseFloat(defaultSize);
    if (!Number.isNaN(pct)) return (pct / 100) * availableSpace;
  }
  return undefined;
}

/**
 * Calculate initial sizes from panel configs and available space.
 */
function computeInitialSizes(
  panelCount: number,
  panels: PanelConfig[],
  availableSpace: number
): number[] {
  const sizes: (number | undefined)[] = Array.from(
    { length: panelCount },
    (_, i) => {
      const cfg = panels[i];
      if (!cfg) return undefined;
      return parseDefaultSize(cfg.defaultSize, availableSpace);
    }
  );

  let allocated = 0;
  let unspecifiedCount = 0;
  for (let i = 0; i < panelCount; i++) {
    if (sizes[i] !== undefined) {
      allocated += sizes[i] as number;
    } else {
      unspecifiedCount++;
    }
  }

  const remaining = Math.max(0, availableSpace - allocated);
  const perUnspecified =
    unspecifiedCount > 0 ? remaining / unspecifiedCount : 0;

  return sizes.map(s => s ?? perUnspecified);
}

/**
 * Clamp sizes to min/max constraints in the panel configs.
 */
function clampSizes(
  sizes: number[],
  panels: PanelConfig[],
  collapsed?: Set<number>
): number[] {
  return sizes.map((size, i) => {
    const cfg = panels[i];
    if (!cfg) return size;
    let clamped = size;
    if (cfg.minSize !== undefined && !collapsed?.has(i))
      clamped = Math.max(clamped, cfg.minSize);
    if (cfg.maxSize !== undefined) clamped = Math.min(clamped, cfg.maxSize);
    return clamped;
  });
}

/**
 * Snap panel sizes to whole pixels while preserving total width/height.
 * This avoids sub-pixel rounding gaps (often visible as a 1-2px seam).
 */
function snapSizesToWholePixels(
  sizes: number[],
  panels: PanelConfig[],
  availableSpace: number
): number[] {
  const targetTotal = Math.max(0, Math.round(availableSpace));
  const floored = sizes.map(size => Math.max(0, Math.floor(size)));
  const fractions = sizes.map((size, i) => ({
    index: i,
    fraction: Math.max(0, size - (floored[i] ?? 0)),
  }));
  const snapped = [...floored];

  let delta = targetTotal - snapped.reduce((sum, size) => sum + size, 0);

  if (delta > 0) {
    const growOrder = [...fractions].sort((a, b) => {
      if (b.fraction !== a.fraction) return b.fraction - a.fraction;
      return b.index - a.index;
    });

    while (delta > 0) {
      let changed = false;
      for (const { index } of growOrder) {
        if (delta <= 0) break;
        const max = panels[index]?.maxSize ?? Infinity;
        const current = snapped[index] ?? 0;
        if (current + 1 > max) continue;
        snapped[index] = current + 1;
        delta -= 1;
        changed = true;
      }
      if (!changed) break;
    }
  } else if (delta < 0) {
    delta = -delta;
    const shrinkOrder = [...fractions].sort((a, b) => {
      if (a.fraction !== b.fraction) return a.fraction - b.fraction;
      return b.index - a.index;
    });

    while (delta > 0) {
      let changed = false;
      for (const { index } of shrinkOrder) {
        if (delta <= 0) break;
        const min = panels[index]?.minSize ?? 0;
        const current = snapped[index] ?? 0;
        if (current - 1 < min) continue;
        snapped[index] = current - 1;
        delta -= 1;
        changed = true;
      }
      if (!changed) break;
    }
  }

  return snapped;
}

/**
 * Ensures panel sizes fill the available space exactly.
 * Handles small floating-point drift and rounding leftovers by distributing
 * the remaining pixels across panels that can still grow/shrink.
 */
function reconcileSizesToAvailableSpace(
  sizes: number[],
  panels: PanelConfig[],
  availableSpace: number,
  collapsed?: Set<number>
): number[] {
  const adjusted = clampSizes(sizes, panels, collapsed);
  let remaining =
    availableSpace - adjusted.reduce((sum, size) => sum + size, 0);

  // Ignore tiny floating-point noise.
  if (Math.abs(remaining) < 0.01) {
    return snapSizesToWholePixels(adjusted, panels, availableSpace);
  }

  // Try to consume remainder from right to left so right-most panel
  // naturally absorbs visual rounding leftovers.
  for (let i = adjusted.length - 1; i >= 0; i--) {
    if (Math.abs(remaining) < 0.01) break;

    const cfg = panels[i];
    const min = cfg?.minSize ?? 0;
    const max = cfg?.maxSize ?? Infinity;
    const current = adjusted[i] ?? 0;

    if (remaining > 0) {
      const room = max - current;
      if (room <= 0) continue;
      const delta = Math.min(room, remaining);
      adjusted[i] = current + delta;
      remaining -= delta;
      continue;
    }

    const room = current - min;
    if (room <= 0) continue;
    const delta = Math.min(room, -remaining);
    adjusted[i] = current - delta;
    remaining += delta;
  }

  return snapSizesToWholePixels(adjusted, panels, availableSpace);
}

const KEYBOARD_STEP = 10;
const KEYBOARD_LARGE_STEP = 50;

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * A resizable split-pane layout component.
 *
 * Divides space between two or more child panels with draggable dividers.
 * Supports horizontal and vertical directions, controlled and uncontrolled
 * modes, collapsible panels, and keyboard-accessible dividers.
 *
 * @example
 * ```tsx
 * <SplitPane direction="horizontal">
 *   <SplitPanePanel>Left</SplitPanePanel>
 *   <SplitPanePanel>Right</SplitPanePanel>
 * </SplitPane>
 * ```
 */
export const SplitPane: React.FC<SplitPaneProps> = ({
  direction = 'horizontal',
  panels: panelConfigs = [],
  sizes: controlledSizes,
  dividerSize = 4,
  children,
  onResize,
  onResizeEnd,
  onCollapseChange,
  className,
  testId,
  style,
  ref,
  ...htmlProps
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [internalSizes, setInternalSizes] = useState<number[]>([]);
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);
  const collapsedRef = useRef<Set<number>>(new Set());

  // Refs for drag tracking
  const dragStartPos = useRef(0);
  const dragStartSizes = useRef<number[]>([]);

  // Extract panel children
  const panelChildren = React.Children.toArray(children);
  const panelCount = panelChildren.length;

  // Which sizes array to use
  const isControlled = controlledSizes !== undefined;
  const sizes = isControlled ? controlledSizes : internalSizes;

  // Stable reference to panelConfigs for use in effects/callbacks
  const panelConfigsKey = JSON.stringify(panelConfigs);
  const stablePanelConfigs = useMemo(() => panelConfigs, [panelConfigsKey]);

  // Keep a ref so the ResizeObserver callback always reads latest values
  const latestRef = useRef({
    panelCount,
    dividerSize,
    direction,
    isControlled,
    panelConfigs: stablePanelConfigs,
  });
  latestRef.current = {
    panelCount,
    dividerSize,
    direction,
    isControlled,
    panelConfigs: stablePanelConfigs,
  };

  // -----------------------------------------------------------------------
  // Initial size calculation + ResizeObserver
  // -----------------------------------------------------------------------

  const recalculate = useCallback(() => {
    const container = containerRef.current;
    const {
      panelCount: count,
      dividerSize: dSize,
      direction: dir,
      isControlled: ctrl,
      panelConfigs: cfgs,
    } = latestRef.current;
    if (!container || count < 2) return;

    const totalDividerSpace = (count - 1) * dSize;
    const containerDim =
      dir === 'horizontal' ? container.clientWidth : container.clientHeight;
    const availableSpace = Math.max(0, containerDim - totalDividerSpace);

    if (!ctrl) {
      const collapsed = collapsedRef.current;
      setInternalSizes(prev => {
        if (prev.length === count && prev.length > 0) {
          // Proportionally redistribute on container resize
          const prevTotal = prev.reduce((a, b) => a + b, 0);
          if (prevTotal <= 0) {
            return reconcileSizesToAvailableSpace(
              computeInitialSizes(count, cfgs, availableSpace),
              cfgs,
              availableSpace,
              collapsed
            );
          }
          const ratio = availableSpace / prevTotal;
          const newSizes = prev.map((s, i) =>
            collapsed.has(i) ? 0 : s * ratio
          );
          return reconcileSizesToAvailableSpace(
            newSizes,
            cfgs,
            availableSpace,
            collapsed
          );
        }
        return reconcileSizesToAvailableSpace(
          computeInitialSizes(count, cfgs, availableSpace),
          cfgs,
          availableSpace,
          collapsed
        );
      });
    }
  }, []);

  const getAvailableSpace = useCallback((): number | null => {
    const container = containerRef.current;
    if (!container || panelCount < 2) return null;

    const containerDim =
      direction === 'horizontal'
        ? container.clientWidth
        : container.clientHeight;
    if (containerDim <= 0) return null;
    const totalDividerSpace = (panelCount - 1) * dividerSize;
    return Math.max(0, containerDim - totalDividerSpace);
  }, [direction, dividerSize, panelCount]);

  useEffect(() => {
    recalculate();

    const container = containerRef.current;
    if (!container || typeof ResizeObserver === 'undefined') return;

    const ro = new ResizeObserver(() => {
      recalculate();
    });
    ro.observe(container);

    return () => {
      ro.disconnect();
    };
  }, [
    recalculate,
    panelCount,
    dividerSize,
    direction,
    isControlled,
    stablePanelConfigs,
  ]);

  // -----------------------------------------------------------------------
  // Pointer resize handlers
  // -----------------------------------------------------------------------

  const handlePointerDown = useCallback(
    (dividerIndex: number, e: React.PointerEvent<HTMLDivElement>) => {
      e.preventDefault();
      (e.target as HTMLElement).setPointerCapture(e.pointerId);

      setDraggingIndex(dividerIndex);
      dragStartPos.current = direction === 'horizontal' ? e.clientX : e.clientY;
      dragStartSizes.current = [...sizes];
    },
    [direction, sizes]
  );

  const handlePointerMove = useCallback(
    (dividerIndex: number, e: React.PointerEvent<HTMLDivElement>) => {
      if (draggingIndex !== dividerIndex) return;

      const currentPos = direction === 'horizontal' ? e.clientX : e.clientY;
      const delta = currentPos - dragStartPos.current;

      const startSizes = dragStartSizes.current;
      const leftIndex = dividerIndex;
      const rightIndex = dividerIndex + 1;

      const startLeft = startSizes[leftIndex] ?? 0;
      const startRight = startSizes[rightIndex] ?? 0;

      const leftCfg = panelConfigs[leftIndex];
      const rightCfg = panelConfigs[rightIndex];

      const leftMin = leftCfg?.minSize ?? 0;
      const leftMax = leftCfg?.maxSize ?? Infinity;
      const rightMin = rightCfg?.minSize ?? 0;
      const rightMax = rightCfg?.maxSize ?? Infinity;

      const totalSize = startLeft + startRight;

      // Raw sizes (unclamped) — used for collapse threshold detection
      const rawLeft = startLeft + delta;
      const rawRight = startRight - delta;

      // Clamp to [0, totalSize] to prevent overflow
      let newLeft = Math.max(0, Math.min(totalSize, rawLeft));
      let newRight = totalSize - newLeft;

      // Collapse / expand handling
      let leftCollapsed = false;
      let rightCollapsed = false;

      if (leftCfg?.collapsible) {
        const threshold = leftCfg.collapseThreshold ?? leftMin / 2;
        if (rawLeft < threshold) {
          leftCollapsed = true;
          if (startLeft > 0) {
            onCollapseChange?.(leftIndex, true);
          }
        } else if (startLeft === 0 && rawLeft >= leftMin) {
          // Expanding from collapsed state
          onCollapseChange?.(leftIndex, false);
        }
      }

      if (rightCfg?.collapsible) {
        const threshold = rightCfg.collapseThreshold ?? rightMin / 2;
        if (rawRight < threshold) {
          rightCollapsed = true;
          if (startRight > 0) {
            onCollapseChange?.(rightIndex, true);
          }
        } else if (startRight === 0 && rawRight >= rightMin) {
          // Expanding from collapsed state
          onCollapseChange?.(rightIndex, false);
        }
      }

      // Apply collapse or min/max with coupled clamping
      if (leftCollapsed) {
        newLeft = 0;
        newRight = totalSize;
      } else if (rightCollapsed) {
        newRight = 0;
        newLeft = totalSize;
      } else {
        // Clamp left, then recompute right
        newLeft = Math.max(leftMin, Math.min(leftMax, newLeft));
        newRight = totalSize - newLeft;

        // If right violates its constraints, clamp it and recompute left
        if (newRight < rightMin) {
          newRight = rightMin;
          newLeft = totalSize - newRight;
        } else if (newRight > rightMax) {
          newRight = rightMax;
          newLeft = totalSize - newRight;
        }
      }

      // Update collapsed tracking
      const collapsed = new Set(collapsedRef.current);
      if (leftCollapsed) {
        collapsed.add(leftIndex);
      } else {
        collapsed.delete(leftIndex);
      }
      if (rightCollapsed) {
        collapsed.add(rightIndex);
      } else {
        collapsed.delete(rightIndex);
      }
      collapsedRef.current = collapsed;

      const newSizes = [...startSizes];
      newSizes[leftIndex] = newLeft;
      newSizes[rightIndex] = newRight;
      const availableSpace = getAvailableSpace();
      const nextSizes =
        availableSpace !== null && availableSpace > 0
          ? reconcileSizesToAvailableSpace(
              newSizes,
              panelConfigs,
              availableSpace,
              collapsed
            )
          : newSizes;

      if (!isControlled) {
        setInternalSizes(nextSizes);
      }
      onResize?.(nextSizes);
    },
    [
      draggingIndex,
      direction,
      getAvailableSpace,
      panelConfigs,
      isControlled,
      onResize,
      onCollapseChange,
    ]
  );

  const handlePointerUp = useCallback(
    (_dividerIndex: number, e: React.PointerEvent<HTMLDivElement>) => {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
      setDraggingIndex(null);

      if (isControlled && controlledSizes) {
        onResizeEnd?.(controlledSizes);
      } else {
        onResizeEnd?.(internalSizes);
      }
    },
    [isControlled, controlledSizes, internalSizes, onResizeEnd]
  );

  // -----------------------------------------------------------------------
  // Keyboard handler on dividers
  // -----------------------------------------------------------------------

  const handleKeyDown = useCallback(
    (dividerIndex: number, e: React.KeyboardEvent<HTMLDivElement>) => {
      const isHorizontal = direction === 'horizontal';
      let delta = 0;

      const positiveKey = isHorizontal ? 'ArrowRight' : 'ArrowDown';
      const negativeKey = isHorizontal ? 'ArrowLeft' : 'ArrowUp';

      if (e.key === positiveKey) {
        delta = e.shiftKey ? KEYBOARD_LARGE_STEP : KEYBOARD_STEP;
      } else if (e.key === negativeKey) {
        delta = -(e.shiftKey ? KEYBOARD_LARGE_STEP : KEYBOARD_STEP);
      } else if (e.key === 'Enter') {
        // Toggle collapse on the left panel if collapsible
        const leftCfg = panelConfigs[dividerIndex];
        if (leftCfg?.collapsible) {
          e.preventDefault();
          const currentSizes = [...sizes];
          const leftIndex = dividerIndex;
          const rightIndex = dividerIndex + 1;

          const curLeft = currentSizes[leftIndex] ?? 0;
          const curRight = currentSizes[rightIndex] ?? 0;

          if (curLeft === 0) {
            // Expand: restore to minSize
            const restoreSize = leftCfg.minSize ?? 100;
            currentSizes[leftIndex] = restoreSize;
            currentSizes[rightIndex] = curRight - restoreSize;
            collapsedRef.current = new Set(
              [...collapsedRef.current].filter(i => i !== leftIndex)
            );
            onCollapseChange?.(leftIndex, false);
          } else {
            // Collapse
            currentSizes[rightIndex] = curRight + curLeft;
            currentSizes[leftIndex] = 0;
            collapsedRef.current = new Set([
              ...collapsedRef.current,
              leftIndex,
            ]);
            onCollapseChange?.(leftIndex, true);
          }

          if (!isControlled) {
            setInternalSizes(currentSizes);
          }
          onResize?.(currentSizes);
          onResizeEnd?.(currentSizes);
        }
        return;
      } else {
        return;
      }

      e.preventDefault();

      const leftIndex = dividerIndex;
      const rightIndex = dividerIndex + 1;

      const newSizes = [...sizes];
      let left = (newSizes[leftIndex] ?? 0) + delta;
      let right = (newSizes[rightIndex] ?? 0) - delta;

      // Clamp
      const leftCfg = panelConfigs[leftIndex];
      const rightCfg = panelConfigs[rightIndex];
      const leftMin = leftCfg?.minSize ?? 0;
      const leftMax = leftCfg?.maxSize ?? Infinity;
      const rightMin = rightCfg?.minSize ?? 0;
      const rightMax = rightCfg?.maxSize ?? Infinity;

      if (left < leftMin) {
        right += left - leftMin;
        left = leftMin;
      }
      if (left > leftMax) {
        right += left - leftMax;
        left = leftMax;
      }
      if (right < rightMin) {
        left += right - rightMin;
        right = rightMin;
      }
      if (right > rightMax) {
        left += right - rightMax;
        right = rightMax;
      }

      newSizes[leftIndex] = left;
      newSizes[rightIndex] = right;
      const availableSpace = getAvailableSpace();
      const nextSizes =
        availableSpace !== null && availableSpace > 0
          ? reconcileSizesToAvailableSpace(
              newSizes,
              panelConfigs,
              availableSpace
            )
          : newSizes;

      if (!isControlled) {
        setInternalSizes(nextSizes);
      }
      onResize?.(nextSizes);
    },
    [
      direction,
      sizes,
      getAvailableSpace,
      panelConfigs,
      isControlled,
      onResize,
      onResizeEnd,
      onCollapseChange,
    ]
  );

  // -----------------------------------------------------------------------
  // Merge refs
  // -----------------------------------------------------------------------

  const setContainerRef = useCallback(
    (node: HTMLDivElement | null) => {
      containerRef.current = node;
      if (typeof ref === 'function') {
        ref(node);
      } else if (ref && typeof ref === 'object') {
        (ref as React.MutableRefObject<HTMLDivElement | null>).current = node;
      }
    },
    [ref]
  );

  // -----------------------------------------------------------------------
  // Render
  // -----------------------------------------------------------------------

  const elements: React.ReactNode[] = [];

  panelChildren.forEach((child, i) => {
    // Panel wrapper with controlled sizing
    const panelSize = sizes[i] ?? 0;
    const panelStyle: React.CSSProperties = {
      flex: `0 0 ${panelSize}px`,
      overflow: panelSize === 0 ? 'hidden' : undefined,
      [direction === 'horizontal' ? 'width' : 'height']: `${panelSize}px`,
      minWidth: direction === 'horizontal' ? 0 : undefined,
      minHeight: direction === 'vertical' ? 0 : undefined,
    };

    elements.push(
      <div
        key={`panel-${i}`}
        style={panelStyle}
        data-splitpane-panel-wrapper=""
      >
        {child}
      </div>
    );

    // Add divider between panels
    if (i < panelCount - 1) {
      const leftSize = sizes[i] ?? 0;
      const leftCfg = panelConfigs[i];

      elements.push(
        <div
          key={`divider-${i}`}
          role="separator"
          tabIndex={0}
          aria-orientation={
            direction === 'horizontal' ? 'vertical' : 'horizontal'
          }
          aria-valuenow={Math.round(leftSize)}
          aria-valuemin={leftCfg?.minSize ?? 0}
          aria-valuemax={leftCfg?.maxSize ?? undefined}
          aria-label="Panel divider"
          data-testid={testId ? `${testId}-divider-${i}` : undefined}
          className={dividerRecipe({
            direction,
            isDragging: draggingIndex === i || undefined,
          })}
          style={assignInlineVars({
            [dividerSizeVar]: `${dividerSize}px`,
          })}
          onPointerDown={e => handlePointerDown(i, e)}
          onPointerMove={e => handlePointerMove(i, e)}
          onPointerUp={e => handlePointerUp(i, e)}
          onKeyDown={e => handleKeyDown(i, e)}
        />
      );
    }
  });

  return (
    <div
      ref={setContainerRef}
      className={cx(containerRecipe({ direction }), className)}
      data-testid={testId}
      style={style}
      {...htmlProps}
    >
      {elements}
    </div>
  );
};

SplitPane.displayName = 'SplitPane';
