'use client';

import { useCallback, useMemo, useRef } from 'react';
import type React from 'react';
import { useLatest } from '@/hooks';
import type { Point2D } from '@/components/primitives/canvas/canvas.types';
import type { ViewportSize } from '@/components/primitives/viewport';
import type {
  TimelineKeyframeRef,
  TimelineMode,
  TimelineSelection,
  TimelineTrack,
  TimelineView,
} from './Timeline.types';
import type { TimelineStore } from './TimelineStore';
import {
  autoValueRange,
  clamp,
  snapFrame,
  trackTop,
  xToFrame,
  yToValue,
} from './timelineCoords';
import { hitTestTimeline, keyframesInRect } from './timelineHitTest';
import {
  addKeyframe,
  makeKeyframe,
  moveSelectedKeyframes,
  moveSelectedKeyframesGraph,
  removeSelectedKeyframes,
  setKeyframeTangent,
} from './timelineEdits';

const CLICK_THRESHOLD_PX = 3;
const KEYBOARD_LARGE_STEP = 10;

export interface TimelineGestureActions {
  /** Scrub live (snaps/clamps, fires onFrameChange). */
  seekLive: (frame: number) => void;
  /** Scrub commit (snaps/clamps, fires onFrameChange + onFrameChangeComplete). */
  seekCommit: (frame: number) => void;
  setSelection: (selection: TimelineSelection) => void;
  /** Live track update (onTracksChange). */
  setTracks: (tracks: TimelineTrack[]) => void;
  /** Commit (onTracksChangeComplete). */
  commitTracks: (tracks: TimelineTrack[]) => void;
  setView: (view: TimelineView) => void;
}

export interface UseTimelineGesturesOptions extends TimelineGestureActions {
  containerRef: React.RefObject<HTMLDivElement | null>;
  store: TimelineStore;
  view: TimelineView;
  size: ViewportSize;
  tracks: ReadonlyArray<TimelineTrack>;
  selection: TimelineSelection;
  frame: number;
  startFrame: number;
  endFrame: number;
  trackHeight: number;
  scrollTop: number;
  rulerHeight: number;
  snap: boolean | number;
  editable: boolean;
  allowAddKeyframe: boolean;
  allowDeleteKeyframe: boolean;
  showPlayhead: boolean;
  mode: TimelineMode;
  minFramesVisible: number;
  maxFramesVisible: number | undefined;
}

interface PointerState {
  pointerId: number;
  mode: 'scrub' | 'move' | 'marquee' | 'pan' | 'tangent';
  startX: number;
  startY: number;
  origTracks?: ReadonlyArray<TimelineTrack>;
  moveSelection?: TimelineSelection;
  startFramePos?: number;
  startView?: TimelineView;
  additive?: boolean;
  tangentRef?: TimelineKeyframeRef;
  tangentWhich?: 'in' | 'out';
}

export interface UseTimelineGesturesReturn {
  handlers: {
    onPointerDown: (e: React.PointerEvent<HTMLDivElement>) => void;
    onPointerMove: (e: React.PointerEvent<HTMLDivElement>) => void;
    onPointerUp: (e: React.PointerEvent<HTMLDivElement>) => void;
    onPointerCancel: (e: React.PointerEvent<HTMLDivElement>) => void;
    onDoubleClick: (e: React.MouseEvent<HTMLDivElement>) => void;
    onKeyDown: (e: React.KeyboardEvent<HTMLDivElement>) => void;
  };
  /** Attach via a native non-passive listener so `preventDefault` works. */
  onWheel: (e: WheelEvent) => void;
}

function localPoint(
  e: { clientX: number; clientY: number },
  container: HTMLDivElement | null
): Point2D {
  if (!container) return { x: 0, y: 0 };
  const rect = container.getBoundingClientRect();
  return { x: e.clientX - rect.left, y: e.clientY - rect.top };
}

function sameRef(a: TimelineKeyframeRef, b: TimelineKeyframeRef): boolean {
  return a.trackId === b.trackId && a.keyframeId === b.keyframeId;
}

