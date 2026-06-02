import { describe, expect, it } from 'vitest';

import {
  defaultFormatTimestamp,
  entriesToText,
  entryMatchesQuery,
  entryToText,
  filterEntries,
  getHighlightSegments,
} from './logViewUtils';

import type { ResolvedLogEntry } from './LogView.types';

describe('getHighlightSegments', () => {
  it('returns a single non-match segment for an empty query', () => {
    expect(getHighlightSegments('hello world', '')).toEqual([
      { text: 'hello world', match: false },
    ]);
  });

  it('returns a single non-match segment for a whitespace-only query', () => {
    expect(getHighlightSegments('hello', '   ')).toEqual([
      { text: 'hello', match: false },
    ]);
  });

  it('returns a single non-match segment for empty text', () => {
    expect(getHighlightSegments('', 'q')).toEqual([{ text: '', match: false }]);
  });

  it('returns a single non-match segment when there is no match', () => {
    expect(getHighlightSegments('hello', 'xyz')).toEqual([
      { text: 'hello', match: false },
    ]);
  });

  it('marks a single match in the middle', () => {
    expect(getHighlightSegments('hello world', 'lo w')).toEqual([
      { text: 'hel', match: false },
      { text: 'lo w', match: true },
      { text: 'orld', match: false },
    ]);
  });

  it('marks a match at the start', () => {
    expect(getHighlightSegments('error: boom', 'error')).toEqual([
      { text: 'error', match: true },
      { text: ': boom', match: false },
    ]);
  });

  it('marks a match at the end', () => {
    expect(getHighlightSegments('the end', 'end')).toEqual([
      { text: 'the ', match: false },
      { text: 'end', match: true },
    ]);
  });

  it('marks all occurrences', () => {
    expect(getHighlightSegments('a-a-a', 'a')).toEqual([
      { text: 'a', match: true },
      { text: '-', match: false },
      { text: 'a', match: true },
      { text: '-', match: false },
      { text: 'a', match: true },
    ]);
  });

  it('is case-insensitive by default and preserves original casing', () => {
    expect(getHighlightSegments('abcABC', 'bc')).toEqual([
      { text: 'a', match: false },
      { text: 'bc', match: true },
      { text: 'A', match: false },
      { text: 'BC', match: true },
    ]);
  });

  it('respects case-sensitive matching', () => {
    expect(getHighlightSegments('abcABC', 'BC', true)).toEqual([
      { text: 'abcA', match: false },
      { text: 'BC', match: true },
    ]);
  });

  it('reconstructs the original text from its segments', () => {
    const text = 'GET /api/users 200 OK in 12ms';
    const joined = getHighlightSegments(text, 'api')
      .map(s => s.text)
      .join('');
    expect(joined).toBe(text);
  });
});

describe('defaultFormatTimestamp', () => {
  it('formats epoch ms and a Date identically', () => {
    const date = new Date(2026, 0, 2, 3, 4, 5, 6);
    expect(defaultFormatTimestamp(date)).toBe('03:04:05.006');
    expect(defaultFormatTimestamp(date.getTime())).toBe('03:04:05.006');
  });

  it('pads hours/minutes/seconds and milliseconds', () => {
    const date = new Date(2026, 0, 1, 23, 59, 9, 90);
    expect(defaultFormatTimestamp(date)).toBe('23:59:09.090');
  });

  it('returns an empty string for an invalid date', () => {
    expect(defaultFormatTimestamp(Number.NaN)).toBe('');
  });
});

describe('entryMatchesQuery', () => {
  it('matches everything on an empty query', () => {
    expect(entryMatchesQuery({ message: 'anything' }, '')).toBe(true);
  });

  it('matches against the message', () => {
    expect(
      entryMatchesQuery({ message: 'connection refused' }, 'refused')
    ).toBe(true);
  });

  it('matches against the source tag', () => {
    expect(entryMatchesQuery({ message: 'ok', source: 'network' }, 'net')).toBe(
      true
    );
  });

  it('is case-insensitive by default', () => {
    expect(entryMatchesQuery({ message: 'BOOM' }, 'boom')).toBe(true);
  });

  it('respects case sensitivity', () => {
    expect(entryMatchesQuery({ message: 'BOOM' }, 'boom', true)).toBe(false);
  });

  it('returns false when neither message nor source match', () => {
    expect(entryMatchesQuery({ message: 'ok', source: 'db' }, 'zzz')).toBe(
      false
    );
  });
});

describe('entryToText / entriesToText', () => {
  const base: ResolvedLogEntry = {
    id: '1',
    level: 'error',
    message: 'disk full',
  };

  it('renders level and message', () => {
    expect(entryToText(base)).toBe('[ERROR] disk full');
  });

  it('includes the source when present', () => {
    expect(entryToText({ ...base, source: 'fs' })).toBe(
      '[ERROR] (fs) disk full'
    );
  });

  it('includes a formatted timestamp when enabled', () => {
    const ts = new Date(2026, 0, 1, 1, 2, 3, 4);
    expect(
      entryToText({ ...base, timestamp: ts }, { showTimestamps: true })
    ).toBe('01:02:03.004 [ERROR] disk full');
  });

  it('omits the timestamp when disabled', () => {
    const ts = new Date(2026, 0, 1, 1, 2, 3, 4);
    expect(entryToText({ ...base, timestamp: ts })).toBe('[ERROR] disk full');
  });

  it('joins multiple entries with newlines', () => {
    const entries: ResolvedLogEntry[] = [
      { id: '1', level: 'info', message: 'a' },
      { id: '2', level: 'warn', message: 'b' },
    ];
    expect(entriesToText(entries)).toBe('[INFO] a\n[WARN] b');
  });
});

describe('filterEntries', () => {
  const entries: ResolvedLogEntry[] = [
    { id: '1', level: 'debug', message: 'starting up' },
    { id: '2', level: 'info', message: 'ready', source: 'core' },
    { id: '3', level: 'warn', message: 'retrying' },
    { id: '4', level: 'error', message: 'boom' },
    { id: '5', level: 'trace', message: 'verbose detail' },
  ];
  const knownLevels = new Set(['debug', 'info', 'warn', 'error']);

  it('returns everything when all known levels are active and the query is empty', () => {
    const result = filterEntries(entries, {
      query: '',
      knownLevels,
      activeLevels: knownLevels,
    });
    expect(result).toHaveLength(5);
  });

  it('hides entries whose known level is inactive', () => {
    const result = filterEntries(entries, {
      query: '',
      knownLevels,
      activeLevels: new Set(['error']),
    });
    expect(result.map(e => e.id)).toEqual(['4', '5']);
  });

  it('always shows entries with an unknown level (no chip)', () => {
    // `trace` has no chip → never hidden by the level filter.
    const result = filterEntries(entries, {
      query: '',
      knownLevels,
      activeLevels: new Set<string>(),
    });
    expect(result.map(e => e.id)).toEqual(['5']);
  });

  it('applies the text query across message and source', () => {
    const result = filterEntries(entries, {
      query: 'core',
      knownLevels,
      activeLevels: knownLevels,
    });
    expect(result.map(e => e.id)).toEqual(['2']);
  });

  it('combines level and query filters', () => {
    const result = filterEntries(entries, {
      query: 'r',
      knownLevels,
      activeLevels: new Set(['warn']),
    });
    expect(result.map(e => e.id)).toEqual(['3', '5']);
  });
});
