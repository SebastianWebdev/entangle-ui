'use client';

import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { vars } from '@/theme/contract.css';
import { resolveVarValue } from '@/components/primitives/canvas/canvasTheme';
import { useLatest, useResizeObserver } from '@/hooks';
import { useTimelineContext } from './TimelineContext';
import { TIMELINE_SLOT } from './Timeline.types';
import type { TimelineMinimapProps, TimelineView } from './Timeline.types';
import { timelineMinimapStyle } from './Timeline.css';
import { clamp } from './timelineCoords';

interface InternalProps extends TimelineMinimapProps {
  /** Wired by the Timeline parent via the slot mechanism. */
  setView?: (view: TimelineView) => void;
}

/**
 * Compact overview strip showing the full frame range, the current viewport
 * rectangle (draggable), the playhead, and small dots for every keyframe.
 * Picked out of `<Timeline>` children by the `TIMELINE_SLOT` symbol — its
 * position in the child tree does not affect placement (always rendered below
 * the track area).
 */
function TimelineMinimapImpl(props: InternalProps): React.ReactElement {
  const {
    tracks,
    height = 40,
    markerColor,
    viewportColor,
    className,
    style,
    setView,
  } = props;

  const ctx = useTimelineContext();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);

  const tracksRef = useLatest(tracks);

  useResizeObserver(containerRef, entry => {
    setWidth(w =>
      w === entry.contentRect.width ? w : entry.contentRect.width
    );
  });

  const range = Math.max(1, ctx.endFrame - ctx.startFrame);
  const pxToFrame = useCallback(
    (px: number): number =>
      ctx.startFrame + (clamp(px, 0, width) / Math.max(1, width)) * range,
    [ctx.startFrame, range, width]
  );

  // ── Render ──
  const rafRef = useRef<number>(0);
  const scheduleDraw = useCallback((): void => {
    cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const renderCtx = canvas.getContext('2d');
      if (!renderCtx) return;

      const w = Math.max(1, width);
      const h = Math.max(1, height);
      const dpr =
        typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1;
      const targetW = Math.max(1, Math.round(w * dpr));
      const targetH = Math.max(1, Math.round(h * dpr));
      if (canvas.width !== targetW || canvas.height !== targetH) {
        canvas.width = targetW;
        canvas.height = targetH;
      }
      renderCtx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const bg = resolveVarValue(canvas, vars.colors.background.inset);
      const border = resolveVarValue(canvas, vars.colors.border.default);
      const marker =
        markerColor ?? resolveVarValue(canvas, vars.colors.accent.secondary);
      const accent =
        viewportColor ?? resolveVarValue(canvas, vars.colors.accent.primary);

      renderCtx.clearRect(0, 0, w, h);
      renderCtx.fillStyle = bg;
      renderCtx.fillRect(0, 0, w, h);

      // Keyframe markers (small vertical ticks)
      renderCtx.fillStyle = marker;
      renderCtx.globalAlpha = 0.6;
      for (const track of tracksRef.current) {
        if (track.hidden) continue;
        for (const kf of track.keyframes) {
          const x = Math.round(((kf.x - ctx.startFrame) / range) * w);
          renderCtx.fillRect(x, h * 0.25, 1, h * 0.5);
        }
      }
      renderCtx.globalAlpha = 1;

      // Viewport rectangle
      const vx = ((ctx.view.startFrame - ctx.startFrame) / range) * w;
      const vw = ((ctx.view.endFrame - ctx.view.startFrame) / range) * w;
      renderCtx.save();
      renderCtx.fillStyle = accent;
      renderCtx.globalAlpha = 0.16;
      renderCtx.fillRect(vx, 0, vw, h);
      renderCtx.globalAlpha = 1;
      renderCtx.strokeStyle = accent;
      renderCtx.lineWidth = 1;
      renderCtx.strokeRect(vx + 0.5, 0.5, Math.max(0, vw - 1), h - 1);
      renderCtx.restore();

      // Playhead
      const px = Math.round(((ctx.frame - ctx.startFrame) / range) * w) + 0.5;
      renderCtx.strokeStyle = accent;
      renderCtx.lineWidth = 1;
      renderCtx.beginPath();
      renderCtx.moveTo(px, 0);
      renderCtx.lineTo(px, h);
      renderCtx.stroke();

      // Top + bottom borders
      renderCtx.fillStyle = border;
      renderCtx.fillRect(0, 0, w, 1);
    });
  }, [
    width,
    height,
    range,
    ctx.startFrame,
    ctx.view.startFrame,
    ctx.view.endFrame,
    ctx.frame,
    markerColor,
    viewportColor,
    tracksRef,
  ]);

  useLayoutEffect(() => {
    scheduleDraw();
    return () => cancelAnimationFrame(rafRef.current);
  }, [scheduleDraw]);

  // ── Interactions: drag viewport, click outside to center ──

  const dragRef = useRef<{
    pointerId: number;
    mode: 'move' | 'jump';
    grabOffset: number;
  } | null>(null);

  const span = ctx.view.endFrame - ctx.view.startFrame;
  const setViewSpan = useCallback(
    (start: number): void => {
      if (!setView) return;
      const clamped = clamp(start, ctx.startFrame, ctx.endFrame - span);
      setView({ startFrame: clamped, endFrame: clamped + span });
    },
    [setView, ctx.startFrame, ctx.endFrame, span]
  );

  const onPointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>): void => {
      if (e.button !== 0) return;
      const container = containerRef.current;
      if (!container) return;
      const rect = container.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const frame = pxToFrame(x);
      e.preventDefault();
      container.setPointerCapture(e.pointerId);
      const inside = frame >= ctx.view.startFrame && frame <= ctx.view.endFrame;
      if (inside) {
        // Drag the viewport rectangle.
        dragRef.current = {
          pointerId: e.pointerId,
          mode: 'move',
          grabOffset: frame - ctx.view.startFrame,
        };
      } else {
        // Click outside → center viewport on the clicked frame.
        dragRef.current = {
          pointerId: e.pointerId,
          mode: 'jump',
          grabOffset: 0,
        };
        setViewSpan(frame - span / 2);
      }
    },
    [pxToFrame, ctx.view.startFrame, ctx.view.endFrame, setViewSpan, span]
  );

  const onPointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>): void => {
      const drag = dragRef.current;
      if (drag?.pointerId !== e.pointerId) return;
      const container = containerRef.current;
      if (!container) return;
      const rect = container.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const frame = pxToFrame(x);
      if (drag.mode === 'move') {
        setViewSpan(frame - drag.grabOffset);
      } else {
        setViewSpan(frame - span / 2);
      }
    },
    [pxToFrame, setViewSpan, span]
  );

  const endDrag = useCallback((e: React.PointerEvent<HTMLDivElement>): void => {
    const drag = dragRef.current;
    if (drag?.pointerId !== e.pointerId) return;
    const container = containerRef.current;
    if (container?.hasPointerCapture(e.pointerId)) {
      container.releasePointerCapture(e.pointerId);
    }
    dragRef.current = null;
  }, []);

  // Redraw when DPR changes
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mq = window.matchMedia(
      `(resolution: ${window.devicePixelRatio}dppx)`
    );
    const handler = (): void => scheduleDraw();
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [scheduleDraw]);

  const wrapperStyle = useMemo<React.CSSProperties>(
    () => ({ height, ...style }),
    [height, style]
  );

  return (
    <div
      ref={containerRef}
      className={`${timelineMinimapStyle}${className ? ` ${className}` : ''}`}
      style={wrapperStyle}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      role="slider"
      aria-label="Timeline overview"
    >
      <canvas
        ref={canvasRef}
        style={{ width: '100%', height: '100%', display: 'block' }}
      />
    </div>
  );
}

export const TimelineMinimap = Object.assign(TimelineMinimapImpl, {
  displayName: 'Timeline.Minimap',
  [TIMELINE_SLOT]: 'minimap' as const,
});
