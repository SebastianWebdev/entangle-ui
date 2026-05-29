import { describe, it, expect } from 'vitest';
import { hitTestTimeline, keyframesInRect } from './timelineHitTest';
import { computeRows } from './timelineLayout';
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

const view = { startFrame: 0, endFrame: 100 };
const size = { width: 200, height: 100 }; // 2 px per frame
const tracks: TimelineTrack[] = [
  { id: 't1', keyframes: [kf('a', 10), kf('b', 50)] }, // px: 20, 100
  { id: 't2', keyframes: [kf('c', 25)] }, // px: 50
];
const layoutOpts = {
  trackHeight: 20,
  expandedHeight: 96,
  groupHeaderHeight: 22,
  globalGraph: false,
  groups: [],
};
const rows = computeRows(tracks, layoutOpts).rows;
// rows: t1 top0 h20 (center content 10), t2 top20 h20 (center 30); rulerHeight 22
const base = {
  view,
  size,
  rows,
  scrollTop: 0,
  rulerHeight: 22,
  frame: 50, // playhead px 100
  showPlayhead: true,
};

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

  it('hits an empty track row (by track id)', () => {
    expect(hitTestTimeline({ ...base, point: { x: 150, y: 32 } })).toEqual({
      kind: 'empty',
      trackId: 't1',
    });
  });

  it('returns outside below the last row', () => {
    expect(hitTestTimeline({ ...base, point: { x: 30, y: 200 } }).kind).toBe(
      'outside'
    );
  });

  it('hits a keyframe at its value position in graph mode', () => {
    const gtracks: TimelineTrack[] = [
      { id: 't1', valueRange: [0, 1], keyframes: [kf('a', 50, 1)] },
    ];
    const graphRows = computeRows(gtracks, {
      ...layoutOpts,
      globalGraph: true,
    }).rows;
    // x=50 -> px 100; value 1 on row0 (top 0, h 20) -> content y 4 -> screen 26
    const hit = hitTestTimeline({
      ...base,
      rows: graphRows,
      point: { x: 100, y: 26 },
    });
    expect(hit).toEqual({ kind: 'keyframe', trackId: 't1', keyframeId: 'a' });
  });

  it('hits a group header', () => {
    const gtracks: TimelineTrack[] = [
      { id: 't1', groupId: 'g', keyframes: [] },
    ];
    const groupRows = computeRows(gtracks, {
      ...layoutOpts,
      groups: [{ id: 'g', label: 'G' }],
    }).rows;
    // group header row0 top0 h22 -> content y in [0,22); screen y 32 -> content 10
    expect(
      hitTestTimeline({ ...base, rows: groupRows, point: { x: 30, y: 32 } })
    ).toEqual({ kind: 'group', groupId: 'g' });
  });

  it('grabs the playhead over a group header row (on its thin band)', () => {
    const gtracks: TimelineTrack[] = [
      { id: 't1', groupId: 'g', keyframes: [] },
    ];
    const groupRows = computeRows(gtracks, {
      ...layoutOpts,
      groups: [{ id: 'g', label: 'G' }],
    }).rows;
    // playhead at frame 50 -> px 100; over the group row (screen y 32) but on
    // the playhead's thin band -> playhead wins; elsewhere -> group.
    expect(
      hitTestTimeline({ ...base, rows: groupRows, point: { x: 100, y: 32 } })
        .kind
    ).toBe('playhead');
    expect(
      hitTestTimeline({ ...base, rows: groupRows, point: { x: 30, y: 32 } })
        .kind
    ).toBe('group');
  });

  it('returns loop-strip on the strip band (empty zone), ruler on the ruler band', () => {
    // strip 10px tall directly below the 22px ruler → strip spans [22, 32)
    // 1 px wide loop near px 40..160; an empty point on the strip at x 5 (no
    // loop overlap) yields the new `loop-strip` kind; the ruler stays as-is.
    expect(
      hitTestTimeline({
        ...base,
        loopStripHeight: 10,
        point: { x: 5, y: 25 },
      }).kind
    ).toBe('loop-strip');
    expect(
      hitTestTimeline({
        ...base,
        loopStripHeight: 10,
        point: { x: 5, y: 5 },
      }).kind
    ).toBe('ruler');
    // Track rows still hit from chromeHeight (32) downward.
    expect(
      hitTestTimeline({
        ...base,
        loopStripHeight: 10,
        point: { x: 150, y: 42 }, // 42 - 32 = 10 = center of t1 (rowH 20)
      })
    ).toEqual({ kind: 'empty', trackId: 't1' });
  });

  it('uses a wider edge pick zone for bracket-style loop handles', () => {
    const loopRegion = { startFrame: 20, endFrame: 80 }; // px 40..160
    // 8 px from the edge: edges-style misses (pick 5), brackets-style hits (pick 9).
    expect(
      hitTestTimeline({ ...base, loopRegion, point: { x: 48, y: 5 } }).kind
    ).toBe('loop-body');
    expect(
      hitTestTimeline({
        ...base,
        loopRegion,
        loopHandles: 'brackets',
        point: { x: 48, y: 5 },
      }).kind
    ).toBe('loop-start');
  });

  it('grabs the playhead on the ruler even inside a loop region', () => {
    const loopRegion = { startFrame: 20, endFrame: 80 }; // px 40..160
    // On the ruler (y 5): playhead (px 100) beats the loop body...
    expect(
      hitTestTimeline({ ...base, loopRegion, point: { x: 100, y: 5 } }).kind
    ).toBe('playhead');
    // ...the loop body is still hit away from the playhead + edges...
    expect(
      hitTestTimeline({ ...base, loopRegion, point: { x: 70, y: 5 } }).kind
    ).toBe('loop-body');
    // ...and the loop edge still wins where they don't overlap.
    expect(
      hitTestTimeline({ ...base, loopRegion, point: { x: 40, y: 5 } }).kind
    ).toBe('loop-start');
  });
});

describe('keyframesInRect', () => {
  it('returns keyframes whose center falls inside a content-space rect', () => {
    const found = keyframesInRect(
      { x: 0, y: 0, width: 60, height: 40 },
      view,
      size,
      rows
    );
    expect(found).toEqual([
      { trackId: 't1', keyframeId: 'a' },
      { trackId: 't2', keyframeId: 'c' },
    ]);
  });
});
