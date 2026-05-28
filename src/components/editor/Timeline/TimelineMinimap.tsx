'use client';

import React, {
  useCallback,
  useEffect,
  useEffectEvent,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { vars } from '@/theme/contract.css';
import { resolveVarValue } from '@/components/primitives/canvas/canvasTheme';
import { useResizeObserver } from '@/hooks';
import { useTimelineGeometry, useTimelinePlayhead } from './TimelineContext';
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

  // Subscribe only to the slices the minimap actually reads — selection,
  // hover, drag and mode changes do not invalidate this strip.
  const geometry = useTimelineGeometry();
  const playhead = useTimelinePlayhead();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);

  useResizeObserver(containerRef, entry => {
    setWidth(w =>
      w === entry.contentRect.width ? w : entry.contentRect.width
    );
  });

  const range = Math.max(1, geometry.endFrame - geometry.startFrame);
  const pxToFrame = useCallback(
    (px: number): number =>
      geometry.startFrame + (clamp(px, 0, width) / Math.max(1, width)) * range,
    [geometry.startFrame, range, width]
  );

  // ── Render ──
  const rafRef = useRef<number>(0);
  const drawNow = useEffectEvent((): void => {
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
    for (const track of tracks) {
      if (track.hidden) continue;
      for (const kf of track.keyframes) {
        const x = Math.round(((kf.x - geometry.startFrame) / range) * w);
        renderCtx.fillRect(x, h * 0.25, 1, h * 0.5);
      }
    }
    renderCtx.globalAlpha = 1;

    // Viewport rectangle
    const vx = ((geometry.view.startFrame - geometry.startFrame) / range) * w;
    const vw =
      ((geometry.view.endFrame - geometry.view.startFrame) / range) * w;
    renderCtx.save();
    renderCtx.fillStyle = accent;
    renderCtx.globalAlpha = 0.16;
    renderCtx.fillRect(vx, 0, vw, h);
    renderCtx.globalAlpha = 1;
    renderCtx.strokeStyle = accent;
    renderCtx.lineWidth = 1;
    renderCtx.strokeRect(vx + 0.5, 0.5, Math.max(0, vw - 1), h - 1);

    // Edge "grippers" — small filled bars centred vertically on each edge
    // hint that the viewport rectangle is resizable (zoom).
    const gripH = Math.max(6, h * 0.4);
    const gripY = (h - gripH) / 2;
    renderCtx.fillRect(vx - 1, gripY, 2, gripH);
    renderCtx.fillRect(vx + vw - 1, gripY, 2, gripH);
    renderCtx.restore();

    // Playhead
    const px =
      Math.round(((playhead.frame - geometry.startFrame) / range) * w) + 0.5;
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

  const scheduleDraw = useCallback((): void => {
    cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => drawNow());
    // `drawNow` is a stable `useEffectEvent`.
  }, []);

  useLayoutEffect(() => {
    scheduleDraw();
    return () => cancelAnimationFrame(rafRef.current);
  }, [
    scheduleDraw,
    width,
    height,
    range,
    geometry.startFrame,
    geometry.view.startFrame,
    geometry.view.endFrame,
    playhead.frame,
    tracks,
    markerColor,
    viewportColor,
  ]);

  // ── Interactions: drag viewport, resize edges, click outside to center ──

  const EDGE_PICK_PX = 6;

  const dragRef = useRef<{
    pointerId: number;
    mode: 'move' | 'jump' | 'resize-start' | 'resize-end';
    grabOffset: number;
  } | null>(null);

  const span = geometry.view.endFrame - geometry.view.startFrame;
  const setViewSpan = useCallback(
    (start: number): void => {
      if (!setView) return;
      const clamped = clamp(
        start,
        geometry.startFrame,
        geometry.endFrame - span
      );
      setView({ startFrame: clamped, endFrame: clamped + span });
    },
    [setView, geometry.startFrame, geometry.endFrame, span]
  );

  const setViewRaw = useCallback(
    (next: TimelineView): void => {
      if (!setView) return;
      setView(next);
    },
    [setView]
  );

  const frameToPx = useCallback(
    (frame: number): number =>
      ((frame - geometry.startFrame) / range) * Math.max(1, width),
    [geometry.startFrame, range, width]
  );

  const onPointerDown = useEffectEvent(
    (e: React.PointerEvent<HTMLDivElement>): void => {
      if (e.button !== 0) return;
      const container = containerRef.current;
      if (!container) return;
      const rect = container.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const frame = pxToFrame(x);
      e.preventDefault();
      container.setPointerCapture(e.pointerId);
      const startPx = frameToPx(geometry.view.startFrame);
      const endPx = frameToPx(geometry.view.endFrame);
      // Edge-resize takes priority: lets the user zoom by dragging the
      // viewport rect's left or right edge.
      if (Math.abs(x - startPx) <= EDGE_PICK_PX) {
        dragRef.current = {
          pointerId: e.pointerId,
          mode: 'resize-start',
          grabOffset: 0,
        };
        return;
      }
      if (Math.abs(x - endPx) <= EDGE_PICK_PX) {
        dragRef.current = {
          pointerId: e.pointerId,
          mode: 'resize-end',
          grabOffset: 0,
        };
        return;
      }
      const inside =
        frame >= geometry.view.startFrame && frame <= geometry.view.endFrame;
      if (inside) {
        dragRef.current = {
          pointerId: e.pointerId,
          mode: 'move',
          grabOffset: frame - geometry.view.startFrame,
        };
      } else {
        dragRef.current = {
          pointerId: e.pointerId,
          mode: 'jump',
          grabOffset: 0,
        };
        setViewSpan(frame - span / 2);
      }
    }
  );

  const onPointerMove = useEffectEvent(
    (e: React.PointerEvent<HTMLDivElement>): void => {
      const drag = dragRef.current;
      if (drag?.pointerId !== e.pointerId) return;
      const container = containerRef.current;
      if (!container) return;
      const rect = container.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const frame = pxToFrame(x);
      switch (drag.mode) {
        case 'move':
          setViewSpan(frame - drag.grabOffset);
          break;
        case 'jump':
          setViewSpan(frame - span / 2);
          break;
        case 'resize-start': {
          const newStart = clamp(
            frame,
            geometry.startFrame,
            geometry.view.endFrame - 1
          );
          setViewRaw({
            startFrame: newStart,
            endFrame: geometry.view.endFrame,
          });
          break;
        }
        case 'resize-end': {
          const newEnd = clamp(
            frame,
            geometry.view.startFrame + 1,
            geometry.endFrame
          );
          setViewRaw({
            startFrame: geometry.view.startFrame,
            endFrame: newEnd,
          });
          break;
        }
      }
    }
  );

  const endDrag = useEffectEvent(
    (e: React.PointerEvent<HTMLDivElement>): void => {
      const drag = dragRef.current;
      if (drag?.pointerId !== e.pointerId) return;
      const container = containerRef.current;
      if (container?.hasPointerCapture(e.pointerId)) {
        container.releasePointerCapture(e.pointerId);
      }
      dragRef.current = null;
    }
  );

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