function nextSelection(
  selection: TimelineSelection,
  ref: TimelineKeyframeRef,
  additive: boolean
): TimelineSelection {
  const exists = selection.some(r => sameRef(r, ref));
  if (additive) {
    return exists
      ? selection.filter(r => !sameRef(r, ref))
      : [...selection, ref];
  }
  return exists ? selection : [ref];
}

function mergeSelection(
  base: TimelineSelection,
  add: ReadonlyArray<TimelineKeyframeRef>
): TimelineSelection {
  const result = [...base];
  for (const ref of add) {
    if (!result.some(r => sameRef(r, ref))) result.push(ref);
  }
  return result;
}

/**
 * Pointer / wheel / keyboard gesture machine for `<Timeline>`. Live props and
 * actions are read through `useLatest` refs so the returned handlers stay
 * stable for the component's lifetime. Drag state (cursor + marquee) is
 * written to the store, not React state.
 */
export function useTimelineGestures(
  opts: UseTimelineGesturesOptions
): UseTimelineGesturesReturn {
  const { containerRef, store } = opts;

  const viewRef = useLatest(opts.view);
  const sizeRef = useLatest(opts.size);
  const tracksRef = useLatest(opts.tracks);
  const selectionRef = useLatest(opts.selection);
  const frameRef = useLatest(opts.frame);
  const startFrameRef = useLatest(opts.startFrame);
  const endFrameRef = useLatest(opts.endFrame);
  const trackHeightRef = useLatest(opts.trackHeight);
  const scrollTopRef = useLatest(opts.scrollTop);
  const rulerHeightRef = useLatest(opts.rulerHeight);
  const snapRef = useLatest(opts.snap);
  const editableRef = useLatest(opts.editable);
  const allowAddRef = useLatest(opts.allowAddKeyframe);
  const allowDeleteRef = useLatest(opts.allowDeleteKeyframe);
  const showPlayheadRef = useLatest(opts.showPlayhead);
  const modeRef = useLatest(opts.mode);
  const minFramesVisibleRef = useLatest(opts.minFramesVisible);
  const maxFramesVisibleRef = useLatest(opts.maxFramesVisible);

  const seekLiveRef = useLatest(opts.seekLive);
  const seekCommitRef = useLatest(opts.seekCommit);
  const setSelectionRef = useLatest(opts.setSelection);
  const setTracksRef = useLatest(opts.setTracks);
  const commitTracksRef = useLatest(opts.commitTracks);
  const setViewRef = useLatest(opts.setView);

  const stateRef = useRef<PointerState | null>(null);

  const hitAt = useCallback(
    (point: Point2D) =>
      hitTestTimeline({
        point,
        view: viewRef.current,
        size: sizeRef.current,
        tracks: tracksRef.current,
        trackHeight: trackHeightRef.current,
        scrollTop: scrollTopRef.current,
        rulerHeight: rulerHeightRef.current,
        frame: frameRef.current,
        showPlayhead: showPlayheadRef.current,
        mode: modeRef.current,
        isSelected: (t, k) =>
          selectionRef.current.some(r => r.trackId === t && r.keyframeId === k),
      }),
    [
      viewRef,
      sizeRef,
      tracksRef,
      trackHeightRef,
      scrollTopRef,
      rulerHeightRef,
      frameRef,
      showPlayheadRef,
      modeRef,
      selectionRef,
    ]
  );

  const moveFromState = useCallback(
    (state: PointerState, point: Point2D): TimelineTrack[] => {
      const view = viewRef.current;
      const width = sizeRef.current.width;
      const curFrame = xToFrame(point.x, view, width);
      const delta = curFrame - (state.startFramePos ?? curFrame);
      const origTracks = state.origTracks ?? tracksRef.current;
      const sel = state.moveSelection ?? [];
      if (modeRef.current === 'graph') {
        return moveSelectedKeyframesGraph(
          origTracks,
          sel,
          delta,
          point.y - state.startY,
          trackHeightRef.current,
          snapRef.current,
          startFrameRef.current,
          endFrameRef.current
        );
      }
      return moveSelectedKeyframes(
        origTracks,
        sel,
        delta,
        snapRef.current,
        startFrameRef.current,
        endFrameRef.current
      );
    },
    [
      viewRef,
      sizeRef,
      tracksRef,
      snapRef,
      startFrameRef,
      endFrameRef,
      modeRef,
      trackHeightRef,
    ]
  );

  const tangentOffset = useCallback(
    (state: PointerState, point: Point2D): { x: number; y: number } | null => {
      const ref = state.tangentRef;
      if (!ref) return null;
      const tracks = state.origTracks ?? tracksRef.current;
      const visible = tracks.filter(t => !t.hidden);
      const index = visible.findIndex(t => t.id === ref.trackId);
      const track = index >= 0 ? visible[index] : undefined;
      if (!track) return null;
      const kf = track.keyframes.find(k => k.id === ref.keyframeId);
      if (!kf) return null;
      const rowH = track.height ?? trackHeightRef.current;
      const top =
        rulerHeightRef.current +
        trackTop(index, trackHeightRef.current, scrollTopRef.current);
      const range = track.valueRange ?? autoValueRange(track.keyframes);
      return {
        x: xToFrame(point.x, viewRef.current, sizeRef.current.width) - kf.x,
        y: yToValue(point.y, range, top, rowH) - kf.y,
      };
    },
    [tracksRef, trackHeightRef, rulerHeightRef, scrollTopRef, viewRef, sizeRef]
  );

  const onPointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>): void => {
      const container = containerRef.current;
      if (!container) return;
      const point = localPoint(e, container);
      const view = viewRef.current;
      const width = sizeRef.current.width;

      if (e.button === 1) {
        e.preventDefault();
        container.setPointerCapture(e.pointerId);
        stateRef.current = {
          pointerId: e.pointerId,
          mode: 'pan',
          startX: point.x,
          startY: point.y,
          startView: view,
        };
        store.setDrag({ kind: 'pan', marquee: null });
        return;
      }
      if (e.button !== 0) return;

      const hit = hitAt(point);

      if (hit.kind === 'ruler' || hit.kind === 'playhead') {
        e.preventDefault();
        container.setPointerCapture(e.pointerId);
        stateRef.current = {
          pointerId: e.pointerId,
          mode: 'scrub',
          startX: point.x,
          startY: point.y,
        };
        store.setDrag({ kind: 'scrub', marquee: null });
        seekLiveRef.current(xToFrame(point.x, view, width));
        return;
      }

      if (hit.kind === 'tangent') {
        e.preventDefault();
        container.setPointerCapture(e.pointerId);
        stateRef.current = {
          pointerId: e.pointerId,
          mode: 'tangent',
          startX: point.x,
          startY: point.y,
          origTracks: tracksRef.current,
          tangentRef: { trackId: hit.trackId, keyframeId: hit.keyframeId },
          tangentWhich: hit.which,
        };
        store.setDrag({ kind: 'move', marquee: null });
        return;
      }

      if (hit.kind === 'keyframe') {
        const additive = e.shiftKey || e.ctrlKey || e.metaKey;
        const ref = { trackId: hit.trackId, keyframeId: hit.keyframeId };
        const sel = nextSelection(selectionRef.current, ref, additive);
        setSelectionRef.current(sel);
        if (editableRef.current) {
          e.preventDefault();
          container.setPointerCapture(e.pointerId);
          stateRef.current = {
            pointerId: e.pointerId,
            mode: 'move',
            startX: point.x,
            startY: point.y,
            origTracks: tracksRef.current,
            moveSelection: sel,
            startFramePos: xToFrame(point.x, view, width),
          };
          store.setDrag({ kind: 'move', marquee: null });
        }
        return;
      }

      // empty / outside → marquee box-select
      const additive = e.shiftKey || e.ctrlKey || e.metaKey;
      e.preventDefault();
      container.setPointerCapture(e.pointerId);
      stateRef.current = {
        pointerId: e.pointerId,
        mode: 'marquee',
        startX: point.x,
        startY: point.y,
        additive,
      };
      store.setDrag({
        kind: 'marquee',
        marquee: { x: point.x, y: point.y, width: 0, height: 0 },
      });
    },
    [
      containerRef,
      store,
      hitAt,
      viewRef,
      sizeRef,
      selectionRef,
      setSelectionRef,
      seekLiveRef,
      editableRef,
      tracksRef,
    ]
  );

  const onPointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>): void => {
      const state = stateRef.current;
      if (state?.pointerId !== e.pointerId) return;
      const container = containerRef.current;
      if (!container) return;
      const point = localPoint(e, container);
      const view = viewRef.current;
      const width = sizeRef.current.width;

      if (state.mode === 'scrub') {
        seekLiveRef.current(xToFrame(point.x, view, width));
        return;
      }
      if (state.mode === 'pan') {
        const startView = state.startView ?? view;
        const span = startView.endFrame - startView.startFrame;
        const dxFrames = ((point.x - state.startX) / Math.max(1, width)) * span;
        setViewRef.current({
          startFrame: startView.startFrame - dxFrames,
          endFrame: startView.endFrame - dxFrames,
        });
        return;
      }
      if (state.mode === 'tangent') {
        const offset = tangentOffset(state, point);
        if (offset && state.tangentRef && state.tangentWhich) {
          setTracksRef.current(
            setKeyframeTangent(
              state.origTracks ?? tracksRef.current,
              state.tangentRef,
              state.tangentWhich,
              offset
            )
          );
        }
        return;
      }
      if (state.mode === 'move') {
        setTracksRef.current(moveFromState(state, point));
        return;
      }
      if (state.mode === 'marquee') {
        store.setDrag({
          kind: 'marquee',
          marquee: {
            x: Math.min(state.startX, point.x),
            y: Math.min(state.startY, point.y),
            width: Math.abs(point.x - state.startX),
            height: Math.abs(point.y - state.startY),
          },
        });
      }
    },
    [
      containerRef,
      store,
      viewRef,
      sizeRef,
      seekLiveRef,
      setViewRef,
      setTracksRef,
      moveFromState,
      tangentOffset,
    ]
  );

  const endGesture = useCallback(
    (e: React.PointerEvent<HTMLDivElement>, cancelled: boolean): void => {
      const state = stateRef.current;
      if (state?.pointerId !== e.pointerId) return;
      const container = containerRef.current;
      if (container?.hasPointerCapture(e.pointerId)) {
        container.releasePointerCapture(e.pointerId);
      }
      const point = localPoint(e, container);
      const view = viewRef.current;
      const size = sizeRef.current;

      if (!cancelled) {
        if (state.mode === 'scrub') {
          seekCommitRef.current(xToFrame(point.x, view, size.width));
        } else if (state.mode === 'move') {
          commitTracksRef.current(moveFromState(state, point));
        } else if (state.mode === 'tangent') {
          const offset = tangentOffset(state, point);
          if (offset && state.tangentRef && state.tangentWhich) {
            commitTracksRef.current(
              setKeyframeTangent(
                state.origTracks ?? tracksRef.current,
                state.tangentRef,
                state.tangentWhich,
                offset
              )
            );
          }
        } else if (state.mode === 'marquee') {
          const rect = {
            x: Math.min(state.startX, point.x),
            y: Math.min(state.startY, point.y),
            width: Math.abs(point.x - state.startX),
            height: Math.abs(point.y - state.startY),
          };
          if (
            rect.width < CLICK_THRESHOLD_PX &&
            rect.height < CLICK_THRESHOLD_PX
          ) {
            if (!state.additive) setSelectionRef.current([]);
          } else {
            const found = keyframesInRect(
              rect,
              view,
              size,
              tracksRef.current,
              trackHeightRef.current,
              scrollTopRef.current,
              rulerHeightRef.current,
              modeRef.current
            );
            const base = state.additive ? selectionRef.current : [];
            setSelectionRef.current(mergeSelection(base, found));
          }
        }
      }

      store.setDrag({ kind: 'none', marquee: null });
      stateRef.current = null;
    },
    [
      containerRef,
      store,
      viewRef,
      sizeRef,
      seekCommitRef,
      commitTracksRef,
      moveFromState,
      setSelectionRef,
      selectionRef,
      tracksRef,
      trackHeightRef,
      scrollTopRef,
      rulerHeightRef,
      modeRef,
      tangentOffset,
    ]
  );

  const onPointerUp = useCallback(
    (e: React.PointerEvent<HTMLDivElement>): void => endGesture(e, false),
    [endGesture]
  );
  const onPointerCancel = useCallback(
    (e: React.PointerEvent<HTMLDivElement>): void => endGesture(e, true),
    [endGesture]
  );

  const onDoubleClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>): void => {
      if (!editableRef.current || !allowAddRef.current) return;
      const container = containerRef.current;
      if (!container) return;
      const point = localPoint(e, container);
      const hit = hitAt(point);
      if (hit.kind !== 'empty') return;
      const visible = tracksRef.current.filter(t => !t.hidden);
      const track = visible[hit.trackIndex];
      if (!track || track.locked) return;
      const view = viewRef.current;
      const width = sizeRef.current.width;
      const frame = clamp(
        snapFrame(xToFrame(point.x, view, width), snapRef.current),
        startFrameRef.current,
        endFrameRef.current
      );
      const next = addKeyframe(
        tracksRef.current,
        track.id,
        makeKeyframe(frame)
      );
      setTracksRef.current(next);
      commitTracksRef.current(next);
    },
    [
      containerRef,
      hitAt,
      editableRef,
      allowAddRef,
      tracksRef,
      viewRef,
      sizeRef,
      snapRef,
      startFrameRef,
      endFrameRef,
      setTracksRef,
      commitTracksRef,
    ]
  );

  const onWheel = useCallback(
    (e: WheelEvent): void => {
      const container = containerRef.current;
      if (!container) return;
      e.preventDefault();
      const view = viewRef.current;
      const width = Math.max(1, sizeRef.current.width);
      const span = view.endFrame - view.startFrame;

      if (e.shiftKey || Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
        const delta = e.shiftKey ? e.deltaY : e.deltaX;
        const panFrames = (delta / width) * span;
        setViewRef.current({
          startFrame: view.startFrame + panFrames,
          endFrame: view.endFrame + panFrames,
        });
        return;
      }

      const rangeSpan = Math.max(
        1,
        endFrameRef.current - startFrameRef.current
      );
      const maxSpan = maxFramesVisibleRef.current ?? rangeSpan;
      const factor = Math.exp(e.deltaY * 0.0015);
      const newSpan = clamp(
        span * factor,
        minFramesVisibleRef.current,
        maxSpan
      );
      const point = localPoint(e, container);
      const frac = point.x / width;
      const cursorFrame = view.startFrame + frac * span;
      const newStart = cursorFrame - frac * newSpan;
      setViewRef.current({
        startFrame: newStart,
        endFrame: newStart + newSpan,
      });
    },
    [
      containerRef,
      viewRef,
      sizeRef,
      setViewRef,
      startFrameRef,
      endFrameRef,
      minFramesVisibleRef,
      maxFramesVisibleRef,
    ]
  );

  const onKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>): void => {
      switch (e.key) {
        case 'ArrowLeft':
        case 'ArrowRight': {
          e.preventDefault();
          const dir = e.key === 'ArrowLeft' ? -1 : 1;
          const step = (e.shiftKey ? KEYBOARD_LARGE_STEP : 1) * dir;
          seekCommitRef.current(frameRef.current + step);
          return;
        }
        case 'Home':
          e.preventDefault();
          seekCommitRef.current(startFrameRef.current);
          return;
        case 'End':
          e.preventDefault();
          seekCommitRef.current(endFrameRef.current);
          return;
        case 'Delete':
        case 'Backspace': {
          if (!editableRef.current || !allowDeleteRef.current) return;
          const sel = selectionRef.current;
          if (sel.length === 0) return;
          e.preventDefault();
          const next = removeSelectedKeyframes(tracksRef.current, sel);
          setTracksRef.current(next);
          commitTracksRef.current(next);
          setSelectionRef.current([]);
          return;
        }
        default:
          return;
      }
    },
    [
      seekCommitRef,
      frameRef,
      startFrameRef,
      endFrameRef,
      editableRef,
      allowDeleteRef,
      selectionRef,
      tracksRef,
      setTracksRef,
      commitTracksRef,
      setSelectionRef,
    ]
  );

  const handlers = useMemo(
    () => ({
      onPointerDown,
      onPointerMove,
      onPointerUp,
      onPointerCancel,
      onDoubleClick,
      onKeyDown,
    }),
    [
      onPointerDown,
      onPointerMove,
      onPointerUp,
      onPointerCancel,
      onDoubleClick,
      onKeyDown,
    ]
  );

  return { handlers, onWheel };
}
