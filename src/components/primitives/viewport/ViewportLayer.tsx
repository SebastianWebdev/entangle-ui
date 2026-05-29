'use client';

import React, {
  useCallback,
  useEffect,
  useRef,
  useSyncExternalStore,
} from 'react';

import { resolveCanvasTheme } from '@/components/primitives/canvas/canvasTheme';
import { useLatest } from '@/hooks';
import { cx } from '@/utils/cx';

import { layerCanvasStyle } from './Viewport.css';
import { useViewportStore } from './ViewportContext';
import { worldToScreen, screenToWorld } from './viewportCoords';

import type {
  ViewportLayerDrawInfo,
  ViewportLayerProps,
} from './Viewport.types';

/**
 * A perf-isolated canvas layer inside a `<Viewport>`.
 *
 * Each layer owns its own `<canvas>` element and runs an independent draw
 * cycle. Draws are scheduled via `requestAnimationFrame` whenever the
 * viewport transform, viewport size, or any `invalidateOn` dependency
 * changes — or when the imperative `handle.invalidate(name)` is called.
 *
 * @example
 * ```tsx
 * <ViewportLayer
 *   name="grid"
 *   draw={(ctx, { size, transform, theme }) => {
 *     ctx.fillStyle = theme.borderDefault;
 *     // ... draw grid
 *   }}
 *   invalidateOn={[gridStep]}
 * />
 * ```
 */
export const ViewportLayer: React.FC<ViewportLayerProps> = ({
  name,
  draw,
  invalidateOn,
  paused = false,
  className,
}) => {
  const store = useViewportStore();
  const transform = useSyncExternalStore(
    store.subscribeTransform,
    store.getTransform
  );
  const size = useSyncExternalStore(store.subscribeSize, store.getSize);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const drawRef = useLatest(draw);
  const pausedRef = useLatest(paused);

  const performDraw = useCallback((): void => {
    if (pausedRef.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const currentSize = store.getSize();
    if (currentSize.width <= 0 || currentSize.height <= 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr =
      typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1;
    const targetW = Math.max(1, Math.round(currentSize.width * dpr));
    const targetH = Math.max(1, Math.round(currentSize.height * dpr));
    if (canvas.width !== targetW || canvas.height !== targetH) {
      canvas.width = targetW;
      canvas.height = targetH;
    }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, currentSize.width, currentSize.height);

    const currentTransform = store.getTransform();
    const theme = resolveCanvasTheme(canvas);
    const info: ViewportLayerDrawInfo = {
      size: currentSize,
      transform: currentTransform,
      theme,
      worldToScreen: p => worldToScreen(p, currentTransform),
      screenToWorld: p => screenToWorld(p, currentTransform),
    };
    drawRef.current(ctx, info);
  }, [store, drawRef, pausedRef]);

  const scheduleDraw = useCallback((): void => {
    cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(performDraw);
  }, [performDraw]);

  // Subscribe to per-layer invalidation events fired by `handle.invalidate(name)`.
  useEffect(() => {
    return store.subscribeLayer(name, scheduleDraw);
  }, [store, name, scheduleDraw]);

  // Schedule a redraw when transform, size, or `invalidateOn` deps change.
  useEffect(() => {
    scheduleDraw();
    return () => {
      cancelAnimationFrame(rafRef.current);
    };
    // `invalidateOn` is intentionally spread into deps so each entry is tracked.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transform, size, scheduleDraw, ...(invalidateOn ?? [])]);

  // Re-render when DPR changes (e.g., dragging the window to a different display).
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mq = window.matchMedia(
      `(resolution: ${window.devicePixelRatio}dppx)`
    );
    const handler = (): void => {
      scheduleDraw();
    };
    mq.addEventListener('change', handler);
    return () => {
      mq.removeEventListener('change', handler);
    };
  }, [scheduleDraw]);

  return (
    <canvas
      ref={canvasRef}
      className={cx(layerCanvasStyle, className)}
      data-viewport-layer={name}
      aria-hidden="true"
    />
  );
};

ViewportLayer.displayName = 'ViewportLayer';
