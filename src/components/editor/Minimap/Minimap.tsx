'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { cx } from '@/utils/cx';
import { vars } from '@/theme/contract.css';
import { resolveVarValue } from '@/components/primitives/canvas/canvasTheme';
import type { MinimapProps } from './Minimap.types';
import {
  minimapWrapperStyle,
  minimapCanvasStyle,
  ariaLiveRegionStyle,
} from './Minimap.css';
import { computeMinimapHeight } from './minimapCoords';
import { drawMinimap, type MinimapDrawColors } from './minimapDrawing';
import { useMinimapGestures } from './useMinimapGestures';

const DEFAULT_INTERACTIONS = {
  click: true,
  dragViewportRect: true,
  dragFromEmpty: true,
} as const;
const DEFAULT_OUTSIDE_OVERLAY = 'rgba(0, 0, 0, 0.4)';
const FALLBACK_BG = '#1a1a1a';
const FALLBACK_ACCENT = '#4a86c8';

/**
 * Compact navigation widget for editor viewports. Renders a miniature of
 * the world content alongside a draggable rectangle that mirrors the main
 * viewport's visible region. Intended to be shared by NodeGraph, Timeline,
 * and any custom 2D editor surface.
 *
 * Designed as a controlled primitive — pass the current `transform` /
 * `viewportSize` from your `<Viewport>` and translate `onNavigate.worldPoint`
 * into a `viewport.centerOn(...)` call.
 *
 * @example
 * ```tsx
 * const viewportRef = useRef<ViewportHandle>(null);
 * const [transform, setTransform] = useState<ViewportTransform>({ x: 0, y: 0, zoom: 1 });
 * const [size, setSize] = useState<ViewportSize>({ width: 0, height: 0 });
 *
 * <Viewport
 *   responsive
 *   transform={transform}
 *   onTransformChange={setTransform}
 *   onResize={setSize}
 *   ref={viewportRef}
 * >
 *   ...layers...
 * </Viewport>
 *
 * <Minimap
 *   items={nodeItems}
 *   worldBounds={computeBoundsFromItems(nodeItems, 40)}
 *   transform={transform}
 *   viewportSize={size}
 *   onNavigate={info => viewportRef.current?.centerOn(info.worldPoint)}
 * />
 * ```
 */
export const Minimap: React.FC<MinimapProps> = ({
  items,
  worldBounds,
  transform,
  viewportSize,
  onNavigate,
  width = 200,
  minHeight = 60,
  maxHeight = 200,
  interactions = DEFAULT_INTERACTIONS,
  keyboardPanStep = 0.1,
  backgroundColor,
  defaultItemColor,
  viewportRectStroke,
  outsideOverlay = DEFAULT_OUTSIDE_OVERLAY,
  disabled = false,
  ariaLabel = 'Minimap',
  className,
  style,
  testId,
  id,
  ...rest
}) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const height = useMemo(
    () => computeMinimapHeight(width, worldBounds, minHeight, maxHeight),
    [width, worldBounds, minHeight, maxHeight]
  );
  const minimapSize = useMemo(() => ({ width, height }), [width, height]);

  const interactionsConfig = useMemo(() => {
    if (interactions === false) {
      return {
        click: false,
        dragViewportRect: false,
        dragFromEmpty: false,
      } as const;
    }
    return {
      click: interactions.click ?? true,
      dragViewportRect: interactions.dragViewportRect ?? true,
      dragFromEmpty: interactions.dragFromEmpty ?? true,
    };
  }, [interactions]);

  const { handlers, isDragging } = useMinimapGestures({
    containerRef: wrapperRef,
    worldBounds,
    transform,
    viewportSize,
    minimapSize,
    interactions: interactionsConfig,
    keyboardPanStep,
    disabled,
    onNavigate,
  });

  const [resolvedColors, setResolvedColors] = useState<MinimapDrawColors>({
    background: backgroundColor ?? FALLBACK_BG,
    defaultItem: defaultItemColor ?? FALLBACK_ACCENT,
    viewportRectStroke: viewportRectStroke ?? FALLBACK_ACCENT,
    outsideOverlay,
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    setResolvedColors({
      background:
        backgroundColor ??
        resolveVarValue(canvas, vars.colors.background.secondary),
      defaultItem:
        defaultItemColor ?? resolveVarValue(canvas, vars.colors.accent.primary),
      viewportRectStroke:
        viewportRectStroke ??
        resolveVarValue(canvas, vars.colors.accent.primary),
      outsideOverlay,
    });
  }, [backgroundColor, defaultItemColor, viewportRectStroke, outsideOverlay]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr =
      typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1;
    if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
      canvas.width = width * dpr;
      canvas.height = height * dpr;
    }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const raf = requestAnimationFrame(() => {
      drawMinimap({
        ctx,
        size: { width, height },
        worldBounds,
        transform,
        viewportSize,
        items,
        colors: resolvedColors,
      });
    });
    return () => cancelAnimationFrame(raf);
  }, [
    width,
    height,
    worldBounds,
    transform,
    viewportSize,
    items,
    resolvedColors,
  ]);

  return (
    <div
      ref={wrapperRef}
      className={cx(minimapWrapperStyle, className)}
      data-testid={testId}
      data-dragging={isDragging || undefined}
      data-disabled={disabled || undefined}
      id={id}
      role="region"
      aria-label={ariaLabel}
      tabIndex={disabled ? -1 : 0}
      style={{ width, height, ...style }}
      onPointerDown={handlers.onPointerDown}
      onPointerMove={handlers.onPointerMove}
      onPointerUp={handlers.onPointerUp}
      onPointerCancel={handlers.onPointerCancel}
      onKeyDown={handlers.onKeyDown}
      {...rest}
    >
      <canvas
        ref={canvasRef}
        className={minimapCanvasStyle}
        style={{ width, height }}
      />
      <div className={ariaLiveRegionStyle} aria-live="polite" role="status">
        {isDragging ? 'Panning viewport' : ''}
      </div>
    </div>
  );
};

Minimap.displayName = 'Minimap';
