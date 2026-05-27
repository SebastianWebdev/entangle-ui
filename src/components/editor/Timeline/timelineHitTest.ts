import type { Point2D } from '@/components/primitives/canvas/canvas.types';
import type { ViewportSize } from '@/components/primitives/viewport';
import type {
  TimelineKeyframeRef,
  TimelineTrack,
  TimelineView,
} from './Timeline.types';
import { frameToX, trackTop } from './timelineCoords';

/** Axis-aligned rectangle in track-area (CSS-pixel) coordinates. */
export interface TimelineScreenRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export type TimelineHit =
  | { kind: 'ruler' }
  | { kind: 'playhead' }
  | { kind: 'keyframe'; trackId: string; keyframeId: string }
  | { kind: 'empty'; trackIndex: number }
  | { kind: 'outside' };

export interface TimelineHitInput {
  /** Pointer position in track-area CSS px (relative to the body top-left). */
  point: Point2D;
  view: TimelineView;
  size: ViewportSize;
  tracks: ReadonlyArray<TimelineTrack>;
  trackHeight: number;
  scrollTop: number;
  rulerHeight: number;
  frame: number;
  showPlayhead: boolean;
}

/** Picking tolerance (CSS px) around a keyframe center on the X axis. */
const KEYFRAME_PICK_X = 6;
/** Picking tolerance (CSS px) around the playhead line. */
const PLAYHEAD_PICK_X = 4;

/**
 * Resolve what's under a pointer: the ruler, the playhead line, a keyframe,
 * an empty track row, or outside the content. Keyframes take priority over
 * the playhead so editing wins over scrubbing when they overlap.
 */
export function hitTestTimeline(input: TimelineHitInput): TimelineHit {
  const { point, view, size, tracks, trackHeight, scrollTop, rulerHeight } =
    input;

  if (point.y < rulerHeight) return { kind: 'ruler' };

  const toX = (f: number): number => frameToX(f, view, size.width);
  const visible = tracks.filter(t => !t.hidden);

  // Keyframes (topmost row first is irrelevant — rows don't overlap on Y).
  for (let index = 0; index < visible.length; index += 1) {
    const track = visible[index];
    if (!track) continue;
    const rowH = track.height ?? trackHeight;
    const top = rulerHeight + trackTop(index, trackHeight, scrollTop);
    if (point.y < top || point.y > top + rowH) continue;
    const centerY = top + rowH / 2;
    for (const kf of track.keyframes) {
      if (kf.id === undefined) continue;
      const x = toX(kf.x);
      if (
        Math.abs(point.x - x) <= KEYFRAME_PICK_X &&
        Math.abs(point.y - centerY) <= rowH / 2
      ) {
        return { kind: 'keyframe', trackId: track.id, keyframeId: kf.id };
      }
    }
  }

  if (input.showPlayhead) {
    const px = toX(input.frame);
    if (Math.abs(point.x - px) <= PLAYHEAD_PICK_X) {
      return { kind: 'playhead' };
    }
  }

  const trackIndex = Math.floor(
    (point.y - rulerHeight + scrollTop) / trackHeight
  );
  if (trackIndex >= 0 && trackIndex < visible.length) {
    return { kind: 'empty', trackIndex };
  }
  return { kind: 'outside' };
}

/**
 * All keyframes whose center falls inside a marquee rectangle (track-area px).
 * Used for box selection.
 */
export function keyframesInRect(
  rect: TimelineScreenRect,
  view: TimelineView,
  size: ViewportSize,
  tracks: ReadonlyArray<TimelineTrack>,
  trackHeight: number,
  scrollTop: number,
  rulerHeight: number
): TimelineKeyframeRef[] {
  const x0 = Math.min(rect.x, rect.x + rect.width);
  const x1 = Math.max(rect.x, rect.x + rect.width);
  const y0 = Math.min(rect.y, rect.y + rect.height);
  const y1 = Math.max(rect.y, rect.y + rect.height);
  const toX = (f: number): number => frameToX(f, view, size.width);
  const visible = tracks.filter(t => !t.hidden);
  const result: TimelineKeyframeRef[] = [];

  visible.forEach((track, index) => {
    const rowH = track.height ?? trackHeight;
    const centerY =
      rulerHeight + trackTop(index, trackHeight, scrollTop) + rowH / 2;
    if (centerY < y0 || centerY > y1) return;
    for (const kf of track.keyframes) {
      if (kf.id === undefined) continue;
      const x = toX(kf.x);
      if (x >= x0 && x <= x1) {
        result.push({ trackId: track.id, keyframeId: kf.id });
      }
    }
  });

  return result;
}
