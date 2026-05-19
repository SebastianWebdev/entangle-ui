import { renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useBreakpoint } from './useBreakpoint';

function mockMatchMedia(matchedQueries: ReadonlyArray<string>) {
  const matched = new Set(matchedQueries);
  return vi.fn((query: string) => ({
    matches: matched.has(query),
    media: query,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })) as unknown as typeof window.matchMedia;
}

describe('useBreakpoint', () => {
  let originalMatchMedia: typeof window.matchMedia | undefined;

  beforeEach(() => {
    originalMatchMedia = window.matchMedia;
  });

  afterEach(() => {
    if (originalMatchMedia) window.matchMedia = originalMatchMedia;
  });

  it('returns xs when no breakpoints match', () => {
    window.matchMedia = mockMatchMedia([]);
    const { result } = renderHook(() => useBreakpoint());

    expect(result.current.xs).toBe(true);
    expect(result.current.sm).toBe(false);
    expect(result.current.md).toBe(false);
    expect(result.current.lg).toBe(false);
    expect(result.current.xl).toBe(false);
    expect(result.current.current).toBe('xs');
  });

  it('returns md as current when sm and md match but lg/xl do not', () => {
    window.matchMedia = mockMatchMedia([
      '(min-width: 576px)',
      '(min-width: 768px)',
    ]);
    const { result } = renderHook(() => useBreakpoint());

    expect(result.current.sm).toBe(true);
    expect(result.current.md).toBe(true);
    expect(result.current.lg).toBe(false);
    expect(result.current.current).toBe('md');
  });

  it('returns xl as current when all breakpoints match', () => {
    window.matchMedia = mockMatchMedia([
      '(min-width: 576px)',
      '(min-width: 768px)',
      '(min-width: 992px)',
      '(min-width: 1200px)',
    ]);
    const { result } = renderHook(() => useBreakpoint());

    expect(result.current.current).toBe('xl');
    expect(result.current.xl).toBe(true);
  });
});
