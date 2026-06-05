import { describe, expect, it } from 'vitest';

import {
  joinPath,
  normalizePath,
  parsePath,
  resolveSiblings,
  segmentPrefix,
} from './pathUtils';

import type { ResolvedPathSegment } from './pathUtils';

describe('parsePath', () => {
  it('splits a relative path into cumulative segments', () => {
    expect(parsePath('src/components/Button.tsx')).toEqual([
      { label: 'src', value: 'src' },
      { label: 'components', value: 'src/components' },
      { label: 'Button.tsx', value: 'src/components/Button.tsx' },
    ]);
  });

  it('keeps the leading delimiter for absolute paths', () => {
    expect(parsePath('/usr/local/bin')).toEqual([
      { label: 'usr', value: '/usr' },
      { label: 'local', value: '/usr/local' },
      { label: 'bin', value: '/usr/local/bin' },
    ]);
  });

  it('drops trailing and doubled delimiters', () => {
    expect(parsePath('src//components/')).toEqual([
      { label: 'src', value: 'src' },
      { label: 'components', value: 'src/components' },
    ]);
  });

  it('returns an empty array for an empty path', () => {
    expect(parsePath('')).toEqual([]);
  });

  it('returns an empty array for a path of only delimiters', () => {
    expect(parsePath('///')).toEqual([]);
  });

  it('supports a custom delimiter', () => {
    expect(parsePath('a.b.c', '.')).toEqual([
      { label: 'a', value: 'a' },
      { label: 'b', value: 'a.b' },
      { label: 'c', value: 'a.b.c' },
    ]);
  });

  it('treats the whole string as one segment when the delimiter is empty', () => {
    expect(parsePath('abc', '')).toEqual([{ label: 'abc', value: 'abc' }]);
  });
});

describe('joinPath', () => {
  it('joins labels up to and including the index', () => {
    expect(joinPath(['a', 'b', 'c'], 1)).toBe('a/b');
  });

  it('prefixes the delimiter when absolute', () => {
    expect(joinPath(['a', 'b'], 0, '/', true)).toBe('/a');
  });

  it('honors a custom delimiter', () => {
    expect(joinPath(['a', 'b', 'c'], 2, '.')).toBe('a.b.c');
  });
});

describe('segmentPrefix', () => {
  it('returns the leading delimiter for an absolute root segment', () => {
    const segment: ResolvedPathSegment = { label: 'src', value: '/src' };
    expect(segmentPrefix(segment)).toBe('/');
  });

  it('returns the parent path with trailing delimiter for nested segments', () => {
    const segment: ResolvedPathSegment = { label: 'b', value: 'a/b' };
    expect(segmentPrefix(segment)).toBe('a/');
  });

  it('returns an empty string for a relative root segment', () => {
    const segment: ResolvedPathSegment = { label: 'src', value: 'src' };
    expect(segmentPrefix(segment)).toBe('');
  });
});

describe('normalizePath', () => {
  it('delegates string input to parsePath', () => {
    expect(normalizePath('a/b')).toEqual([
      { label: 'a', value: 'a' },
      { label: 'b', value: 'a/b' },
    ]);
  });

  it('builds cumulative values from an array of label strings', () => {
    expect(normalizePath(['src', 'app'])).toEqual([
      { label: 'src', value: 'src' },
      { label: 'app', value: 'src/app' },
    ]);
  });

  it('preserves an explicit value and icon on a structured segment', () => {
    const icon = 'home-icon';
    const result = normalizePath([
      { label: 'Home', value: '/', icon },
      'projects',
    ]);
    expect(result).toEqual([
      { label: 'Home', value: '/', icon },
      // Cumulative join uses the labels, so 'projects' resolves under 'Home'.
      { label: 'projects', value: 'Home/projects' },
    ]);
  });

  it('honors a custom delimiter when joining array labels', () => {
    expect(normalizePath(['com', 'example', 'app'], '.')).toEqual([
      { label: 'com', value: 'com' },
      { label: 'example', value: 'com.example' },
      { label: 'app', value: 'com.example.app' },
    ]);
  });
});

describe('resolveSiblings', () => {
  it('derives sibling values from the anchor prefix', () => {
    const anchor: ResolvedPathSegment = {
      label: 'Button.tsx',
      value: 'src/components/Button.tsx',
    };
    expect(resolveSiblings(anchor, ['Input.tsx', 'Card.tsx'])).toEqual([
      { label: 'Input.tsx', value: 'src/components/Input.tsx' },
      { label: 'Card.tsx', value: 'src/components/Card.tsx' },
    ]);
  });

  it('keeps the leading delimiter for absolute anchors', () => {
    const anchor: ResolvedPathSegment = { label: 'local', value: '/usr/local' };
    expect(resolveSiblings(anchor, ['bin'])).toEqual([
      { label: 'bin', value: '/usr/bin' },
    ]);
  });

  it('resolves siblings of a relative root against an empty prefix', () => {
    const anchor: ResolvedPathSegment = { label: 'src', value: 'src' };
    expect(resolveSiblings(anchor, ['public'])).toEqual([
      { label: 'public', value: 'public' },
    ]);
  });

  it('preserves an explicit value and icon on a structured sibling', () => {
    const anchor: ResolvedPathSegment = { label: 'b', value: 'a/b' };
    const icon = 'icon';
    expect(
      resolveSiblings(anchor, [{ label: 'c', value: 'custom', icon }])
    ).toEqual([{ label: 'c', value: 'custom', icon }]);
  });

  it('returns an empty array when there are no entries', () => {
    const anchor: ResolvedPathSegment = { label: 'src', value: 'src' };
    expect(resolveSiblings(anchor, [])).toEqual([]);
  });
});
