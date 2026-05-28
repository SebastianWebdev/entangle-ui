'use client';

import { useEffectEvent, useMemo, useRef } from 'react';
import type React from 'react';
import type { Point2D } from '@/components/primitives/canvas/canvas.types';
import type { ViewportSize } from '@/components/primitives/viewport';
import type {
  TimelineGroup,
  TimelineKeyframeRef,
  TimelineLoop,
  TimelineSelection,
  TimelineTrack,
  TimelineView,
} from './Timeline.types';
import type { TimelineRow, TrackGeometry } from './timelineLayout';
import type { TimelineStore } from './TimelineStore';
import { clamp, snapFrame, xToFrame, yToValue } from './timelineCoords';
import { hitTestTimeline, keyframesInRect } from './timelineHitTest';
import {
  addKeyframe,
  copySelectedKeyframes,
  makeKeyframe,
  moveSelectedKeyframes,
  moveSelectedKeyframesGraph,
  pasteKeyframes,
  removeSelectedKeyframes,
  setKeyframeTangent,
  valueAtPointer,
} from './timelineEdits';
import type { TimelineClipboard } from './timelineEdits';
import { sameRef } from './timelineSelection';

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
  setLoop: (loop: TimelineLoop) => void;
  scrollBy: (deltaPixels: number) => void;
  setGroups: (groups: TimelineGroup[]) => void;
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
  rows: ReadonlyArray<TimelineRow>;
  trackTops: ReadonlyMap<string, TrackGeometry>;
  expandedHeight: number;
  groups: ReadonlyArray<TimelineGroup>;
  minFramesVisible: number;
  maxFramesVisible: number | undefined;
  loopRegion: { startFrame: number; endFrame: number } | null;
  maxScrollTop: number;
}

interface PointerState {
  pointerId: number;
  mode: 'scrub' | 'move' | 'marquee' | 'pan' | 'tangent' | 'loop';
  startX: number;
  startY: number;
  origTracks?: ReadonlyArray<TimelineTrack>;
  moveSelection?: TimelineSelection;
  graphMove?: boolean;
  startFramePos?: number;
  startView?: TimelineView;
  additive?: boolean;
  tangentRef?: TimelineKeyframeRef;
  tangentWhich?: 'in' | 'out';
  loopWhich?: 'start' | 'end' | 'body';
  startLoop?: { startFrame: number; endFrame: number };
}

