'use client';

import React, {
  useCallback,
  useEffect,
  useEffectEvent,
  useImperativeHandle,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from 'react';
import { useControlledState, useResizeObserver } from '@/hooks';
import { cx } from '@/utils/cx';
import type { ViewportSize } from '@/components/primitives/viewport';
import type {
  TimelineGroup,
  TimelineLoop,
  TimelineMinimapProps,
  TimelineMode,
  TimelineProps,
  TimelineSelection,
  TimelineSlotKind,
  TimelineSlotMarker,
  TimelineTrack,
  TimelineTrackScaleProps,
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
import { computeRows } from './timelineLayout';
import {
  clamp,
  nextFollowView,
  resolveLoop,
  snapFrame,
} from './timelineCoords';
import { TimelineStore } from './TimelineStore';
import { TimelineStoreContext } from './TimelineContext';
import { useTimelineGestures } from './useTimelineGestures';
import { useTimelinePlayback } from './useTimelinePlayback';
import { useTimelineDraw } from './useTimelineDraw';

const RULER_HEIGHT = 22;

interface CategorizedSlots {
  toolbar: React.ReactNode;
  footer: React.ReactNode;
  minimap: React.ReactElement | null;
  /** Deprecated: prefer the `trackScale` prop on `<Timeline>`. */
  trackScale: TimelineTrackScaleProps | null;
  overlay: React.ReactNode[];
}

function getSlotKind(el: React.ReactElement): TimelineSlotKind | null {
  const marker = (el.type as Partial<TimelineSlotMarker>)[TIMELINE_SLOT];
  return marker ?? null;
}

function categorizeChildren(children: React.ReactNode): CategorizedSlots {
  const slots: CategorizedSlots = {
    toolbar: null,
    footer: null,
    minimap: null,
    trackScale: null,
    overlay: [],
  };
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
    if (kind === 'track-scale') {
      slots.trackScale = child.props as TimelineTrackScaleProps;
      return;
    }
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
    } else if (kind === 'minimap') {
      slots.minimap = child;
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
    followMode = 'smooth',
    groups,
    onGroupsChange,
    trackHeight = 28,
    expandedTrackHeight = 96,
    groupHeaderHeight = 22,
    showRuler = true,
    showPlayhead = true,
    trackHeaderWidth = 160,
    responsive = true,
    height,
    playheadColor,
    backgroundColor,
    trackScale: trackScaleProp,
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
  const headerColumnRef = useRef<HTMLDivElement>(null);

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

  // ── Groups (controlled or uncontrolled) ──

  const [internalGroups, setInternalGroups] = useState<
    ReadonlyArray<TimelineGroup>
  >(groups ?? []);
  const groupsState = groups ?? internalGroups;
  const setGroups = useCallback(
    (next: TimelineGroup[]): void => {
      if (groups === undefined) setInternalGroups(next);
      onGroupsChange?.(next);
    },
    [groups, onGroupsChange]
  );

  // ── Row layout (variable heights: expanded lanes + group headers) ──

  const layout = useMemo(
    () =>
      computeRows(tracks, {
        trackHeight,
        expandedHeight: expandedTrackHeight,
        groupHeaderHeight,
        globalGraph: modeState === 'graph',
        groups: groupsState,
      }),
    [
      tracks,
      trackHeight,
      expandedTrackHeight,
      groupHeaderHeight,
      modeState,
      groupsState,
    ]
  );

  // ── Store ──

  const store = useMemo(() => new TimelineStore(), []);
  const drag = useSyncExternalStore(store.subscribeDrag, store.getDrag);
  const hover = useSyncExternalStore(store.subscribeHover, store.getHover);
  const hoverPlayhead = useSyncExternalStore(
    store.subscribeHoverPlayhead,
    store.getHoverPlayhead
  );

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

  const applyFrame = useCallback(
    (f: number): number => clamp(snapFrame(f, snap), startFrame, endFrame),
    [snap, startFrame, endFrame]
  );
  const seekLive = useCallback(
    (f: number): void => setFrame(applyFrame(f)),
    [setFrame, applyFrame]
  );
  const onFrameCompleteEvt = useEffectEvent((f: number): void => {
    onFrameChangeComplete?.(f);
  });
  const seekCommit = useCallback(
    (f: number): void => {
      const v = applyFrame(f);
      setFrame(v);
      onFrameCompleteEvt(v);
    },
    // `onFrameCompleteEvt` is a stable `useEffectEvent`.
    [setFrame, applyFrame]
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

  // ── Follow-playhead during playback ──
  // `smooth` keeps the playhead centred in the view — the view slides
  // continuously once the playhead reaches the centre (one frame per tick,
  // so visually smooth). `paged` waits until the playhead leaves the view
  // and then jumps forward by a full span (After Effects vs Premiere style).
  // `off` leaves the view alone.
  useLayoutEffect(() => {
    if (!playingState) return;
    const next = nextFollowView(
      followMode,
      viewState,
      frameState,
      startFrame,
      endFrame
    );
    if (next) setView(next);
  }, [
    playingState,
    followMode,
    frameState,
    viewState,
    setView,
    startFrame,
    endFrame,
  ]);

  // ── Track-edit helpers ──

  const setTracksLiveEvt = useEffectEvent((t: TimelineTrack[]): void => {
    onTracksChange?.(t);
  });
  const commitTracksEvt = useEffectEvent((t: TimelineTrack[]): void => {
    onTracksChangeComplete?.(t);
  });
  const handleReorderTracks = useCallback(
    (next: TimelineTrack[]): void => {
      setTracksLiveEvt(next);
      commitTracksEvt(next);
    },
    // `setTracksLiveEvt` / `commitTracksEvt` are stable `useEffectEvent`s.
    []
  );
  const handleToggleTrackExpanded = useCallback(
    (trackId: string): void => {
      const next = tracks.map(t =>
        t.id === trackId ? { ...t, expanded: !t.expanded } : t
      );
      setTracksLiveEvt(next);
      commitTracksEvt(next);
    },
    // `setTracksLiveEvt` / `commitTracksEvt` are stable `useEffectEvent`s.
    [tracks]
  );
  const handleToggleGroupCollapsed = useCallback(
    (groupId: string): void => {
      setGroups(
        groupsState.map(g =>
          g.id === groupId ? { ...g, collapsed: !g.collapsed } : g
        )
      );
    },
    [groupsState, setGroups]
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

  const requestZoomToFit = useCallback(
    (paddingFrames?: number): void => {
      const p = paddingFrames ?? 0;
      setView(
        clampView({ startFrame: startFrame - p, endFrame: endFrame + p })
      );
    },
    [setView, clampView, startFrame, endFrame]
  );

  const requestZoomToSelection = useEffectEvent((): void => {
    const sel = selectionState;
    if (sel.length === 0) return;
    // O(|selection|) walk: index tracks once, look up the keyframe per ref.
    const tracksById = new Map(tracks.map(t => [t.id, t]));
    let min = Infinity;
    let max = -Infinity;
    for (const ref of sel) {
      const track = tracksById.get(ref.trackId);
      if (!track) continue;
      const kf = track.keyframes.find(k => k.id === ref.keyframeId);
      if (!kf) continue;
      if (kf.x < min) min = kf.x;
      if (kf.x > max) max = kf.x;
    }
    if (!Number.isFinite(min) || !Number.isFinite(max)) return;
    const pad = Math.max(1, (max - min) * 0.1);
    setView(clampView({ startFrame: min - pad, endFrame: max + pad }));
  });

  const requestSetView = useCallback(
    (v: TimelineView): void => {
      setView(clampView(v));
    },
    [setView, clampView]
  );

  useLayoutEffect(() => {
    store.configureHandle({
      focus: () => bodyRef.current?.focus(),
      getElement: () => bodyRef.current,
      seek: seekCommit,
      setPlaying,
      setView: requestSetView,
      zoomToFit: requestZoomToFit,
      zoomToSelection: requestZoomToSelection,
    });
    // `requestZoomToSelection` is a stable `useEffectEvent`.
  }, [store, seekCommit, setPlaying, requestSetView, requestZoomToFit]);

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
  const maxScrollTop = Math.max(
    0,
    layout.contentHeight - (size.height - rulerHeight)
  );

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
    rows: layout.rows,
    trackTops: layout.trackTops,
    expandedHeight: expandedTrackHeight,
    groups: groupsState,
    minFramesVisible,
    maxFramesVisible,
    loopRegion,
    maxScrollTop,
    seekLive,
    seekCommit,
    setSelection,
    setTracks: setTracksLiveEvt,
    commitTracks: commitTracksEvt,
    setView,
    setLoop,
    scrollBy,
    setGroups,
  });

  // Native non-passive wheel listener (React onWheel is passive). Attach to
  // both the track body and the left header column so vertical scrolling works
  // when the cursor is over the track names too. `onWheel` is a stable
  // `useEffectEvent` so this effect attaches once.
  useEffect(() => {
    const body = bodyRef.current;
    const header = headerColumnRef.current;
    body?.addEventListener('wheel', onWheel, { passive: false });
    header?.addEventListener('wheel', onWheel, { passive: false });
    return () => {
      body?.removeEventListener('wheel', onWheel);
      header?.removeEventListener('wheel', onWheel);
    };
  }, []);

  // ── Slots + draw ──

  const slots = useMemo(() => categorizeChildren(children), [children]);
  // Prop wins; the deprecated `<Timeline.TrackScale />` slot still works.
  const trackScale = trackScaleProp ?? slots.trackScale ?? undefined;

  useTimelineDraw({
    canvasRef,
    size,
    view: viewState,
    startFrame,
    endFrame,
    fps,
    frame: frameState,
    rows: layout.rows,
    scrollTop,
    rulerHeight,
    showPlayhead,
    selection: selectionState,
    hover,
    hoverPlayhead,
    marquee: drag.marquee,
    loopRegion,
    ...(backgroundColor !== undefined ? { backgroundColor } : {}),
    ...(playheadColor !== undefined ? { playheadColor } : {}),
    ...(trackScale ? { trackScale } : {}),
    ...(renderOverlay ? { renderOverlay } : {}),
    ...(formatTime ? { formatTime } : {}),
  });

  // ── Layout ──

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
            ref={headerColumnRef}
            rows={layout.rows}
            contentHeight={layout.contentHeight}
            tracks={tracks}
            rulerHeight={rulerHeight}
            scrollTop={scrollTop}
            width={trackHeaderWidth}
            selection={selectionState}
            editable={editable}
            renderTrackHeader={renderTrackHeader}
            onReorderTracks={handleReorderTracks}
            onToggleGroupCollapsed={handleToggleGroupCollapsed}
            onToggleTrackExpanded={handleToggleTrackExpanded}
          />
          <div
            ref={bodyRef}
            className={timelineBodyStyle}
            data-dragging={drag.kind !== 'none' || undefined}
            data-hover-target={
              hoverPlayhead && drag.kind === 'none' ? 'playhead' : undefined
            }
            role="group"
            aria-label={ariaLabel}
            aria-roledescription="Timeline"
            tabIndex={0}
            onPointerDown={handlers.onPointerDown}
            onPointerMove={handlers.onPointerMove}
            onPointerUp={handlers.onPointerUp}
            onPointerCancel={handlers.onPointerCancel}
            onPointerLeave={handlers.onPointerLeave}
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
        {slots.minimap
          ? React.cloneElement(slots.minimap, {
              setView: requestSetView,
            } as Partial<TimelineMinimapProps>)
          : null}
        {slots.footer}
      </div>
    </TimelineStoreContext.Provider>
  );
};

Timeline.displayName = 'Timeline';
