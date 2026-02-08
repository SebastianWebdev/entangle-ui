import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import styled from '@emotion/styled';
import { processCss } from '@/utils/styledUtils';
import type { Theme } from '@/theme/types';
import type {
  PanelConfig,
  SplitDirection,
  SplitPaneProps,
} from './SplitPane.types';

// ---------------------------------------------------------------------------
// Styled components
// ---------------------------------------------------------------------------

interface StyledContainerProps {
  $direction: SplitDirection;
  $css?: SplitPaneProps['css'];
}

const StyledContainer = styled.div<StyledContainerProps>`
  display: flex;
  flex-direction: ${props =>
    props.$direction === 'horizontal' ? 'row' : 'column'};
  width: 100%;
  height: 100%;
  overflow: hidden;
  ${props => processCss(props.$css, props.theme as Theme)}
`;

interface StyledDividerProps {
  $direction: SplitDirection;
  $size: number;
  $isDragging: boolean;
}

const StyledDivider = styled.div<StyledDividerProps>`
  flex: 0 0 ${props => props.$size}px;
  background: ${props => (props.theme as Theme).colors.border.default};
  cursor: ${props =>
    props.$direction === 'horizontal' ? 'col-resize' : 'row-resize'};
  transition: background-color
    ${props => (props.theme as Theme).transitions.fast};
  user-select: none;
  touch-action: none;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  z-index: 1;

  &:hover,
  &:focus-visible {
    background: ${props => (props.theme as Theme).colors.accent.primary};
    outline: none;
  }

  ${props =>
    props.$isDragging &&
    `background: ${(props.theme as Theme).colors.accent.primary};`}
`;

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
function clampSizes(sizes: number[], panels: PanelConfig[]): number[] {
  return sizes.map((size, i) => {
    const cfg = panels[i];
    if (!cfg) return size;
    let clamped = size;
    if (cfg.minSize !== undefined) clamped = Math.max(clamped, cfg.minSize);
    if (cfg.maxSize !== undefined) clamped = Math.min(clamped, cfg.maxSize);
    return clamped;
  });
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
  css,
  style,
  ref,
  ...htmlProps
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [internalSizes, setInternalSizes] = useState<number[]>([]);
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);

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
      setInternalSizes(prev => {
        if (prev.length === count && prev.length > 0) {
          // Proportionally redistribute on container resize
          const prevTotal = prev.reduce((a, b) => a + b, 0);
          if (prevTotal <= 0) {
            return computeInitialSizes(count, cfgs, availableSpace);
          }
          const ratio = availableSpace / prevTotal;
          const newSizes = prev.map(s => s * ratio);
          return clampSizes(newSizes, cfgs);
        }
        return clampSizes(
          computeInitialSizes(count, cfgs, availableSpace),
          cfgs
        );
      });
    }
  }, []);

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

      let newLeft = startLeft + delta;
      let newRight = startRight - delta;

      // Clamp to min/max
      const leftCfg = panelConfigs[leftIndex];
      const rightCfg = panelConfigs[rightIndex];

      const leftMin = leftCfg?.minSize ?? 0;
      const leftMax = leftCfg?.maxSize ?? Infinity;
      const rightMin = rightCfg?.minSize ?? 0;
      const rightMax = rightCfg?.maxSize ?? Infinity;

      // Collapse handling
      if (leftCfg?.collapsible) {
        const threshold = leftCfg.collapseThreshold ?? leftMin / 2;
        if (newLeft < threshold && newLeft < leftMin) {
          const leftWas = newLeft;
          newLeft = 0;
          newRight = startRight + startLeft - newLeft;
          if (leftWas > 0) {
            onCollapseChange?.(leftIndex, true);
          }
        }
      }

      if (rightCfg?.collapsible) {
        const threshold = rightCfg.collapseThreshold ?? rightMin / 2;
        if (newRight < threshold && newRight < rightMin) {
          const rightWas = newRight;
          newRight = 0;
          newLeft = startLeft + startRight - newRight;
          if (rightWas > 0) {
            onCollapseChange?.(rightIndex, true);
          }
        }
      }

      // Apply min/max after collapse logic (but only if not collapsed to 0)
      if (newLeft > 0) {
        newLeft = Math.max(leftMin, Math.min(leftMax, newLeft));
      }
      if (newRight > 0) {
        newRight = Math.max(rightMin, Math.min(rightMax, newRight));
      }

      const newSizes = [...startSizes];
      newSizes[leftIndex] = newLeft;
      newSizes[rightIndex] = newRight;

      if (!isControlled) {
        setInternalSizes(newSizes);
      }
      onResize?.(newSizes);
    },
    [
      draggingIndex,
      direction,
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
            onCollapseChange?.(leftIndex, false);
          } else {
            // Collapse
            currentSizes[rightIndex] = curRight + curLeft;
            currentSizes[leftIndex] = 0;
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

      if (!isControlled) {
        setInternalSizes(newSizes);
      }
      onResize?.(newSizes);
    },
    [
      direction,
      sizes,
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
        <StyledDivider
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
          $direction={direction}
          $size={dividerSize}
          $isDragging={draggingIndex === i}
          onPointerDown={e => handlePointerDown(i, e)}
          onPointerMove={e => handlePointerMove(i, e)}
          onPointerUp={e => handlePointerUp(i, e)}
          onKeyDown={e => handleKeyDown(i, e)}
        />
      );
    }
  });

  return (
    <StyledContainer
      ref={setContainerRef}
      className={className}
      data-testid={testId}
      $direction={direction}
      $css={css}
      style={style}
      {...htmlProps}
    >
      {elements}
    </StyledContainer>
  );
};

SplitPane.displayName = 'SplitPane';