export interface UseTimelineGesturesReturn {
  handlers: {
    onPointerDown: (e: React.PointerEvent<HTMLDivElement>) => void;
    onPointerMove: (e: React.PointerEvent<HTMLDivElement>) => void;
    onPointerUp: (e: React.PointerEvent<HTMLDivElement>) => void;
    onPointerCancel: (e: React.PointerEvent<HTMLDivElement>) => void;
    onPointerLeave: () => void;
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
 * actions are read through `useEffectEvent` so the returned handlers stay
 * stable for the component's lifetime. Drag state (cursor + marquee) is
 * written to the store, not React state.
 */
export function useTimelineGestures(
  opts: UseTimelineGesturesOptions
): UseTimelineGesturesReturn {
  const { containerRef, store } = opts;

  const stateRef = useRef<PointerState | null>(null);
  const clipboardRef = useRef<TimelineClipboard | null>(null);

  const hitAt = useEffectEvent((point: Point2D) =>
    hitTestTimeline({
      point,
      view: opts.view,
      size: opts.size,
      rows: opts.rows,
      scrollTop: opts.scrollTop,
      rulerHeight: opts.rulerHeight,
      frame: opts.frame,
      showPlayhead: opts.showPlayhead,
      loopRegion: opts.loopRegion,
      isSelected: (t, k) =>
        opts.selection.some(r => r.trackId === t && r.keyframeId === k),
    })
  );

  const moveFromState = useEffectEvent(
    (state: PointerState, point: Point2D): TimelineTrack[] => {
      const view = opts.view;
      const width = opts.size.width;
      const curFrame = xToFrame(point.x, view, width);
      const delta = curFrame - (state.startFramePos ?? curFrame);
      const origTracks = state.origTracks ?? opts.tracks;
      const sel = state.moveSelection ?? [];
      if (state.graphMove) {
        return moveSelectedKeyframesGraph(
          origTracks,
          sel,
          delta,
          point.y - state.startY,
          opts.trackHeight,
          opts.expandedHeight,
          opts.snap,
          opts.startFrame,
          opts.endFrame
        );
      }
      return moveSelectedKeyframes(
        origTracks,
        sel,
        delta,
        opts.snap,
        opts.startFrame,
        opts.endFrame
      );
    }
  );

  const tangentOffset = useEffectEvent(
    (state: PointerState, point: Point2D): { x: number; y: number } | null => {
      const ref = state.tangentRef;
      if (!ref) return null;
      const geom = opts.trackTops.get(ref.trackId);
      if (!geom) return null;
      const tracks = state.origTracks ?? opts.tracks;
      const track = tracks.find(t => t.id === ref.trackId);
      const kf = track?.keyframes.find(k => k.id === ref.keyframeId);
      if (!track || !kf) return null;
      const screenTop = opts.rulerHeight + geom.top - opts.scrollTop;
      const range = geom.range;
      return {
        x: xToFrame(point.x, opts.view, opts.size.width) - kf.x,
        y: yToValue(point.y, range, screenTop, geom.height) - kf.y,
      };
    }
  );

  const onPointerDown = useEffectEvent(
    (e: React.PointerEvent<HTMLDivElement>): void => {
      const container = containerRef.current;
      if (!container) return;
      const point = localPoint(e, container);
      const view = opts.view;
      const width = opts.size.width;

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

      if (
        hit.kind === 'loop-start' ||
        hit.kind === 'loop-end' ||
        hit.kind === 'loop-body'
      ) {
        const region = opts.loopRegion;
        if (!region) return;
        e.preventDefault();
        container.setPointerCapture(e.pointerId);
        stateRef.current = {
          pointerId: e.pointerId,
          mode: 'loop',
          startX: point.x,
          startY: point.y,
          loopWhich:
            hit.kind === 'loop-start'
              ? 'start'
              : hit.kind === 'loop-end'
                ? 'end'
                : 'body',
          startLoop: region,
        };
        store.setDrag({ kind: 'scrub', marquee: null });
        return;
      }

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
        opts.seekLive(xToFrame(point.x, view, width));
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
          origTracks: opts.tracks,
          tangentRef: { trackId: hit.trackId, keyframeId: hit.keyframeId },
          tangentWhich: hit.which,
        };
        store.setDrag({ kind: 'move', marquee: null });
        return;
      }

      if (hit.kind === 'group') {
        const groups = opts.groups;
        opts.setGroups(
          groups.map(g =>
            g.id === hit.groupId ? { ...g, collapsed: !g.collapsed } : g
          )
        );
        return;
      }

      if (hit.kind === 'keyframe') {
        const additive = e.shiftKey || e.ctrlKey || e.metaKey;
        const ref = { trackId: hit.trackId, keyframeId: hit.keyframeId };
        const sel = nextSelection(opts.selection, ref, additive);
        opts.setSelection(sel);
        if (opts.editable) {
          e.preventDefault();
          container.setPointerCapture(e.pointerId);
          stateRef.current = {
            pointerId: e.pointerId,
            mode: 'move',
            startX: point.x,
            startY: point.y,
            origTracks: opts.tracks,
            moveSelection: sel,
            graphMove: opts.trackTops.get(hit.trackId)?.graph ?? false,
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
    }
  );

  const onPointerMove = useEffectEvent(
    (e: React.PointerEvent<HTMLDivElement>): void => {
      const container = containerRef.current;
      if (!container) return;
      const point = localPoint(e, container);
      const state = stateRef.current;

      // Hover-tracking: only when no active drag (so the diamond / circle can
      // grow under the cursor as a "grabbable" affordance; playhead glows
      // when the cursor is over the line or its head).
      if (!state) {
        const hit = hitAt(point);
        if (hit.kind === 'keyframe') {
          store.setHover({ trackId: hit.trackId, keyframeId: hit.keyframeId });
        } else {
          store.setHover(null);
        }
        store.setHoverPlayhead(hit.kind === 'playhead');
      }

      if (state?.pointerId !== e.pointerId) return;
      const view = opts.view;
      const width = opts.size.width;

      if (state.mode === 'loop') {
        const frame = xToFrame(point.x, view, width);
        const sl = state.startLoop;
        if (sl && state.loopWhich === 'start') {
          opts.setLoop({
            startFrame: clamp(frame, opts.startFrame, sl.endFrame),
            endFrame: sl.endFrame,
          });
        } else if (sl && state.loopWhich === 'end') {
          opts.setLoop({
            startFrame: sl.startFrame,
            endFrame: clamp(frame, sl.startFrame, opts.endFrame),
          });
        } else if (sl) {
          const span = sl.endFrame - sl.startFrame;
          const delta = frame - xToFrame(state.startX, view, width);
          const ns = clamp(
            sl.startFrame + delta,
            opts.startFrame,
            opts.endFrame - span
          );
          opts.setLoop({ startFrame: ns, endFrame: ns + span });
        }
        return;
      }
      if (state.mode === 'scrub') {
        opts.seekLive(xToFrame(point.x, view, width));
        return;
      }
      if (state.mode === 'pan') {
        const startView = state.startView ?? view;
        const span = startView.endFrame - startView.startFrame;
        const dxFrames = ((point.x - state.startX) / Math.max(1, width)) * span;
        opts.setView({
          startFrame: startView.startFrame - dxFrames,
          endFrame: startView.endFrame - dxFrames,
        });
        return;
      }
      if (state.mode === 'tangent') {
        const offset = tangentOffset(state, point);
        if (offset && state.tangentRef && state.tangentWhich) {
          opts.setTracks(
            setKeyframeTangent(
              state.origTracks ?? opts.tracks,
              state.tangentRef,
              state.tangentWhich,
              offset
            )
          );
        }
        return;
      }
      if (state.mode === 'move') {
        opts.setTracks(moveFromState(state, point));
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
    }
  );

  const onPointerLeave = useEffectEvent((): void => {
    store.setHover(null);
    store.setHoverPlayhead(false);
  });

  const endGesture = useEffectEvent(
    (e: React.PointerEvent<HTMLDivElement>, cancelled: boolean): void => {
      const state = stateRef.current;
      if (state?.pointerId !== e.pointerId) return;
      const container = containerRef.current;
      if (container?.hasPointerCapture(e.pointerId)) {
        container.releasePointerCapture(e.pointerId);
      }
      const point = localPoint(e, container);
      const view = opts.view;
      const size = opts.size;

      if (!cancelled) {
        if (state.mode === 'scrub') {
          opts.seekCommit(xToFrame(point.x, view, size.width));
        } else if (state.mode === 'move') {
          opts.commitTracks(moveFromState(state, point));
        } else if (state.mode === 'tangent') {
          const offset = tangentOffset(state, point);
          if (offset && state.tangentRef && state.tangentWhich) {
            opts.commitTracks(
              setKeyframeTangent(
                state.origTracks ?? opts.tracks,
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
            if (!state.additive) opts.setSelection([]);
          } else {
            const found = keyframesInRect(
              {
                x: rect.x,
                y: rect.y - opts.rulerHeight + opts.scrollTop,
                width: rect.width,
                height: rect.height,
              },
              view,
              size,
              opts.rows
            );
            const base = state.additive ? opts.selection : [];
            opts.setSelection(mergeSelection(base, found));
          }
        }
      }

      store.setDrag({ kind: 'none', marquee: null });
      stateRef.current = null;
    }
  );

  const onPointerUp = useEffectEvent(
    (e: React.PointerEvent<HTMLDivElement>): void => endGesture(e, false)
  );
  const onPointerCancel = useEffectEvent(
    (e: React.PointerEvent<HTMLDivElement>): void => endGesture(e, true)
  );

  const onDoubleClick = useEffectEvent(
    (e: React.MouseEvent<HTMLDivElement>): void => {
      if (!opts.editable || !opts.allowAddKeyframe) return;
      const container = containerRef.current;
      if (!container) return;
      const point = localPoint(e, container);
      const hit = hitAt(point);
      if (hit.kind !== 'empty') return;
      const track = opts.tracks.find(t => t.id === hit.trackId);
      if (!track || track.locked) return;
      const view = opts.view;
      const width = opts.size.width;
      const frame = clamp(
        snapFrame(xToFrame(point.x, view, width), opts.snap),
        opts.startFrame,
        opts.endFrame
      );
      const value = valueAtPointer({
        pointerY: point.y,
        frame,
        track,
        geometry: opts.trackTops.get(track.id),
        rulerHeight: opts.rulerHeight,
        scrollTop: opts.scrollTop,
      });
      const next = addKeyframe(
        opts.tracks,
        track.id,
        makeKeyframe(frame, value)
      );
      opts.setTracks(next);
      opts.commitTracks(next);
    }
  );

  const onWheel = useEffectEvent((e: WheelEvent): void => {
    const container = containerRef.current;
    if (!container) return;
    e.preventDefault();
    const view = opts.view;
    const width = Math.max(1, opts.size.width);
    const span = view.endFrame - view.startFrame;

    if (e.shiftKey || Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
      const delta = e.shiftKey ? e.deltaY : e.deltaX;
      const panFrames = (delta / width) * span;
      opts.setView({
        startFrame: view.startFrame + panFrames,
        endFrame: view.endFrame + panFrames,
      });
      return;
    }

    // Plain vertical wheel scrolls tracks when they overflow; Ctrl/Cmd zooms.
    if (!e.ctrlKey && !e.metaKey && opts.maxScrollTop > 0) {
      opts.scrollBy(e.deltaY);
      return;
    }

    const rangeSpan = Math.max(1, opts.endFrame - opts.startFrame);
    const maxSpan = opts.maxFramesVisible ?? rangeSpan;
    const factor = Math.exp(e.deltaY * 0.0015);
    const newSpan = clamp(span * factor, opts.minFramesVisible, maxSpan);
    const point = localPoint(e, container);
    const frac = point.x / width;
    const cursorFrame = view.startFrame + frac * span;
    const newStart = cursorFrame - frac * newSpan;
    opts.setView({
      startFrame: newStart,
      endFrame: newStart + newSpan,
    });
  });

  const onKeyDown = useEffectEvent(
    (e: React.KeyboardEvent<HTMLDivElement>): void => {
      switch (e.key) {
        case 'ArrowLeft':
        case 'ArrowRight': {
          e.preventDefault();
          const dir = e.key === 'ArrowLeft' ? -1 : 1;
          const step = (e.shiftKey ? KEYBOARD_LARGE_STEP : 1) * dir;
          opts.seekCommit(opts.frame + step);
          return;
        }
        case 'Home':
          e.preventDefault();
          opts.seekCommit(opts.startFrame);
          return;
        case 'End':
          e.preventDefault();
          opts.seekCommit(opts.endFrame);
          return;
        case 'Delete':
        case 'Backspace': {
          if (!opts.editable || !opts.allowDeleteKeyframe) return;
          const sel = opts.selection;
          if (sel.length === 0) return;
          e.preventDefault();
          const next = removeSelectedKeyframes(opts.tracks, sel);
          opts.setTracks(next);
          opts.commitTracks(next);
          opts.setSelection([]);
          return;
        }
        case 'c':
        case 'C': {
          if (!(e.ctrlKey || e.metaKey)) return;
          e.preventDefault();
          clipboardRef.current = copySelectedKeyframes(
            opts.tracks,
            opts.selection
          );
          return;
        }
        case 'v':
        case 'V': {
          if (!(e.ctrlKey || e.metaKey) || !opts.editable) return;
          const clip = clipboardRef.current;
          if (!clip || clip.entries.length === 0) return;
          e.preventDefault();
          const pasted = pasteKeyframes(opts.tracks, clip, opts.frame);
          opts.setTracks(pasted.tracks);
          opts.commitTracks(pasted.tracks);
          opts.setSelection(pasted.refs);
          return;
        }
        default:
          return;
      }
    }
  );

  const handlers = useMemo(
    () => ({
      onPointerDown,
      onPointerMove,
      onPointerUp,
      onPointerCancel,
      onPointerLeave,
      onDoubleClick,
      onKeyDown,
    }),
    // `useEffectEvent` returns stable callbacks — the bag is stable for the
    // component's lifetime.
    []
  );

  return { handlers, onWheel };
}
