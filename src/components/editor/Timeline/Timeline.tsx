'use client';

import React, {
  useCallback,
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from 'react';
import { useControlledState, useLatest, useResizeObserver } from '@/hooks';
import { cx } from '@/utils/cx';
import { vars } from '@/theme/contract.css';
import { resolveVarValue } from '@/components/primitives/canvas/canvasTheme';
import type { ViewportSize } from '@/components/primitives/viewport';
import type {
  TimelineLoop,
  TimelineMode,
  TimelineProps,
  TimelineSelection,
  TimelineSlotKind,
  TimelineSlotMarker,
  TimelineTrack,
  TimelineView,
} from './Timeline.types';
import { TIMELINE_SLOT } from './Timeline.types';
import {
  timelineShellStyle,
  timelineBodyStyle,
  timelineCanvasStyle,
  timelineOverlayLayerStyle,
  timelineMainRowStyle,
  timelineToolbarStyle,
  timelineFooterStyle,
  ariaLiveRegionStyle,
} from './Timeline.css';
import { TimelineTrackHeaders } from './TimelineTrackHeaders';
import {
  clamp,
  framesToTimecode,
  resolveLoop,
  snapFrame,
} from './timelineCoords';
import { drawTimeline, type TimelineDrawColors } from './timelineDrawing';
import { TimelineStore } from './TimelineStore';
import { TimelineStoreContext } from './TimelineContext';
import { useTimelineGestures } from './useTimelineGestures';
import { useTimelinePlayback } from './useTimelinePlayback';

const RULER_HEIGHT = 22;

function selectionKey(trackId: string, keyframeId: string): string {
  return `${trackId} ${keyframeId}`;
}

interface CategorizedSlots {
  toolbar: React.ReactNode;
  footer: React.ReactNode;
  overlay: React.ReactNode[];
}

function getSlotKind(el: React.ReactElement): TimelineSlotKind | null {
  const marker = (el.type as Partial<TimelineSlotMarker>)[TIMELINE_SLOT];
  return marker ?? null;
}

function categorizeChildren(children: React.ReactNode): CategorizedSlots {
  const slots: CategorizedSlots = { toolbar: null, footer: null, overlay: [] };
  React.Children.forEach(children, child => {
    if (!React.isValidElement(child)) {
      if (child !== null && child !== undefined && child !== false) {
        slots.overlay.push(child);
      }
      return;
    }
    const kind = getSlotKind(child);
    const props = child.props as {
      children?: React.ReactNode;
      className?: string;
      style?: React.CSSProperties;
    };
    if (kind === 'toolbar') {
      slots.toolbar = (
        <div
          className={cx(timelineToolbarStyle, props.className)}
          style={props.style}
        >
          {props.children}
        </div>
      );
    } else if (kind === 'footer') {
      slots.footer = (
        <div
          className={cx(timelineFooterStyle, props.className)}
          style={props.style}
        >
          {props.children}
        </div>
      );
    } else {
      slots.overlay.push(child);
    }
  });
  return slots;
}

/**
 * Horizontal multi-track animation timeline / dope sheet. Tracks hold
 * keyframes (the shared `CurveKeyframe` model) along a frame-based time axis;
 * a playhead scrubs across all tracks. Canvas-rendered keyframes with DOM
 * chrome, store-driven via `useSyncExternalStore`.
 *
 * Children read live state via `useTimelineContext()` / `useTimelineGeometry()`
 * / `useTimelinePlayhead()` / `useTimelineSelection()`.
 */
export const Timeline = (props: TimelineProps): React.ReactElement => {
  const {
    tracks,
    onTracksChange,
    onTracksChangeComplete,
    startFrame = 0,
    endFrame,
    fps = 30,
    frame,
    defaultFrame,
    onFrameChange,
    onFrameChangeComplete,
    view,
    defaultView,
    onViewChange,
    minFramesVisible = 1,
    maxFramesVisible,
    selection,
    defaultSelection,
    onSelectionChange,
    editable = true,
    allowAddKeyframe = true,
    allowDeleteKeyframe = true,
    snap = true,
    mode,
    defaultMode,
    onModeChange,
    playing,
    defaultPlaying,
    onPlayingChange,
    loop,
    defaultLoop,
    onLoopChange,
    trackHeight = 28,
    showRuler = true,
    showPlayhead = true,
    trackHeaderWidth = 160,
    responsive = true,
    height,
    playheadColor,
    backgroundColor,
    renderOverlay,
    renderTrackHeader,
    formatTime,
    ariaLabel = 'Timeline',
    className,
    style,
    testId,
    id,
    children,
    ref,
  } = props;

  const bodyRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [size, setSize] = useState<ViewportSize>({ width: 0, height: 0 });
  const [scrollTop, setScrollTop] = useState(0);

  const fullView = useMemo<TimelineView>(
    () => ({ startFrame, endFrame }),
    [startFrame, endFrame]
  );

  // ── Controlled / uncontrolled state ──

  const [frameState, setFrame] = useControlledState<number>({
    value: frame,
    defaultValue: defaultFrame,
    onChange: onFrameChange,
    fallback: startFrame,
  });
  const [viewState, setView] = useControlledState<TimelineView>({
    value: view,
    defaultValue: defaultView,
    onChange: onViewChange,
    fallback: fullView,
  });
  const [selectionState, setSelection] = useControlledState<TimelineSelection>({
    value: selection,
    defaultValue: defaultSelection,
    onChange: onSelectionChange,
    fallback: [],
  });
  const [modeState] = useControlledState<TimelineMode>({
    value: mode,
    defaultValue: defaultMode,
    onChange: onModeChange,
    fallback: 'dope-sheet',
  });
  const [playingState, setPlaying] = useControlledState<boolean>({
    value: playing,
    defaultValue: defaultPlaying,
    onChange: onPlayingChange,
    fallback: false,
  });
  const [loopState, setLoop] = useControlledState<TimelineLoop>({
    value: loop,
    defaultValue: defaultLoop,
    onChange: onLoopChange,
    fallback: false,
  });
  const loopRegion = useMemo(
    () => resolveLoop(loopState, startFrame, endFrame),
    [loopState, startFrame, endFrame]
  );

  // ── Store ──

  const store = useMemo(() => new TimelineStore(), []);
  const drag = useSyncExternalStore(store.subscribeDrag, store.getDrag);

  useLayoutEffect(() => {
    store.setGeometry({
      view: viewState,
      size,
      trackHeight,
      scrollTop,
      startFrame,
      endFrame,
      fps,
      mode: modeState,
    });
  }, [
    store,
    viewState,
    size,
    trackHeight,
    scrollTop,
    startFrame,
    endFrame,
    fps,
    modeState,
  ]);

  useLayoutEffect(() => {
    store.setPlayhead({ frame: frameState, playing: playingState });
  }, [store, frameState, playingState]);

  useLayoutEffect(() => {
    store.setSelection(selectionState);
  }, [store, selectionState]);

  // ── Seek helpers (snap + clamp) ──

  const onFrameCompleteRef = useLatest(onFrameChangeComplete);
  const applyFrame = useCallback(
    (f: number): number => clamp(snapFrame(f, snap), startFrame, endFrame),
    [snap, startFrame, endFrame]
  );
  const seekLive = useCallback(
    (f: number): void => setFrame(applyFrame(f)),
    [setFrame, applyFrame]
  );
  const seekCommit = useCallback(
    (f: number): void => {
      const v = applyFrame(f);
      setFrame(v);
      onFrameCompleteRef.current?.(v);
    },
    [setFrame, applyFrame, onFrameCompleteRef]
  );

  // ── Playback (optional built-in rAF loop) ──

  const setFrameRaw = useCallback(
    (f: number): void => setFrame(clamp(f, startFrame, endFrame)),
    [setFrame, startFrame, endFrame]
  );
  const handlePlaybackEnd = useCallback(
    (): void => setPlaying(false),
    [setPlaying]
  );
  useTimelinePlayback({
    playing: playingState,
    frame: frameState,
    fps,
    startFrame,
    endFrame,
    loop: loopState,
    onAdvance: setFrameRaw,
    onEnd: handlePlaybackEnd,
  });

  // ── Track-edit helpers ──

  const onTracksChangeRef = useLatest(onTracksChange);
  const onTracksCompleteRef = useLatest(onTracksChangeComplete);
  const setTracksLive = useCallback(
    (t: TimelineTrack[]): void => onTracksChangeRef.current?.(t),
    [onTracksChangeRef]
  );
  const commitTracks = useCallback(
    (t: TimelineTrack[]): void => onTracksCompleteRef.current?.(t),
    [onTracksCompleteRef]
  );
  const handleReorderTracks = useCallback(
    (next: TimelineTrack[]): void => {
      setTracksLive(next);
      commitTracks(next);
    },
    [setTracksLive, commitTracks]
  );

  // ── View helpers + imperative handle ──

  const rangeSpan = Math.max(1, endFrame - startFrame);
  const clampView = useCallback(
    (v: TimelineView): TimelineView => {
      const maxSpan = maxFramesVisible ?? rangeSpan;
      const span = Math.min(
        maxSpan,
        Math.max(minFramesVisible, v.endFrame - v.startFrame)
      );
      const center = (v.startFrame + v.endFrame) / 2;
      return { startFrame: center - span / 2, endFrame: center + span / 2 };
    },
    [minFramesVisible, maxFramesVisible, rangeSpan]
  );

  const tracksRef = useLatest(tracks);
  const selectionRef = useLatest(selectionState);

  const requestZoomToFit = useCallback(
    (paddingFrames?: number): void => {
      const p = paddingFrames ?? 0;
      setView(
        clampView({ startFrame: startFrame - p, endFrame: endFrame + p })
      );
    },
    [setView, clampView, startFrame, endFrame]
  );

  const requestZoomToSelection = useCallback((): void => {
    const sel = selectionRef.current;
    if (sel.length === 0) return;
    const keys = new Set(sel.map(r => selectionKey(r.trackId, r.keyframeId)));
    let min = Infinity;
    let max = -Infinity;
    for (const track of tracksRef.current) {
      for (const kf of track.keyframes) {
        if (kf.id !== undefined && keys.has(selectionKey(track.id, kf.id))) {
          if (kf.x < min) min = kf.x;
          if (kf.x > max) max = kf.x;
        }
      }
    }
    if (!Number.isFinite(min) || !Number.isFinite(max)) return;
    const pad = Math.max(1, (max - min) * 0.1);
    setView(clampView({ startFrame: min - pad, endFrame: max + pad }));
  }, [setView, clampView, selectionRef, tracksRef]);

  useLayoutEffect(() => {
    store.configureHandle({
      focus: () => bodyRef.current?.focus(),
      getElement: () => bodyRef.current,
      seek: seekCommit,
      setPlaying,
      zoomToFit: requestZoomToFit,
      zoomToSelection: requestZoomToSelection,
    });
  }, [store, seekCommit, setPlaying, requestZoomToFit, requestZoomToSelection]);

  useImperativeHandle(ref, () => store.handle, [store]);

  // ── Responsive sizing ──

  useResizeObserver(bodyRef, entry => {
    const { width, height: h } = entry.contentRect;
    setSize(prev =>
      prev.width === width && prev.height === h ? prev : { width, height: h }
    );
  });

  // ── Vertical scroll ──

  const rulerHeight = showRuler ? RULER_HEIGHT : 0;
  const visibleCount = useMemo(
    () => tracks.filter(t => !t.hidden).length,
    [tracks]
  );
  const contentHeight = visibleCount * trackHeight;
  const maxScrollTop = Math.max(0, contentHeight - (size.height - rulerHeight));

  useLayoutEffect(() => {
    setScrollTop(s => Math.min(s, maxScrollTop));
  }, [maxScrollTop]);

  const scrollBy = useCallback(
    (deltaPixels: number): void => {
      setScrollTop(s => clamp(s + deltaPixels, 0, maxScrollTop));
    },
    [maxScrollTop]
  );

  // ── Gestures ──

  const { handlers, onWheel } = useTimelineGestures({
    containerRef: bodyRef,
    store,
    view: viewState,
    size,
    tracks,
    selection: selectionState,
    frame: frameState,
    startFrame,
    endFrame,
    trackHeight,
    scrollTop,
    rulerHeight,
    snap,
    editable,
    allowAddKeyframe,
    allowDeleteKeyframe,
    showPlayhead,
    mode: modeState,
    minFramesVisible,
    maxFramesVisible,
    loopRegion,
    maxScrollTop,
    seekLive,
    seekCommit,
    setSelection,
    setTracks: setTracksLive,
    commitTracks,
    setView,
    setLoop,
    scrollBy,
  });

  // Native non-passive wheel listener (React onWheel is passive).
  useEffect(() => {
    const el = bodyRef.current;
    if (!el) return;
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, [onWheel]);

  // ── Draw — useLayoutEffect + scheduleDraw, theme resolved per-frame ──

  const renderOverlayRef = useLatest(renderOverlay);
  const formatTimeRef = useLatest(formatTime ?? framesToTimecode);
  const rafRef = useRef<number>(0);

  const scheduleDraw = useCallback((): void => {
    cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const w = Math.max(1, size.width);
      const h = Math.max(1, size.height);
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
          backgroundColor ??
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
          playheadColor ?? resolveVarValue(canvas, vars.colors.accent.primary),
      };

      const selKeys = new Set(
        selectionState.map(r => selectionKey(r.trackId, r.keyframeId))
      );

      drawTimeline({
        ctx,
        size: { width: w, height: h },
        view: viewState,
        startFrame,
        endFrame,
        fps,
        frame: frameState,
        tracks,
        trackHeight,
        scrollTop,
        mode: modeState,
        rulerHeight,
        showPlayhead,
        colors,
        font: `${fontPx}px ${family}`,
        formatTime: formatTimeRef.current,
        isSelected: (t, k) => selKeys.has(selectionKey(t, k)),
        renderOverlay: renderOverlayRef.current,
        marquee: drag.marquee,
        loopRegion,
      });
    });
  }, [
    size,
    viewState,
    frameState,
    tracks,
    selectionState,
    startFrame,
    endFrame,
    fps,
    trackHeight,
    scrollTop,
    rulerHeight,
    showPlayhead,
    modeState,
    backgroundColor,
    playheadColor,
    drag.marquee,
    loopRegion,
    renderOverlayRef,
    formatTimeRef,
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

  // ── Layout ──

  const slots = useMemo(() => categorizeChildren(children), [children]);

  // Announce the playhead on discrete moves (keyboard / click), but stay quiet
  // during continuous scrub drags and playback so AT isn't flooded.
  const liveMessage =
    drag.kind === 'none' && !playingState
      ? `Playhead at frame ${Math.round(frameState)}`
      : '';

  const shellHeight =
    height !== undefined ? `${height}px` : responsive ? '100%' : '240px';

  return (
    <TimelineStoreContext.Provider value={store}>
      <div
        className={cx(timelineShellStyle, className)}
        data-testid={testId}
        id={id}
        style={{ height: shellHeight, ...style }}
      >
        {slots.toolbar}
        <div className={timelineMainRowStyle}>
          <TimelineTrackHeaders
            tracks={tracks}
            trackHeight={trackHeight}
            rulerHeight={rulerHeight}
            scrollTop={scrollTop}
            width={trackHeaderWidth}
            selection={selectionState}
            editable={editable}
            renderTrackHeader={renderTrackHeader}
            onReorderTracks={handleReorderTracks}
          />
          <div
            ref={bodyRef}
            className={timelineBodyStyle}
            data-dragging={drag.kind !== 'none' || undefined}
            role="group"
            aria-label={ariaLabel}
            aria-roledescription="Timeline"
            tabIndex={0}
            onPointerDown={handlers.onPointerDown}
            onPointerMove={handlers.onPointerMove}
            onPointerUp={handlers.onPointerUp}
            onPointerCancel={handlers.onPointerCancel}
            onDoubleClick={handlers.onDoubleClick}
            onKeyDown={handlers.onKeyDown}
          >
            <canvas ref={canvasRef} className={timelineCanvasStyle} />
            <div className={timelineOverlayLayerStyle}>{slots.overlay}</div>
            <div
              className={ariaLiveRegionStyle}
              aria-live="polite"
              role="status"
            >
              {liveMessage}
            </div>
          </div>
        </div>
        {slots.footer}
      </div>
    </TimelineStoreContext.Provider>
  );
};

Timeline.displayName = 'Timeline';
