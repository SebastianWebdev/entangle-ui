import { describe, it, expect } from 'vitest';
import {
  addKeyframe,
  copySelectedKeyframes,
  makeKeyframe,
  moveSelectedKeyframes,
  moveSelectedKeyframesGraph,
  moveTrack,
  pasteKeyframes,
  removeSelectedKeyframes,
  reorderTracksByDrop,
  setKeyframeTangent,
} from './timelineEdits';
import type { TimelineTrack } from './Timeline.types';

function kf(id: string, x: number, y = 0): TimelineTrack['keyframes'][number] {
  return {
    id,
    x,
    y,
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

  describe('moveSelectedKeyframesGraph', () => {
    it('moves x by frames and y by a value delta from the pixel drag', () => {
      const tracks: TimelineTrack[] = [
        {
          id: 't1',
          valueRange: [0, 1] as [number, number],
          keyframes: [kf('a', 10, 0.5)],
        },
      ];
      // rowH 20 -> usable 12, span 1; deltaY -6px -> valueDelta +0.5
      const next = moveSelectedKeyframesGraph(
        tracks,
        [{ trackId: 't1', keyframeId: 'a' }],
        5,
        -6,
        20,
        true,
        0,
        100
      );
      expect(frameOf(track(next, 't1'), 'a')).toBe(15);
      const a = track(next, 't1').keyframes.find(k => k.id === 'a');
      expect(a?.y).toBeCloseTo(1);
    });

    it('leaves locked tracks untouched', () => {
      const locked: TimelineTrack[] = [
        {
          id: 't1',
          locked: true,
          valueRange: [0, 1] as [number, number],
          keyframes: [kf('a', 10, 0.5)],
        },
      ];
      const next = moveSelectedKeyframesGraph(
        locked,
        [{ trackId: 't1', keyframeId: 'a' }],
        5,
        -6,
        20,
        true,
        0,
        100
      );
      expect(next[0]).toBe(locked[0]);
    });
  });

  describe('setKeyframeTangent', () => {
    it('sets the dragged handle and promotes auto to aligned', () => {
      const tracks: TimelineTrack[] = [
        { id: 't1', keyframes: [kf('a', 10, 0.5)] },
      ];
      const next = setKeyframeTangent(
        tracks,
        { trackId: 't1', keyframeId: 'a' },
        'out',
        { x: 4, y: 2 }
      );
      const a = track(next, 't1').keyframes.find(k => k.id === 'a');
      expect(a?.handleOut).toEqual({ x: 4, y: 2 });
      expect(a?.tangentMode).toBe('aligned');
    });

    it('mirrored makes the opposite handle the exact negation', () => {
      const tracks: TimelineTrack[] = [
        {
          id: 't1',
          keyframes: [
            {
              id: 'a',
              x: 10,
              y: 0,
              handleIn: { x: -3, y: 0 },
              handleOut: { x: 3, y: 0 },
              tangentMode: 'mirrored',
            },
          ],
        },
      ];
      const next = setKeyframeTangent(
        tracks,
        { trackId: 't1', keyframeId: 'a' },
        'out',
        { x: 4, y: 2 }
      );
      const a = track(next, 't1').keyframes.find(k => k.id === 'a');
      expect(a?.handleOut).toEqual({ x: 4, y: 2 });
      expect(a?.handleIn.x).toBeCloseTo(-4);
      expect(a?.handleIn.y).toBeCloseTo(-2);
    });

    it('leaves locked tracks untouched', () => {
      const locked: TimelineTrack[] = [
        { id: 't1', locked: true, keyframes: [kf('a', 10, 0)] },
      ];
      const next = setKeyframeTangent(
        locked,
        { trackId: 't1', keyframeId: 'a' },
        'in',
        { x: -2, y: 1 }
      );
      expect(next[0]).toBe(locked[0]);
    });
  });

  describe('copy / paste keyframes', () => {
    it('copies with relative offsets and pastes at a frame', () => {
      const tracks: TimelineTrack[] = [
        { id: 't1', keyframes: [kf('a', 10, 1), kf('b', 20, 2)] },
      ];
      const clip = copySelectedKeyframes(tracks, [
        { trackId: 't1', keyframeId: 'a' },
        { trackId: 't1', keyframeId: 'b' },
      ]);
      expect(clip.entries.map(e => e.dx)).toEqual([0, 10]);

      const { tracks: next, refs } = pasteKeyframes(tracks, clip, 50);
      expect(track(next, 't1').keyframes.map(k => k.x)).toEqual([
        10, 20, 50, 60,
      ]);
      expect(refs).toHaveLength(2);
      const ids = track(next, 't1').keyframes.map(k => k.id);
      expect(ids).toContain(refs[0]?.keyframeId);
    });

    it('skips locked tracks on paste', () => {
      const clip = copySelectedKeyframes(
        [{ id: 't1', keyframes: [kf('a', 10, 1)] }],
        [{ trackId: 't1', keyframeId: 'a' }]
      );
      const locked: TimelineTrack[] = [
        { id: 't1', locked: true, keyframes: [kf('a', 10, 1)] },
      ];
      const { tracks: next, refs } = pasteKeyframes(locked, clip, 50);
      expect(track(next, 't1').keyframes).toHaveLength(1);
      expect(refs).toHaveLength(0);
    });
  });

  describe('track reorder', () => {
    const ts: TimelineTrack[] = [
      { id: 'a', keyframes: [] },
      { id: 'b', keyframes: [] },
      { id: 'c', keyframes: [] },
    ];

    it('moveTrack moves between indices', () => {
      expect(moveTrack(ts, 0, 2).map(t => t.id)).toEqual(['b', 'c', 'a']);
      expect(moveTrack(ts, 2, 0).map(t => t.id)).toEqual(['c', 'a', 'b']);
    });

    it('reorderTracksByDrop drops at a visible gap', () => {
      expect(reorderTracksByDrop(ts, 'a', 2).map(t => t.id)).toEqual([
        'b',
        'a',
        'c',
      ]);
      expect(reorderTracksByDrop(ts, 'a', 3).map(t => t.id)).toEqual([
        'b',
        'c',
        'a',
      ]);
      expect(reorderTracksByDrop(ts, 'c', 0).map(t => t.id)).toEqual([
        'c',
        'a',
        'b',
      ]);
    });
  });
});
