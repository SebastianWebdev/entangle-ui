'use client';

import React, { useContext, useEffect, useRef, useState } from 'react';
import { resolveCanvasTheme } from '@/components/primitives/canvas/canvasTheme';
import { cx } from '@/utils/cx';
import type {
  ViewportLayerDrawInfo,
  ViewportLayerProps,
} from './Viewport.types';
import {
  LayerSubscriptionContext,
  useViewportContext,
} from './ViewportContext';
import { worldToScreen, screenToWorld } from './viewportCoords';
import { layerCanvasStyle } from './Viewport.css';

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
  const { transform, size } = useViewportContext();
  const subscription = useContext(LayerSubscriptionContext);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const drawRef = useRef(draw);
  drawRef.current = draw;

  // Bumped by `handle.invalidate(name)` — included in effect deps to trigger redraw
  const [version, setVersion] = useState(0);

  useEffect(() => {
    if (!subscription) return;
    return subscription.subscribeLayer(name, () => {
      setVersion(v => v + 1);
    });
  }, [subscription, name]);

  useEffect(() => {
    if (paused) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    if (size.width <= 0 || size.height <= 0) return;

    cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const dpr =
        typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1;
      const targetW = Math.max(1, Math.round(size.width * dpr));
      const targetH = Math.max(1, Math.round(size.height * dpr));
      if (canvas.width !== targetW || canvas.height !== targetH) {
        canvas.width = targetW;
        canvas.height = targetH;
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, size.width, size.height);

      const theme = resolveCanvasTheme(canvas);
      const info: ViewportLayerDrawInfo = {
        size,
        transform,
        theme,
        worldToScreen: p => worldToScreen(p, transform),
        screenToWorld: p => screenToWorld(p, transform),
      };
      drawRef.current(ctx, info);
    });

    return () => cancelAnimationFrame(rafRef.current);
    // `invalidateOn` is intentionally spread into deps so each entry is tracked.
  }, [transform, size, paused, version, ...(invalidateOn ?? [])]);

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
