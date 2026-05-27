import type { CurveKeyframe } from '@/types/keyframe';
import type {
  TimelineKeyframeRef,
  TimelineSelection,
  TimelineTrack,
} from './Timeline.types';
import { autoValueRange, clamp, snapFrame } from './timelineCoords';

function selKey(trackId: string, keyframeId: string): string {
  return `${trackId} ${keyframeId}`;
}

function selectionKeySet(selection: TimelineSelection): Set<string> {
  return new Set(selection.map(r => selKey(r.trackId, r.keyframeId)));
}

let idCounter = 0;

/** Generate a stable, unique keyframe id. */
export function generateKeyframeId(): string {
  idCounter += 1;
  return `kf_${Date.now().toString(36)}_${idCounter}`;
}

/** Build a keyframe at `(frame, value)` with flat tangents. */
export function makeKeyframe(frame: number, value = 0): CurveKeyframe {
  return {
    id: generateKeyframeId(),
    x: frame,
    y: value,
    handleIn: { x: 0, y: 0 },
    handleOut: { x: 0, y: 0 },
    tangentMode: 'auto',
  };
}

/**
 * Move the selected keyframes by `deltaFrames` from the supplied (original)
 * track positions, snapping + clamping each to `[min, max]`. Pass the tracks
 * captured at drag-start so repeated calls don't accumulate drift.
 */
export function moveSelectedKeyframes(
  tracks: ReadonlyArray<TimelineTrack>,
  selection: TimelineSelection,
  deltaFrames: number,
  snap: boolean | number,
  min: number,
  max: number
): TimelineTrack[] {
  const keys = selectionKeySet(selection);
  return tracks.map(track => {
    if (track.locked) return track;
    let changed = false;
    const keyframes = track.keyframes.map(kf => {
      if (kf.id === undefined || !keys.has(selKey(track.id, kf.id))) return kf;
      changed = true;
      return { ...kf, x: clamp(snapFrame(kf.x + deltaFrames, snap), min, max) };
    });
    if (!changed) return track;
    keyframes.sort((a, b) => a.x - b.x);
    return { ...track, keyframes };
  });
}

/**
 * Graph-mode move: shifts selected keyframes by `deltaFrames` (x, snapped +
 * clamped) and by a pixel delta on the value axis, converted per track using
 * its row height + value range. Pass drag-start tracks so the range mapping
 * stays stable across the drag.
 */
export function moveSelectedKeyframesGraph(
  tracks: ReadonlyArray<TimelineTrack>,
  selection: TimelineSelection,
  deltaFrames: number,
  deltaYPixels: number,
  trackHeight: number,
  snap: boolean | number,
  min: number,
  max: number
): TimelineTrack[] {
  const keys = selectionKeySet(selection);
  return tracks.map(track => {
    if (track.locked) return track;
    const keyMatches = track.keyframes.some(
      kf => kf.id !== undefined && keys.has(selKey(track.id, kf.id))
    );
    if (!keyMatches) return track;
    const rowH = track.height ?? trackHeight;
    const range = track.valueRange ?? autoValueRange(track.keyframes);
    const inset = Math.min(8, rowH * 0.2);
    const usable = Math.max(1e-6, rowH - inset * 2);
    const valueDelta = -(deltaYPixels / usable) * (range[1] - range[0]);
    const keyframes = track.keyframes.map(kf => {
      if (kf.id === undefined || !keys.has(selKey(track.id, kf.id))) return kf;
      return {
        ...kf,
        x: clamp(snapFrame(kf.x + deltaFrames, snap), min, max),
        y: kf.y + valueDelta,
      };
    });
    keyframes.sort((a, b) => a.x - b.x);
    return { ...track, keyframes };
  });
}

/** Remove the selected keyframes from their tracks. */
export function removeSelectedKeyframes(
  tracks: ReadonlyArray<TimelineTrack>,
  selection: TimelineSelection
): TimelineTrack[] {
  const keys = selectionKeySet(selection);
  return tracks.map(track => {
    const keyframes = track.keyframes.filter(
      kf => kf.id === undefined || !keys.has(selKey(track.id, kf.id))
    );
    return keyframes.length === track.keyframes.length
      ? track
      : { ...track, keyframes };
  });
}

/** Insert a keyframe into a track, keeping the track's keyframes sorted by x. */
export function addKeyframe(
  tracks: ReadonlyArray<TimelineTrack>,
  trackId: string,
  keyframe: CurveKeyframe
): TimelineTrack[] {
  return tracks.map(track => {
    if (track.id !== trackId) return track;
    const keyframes = [...track.keyframes, keyframe].sort((a, b) => a.x - b.x);
    return { ...track, keyframes };
  });
}

/**
 * Apply a dragged tangent handle offset (domain units) to one keyframe,
 * honoring its tangent mode. `auto` / `linear` / `step` are promoted to
 * `aligned` on first drag; `aligned` keeps the opposite handle collinear at
 * its current length; `mirrored` makes it the exact opposite; `free` moves
 * only the dragged handle.
 */
function applyTangent(
  kf: CurveKeyframe,
  which: 'in' | 'out',
  offset: { x: number; y: number }
): CurveKeyframe {
  const mode =
    kf.tangentMode === 'auto' ||
    kf.tangentMode === 'linear' ||
    kf.tangentMode === 'step'
      ? 'aligned'
      : kf.tangentMode;

  let handleIn = which === 'in' ? offset : kf.handleIn;
  let handleOut = which === 'out' ? offset : kf.handleOut;

  if (mode === 'aligned' || mode === 'mirrored') {
    const draggedLen = Math.hypot(offset.x, offset.y);
    const other = which === 'in' ? kf.handleOut : kf.handleIn;
    const otherLen =
      mode === 'mirrored' ? draggedLen : Math.hypot(other.x, other.y);
    if (draggedLen > 1e-6) {
      const opposite = {
        x: (-offset.x / draggedLen) * otherLen,
        y: (-offset.y / draggedLen) * otherLen,
      };
      if (which === 'in') handleOut = opposite;
      else handleIn = opposite;
    }
  }

  return { ...kf, handleIn, handleOut, tangentMode: mode };
}

/** Set one keyframe's in/out tangent handle to a new offset (domain units). */
export function setKeyframeTangent(
  tracks: ReadonlyArray<TimelineTrack>,
  ref: TimelineKeyframeRef,
  which: 'in' | 'out',
  offset: { x: number; y: number }
): TimelineTrack[] {
  return tracks.map(track => {
    if (track.id !== ref.trackId || track.locked) return track;
    let changed = false;
    const keyframes = track.keyframes.map(kf => {
      if (kf.id !== ref.keyframeId) return kf;
      changed = true;
      return applyTangent(kf, which, offset);
    });
    return changed ? { ...track, keyframes } : track;
  });
}
