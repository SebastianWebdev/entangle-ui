'use client';

import React, {
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';
import { assignInlineVars } from '@vanilla-extract/dynamic';
import { clamp } from '@/utils/mathUtils';
import { cx } from '@/utils/cx';
import { useControlledState } from '@/hooks';
import type { Point2D } from '@/components/primitives/canvas/canvas.types';
import type {
  ViewportContextValue,
  ViewportHandle,
  ViewportProps,
  ViewportSelectionEvent,
  ViewportSize,
  ViewportTransform,
} from './Viewport.types';
import { LayerSubscriptionContext, ViewportContext } from './ViewportContext';
import { ViewportLayer } from './ViewportLayer';
import { ViewportWorld } from './ViewportWorld';
import { ViewportOverlay } from './ViewportOverlay';
import { useViewportGestures } from './useViewportGestures';
import {
  computeCenterTransform,
  computeFitTransform,
  normalizeRect,
} from './viewportMath';
import { worldToScreen } from './viewportCoords';
import {
  viewportRootRecipe,
  viewportHeightVar,
  marqueeRectStyle,
} from './Viewport.css';

const IDENTITY_TRANSFORM: ViewportTransform = { x: 0, y: 0, zoom: 1 };

interface InvalidateBus {
  byName: Map<string, Set<() => void>>;
  all: Set<() => void>;
}

interface CategorizedChildren {
  layers: React.ReactElement[];
  worldChildren: React.ReactElement[];
  overlayChildren: React.ReactElement[];
}

function categorizeChildren(children: React.ReactNode): CategorizedChildren {
  const layers: React.ReactElement[] = [];
  const worldChildren: React.ReactElement[] = [];
  const overlayChildren: React.ReactElement[] = [];

  React.Children.forEach(children, child => {
    if (!React.isValidElement(child)) return;
    if (child.type === ViewportLayer) {
      layers.push(child);
    } else if (child.type === ViewportWorld) {
      worldChildren.push(child);
    } else if (child.type === ViewportOverlay) {
      overlayChildren.push(child);
    }
  });

  return { layers, worldChildren, overlayChildren };
}

/**
 * Viewport — pan/zoom canvas + HTML container for editor-style surfaces
 * such as node graphs, timelines, and 2D world editors.
 *
 * Composes:
 * - Multiple perf-isolated `<ViewportLayer>` canvases (one draw cycle each).
 * - `<ViewportWorld>` for HTML positioned in world coordinates.
 * - `<ViewportOverlay>` for HTML pinned to the viewport (toolbars, minimap).
 *
 * Owns pan/zoom gestures (drag-to-pan, wheel-zoom-toward-cursor, optional
 * pinch and space-to-pan) and optional marquee selection. Transform is
 * controlled or uncontrolled (`useControlledState`-style).
 *
 * @example
 * ```tsx
 * <Viewport responsive selectionRect={{ enabled: true }}>
 *   <ViewportLayer name="grid" draw={drawGrid} invalidateOn={[gridStep]} />
 *   <ViewportLayer name="content" draw={drawNodes} invalidateOn={[nodes]} />
 *   <ViewportWorld>
 *     <NodeView style={{ position: 'absolute', left: 100, top: 200 }} />
 *   </ViewportWorld>
 *   <ViewportOverlay>
 *     <Toolbar />
 *   </ViewportOverlay>
 * </Viewport>
 * ```
 */
export const Viewport = ({
  transform: transformProp,
  defaultTransform,
  onTransformChange,
  minZoom = 0.1,
  maxZoom = 8,
  pan,
  zoom,
  selectionRect,
  onSelectionChange,
  onPanStart,
  onPanEnd,
  onZoomStart,
  onZoomEnd,
  responsive = false,
  height = 300,
  disabled = false,
  role = 'application',
  ariaLabel,
  ariaRoledescription,
  className,
  style,
  testId,
  id,
  children,
  ref,
  ...rest
}: ViewportProps): React.ReactElement => {
  const rootRef = useRef<HTMLDivElement>(null);

  // ── Transform (controlled/uncontrolled) ──
  const clampTransform = useCallback(
    (t: ViewportTransform): ViewportTransform => ({
      x: t.x,
      y: t.y,
      zoom: clamp(t.zoom, minZoom, maxZoom),
    }),
    [minZoom, maxZoom]
  );

  const [transformRaw, setTransformRaw] = useControlledState<ViewportTransform>(
    {
      value: transformProp,
      defaultValue: defaultTransform,
      onChange: onTransformChange,
      fallback: IDENTITY_TRANSFORM,
    }
  );

  // Apply zoom clamping at the edge so downstream code can assume valid range.
  const transform = useMemo(
    () => clampTransform(transformRaw),
    [transformRaw, clampTransform]
  );
  const setTransform = useCallback(
    (next: ViewportTransform) => setTransformRaw(clampTransform(next)),
    [setTransformRaw, clampTransform]
  );

  // ── Size tracking via ResizeObserver ──
  const [size, setSize] = useState<ViewportSize>({ width: 0, height: 0 });
  const sizeRef = useRef(size);
  sizeRef.current = size;
  const transformRef = useRef(transform);
  transformRef.current = transform;

  useEffect(() => {
    const el = rootRef.current;
    if (!el || typeof ResizeObserver === 'undefined') return;
    const initial = el.getBoundingClientRect();
    setSize({ width: initial.width, height: initial.height });
    const observer = new ResizeObserver(entries => {
      const entry = entries[0];
      if (!entry) return;
      const next = {
        width: entry.contentRect.width,
        height: entry.contentRect.height,
      };
      setSize(prev =>
        prev.width === next.width && prev.height === next.height ? prev : next
      );
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // ── Invalidation bus (per-layer + all) ──
  const invalidateBus = useRef<InvalidateBus>({
    byName: new Map(),
    all: new Set(),
  });

  const subscribeLayer = useCallback(
    (name: string, cb: () => void): (() => void) => {
      const bus = invalidateBus.current;
      let set = bus.byName.get(name);
      if (!set) {
        set = new Set();
        bus.byName.set(name, set);
      }
      set.add(cb);
      bus.all.add(cb);
      return () => {
        set?.delete(cb);
        bus.all.delete(cb);
        if (set?.size === 0) bus.byName.delete(name);
      };
    },
    []
  );

  const invalidate = useCallback((layerName?: string): void => {
    const bus = invalidateBus.current;
    if (layerName === undefined) {
      bus.all.forEach(cb => cb());
    } else {
      bus.byName.get(layerName)?.forEach(cb => cb());
    }
  }, []);

  // ── Imperative handle ──
  const setTransformRef = useRef(setTransform);
  setTransformRef.current = setTransform;
  const minZoomRef = useRef(minZoom);
  minZoomRef.current = minZoom;
  const maxZoomRef = useRef(maxZoom);
  maxZoomRef.current = maxZoom;

  const handle = useMemo<ViewportHandle>(
    () => ({
      fitToContent(bounds, padding = 0): void {
        setTransformRef.current(
          computeFitTransform(bounds, sizeRef.current, padding, {
            minZoom: minZoomRef.current,
            maxZoom: maxZoomRef.current,
          })
        );
      },
      zoomToRect(rect, padding = 0): void {
        setTransformRef.current(
          computeFitTransform(rect, sizeRef.current, padding, {
            minZoom: minZoomRef.current,
            maxZoom: maxZoomRef.current,
          })
        );
      },
      centerOn(point: Point2D, nextZoom?: number): void {
        setTransformRef.current(
          computeCenterTransform(
            point,
            sizeRef.current,
            transformRef.current,
            {
              minZoom: minZoomRef.current,
              maxZoom: maxZoomRef.current,
            },
            nextZoom
          )
        );
      },
      getTransform(): ViewportTransform {
        return transformRef.current;
      },
      getSize(): ViewportSize {
        return sizeRef.current;
      },
      invalidate(layerName?: string): void {
        invalidate(layerName);
      },
    }),
    [invalidate]
  );

  useImperativeHandle(ref, () => handle, [handle]);

  // ── Marquee visual rect (screen-space) ──
  const [marqueeScreenRect, setMarqueeScreenRect] = useState<{
    x: number;
    y: number;
    width: number;
    height: number;
  } | null>(null);

  const handleSelectionChange = useCallback(
    (info: ViewportSelectionEvent): void => {
      // Convert world rect back to screen for the visual overlay
      const t = transformRef.current;
      const topLeft = worldToScreen({ x: info.rect.x, y: info.rect.y }, t);
      const bottomRight = worldToScreen(
        { x: info.rect.x + info.rect.width, y: info.rect.y + info.rect.height },
        t
      );
      const screenRect = normalizeRect({
        x: topLeft.x,
        y: topLeft.y,
        width: bottomRight.x - topLeft.x,
        height: bottomRight.y - topLeft.y,
      });
      if (info.inProgress) {
        setMarqueeScreenRect(screenRect);
      } else {
        setMarqueeScreenRect(null);
      }
      onSelectionChange?.(info);
    },
    [onSelectionChange]
  );

  // ── Gestures ──
  const { isPanning, handlers } = useViewportGestures({
    viewportRef: rootRef,
    transform,
    setTransform,
    getSize: () => sizeRef.current,
    disabled,
    minZoom,
    maxZoom,
    pan: pan ?? {},
    zoom: zoom ?? {},
    selectionRect: selectionRect ?? {},
    onPanStart,
    onPanEnd,
    onZoomStart,
    onZoomEnd,
    onSelectionChange: handleSelectionChange,
  });

  // ── Context value (stable across non-context state changes) ──
  const contextValue = useMemo<ViewportContextValue>(
    () => ({
      transform,
      size,
      handle,
      isPanning,
    }),
    [transform, size, handle, isPanning]
  );

  // ── Children categorization ──
  const { layers, worldChildren, overlayChildren } = useMemo(
    () => categorizeChildren(children),
    [children]
  );

  const layerInvalidateBusContext = useMemo(
    () => ({ subscribeLayer }),
    [subscribeLayer]
  );

  return (
    <div
      ref={rootRef}
      id={id}
      data-testid={testId}
      role={role}
      aria-label={ariaLabel}
      aria-roledescription={ariaRoledescription}
      tabIndex={disabled ? -1 : 0}
      className={cx(
        viewportRootRecipe({
          responsive,
          disabled,
          panning: isPanning,
        }),
        className
      )}
      style={{
        ...style,
        ...(!responsive
          ? assignInlineVars({ [viewportHeightVar]: `${height}px` })
          : {}),
      }}
      onPointerDown={handlers.onPointerDown}
      onPointerMove={handlers.onPointerMove}
      onPointerUp={handlers.onPointerUp}
      onPointerCancel={handlers.onPointerCancel}
      onContextMenu={handlers.onContextMenu}
      {...rest}
    >
      <ViewportContext.Provider value={contextValue}>
        <LayerSubscriptionContext.Provider value={layerInvalidateBusContext}>
          {layers}
          {worldChildren}
          {overlayChildren}
        </LayerSubscriptionContext.Provider>
      </ViewportContext.Provider>
      {marqueeScreenRect && (
        <div
          className={marqueeRectStyle}
          style={{
            left: marqueeScreenRect.x,
            top: marqueeScreenRect.y,
            width: marqueeScreenRect.width,
            height: marqueeScreenRect.height,
          }}
          data-viewport-marquee=""
        />
      )}
    </div>
  );
};

Viewport.displayName = 'Viewport';
