import type { Point2D } from '@/components/primitives/canvas/canvas.types';
import type { ViewportSize } from '@/components/primitives/viewport';
import type {
  TimelineKeyframeRef,
  TimelineMode,
  TimelineTrack,
  TimelineView,
} from './Timeline.types';
import { autoValueRange, frameToX, trackTop, valueToY } from './timelineCoords';

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
  | { kind: 'loop-start' }
  | { kind: 'loop-end' }
  | { kind: 'loop-body' }
  | { kind: 'keyframe'; trackId: string; keyframeId: string }
  | {
      kind: 'tangent';
      trackId: string;
      keyframeId: string;
      which: 'in' | 'out';
    }
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
  mode: TimelineMode;
  /** Selection predicate — enables tangent-handle picking in graph mode. */
  isSelected?: (trackId: string, keyframeId: string) => boolean;
  /** Resolved loop region — enables loop-edge / body picking on the ruler. */
  loopRegion?: { startFrame: number; endFrame: number } | null;
}

/** Picking tolerance (CSS px) around a keyframe center on the X axis. */
const KEYFRAME_PICK_X = 6;
/** Picking tolerance (CSS px) around the playhead line. */
const PLAYHEAD_PICK_X = 4;
/** Picking tolerance (CSS px) around a graph-mode tangent handle endpoint. */
const HANDLE_PICK_X = 6;
/** Picking tolerance (CSS px) around a loop-region edge on the ruler. */
const LOOP_EDGE_PICK_X = 5;

/**
 * Resolve what's under a pointer: the ruler, the playhead line, a keyframe,
 * an empty track row, or outside the content. Keyframes take priority over
 * the playhead so editing wins over scrubbing when they overlap.
 */
export function hitTestTimeline(input: TimelineHitInput): TimelineHit {
  const { point, view, size, tracks, trackHeight, scrollTop, rulerHeight } =
    input;

  const toX = (f: number): number => frameToX(f, view, size.width);

  if (point.y < rulerHeight) {
    const loop = input.loopRegion;
    if (loop) {
      const lx = toX(loop.startFrame);
      const rx = toX(loop.endFrame);
      if (Math.abs(point.x - lx) <= LOOP_EDGE_PICK_X)
        return { kind: 'loop-start' };
      if (Math.abs(point.x - rx) <= LOOP_EDGE_PICK_X)
        return { kind: 'loop-end' };
      if (point.x > lx && point.x < rx) return { kind: 'loop-body' };
    }
    return { kind: 'ruler' };
  }

  const visible = tracks.filter(t => !t.hidden);

  // Keyframes (topmost row first is irrelevant — rows don't overlap on Y).
  for (let index = 0; index < visible.length; index += 1) {
    const track = visible[index];
    if (!track) continue;
    const rowH = track.height ?? trackHeight;
    const top = rulerHeight + trackTop(index, trackHeight, scrollTop);
    if (point.y < top || point.y > top + rowH) continue;
    const range =
      input.mode === 'graph'
        ? (track.valueRange ?? autoValueRange(track.keyframes))
        : null;
    const centerY = top + rowH / 2;

    // Tangent handles (graph mode, selected keyframes) take pick priority.
    if (range && input.isSelected) {
      for (const kf of track.keyframes) {
        if (kf.id === undefined || !input.isSelected(track.id, kf.id)) continue;
        if (kf.tangentMode === 'linear' || kf.tangentMode === 'step') continue;
        const inX = toX(kf.x + kf.handleIn.x);
        const inY = valueToY(kf.y + kf.handleIn.y, range, top, rowH);
        if (Math.hypot(point.x - inX, point.y - inY) <= HANDLE_PICK_X) {
          return {
            kind: 'tangent',
            trackId: track.id,
            keyframeId: kf.id,
            which: 'in',
          };
        }
        const outX = toX(kf.x + kf.handleOut.x);
        const outY = valueToY(kf.y + kf.handleOut.y, range, top, rowH);
        if (Math.hypot(point.x - outX, point.y - outY) <= HANDLE_PICK_X) {
          return {
            kind: 'tangent',
            trackId: track.id,
            keyframeId: kf.id,
            which: 'out',
          };
        }
      }
    }

    for (const kf of track.keyframes) {
      if (kf.id === undefined) continue;
      const x = toX(kf.x);
      if (Math.abs(point.x - x) > KEYFRAME_PICK_X) continue;
      const py = range ? valueToY(kf.y, range, top, rowH) : centerY;
      const yTol = range ? KEYFRAME_PICK_X : rowH / 2;
      if (Math.abs(point.y - py) <= yTol) {
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
  rulerHeight: number,
  mode: TimelineMode
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
    const top = rulerHeight + trackTop(index, trackHeight, scrollTop);
    const range =
      mode === 'graph'
        ? (track.valueRange ?? autoValueRange(track.keyframes))
        : null;
    const centerY = top + rowH / 2;
    for (const kf of track.keyframes) {
      if (kf.id === undefined) continue;
      const x = toX(kf.x);
      if (x < x0 || x > x1) continue;
      const py = range ? valueToY(kf.y, range, top, rowH) : centerY;
      if (py >= y0 && py <= y1) {
        result.push({ trackId: track.id, keyframeId: kf.id });
      }
    }
  });

  return result;
}
