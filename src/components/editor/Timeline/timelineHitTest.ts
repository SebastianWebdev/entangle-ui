import type { Point2D } from '@/components/primitives/canvas/canvas.types';
import type { ViewportSize } from '@/components/primitives/viewport';
import type { TimelineKeyframeRef, TimelineView } from './Timeline.types';
import type { TimelineRow } from './timelineLayout';
import { autoValueRange, frameToX, valueToY } from './timelineCoords';

/** Axis-aligned rectangle in content-space (CSS-pixel) coordinates. */
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
  | { kind: 'group'; groupId: string }
  | { kind: 'keyframe'; trackId: string; keyframeId: string }
  | {
      kind: 'tangent';
      trackId: string;
      keyframeId: string;
      which: 'in' | 'out';
    }
  | { kind: 'empty'; trackId: string }
  | { kind: 'outside' };

export interface TimelineHitInput {
  /** Pointer position in track-area CSS px (relative to the body top-left). */
  point: Point2D;
  view: TimelineView;
  size: ViewportSize;
  /** Pre-computed rows (group headers + track lanes). */
  rows: ReadonlyArray<TimelineRow>;
  scrollTop: number;
  rulerHeight: number;
  frame: number;
  showPlayhead: boolean;
  /** Selection predicate — enables tangent-handle picking in graph mode. */
  isSelected?: (trackId: string, keyframeId: string) => boolean;
  /** Resolved loop region — enables loop-edge / body picking on the ruler. */
  loopRegion?: { startFrame: number; endFrame: number } | null;
}

const KEYFRAME_PICK_X = 6;
const PLAYHEAD_PICK_X = 4;
const HANDLE_PICK_X = 6;
const LOOP_EDGE_PICK_X = 5;

/**
 * Resolve what's under a pointer: ruler / loop handles, a group header, a
 * keyframe, a graph tangent handle, an empty track row, or outside. Works in
 * content space (scroll-adjusted), iterating the pre-computed rows.
 */
export function hitTestTimeline(input: TimelineHitInput): TimelineHit {
  const { point, view, size, rows, scrollTop, rulerHeight } = input;
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

  const contentY = point.y - rulerHeight + scrollTop;
  const playheadX = input.showPlayhead ? toX(input.frame) : null;
  const nearPlayhead =
    playheadX !== null && Math.abs(point.x - playheadX) <= PLAYHEAD_PICK_X;

  for (const row of rows) {
    if (contentY < row.top || contentY >= row.top + row.height) continue;
    if (row.kind === 'group') return { kind: 'group', groupId: row.group.id };

    const track = row.track;
    const { top, height: rowH } = row;
    const range = row.graph
      ? (track.valueRange ?? autoValueRange(track.keyframes))
      : null;
    const centerY = top + rowH / 2;

    if (range && input.isSelected) {
      for (const kf of track.keyframes) {
        if (kf.id === undefined || !input.isSelected(track.id, kf.id)) continue;
        if (kf.tangentMode === 'linear' || kf.tangentMode === 'step') continue;
        const inX = toX(kf.x + kf.handleIn.x);
        const inY = valueToY(kf.y + kf.handleIn.y, range, top, rowH);
        if (Math.hypot(point.x - inX, contentY - inY) <= HANDLE_PICK_X) {
          return {
            kind: 'tangent',
            trackId: track.id,
            keyframeId: kf.id,
            which: 'in',
          };
        }
        const outX = toX(kf.x + kf.handleOut.x);
        const outY = valueToY(kf.y + kf.handleOut.y, range, top, rowH);
        if (Math.hypot(point.x - outX, contentY - outY) <= HANDLE_PICK_X) {
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
      if (Math.abs(contentY - py) <= yTol) {
        return { kind: 'keyframe', trackId: track.id, keyframeId: kf.id };
      }
    }

    if (nearPlayhead) return { kind: 'playhead' };
    return { kind: 'empty', trackId: track.id };
  }

  if (nearPlayhead) return { kind: 'playhead' };
  return { kind: 'outside' };
}

/**
 * All keyframes whose center falls inside a content-space marquee rectangle.
 * Used for box selection.
 */
export function keyframesInRect(
  rect: TimelineScreenRect,
  view: TimelineView,
  size: ViewportSize,
  rows: ReadonlyArray<TimelineRow>
): TimelineKeyframeRef[] {
  const x0 = Math.min(rect.x, rect.x + rect.width);
  const x1 = Math.max(rect.x, rect.x + rect.width);
  const y0 = Math.min(rect.y, rect.y + rect.height);
  const y1 = Math.max(rect.y, rect.y + rect.height);
  const toX = (f: number): number => frameToX(f, view, size.width);
  const result: TimelineKeyframeRef[] = [];

  for (const row of rows) {
    if (row.kind !== 'track') continue;
    const { track, top, height } = row;
    const range = row.graph
      ? (track.valueRange ?? autoValueRange(track.keyframes))
      : null;
    const centerY = top + height / 2;
    for (const kf of track.keyframes) {
      if (kf.id === undefined) continue;
      const x = toX(kf.x);
      if (x < x0 || x > x1) continue;
      const py = range ? valueToY(kf.y, range, top, height) : centerY;
      if (py >= y0 && py <= y1) {
        result.push({ trackId: track.id, keyframeId: kf.id });
      }
    }
  }

  return result;
}
