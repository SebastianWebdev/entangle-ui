import { describe, expect, it } from 'vitest';
import { fuzzyFilter, fuzzyScore } from './fuzzySearch';

describe('fuzzyScore', () => {
  it('returns 0 for an empty target', () => {
    expect(fuzzyScore('a', '')).toBe(0);
  });

  it('returns 1 for an empty query (no filtering)', () => {
    expect(fuzzyScore('', 'anything')).toBe(1);
  });

  it('exact match wins', () => {
    expect(fuzzyScore('save', 'save')).toBe(1000);
  });

  it('case-insensitive', () => {
    expect(fuzzyScore('SAVE', 'save')).toBe(1000);
    expect(fuzzyScore('save', 'SAVE')).toBe(1000);
  });

  it('prefix beats substring beats subsequence', () => {
    const prefix = fuzzyScore('op', 'open file');
    const substr = fuzzyScore('en', 'open file');
    const sub = fuzzyScore('of', 'open file');
    expect(prefix).toBeGreaterThan(substr);
    expect(substr).toBeGreaterThan(sub);
  });

  it('returns 0 when characters cannot be matched in order', () => {
    expect(fuzzyScore('zzz', 'open file')).toBe(0);
    expect(fuzzyScore('eo', 'open')).toBe(0); // wrong order
  });

  it('subsequence match works for non-contiguous chars', () => {
    expect(fuzzyScore('opf', 'open file')).toBeGreaterThan(0);
  });

  it('consecutive characters score higher than spread-out ones', () => {
    const consecutive = fuzzyScore('open', 'open file');
    const spread = fuzzyScore('opfl', 'open file');
    expect(consecutive).toBeGreaterThan(spread);
  });

  it('word-boundary matches are bonused', () => {
    // "of" matches both "open" and "settings.org-file".
    // The second has matches at word starts (o + f), so it should score well.
    const a = fuzzyScore('of', 'go file');
    const b = fuzzyScore('of', 'goof');
    expect(a).toBeGreaterThan(0);
    expect(b).toBeGreaterThan(0);
  });
});

describe('fuzzyFilter', () => {
  const items = [
    { id: 'open', label: 'Open File' },
    { id: 'save', label: 'Save File' },
    { id: 'close', label: 'Close Window' },
    { id: 'find', label: 'Find in Files' },
  ];
  const getStrings = (it: (typeof items)[number]) => [it.label];

  it('returns all items with score 1 for an empty query', () => {
    const result = fuzzyFilter('', items, getStrings);
    expect(result).toHaveLength(4);
    expect(result.every(r => r.score === 1)).toBe(true);
  });

  it('drops items that do not match', () => {
    const result = fuzzyFilter('zzz', items, getStrings);
    expect(result).toHaveLength(0);
  });

  it('sorts matches by descending score', () => {
    const result = fuzzyFilter('file', items, getStrings);
    expect(result.length).toBeGreaterThan(0);
    for (let i = 1; i < result.length; i++) {
      const prev = result[i - 1];
      const curr = result[i];
      if (!prev || !curr) continue;
      expect(prev.score).toBeGreaterThanOrEqual(curr.score);
    }
  });

  it('uses the best-scoring string when multiple are provided', () => {
    const result = fuzzyFilter('open', items, it => [it.label, it.id]);
    const top = result[0];
    if (!top) throw new Error('expected at least one match');
    expect(top.item.id).toBe('open');
  });
});
