import { describe, it, expect } from 'vitest';
import { computeRows } from './timelineLayout';
import type { TimelineTrack } from './Timeline.types';

function t(id: string, extra: Partial<TimelineTrack> = {}): TimelineTrack {
  return { id, keyframes: [], ...extra };
}

const base = {
  trackHeight: 28,
  expandedHeight: 96,
  groupHeaderHeight: 22,
  globalGraph: false,
  groups: [],
};

describe('computeRows', () => {
  it('is the uniform grid with no groups / expansion', () => {
    const { rows, contentHeight, trackTops } = computeRows(
      [t('a'), t('b'), t('c')],
      base
    );
    expect(rows.map(r => r.kind)).toEqual(['track', 'track', 'track']);
    expect(rows.map(r => r.top)).toEqual([0, 28, 56]);
    expect(contentHeight).toBe(84);
    expect(trackTops.get('b')?.top).toBe(28);
    expect(trackTops.get('b')?.graph).toBe(false);
  });

  it('skips hidden tracks', () => {
    const { rows } = computeRows(
      [t('a'), t('b', { hidden: true }), t('c')],
      base
    );
    expect(rows.map(r => (r.kind === 'track' ? r.track.id : 'G'))).toEqual([
      'a',
      'c',
    ]);
  });

  it('makes an expanded track taller + a graph lane', () => {
    const { trackTops } = computeRows(
      [t('a', { expanded: true }), t('b')],
      base
    );
    expect(trackTops.get('a')).toEqual({
      top: 0,
      height: 96,
      graph: true,
      range: [0, 1],
    });
    expect(trackTops.get('b')?.top).toBe(96);
    expect(trackTops.get('b')?.graph).toBe(false);
  });

  it('emits a group header before the first member', () => {
    const groups = [{ id: 'g1', label: 'G1' }];
    const { rows } = computeRows(
      [t('a', { groupId: 'g1' }), t('b', { groupId: 'g1' }), t('c')],
      { ...base, groups }
    );
    expect(
      rows.map(r => (r.kind === 'group' ? `G:${r.group.id}` : r.track.id))
    ).toEqual(['G:g1', 'a', 'b', 'c']);
  });

  it('collapsing a group hides its members but keeps the header', () => {
    const { rows } = computeRows(
      [t('a', { groupId: 'g1' }), t('b', { groupId: 'g1' }), t('c')],
      { ...base, groups: [{ id: 'g1', collapsed: true }] }
    );
    expect(rows.map(r => (r.kind === 'group' ? 'G' : r.track.id))).toEqual([
      'G',
      'c',
    ]);
  });
});
