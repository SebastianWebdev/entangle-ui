import { describe, it, expect } from 'vitest';
import { hitTestTimeline, keyframesInRect } from './timelineHitTest';
import type { TimelineTrack } from './Timeline.types';

function kf(id: string, x: number): TimelineTrack['keyframes'][number] {
  return {
    id,
    x,
    y: 0,
    handleIn: { x: 0, y: 0 },
    handleOut: { x: 0, y: 0 },
    tangentMode: 'auto',
  };
}

const view = { startFrame: 0, endFrame: 100 };
const size = { width: 200, height: 100 }; // 2 px per frame
const tracks: TimelineTrack[] = [
  { id: 't1', keyframes: [kf('a', 10), kf('b', 50)] }, // px: 20, 100
  { id: 't2', keyframes: [kf('c', 25)] }, // px: 50
];
// rows: trackHeight 20, rulerHeight 22 -> row0 [22,42] center 32, row1 [42,62] center 52
const base = {
  view,
  size,
  tracks,
  trackHeight: 20,
  scrollTop: 0,
  rulerHeight: 22,
  frame: 50, // playhead px 100
  showPlayhead: true,
  mode: 'dope-sheet' as const,
};

describe('timelineHitTest', () => {
  describe('hitTestTimeline', () => {
    it('hits the ruler above the ruler height', () => {
      expect(hitTestTimeline({ ...base, point: { x: 30, y: 5 } }).kind).toBe(
        'ruler'
      );
    });

    it('hits a keyframe near its diamond', () => {
      expect(hitTestTimeline({ ...base, point: { x: 20, y: 32 } })).toEqual({
        kind: 'keyframe',
        trackId: 't1',
        keyframeId: 'a',
      });
    });

    it('hits the playhead line away from any keyframe', () => {
      expect(hitTestTimeline({ ...base, point: { x: 100, y: 52 } }).kind).toBe(
        'playhead'
      );
    });

    it('hits an empty track row', () => {
      expect(hitTestTimeline({ ...base, point: { x: 150, y: 32 } })).toEqual({
        kind: 'empty',
        trackIndex: 0,
      });
    });

    it('returns outside below the last row', () => {
      expect(hitTestTimeline({ ...base, point: { x: 30, y: 200 } }).kind).toBe(
        'outside'
      );
    });

    it('hits a keyframe at its value position in graph mode', () => {
      const gtracks: TimelineTrack[] = [
        {
          id: 't1',
          valueRange: [0, 1] as [number, number],
          keyframes: [
            {
              id: 'a',
              x: 50,
              y: 1,
              handleIn: { x: 0, y: 0 },
              handleOut: { x: 0, y: 0 },
              tangentMode: 'auto',
            },
          ],
        },
      ];
      // x=50 -> px 100; value 1 in [0,1] on row0 (top 22, h 20) -> y 26
      const hit = hitTestTimeline({
        ...base,
        tracks: gtracks,
        mode: 'graph',
        point: { x: 100, y: 26 },
      });
      expect(hit).toEqual({ kind: 'keyframe', trackId: 't1', keyframeId: 'a' });
    });
  });

  describe('keyframesInRect', () => {
    it('returns keyframes whose center falls inside the rectangle', () => {
      const found = keyframesInRect(
        { x: 0, y: 22, width: 60, height: 40 },
        view,
        size,
        tracks,
        20,
        0,
        22,
        'dope-sheet'
      );
      expect(found).toEqual([
        { trackId: 't1', keyframeId: 'a' },
        { trackId: 't2', keyframeId: 'c' },
      ]);
    });
  });
});
