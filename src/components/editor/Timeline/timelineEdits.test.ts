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
  selectedTangentMode,
  setKeyframeTangent,
  setSelectedTangentMode,
  valueAtPointer,
} from './timelineEdits';
import type { TimelineTrack } from './Timeline.types';
import type { TrackGeometry } from './timelineLayout';

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
        96,
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
        96,
        true,
        0,
        100
      );
      expect(next[0]).toBe(locked[0]);
    });

    it('clamps y to the track value range so points stay in the lane', () => {
      const tracks: TimelineTrack[] = [
        {
          id: 't1',
          valueRange: [0, 1] as [number, number],
          keyframes: [kf('a', 10, 0.5)],
        },
      ];
      const up = moveSelectedKeyframesGraph(
        tracks,
        [{ trackId: 't1', keyframeId: 'a' }],
        0,
        -5000,
        20,
        96,
        true,
        0,
        100
      );
      expect(up[0]?.keyframes.find(k => k.id === 'a')?.y).toBe(1);

      const down = moveSelectedKeyframesGraph(
        tracks,
        [{ trackId: 't1', keyframeId: 'a' }],
        0,
        5000,
        20,
        96,
        true,
        0,
        100
      );
      expect(down[0]?.keyframes.find(k => k.id === 'a')?.y).toBe(0);
    });
  });

  describe('setKeyframeTangent', () => {
    it('sets the dragged handle and promotes auto to aligned', () => {
      // Explicit value range so the tangent-y assertion isn't tripped by
      // the new range clamp (covered separately below).
      const tracks: TimelineTrack[] = [
        { id: 't1', valueRange: [-10, 10], keyframes: [kf('a', 10, 0.5)] },
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
          valueRange: [-10, 10],
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

  describe('valueAtPointer', () => {
    const graphGeom: TrackGeometry = { top: 0, height: 100, graph: true };
    const dopeGeom: TrackGeometry = { top: 0, height: 24, graph: false };

    it('graph row: converts a pointer Y to a value on the track axis', () => {
      const track: TimelineTrack = {
        id: 't1',
        valueRange: [0, 1],
        keyframes: [],
      };
      // inset=8, usable=100-16=84; screenTop=20+0-0=20; centerY=20+8+42=70 → value 0.5
      const v = valueAtPointer({
        pointerY: 70,
        frame: 10,
        track,
        geometry: graphGeom,
        rulerHeight: 20,
        scrollTop: 0,
      });
      expect(v).toBeCloseTo(0.5, 2);
    });

    it('graph row: clamps to the track value range', () => {
      const track: TimelineTrack = {
        id: 't1',
        valueRange: [0, 1],
        keyframes: [],
      };
      const above = valueAtPointer({
        pointerY: -1000,
        frame: 10,
        track,
        geometry: graphGeom,
        rulerHeight: 20,
        scrollTop: 0,
      });
      const below = valueAtPointer({
        pointerY: 5000,
        frame: 10,
        track,
        geometry: graphGeom,
        rulerHeight: 20,
        scrollTop: 0,
      });
      expect(above).toBe(1);
      expect(below).toBe(0);
    });

    it('dope row with keyframes: places the new keyframe on the existing curve', () => {
      const track: TimelineTrack = {
        id: 't1',
        valueRange: [0, 1],
        keyframes: [kf('a', 0, 0), kf('b', 10, 1)],
      };
      const v = valueAtPointer({
        pointerY: 999,
        frame: 5,
        track,
        geometry: dopeGeom,
        rulerHeight: 20,
        scrollTop: 0,
      });
      // halfway between the two keyframes — pointer Y is ignored in dope mode
      expect(v).toBeGreaterThan(0);
      expect(v).toBeLessThan(1);
    });

    it('dope row without keyframes: falls back to the midpoint of the range', () => {
      const track: TimelineTrack = {
        id: 't1',
        valueRange: [-100, 100],
        keyframes: [],
      };
      const v = valueAtPointer({
        pointerY: 50,
        frame: 5,
        track,
        geometry: dopeGeom,
        rulerHeight: 20,
        scrollTop: 0,
      });
      expect(v).toBe(0);
    });
  });

  describe('selectedTangentMode + setSelectedTangentMode', () => {
    const tracks: TimelineTrack[] = [
      {
        id: 't1',
        keyframes: [
          { ...kf('a', 0), tangentMode: 'aligned' },
          { ...kf('b', 10), tangentMode: 'aligned' },
        ],
      },
      {
        id: 't2',
        keyframes: [{ ...kf('c', 5), tangentMode: 'free' }],
      },
    ];

    it('returns null when nothing is selected', () => {
      expect(selectedTangentMode(tracks, [])).toBeNull();
    });

    it('returns the unified mode when selected keyframes agree', () => {
      expect(
        selectedTangentMode(tracks, [
          { trackId: 't1', keyframeId: 'a' },
          { trackId: 't1', keyframeId: 'b' },
        ])
      ).toBe('aligned');
    });

    it('returns "mixed" when selected keyframes disagree', () => {
      expect(
        selectedTangentMode(tracks, [
          { trackId: 't1', keyframeId: 'a' },
          { trackId: 't2', keyframeId: 'c' },
        ])
      ).toBe('mixed');
    });

    it('setSelectedTangentMode writes the mode to all selected keyframes', () => {
      const next = setSelectedTangentMode(
        tracks,
        [
          { trackId: 't1', keyframeId: 'a' },
          { trackId: 't2', keyframeId: 'c' },
        ],
        'mirrored'
      );
      expect(next[0]?.keyframes.find(k => k.id === 'a')?.tangentMode).toBe(
        'mirrored'
      );
      expect(next[1]?.keyframes.find(k => k.id === 'c')?.tangentMode).toBe(
        'mirrored'
      );
      // Unselected keyframe untouched
      expect(next[0]?.keyframes.find(k => k.id === 'b')?.tangentMode).toBe(
        'aligned'
      );
    });

    it('skips locked tracks', () => {
      const locked: TimelineTrack[] = [
        {
          id: 't1',
          locked: true,
          keyframes: [{ ...kf('a', 0), tangentMode: 'aligned' }],
        },
      ];
      const next = setSelectedTangentMode(
        locked,
        [{ trackId: 't1', keyframeId: 'a' }],
        'free'
      );
      expect(next[0]).toBe(locked[0]);
    });

    it('preserves identity when the mode already matches', () => {
      const same = setSelectedTangentMode(
        tracks,
        [{ trackId: 't1', keyframeId: 'a' }],
        'aligned'
      );
      expect(same[0]).toBe(tracks[0]);
    });
  });
});
