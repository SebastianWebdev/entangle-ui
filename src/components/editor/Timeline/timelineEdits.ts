import type { CurveKeyframe } from '@/types/keyframe';
import { evaluateCurve } from '@/components/controls/CurveEditor';
import type {
  TimelineKeyframeRef,
  TimelineSelection,
  TimelineTrack,
} from './Timeline.types';
import type { TrackGeometry } from './timelineLayout';
import { autoValueRange, clamp, snapFrame, yToValue } from './timelineCoords';

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
 * Pick the value (y) for a new keyframe inserted at a pointer position.
 * In a graph / expanded row, the click's pixel-y is converted back to a value
 * on the track's value axis (clamped to `valueRange`), so the new keyframe
 * lands exactly under the cursor. In a dope-sheet row (no visible y axis) the
 * new keyframe sits **on the existing curve** at the clicked frame so it
 * doesn't disturb the shape; with no existing keyframes it falls back to the
 * midpoint of the range.
 */
export function valueAtPointer(args: {
  pointerY: number;
  frame: number;
  track: TimelineTrack;
  geometry: TrackGeometry | undefined;
  rulerHeight: number;
  scrollTop: number;
}): number {
  const { pointerY, frame, track, geometry, rulerHeight, scrollTop } = args;
  const range = track.valueRange ?? autoValueRange(track.keyframes);
  if (geometry?.graph) {
    const screenTop = rulerHeight + geometry.top - scrollTop;
    return clamp(
      yToValue(pointerY, range, screenTop, geometry.height),
      range[0],
      range[1]
    );
  }
  if (track.keyframes.length > 0) {
    return evaluateCurve(
      { keyframes: track.keyframes, domainX: [0, 1], domainY: range },
      frame
    );
  }
  return (range[0] + range[1]) / 2;
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
  expandedHeight: number,
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
    const rowH =
      track.height ?? (track.expanded ? expandedHeight : trackHeight);
    const range = track.valueRange ?? autoValueRange(track.keyframes);
    const inset = Math.min(8, rowH * 0.2);
    const usable = Math.max(1e-6, rowH - inset * 2);
    const valueDelta = -(deltaYPixels / usable) * (range[1] - range[0]);
    const keyframes = track.keyframes.map(kf => {
      if (kf.id === undefined || !keys.has(selKey(track.id, kf.id))) return kf;
      return {
        ...kf,
        x: clamp(snapFrame(kf.x + deltaFrames, snap), min, max),
        y: clamp(kf.y + valueDelta, range[0], range[1]),
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

/** Clipboard payload — selected keyframes captured relative to the earliest. */
export interface TimelineClipboard {
  entries: ReadonlyArray<{
    trackId: string;
    dx: number;
    keyframe: CurveKeyframe;
  }>;
}

/** Capture the selected keyframes into a clipboard payload (relative offsets). */
export function copySelectedKeyframes(
  tracks: ReadonlyArray<TimelineTrack>,
  selection: TimelineSelection
): TimelineClipboard {
  const keys = selectionKeySet(selection);
  const picked: { trackId: string; keyframe: CurveKeyframe }[] = [];
  for (const track of tracks) {
    for (const kf of track.keyframes) {
      if (kf.id !== undefined && keys.has(selKey(track.id, kf.id))) {
        picked.push({ trackId: track.id, keyframe: kf });
      }
    }
  }
  if (picked.length === 0) return { entries: [] };
  const base = Math.min(...picked.map(p => p.keyframe.x));
  return {
    entries: picked.map(p => ({
      trackId: p.trackId,
      dx: p.keyframe.x - base,
      keyframe: p.keyframe,
    })),
  };
}

/**
 * Paste a clipboard payload at `atFrame`, preserving relative offsets and
 * assigning fresh ids. Skips locked / missing tracks. Returns the new tracks
 * plus refs to the pasted keyframes (for selecting them).
 */
export function pasteKeyframes(
  tracks: ReadonlyArray<TimelineTrack>,
  clipboard: TimelineClipboard,
  atFrame: number
): { tracks: TimelineTrack[]; refs: TimelineKeyframeRef[] } {
  const validTracks = new Set(tracks.filter(t => !t.locked).map(t => t.id));
  const additions = new Map<string, CurveKeyframe[]>();
  const refs: TimelineKeyframeRef[] = [];
  for (const entry of clipboard.entries) {
    if (!validTracks.has(entry.trackId)) continue;
    const keyframe: CurveKeyframe = {
      ...entry.keyframe,
      id: generateKeyframeId(),
      x: atFrame + entry.dx,
    };
    refs.push({ trackId: entry.trackId, keyframeId: keyframe.id as string });
    const list = additions.get(entry.trackId) ?? [];
    list.push(keyframe);
    additions.set(entry.trackId, list);
  }
  const next = tracks.map(track => {
    const adds = additions.get(track.id);
    if (!adds) return track;
    const keyframes = [...track.keyframes, ...adds].sort((a, b) => a.x - b.x);
    return { ...track, keyframes };
  });
  return { tracks: next, refs };
}

/** Move a track from one full-array index to another. */
export function moveTrack(
  tracks: ReadonlyArray<TimelineTrack>,
  fromIndex: number,
  toIndex: number
): TimelineTrack[] {
  const next = tracks.slice();
  const [moved] = next.splice(fromIndex, 1);
  if (!moved) return next;
  next.splice(Math.max(0, Math.min(next.length, toIndex)), 0, moved);
  return next;
}

/**
 * Reorder from a header drag: move the dragged track to a gap among the
 * visible rows (`dropVisibleIndex` in `[0, visibleCount]`). Maps visible gaps
 * back to full-array indices and corrects for forward moves.
 */
export function reorderTracksByDrop(
  tracks: ReadonlyArray<TimelineTrack>,
  draggingId: string,
  dropVisibleIndex: number
): TimelineTrack[] {
  const fromFull = tracks.findIndex(t => t.id === draggingId);
  if (fromFull < 0) return tracks.slice();
  const visible = tracks.filter(t => !t.hidden);
  let gapFull: number;
  if (dropVisibleIndex >= visible.length) {
    gapFull = tracks.length;
  } else {
    const target = visible[dropVisibleIndex];
    gapFull = target
      ? tracks.findIndex(t => t.id === target.id)
      : tracks.length;
  }
  const toIndex = fromFull < gapFull ? gapFull - 1 : gapFull;
  return moveTrack(tracks, fromFull, toIndex);
}
