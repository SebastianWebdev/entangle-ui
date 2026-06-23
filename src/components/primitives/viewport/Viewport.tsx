'use client';

import { assignInlineVars } from '@vanilla-extract/dynamic';
import React, {
  useCallback,
  useImperativeHandle,
  useLayoutEffect,
  useMemo,
  useRef,
  useSyncExternalStore,
} from 'react';

import { useControlledState, useResizeObserver } from '@/hooks';
import { cx } from '@/utils/cx';
import { clamp } from '@/utils/mathUtils';

import { useViewportGestures } from './useViewportGestures';
import {
  viewportRootRecipe,
  viewportHeightVar,
  marqueeRectStyle,
} from './Viewport.css';
import { ViewportStoreContext, useViewportStore } from './ViewportContext';
import { ViewportStore } from './ViewportStore';

import type { ViewportProps, ViewportTransform } from './Viewport.types';

const IDENTITY_TRANSFORM: ViewportTransform = { x: 0, y: 0, zoom: 1 };

// Stable empty defaults so `useViewportGestures` does not re-compute config
// objects on every render when the consumer passes nothing.
const EMPTY_PAN = {};
const EMPTY_ZOOM = {};
const EMPTY_SELECTION = {};

interface CategorizedChildren {
  layers: React.ReactElement[];
  worldChildren: React.ReactElement[];
  overlayChildren: React.ReactElement[];
}

function getSlotKind(
  child: React.ReactElement
): 'layer' | 'world' | 'overlay' | null {
  const displayName = (child.type as { displayName?: string } | undefined)
    ?.displayName;
  if (displayName === 'ViewportLayer') return 'layer';
  if (displayName === 'ViewportWorld') return 'world';
  if (displayName === 'ViewportOverlay') return 'overlay';
  // Compound components rendered in the overlay slot (e.g. <ViewportMinimap />).
  if (displayName === 'ViewportMinimap') return 'overlay';
  return null;
}

function categorizeChildren(children: React.ReactNode): CategorizedChildren {
  const layers: React.ReactElement[] = [];
  const worldChildren: React.ReactElement[] = [];
  const overlayChildren: React.ReactElement[] = [];

  React.Children.forEach(children, child => {
    if (!React.isValidElement(child)) return;
    const kind = getSlotKind(child);
    if (kind === 'layer') layers.push(child);
    else if (kind === 'world') worldChildren.push(child);
    else if (kind === 'overlay') overlayChildren.push(child);
  });

  return { layers, worldChildren, overlayChildren };
}

/**
 * Viewport — **2D only.** A pan/zoom canvas + HTML container for editor-style
 * surfaces such as node graphs, timelines, and 2D world editors. Despite the
 * name it is *not* a 3D viewport: it owns a 2D pan/zoom transform, not a camera.
 * For 3D, host your own WebGL/WebGPU canvas (e.g. inside an `AppShell.Dock`) and
 * reach for `Viewport` only for 2D editor surfaces.
 *
 * Composes:
 * - Multiple perf-isolated `<ViewportLayer>` canvases (one draw cycle each).
 * - `<ViewportWorld>` for HTML positioned in world coordinates.
 * - `<ViewportOverlay>` for HTML pinned to the viewport (toolbars, minimap).
 *
 * Owns pan/zoom gestures (drag-to-pan, wheel-zoom-toward-cursor, optional
 * pinch and space-to-pan) and optional marquee selection. Transform is
 * controlled or uncontrolled (`useControlledState`-style) and mirrored
 * into an internal `ViewportStore` that powers slice-level subscriptions
 * for layers, world, and overlay children.
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

  // One store per <Viewport> instance, stable for the lifetime of the component.
  const store = useMemo(() => new ViewportStore(), []);

  // ── Controlled / uncontrolled transform (React state) ──
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

  const transform = useMemo(
    () => clampTransform(transformRaw),
    [transformRaw, clampTransform]
  );
  const setTransform = useCallback(
    (next: ViewportTransform) => {
      setTransformRaw(clampTransform(next));
    },
    [setTransformRaw, clampTransform]
  );

  // Mirror React state → store before paint so layer/world subscribers see the
  // latest transform in the same frame.
  useLayoutEffect(() => {
    store.setTransform(transform);
  }, [store, transform]);

  // Wire the store's imperative methods (fitToContent etc.) to React's
  // setTransform and current zoom limits.
  useLayoutEffect(() => {
    store.configureImperative({ setTransform, minZoom, maxZoom });
  }, [store, setTransform, minZoom, maxZoom]);

  // ── Size tracking ──
  useResizeObserver(rootRef, entry => {
    store.setSize({
      width: entry.contentRect.width,
      height: entry.contentRect.height,
    });
  });

  // Seed size on mount in case ResizeObserver fires asynchronously.
  useLayoutEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    store.setSize({ width: rect.width, height: rect.height });
  }, [store]);

  // ── Imperative ref ──
  useImperativeHandle(ref, () => store.handle, [store]);

  // ── Gestures ──
  const { handlers } = useViewportGestures({
    viewportRef: rootRef,
    store,
    setTransform,
    disabled,
    minZoom,
    maxZoom,
    pan: pan ?? EMPTY_PAN,
    zoom: zoom ?? EMPTY_ZOOM,
    selectionRect: selectionRect ?? EMPTY_SELECTION,
    callbacks: {
      onPanStart,
      onPanEnd,
      onZoomStart,
      onZoomEnd,
      onSelectionChange,
    },
  });

  // Subscribe to isPanning only — drives the cursor class on the wrapper.
  const isPanning = useSyncExternalStore(
    store.subscribeIsPanning,
    store.getIsPanning
  );

  // ── Children categorization ──
  const { layers, worldChildren, overlayChildren } = useMemo(
    () => categorizeChildren(children),
    [children]
  );

  const rootStyle = useMemo(
    () => ({
      ...style,
      ...(!responsive
        ? assignInlineVars({ [viewportHeightVar]: `${height}px` })
        : {}),
    }),
    [style, responsive, height]
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
      style={rootStyle}
      onPointerDown={handlers.onPointerDown}
      onPointerMove={handlers.onPointerMove}
      onPointerUp={handlers.onPointerUp}
      onPointerCancel={handlers.onPointerCancel}
      onPointerEnter={handlers.onPointerEnter}
      onPointerLeave={handlers.onPointerLeave}
      onContextMenu={handlers.onContextMenu}
      {...rest}
    >
      <ViewportStoreContext.Provider value={store}>
        {layers}
        {worldChildren}
        {overlayChildren}
        <MarqueeRect />
      </ViewportStoreContext.Provider>
    </div>
  );
};

Viewport.displayName = 'Viewport';

/**
 * Internal — renders the marquee selection rectangle. Subscribes only to
 * the marquee slice so it re-renders only when the rectangle changes,
 * never on transform/size/isPanning mutations.
 */
const MarqueeRect: React.FC = () => {
  const store = useViewportStore();
  const rect = useSyncExternalStore(
    store.subscribeMarquee,
    store.getMarqueeRect
  );
  if (!rect) return null;
  return (
    <div
      className={marqueeRectStyle}
      style={{
        left: rect.x,
        top: rect.y,
        width: rect.width,
        height: rect.height,
      }}
      data-viewport-marquee=""
    />
  );
};
