import type { CurveKeyframe } from '@/types/keyframe';
import type { TimelineSelection, TimelineTrack } from './Timeline.types';
import { clamp, snapFrame } from './timelineCoords';

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
