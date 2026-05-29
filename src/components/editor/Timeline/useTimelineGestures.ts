'use client';

import { useCallback, useMemo, useRef } from 'react';
import type React from 'react';
import { useLatest } from '@/hooks';
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
  loopStripHeight: number;
  loopHandles: 'edges' | 'brackets';
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
  loopWhich?: 'start' | 'end' | 'body' | 'create';
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
 * Pointer / wheel / keyboard gesture machine for `<Timeline>`. The hook is
 * called every render with a fresh `options` object (live props + the
 * component's action callbacks, several of which change identity on every
 * frame). They are read through a single `useLatest` ref so the returned
 * handlers keep a **stable identity for the component's lifetime** — they are
 * attached to the DOM (`onPointerDown=…`) and to a native `wheel` listener, so
 * stability is what keeps listeners from re-attaching every render. Reads
 * happen at event time, by which point the ref already holds the latest
 * committed options. Drag state (cursor + marquee) is written to the store,
 * not React state.
 */
export function useTimelineGestures(
  options: UseTimelineGesturesOptions
): UseTimelineGesturesReturn {
  // Single live snapshot of every option/action. `useLatest` keeps it synced
  // to the most recently committed render, so handlers below never need the
  // individual values in their dependency arrays.
  const optsRef = useLatest(options);

  const stateRef = useRef<PointerState | null>(null);
  const clipboardRef = useRef<TimelineClipboard | null>(null);

  const hitAt = useCallback(
    (point: Point2D) => {
      const o = optsRef.current;
      return hitTestTimeline({
        point,
        view: o.view,
        size: o.size,
        rows: o.rows,
        scrollTop: o.scrollTop,
        rulerHeight: o.rulerHeight,
        loopStripHeight: o.loopStripHeight,
        loopHandles: o.loopHandles,
        frame: o.frame,
        showPlayhead: o.showPlayhead,
        loopRegion: o.loopRegion,
        isSelected: (t, k) =>
          o.selection.some(r => r.trackId === t && r.keyframeId === k),
      });
    },
    [optsRef]
  );

  const moveFromState = useCallback(
    (state: PointerState, point: Point2D): TimelineTrack[] => {
      const o = optsRef.current;
      const view = o.view;
      const width = o.size.width;
      const curFrame = xToFrame(point.x, view, width);
      const delta = curFrame - (state.startFramePos ?? curFrame);
      const origTracks = state.origTracks ?? o.tracks;
      const sel = state.moveSelection ?? [];
      if (state.graphMove) {
        return moveSelectedKeyframesGraph(
          origTracks,
          sel,
          delta,
          point.y - state.startY,
          o.trackHeight,
          o.expandedHeight,
          o.snap,
          o.startFrame,
          o.endFrame
        );
      }
      return moveSelectedKeyframes(
        origTracks,
        sel,
        delta,
        o.snap,
        o.startFrame,
        o.endFrame
      );
    },
    [optsRef]
  );

  const tangentOffset = useCallback(
    (state: PointerState, point: Point2D): { x: number; y: number } | null => {
      const o = optsRef.current;
      const ref = state.tangentRef;
      if (!ref) return null;
      const geom = o.trackTops.get(ref.trackId);
      if (!geom) return null;
      const tracks = state.origTracks ?? o.tracks;
      const track = tracks.find(t => t.id === ref.trackId);
      const kf = track?.keyframes.find(k => k.id === ref.keyframeId);
      if (!track || !kf) return null;
      const screenTop =
        o.rulerHeight + o.loopStripHeight + geom.top - o.scrollTop;
      const range = geom.range;
      return {
        x: xToFrame(point.x, o.view, o.size.width) - kf.x,
        y: yToValue(point.y, range, screenTop, geom.height) - kf.y,
      };
    },
    [optsRef]
  );

  const onPointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>): void => {
      const o = optsRef.current;
      const container = o.containerRef.current;
      if (!container) return;
      const point = localPoint(e, container);
      const view = o.view;
      const width = o.size.width;

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
        o.store.setDrag({ kind: 'pan', marquee: null });
        return;
      }
      if (e.button !== 0) return;

      const hit = hitAt(point);

      if (
        hit.kind === 'loop-start' ||
        hit.kind === 'loop-end' ||
        hit.kind === 'loop-body'
      ) {
        const region = o.loopRegion;
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
        o.store.setDrag({ kind: 'scrub', marquee: null });
        return;
      }

      // Alt+drag on the ruler creates / narrows the loop region — works
      // even when looping is currently off (the drag flips `loop` to a
      // sub-range object via `setLoop`). Gated on the ruler band so it still
      // fires when the drag starts right on the playhead line.
      if (
        e.altKey &&
        point.y < o.rulerHeight &&
        (hit.kind === 'ruler' || hit.kind === 'playhead')
      ) {
        e.preventDefault();
        container.setPointerCapture(e.pointerId);
        const anchorFrame = xToFrame(point.x, view, width);
        const anchor = clamp(anchorFrame, o.startFrame, o.endFrame);
        stateRef.current = {
          pointerId: e.pointerId,
          mode: 'loop',
          startX: point.x,
          startY: point.y,
          loopWhich: 'create',
          startLoop: { startFrame: anchor, endFrame: anchor },
        };
        o.store.setDrag({ kind: 'scrub', marquee: null });
        o.setLoop({ startFrame: anchor, endFrame: anchor });
        return;
      }

      // Plain drag on the dedicated loop strip = loop create (no Alt needed).
      if (hit.kind === 'loop-strip') {
        e.preventDefault();
        container.setPointerCapture(e.pointerId);
        const anchorFrame = xToFrame(point.x, view, width);
        const anchor = clamp(anchorFrame, o.startFrame, o.endFrame);
        stateRef.current = {
          pointerId: e.pointerId,
          mode: 'loop',
          startX: point.x,
          startY: point.y,
          loopWhich: 'create',
          startLoop: { startFrame: anchor, endFrame: anchor },
        };
        o.store.setDrag({ kind: 'scrub', marquee: null });
        o.setLoop({ startFrame: anchor, endFrame: anchor });
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
        o.store.setDrag({ kind: 'scrub', marquee: null });
        o.seekLive(xToFrame(point.x, view, width));
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
          origTracks: o.tracks,
          tangentRef: { trackId: hit.trackId, keyframeId: hit.keyframeId },
          tangentWhich: hit.which,
        };
        o.store.setDrag({ kind: 'move', marquee: null });
        return;
      }

      if (hit.kind === 'group') {
        const groups = o.groups;
        o.setGroups(
          groups.map(g =>
            g.id === hit.groupId ? { ...g, collapsed: !g.collapsed } : g
          )
        );
        return;
      }

      if (hit.kind === 'keyframe') {
        const additive = e.shiftKey || e.ctrlKey || e.metaKey;
        const ref = { trackId: hit.trackId, keyframeId: hit.keyframeId };
        const sel = nextSelection(o.selection, ref, additive);
        o.setSelection(sel);
        if (o.editable) {
          e.preventDefault();
          container.setPointerCapture(e.pointerId);
          stateRef.current = {
            pointerId: e.pointerId,
            mode: 'move',
            startX: point.x,
            startY: point.y,
            origTracks: o.tracks,
            moveSelection: sel,
            graphMove: o.trackTops.get(hit.trackId)?.graph ?? false,
            startFramePos: xToFrame(point.x, view, width),
          };
          o.store.setDrag({ kind: 'move', marquee: null });
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
      o.store.setDrag({
        kind: 'marquee',
        marquee: { x: point.x, y: point.y, width: 0, height: 0 },
      });
    },
    [optsRef, hitAt]
  );

  const onPointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>): void => {
      const o = optsRef.current;
      const container = o.containerRef.current;
      if (!container) return;
      const point = localPoint(e, container);
      const state = stateRef.current;

      // Hover-tracking: only when no active drag (so the diamond / circle can
      // grow under the cursor as a "grabbable" affordance; playhead glows
      // when the cursor is over the line or its head).
      if (!state) {
        const hit = hitAt(point);
        if (hit.kind === 'keyframe') {
          o.store.setHover({
            trackId: hit.trackId,
            keyframeId: hit.keyframeId,
          });
        } else {
          o.store.setHover(null);
        }
        o.store.setHoverPlayhead(hit.kind === 'playhead');
        o.store.setHoverLoop(
          hit.kind === 'loop-start'
            ? 'start'
            : hit.kind === 'loop-end'
              ? 'end'
              : hit.kind === 'loop-body'
                ? 'body'
                : null
        );
      }

      if (state?.pointerId !== e.pointerId) return;
      const view = o.view;
      const width = o.size.width;

      if (state.mode === 'loop') {
        const frame = xToFrame(point.x, view, width);
        const sl = state.startLoop;
        if (sl && state.loopWhich === 'create') {
          const cur = clamp(frame, o.startFrame, o.endFrame);
          o.setLoop({
            startFrame: Math.min(sl.startFrame, cur),
            endFrame: Math.max(sl.startFrame, cur),
          });
        } else if (sl && state.loopWhich === 'start') {
          o.setLoop({
            startFrame: clamp(frame, o.startFrame, sl.endFrame),
            endFrame: sl.endFrame,
          });
        } else if (sl && state.loopWhich === 'end') {
          o.setLoop({
            startFrame: sl.startFrame,
            endFrame: clamp(frame, sl.startFrame, o.endFrame),
          });
        } else if (sl) {
          const span = sl.endFrame - sl.startFrame;
          const delta = frame - xToFrame(state.startX, view, width);
          const ns = clamp(
            sl.startFrame + delta,
            o.startFrame,
            o.endFrame - span
          );
          o.setLoop({ startFrame: ns, endFrame: ns + span });
        }
        return;
      }
      if (state.mode === 'scrub') {
        o.seekLive(xToFrame(point.x, view, width));
        return;
      }
      if (state.mode === 'pan') {
        const startView = state.startView ?? view;
        const span = startView.endFrame - startView.startFrame;
        const dxFrames = ((point.x - state.startX) / Math.max(1, width)) * span;
        o.setView({
          startFrame: startView.startFrame - dxFrames,
          endFrame: startView.endFrame - dxFrames,
        });
        return;
      }
      if (state.mode === 'tangent') {
        const offset = tangentOffset(state, point);
        if (offset && state.tangentRef && state.tangentWhich) {
          o.setTracks(
            setKeyframeTangent(
              state.origTracks ?? o.tracks,
              state.tangentRef,
              state.tangentWhich,
              offset
            )
          );
        }
        return;
      }
      if (state.mode === 'move') {
        o.setTracks(moveFromState(state, point));
        return;
      }
      if (state.mode === 'marquee') {
        o.store.setDrag({
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
    [optsRef, hitAt, tangentOffset, moveFromState]
  );

  const onPointerLeave = useCallback((): void => {
    const o = optsRef.current;
    o.store.setHover(null);
    o.store.setHoverPlayhead(false);
    o.store.setHoverLoop(null);
  }, [optsRef]);

  const endGesture = useCallback(
    (e: React.PointerEvent<HTMLDivElement>, cancelled: boolean): void => {
      const o = optsRef.current;
      const state = stateRef.current;
      if (state?.pointerId !== e.pointerId) return;
      const container = o.containerRef.current;
      if (container?.hasPointerCapture(e.pointerId)) {
        container.releasePointerCapture(e.pointerId);
      }
      const point = localPoint(e, container);
      const view = o.view;
      const size = o.size;

      if (!cancelled) {
        if (state.mode === 'loop' && state.loopWhich === 'create') {
          // Bare Alt-click (no drag) on the ruler: don't leave a zero-width
          // loop hanging around — clear it.
          if (Math.abs(point.x - state.startX) < CLICK_THRESHOLD_PX) {
            o.setLoop(false);
          }
        } else if (state.mode === 'scrub') {
          o.seekCommit(xToFrame(point.x, view, size.width));
        } else if (state.mode === 'move') {
          o.commitTracks(moveFromState(state, point));
        } else if (state.mode === 'tangent') {
          const offset = tangentOffset(state, point);
          if (offset && state.tangentRef && state.tangentWhich) {
            o.commitTracks(
              setKeyframeTangent(
                state.origTracks ?? o.tracks,
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
            if (!state.additive) o.setSelection([]);
          } else {
            const found = keyframesInRect(
              {
                x: rect.x,
                y: rect.y - o.rulerHeight - o.loopStripHeight + o.scrollTop,
                width: rect.width,
                height: rect.height,
              },
              view,
              size,
              o.rows
            );
            const base = state.additive ? o.selection : [];
            o.setSelection(mergeSelection(base, found));
          }
        }
      }

      o.store.setDrag({ kind: 'none', marquee: null });
      stateRef.current = null;
    },
    [optsRef, moveFromState, tangentOffset]
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
      const o = optsRef.current;
      if (!o.editable || !o.allowAddKeyframe) return;
      const container = o.containerRef.current;
      if (!container) return;
      const point = localPoint(e, container);
      const hit = hitAt(point);
      if (hit.kind !== 'empty') return;
      const track = o.tracks.find(t => t.id === hit.trackId);
      if (!track || track.locked) return;
      const view = o.view;
      const width = o.size.width;
      const frame = clamp(
        snapFrame(xToFrame(point.x, view, width), o.snap),
        o.startFrame,
        o.endFrame
      );
      const value = valueAtPointer({
        pointerY: point.y,
        frame,
        track,
        geometry: o.trackTops.get(track.id),
        rulerHeight: o.rulerHeight + o.loopStripHeight,
        scrollTop: o.scrollTop,
      });
      const next = addKeyframe(o.tracks, track.id, makeKeyframe(frame, value));
      o.setTracks(next);
      o.commitTracks(next);
    },
    [optsRef, hitAt]
  );

  const onWheel = useCallback(
    (e: WheelEvent): void => {
      const o = optsRef.current;
      const container = o.containerRef.current;
      if (!container) return;
      e.preventDefault();
      const view = o.view;
      const width = Math.max(1, o.size.width);
      const span = view.endFrame - view.startFrame;

      if (e.shiftKey || Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
        const delta = e.shiftKey ? e.deltaY : e.deltaX;
        const panFrames = (delta / width) * span;
        o.setView({
          startFrame: view.startFrame + panFrames,
          endFrame: view.endFrame + panFrames,
        });
        return;
      }

      // Plain vertical wheel scrolls tracks when they overflow; Ctrl/Cmd zooms.
      if (!e.ctrlKey && !e.metaKey && o.maxScrollTop > 0) {
        o.scrollBy(e.deltaY);
        return;
      }

      const rangeSpan = Math.max(1, o.endFrame - o.startFrame);
      const maxSpan = o.maxFramesVisible ?? rangeSpan;
      const factor = Math.exp(e.deltaY * 0.0015);
      const newSpan = clamp(span * factor, o.minFramesVisible, maxSpan);
      const point = localPoint(e, container);
      const frac = point.x / width;
      const cursorFrame = view.startFrame + frac * span;
      const newStart = cursorFrame - frac * newSpan;
      o.setView({
        startFrame: newStart,
        endFrame: newStart + newSpan,
      });
    },
    [optsRef]
  );

  const onKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>): void => {
      const o = optsRef.current;
      switch (e.key) {
        case 'ArrowLeft':
        case 'ArrowRight': {
          e.preventDefault();
          const dir = e.key === 'ArrowLeft' ? -1 : 1;
          const step = (e.shiftKey ? KEYBOARD_LARGE_STEP : 1) * dir;
          o.seekCommit(o.frame + step);
          return;
        }
        case 'Home':
          e.preventDefault();
          o.seekCommit(o.startFrame);
          return;
        case 'End':
          e.preventDefault();
          o.seekCommit(o.endFrame);
          return;
        case 'Delete':
        case 'Backspace': {
          if (!o.editable || !o.allowDeleteKeyframe) return;
          const sel = o.selection;
          if (sel.length === 0) return;
          e.preventDefault();
          const next = removeSelectedKeyframes(o.tracks, sel);
          o.setTracks(next);
          o.commitTracks(next);
          o.setSelection([]);
          return;
        }
        case 'c':
        case 'C': {
          if (!(e.ctrlKey || e.metaKey)) return;
          e.preventDefault();
          clipboardRef.current = copySelectedKeyframes(o.tracks, o.selection);
          return;
        }
        case 'v':
        case 'V': {
          if (!(e.ctrlKey || e.metaKey) || !o.editable) return;
          const clip = clipboardRef.current;
          if (!clip || clip.entries.length === 0) return;
          e.preventDefault();
          const pasted = pasteKeyframes(o.tracks, clip, o.frame);
          o.setTracks(pasted.tracks);
          o.commitTracks(pasted.tracks);
          o.setSelection(pasted.refs);
          return;
        }
        default:
          return;
      }
    },
    [optsRef]
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
    [
      onPointerDown,
      onPointerMove,
      onPointerUp,
      onPointerCancel,
      onPointerLeave,
      onDoubleClick,
      onKeyDown,
    ]
  );

  return { handlers, onWheel };
}
