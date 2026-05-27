import { describe, it, expect } from 'vitest';
import {
  addKeyframe,
  makeKeyframe,
  moveSelectedKeyframes,
  removeSelectedKeyframes,
} from './timelineEdits';
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

function track(tracks: TimelineTrack[], id: string): TimelineTrack {
  const t = tracks.find(x => x.id === id);
  if (!t) throw new Error(`track ${id} not found`);
  return t;
}

function frameOf(t: TimelineTrack, id: string): number {
  const k = t.keyframes.find(x => x.id === id);
  if (!k) throw new Error(`keyframe ${id} not found`);
  return k.x;
}

const TRACKS: TimelineTrack[] = [
  { id: 't1', keyframes: [kf('a', 10), kf('b', 20)] },
  { id: 't2', keyframes: [kf('c', 5)] },
];

describe('timelineEdits', () => {
  describe('moveSelectedKeyframes', () => {
    it('moves only selected keyframes, snapped + clamped', () => {
      const next = moveSelectedKeyframes(
        TRACKS,
        [{ trackId: 't1', keyframeId: 'a' }],
        5,
        true,
        0,
        100
      );
      expect(frameOf(track(next, 't1'), 'a')).toBe(15);
      expect(frameOf(track(next, 't1'), 'b')).toBe(20);
      expect(next[1]).toBe(TRACKS[1]); // untouched track keeps identity
    });

    it('clamps moved keyframes to the range', () => {
      const next = moveSelectedKeyframes(
        TRACKS,
        [{ trackId: 't1', keyframeId: 'b' }],
        1000,
        true,
        0,
        100
      );
      expect(frameOf(track(next, 't1'), 'b')).toBe(100);
    });

    it('keeps keyframes sorted by x after a move', () => {
      const next = moveSelectedKeyframes(
        TRACKS,
        [{ trackId: 't1', keyframeId: 'a' }],
        50,
        true,
        0,
        100
      );
      expect(track(next, 't1').keyframes.map(k => k.x)).toEqual([20, 60]);
    });

    it('does not move keyframes on a locked track', () => {
      const locked: TimelineTrack[] = [
        { id: 't1', locked: true, keyframes: [kf('a', 10)] },
      ];
      const next = moveSelectedKeyframes(
        locked,
        [{ trackId: 't1', keyframeId: 'a' }],
        5,
        true,
        0,
        100
      );
      expect(next[0]).toBe(locked[0]);
    });
  });

  describe('removeSelectedKeyframes', () => {
    it('removes selected keyframes only', () => {
      const next = removeSelectedKeyframes(TRACKS, [
        { trackId: 't1', keyframeId: 'a' },
      ]);
      expect(track(next, 't1').keyframes.map(k => k.id)).toEqual(['b']);
      expect(next[1]).toBe(TRACKS[1]);
    });
  });

  describe('addKeyframe', () => {
    it('inserts a keyframe sorted by x into the target track', () => {
      const next = addKeyframe(TRACKS, 't1', makeKeyframe(15));
      expect(track(next, 't1').keyframes.map(k => k.x)).toEqual([10, 15, 20]);
      expect(next[1]).toBe(TRACKS[1]);
    });
  });

  describe('makeKeyframe', () => {
    it('creates a keyframe with a unique id and flat tangents', () => {
      const a = makeKeyframe(1);
      const b = makeKeyframe(2);
      expect(a.id).toBeDefined();
      expect(a.id).not.toBe(b.id);
      expect(a.tangentMode).toBe('auto');
      expect(a.x).toBe(1);
    });
  });
});
