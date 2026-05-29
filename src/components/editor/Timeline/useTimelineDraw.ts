'use client';

import type React from 'react';
import { useCallback, useEffect, useLayoutEffect, useRef } from 'react';
import { useLatest } from '@/hooks';
import { vars } from '@/theme/contract.css';
import { resolveVarValue } from '@/components/primitives/canvas/canvasTheme';
import type { ViewportSize } from '@/components/primitives/viewport';
import type {
  TimelineDrawInfo,
  TimelineSelection,
  TimelineTrackScaleProps,
  TimelineView,
} from './Timeline.types';
import type { TimelineRow } from './timelineLayout';
import { framesToTimecode } from './timelineCoords';
import { drawTimeline, type TimelineDrawColors } from './timelineDrawing';
import { selectionKey, selectionKeySet } from './timelineSelection';

export interface UseTimelineDrawOptions {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  size: ViewportSize;
  view: TimelineView;
  startFrame: number;
  endFrame: number;
  fps: number;
  frame: number;
  rows: ReadonlyArray<TimelineRow>;
  scrollTop: number;
  rulerHeight: number;
  loopStripHeight: number;
  loopHandles: 'edges' | 'brackets';
  showPlayhead: boolean;
  selection: TimelineSelection;
  hover: { trackId: string; keyframeId: string } | null;
  hoverPlayhead: boolean;
  marquee: { x: number; y: number; width: number; height: number } | null;
  loopRegion: { startFrame: number; endFrame: number } | null;
  loopHover: 'start' | 'end' | 'body' | null;
  backgroundColor?: string;
  playheadColor?: string;
  trackScale?: TimelineTrackScaleProps;
  renderOverlay?: (
    ctx: CanvasRenderingContext2D,
    info: TimelineDrawInfo
  ) => void;
  formatTime?: (frame: number, fps: number) => string;
}

/**
 * Schedules a canvas redraw via `requestAnimationFrame`, resolves theme
 * tokens per-frame so the live theme is respected, and re-runs on any
 * input change. `renderOverlay` / `formatTime` are read through `useLatest`
 * refs so consumer inline functions don't invalidate the draw schedule
 * (component-patterns.md rule #3).
 */
export function useTimelineDraw(opts: UseTimelineDrawOptions): void {
  const rafRef = useRef<number>(0);

  // Consumer callbacks — read live without invalidating `scheduleDraw`.
  const renderOverlayRef = useLatest(opts.renderOverlay);
  const formatTimeRef = useLatest(opts.formatTime);

  const scheduleDraw = useCallback((): void => {
    cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      const canvas = opts.canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const w = Math.max(1, opts.size.width);
      const h = Math.max(1, opts.size.height);
      const dpr =
        typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1;
      const targetW = Math.max(1, Math.round(w * dpr));
      const targetH = Math.max(1, Math.round(h * dpr));
      if (canvas.width !== targetW || canvas.height !== targetH) {
        canvas.width = targetW;
        canvas.height = targetH;
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const fontPx =
        parseFloat(resolveVarValue(canvas, vars.typography.fontSize.xs)) || 10;
      const family = getComputedStyle(canvas).fontFamily || 'sans-serif';

      const colors: TimelineDrawColors = {
        background:
          opts.backgroundColor ??
          resolveVarValue(canvas, vars.colors.background.secondary),
        gridLine: resolveVarValue(canvas, vars.colors.border.default),
        rulerText: resolveVarValue(canvas, vars.colors.text.muted),
        rowSeparator: resolveVarValue(canvas, vars.colors.border.default),
        keyframe: resolveVarValue(canvas, vars.colors.accent.secondary),
        keyframeSelected: resolveVarValue(canvas, vars.colors.accent.primary),
        keyframeStroke: resolveVarValue(
          canvas,
          vars.colors.background.secondary
        ),
        playhead:
          opts.playheadColor ??
          resolveVarValue(canvas, vars.colors.accent.primary),
        groupHeader: resolveVarValue(canvas, vars.colors.background.elevated),
      };

      const selKeys = selectionKeySet(opts.selection);
      const hover = opts.hover;

      drawTimeline({
        ctx,
        size: { width: w, height: h },
        view: opts.view,
        startFrame: opts.startFrame,
        endFrame: opts.endFrame,
        fps: opts.fps,
        frame: opts.frame,
        rows: opts.rows,
        scrollTop: opts.scrollTop,
        rulerHeight: opts.rulerHeight,
        loopStripHeight: opts.loopStripHeight,
        loopHandles: opts.loopHandles,
        showPlayhead: opts.showPlayhead,
        colors,
        font: `${fontPx}px ${family}`,
        formatTime: (f: number, fps: number): string =>
          (formatTimeRef.current ?? framesToTimecode)(f, fps),
        isSelected: (t, k) =>
          selKeys.has(selectionKey({ trackId: t, keyframeId: k })),
        isHovered: (t, k) =>
          hover !== null && hover.trackId === t && hover.keyframeId === k,
        playheadHovered: opts.hoverPlayhead,
        ...(opts.trackScale
          ? {
              trackScale: {
                position: opts.trackScale.position ?? 'start',
                format:
                  opts.trackScale.format ??
                  ((v: number) => Number(v.toFixed(2)).toString()),
                showMidpoint: opts.trackScale.showMidpoint ?? false,
                gridlines: opts.trackScale.gridlines ?? false,
                minLaneHeight: opts.trackScale.minLaneHeight ?? 48,
                ...(opts.trackScale.color
                  ? { color: opts.trackScale.color }
                  : {}),
              },
            }
          : {}),
        renderOverlay: (
          ctx: CanvasRenderingContext2D,
          info: TimelineDrawInfo
        ): void => renderOverlayRef.current?.(ctx, info),
        marquee: opts.marquee,
        loopRegion: opts.loopRegion,
        loopHover: opts.loopHover,
      });
    });
    // `renderOverlayRef` / `formatTimeRef` are stable refs from `useLatest`.
  }, [
    opts.canvasRef,
    opts.size,
    opts.view,
    opts.startFrame,
    opts.endFrame,
    opts.fps,
    opts.frame,
    opts.rows,
    opts.scrollTop,
    opts.rulerHeight,
    opts.loopStripHeight,
    opts.loopHandles,
    opts.showPlayhead,
    opts.selection,
    opts.hover,
    opts.hoverPlayhead,
    opts.marquee,
    opts.loopRegion,
    opts.loopHover,
    opts.backgroundColor,
    opts.playheadColor,
    opts.trackScale,
  ]);

  useLayoutEffect(() => {
    scheduleDraw();
    return () => cancelAnimationFrame(rafRef.current);
  }, [scheduleDraw]);

  // Redraw when DPR changes (e.g. dragging to a different display).
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mq = window.matchMedia(
      `(resolution: ${window.devicePixelRatio}dppx)`
    );
    const handler = (): void => scheduleDraw();
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [scheduleDraw]);
}
