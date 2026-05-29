import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useMediaQuery } from './useMediaQuery';

interface MockMediaQueryList {
  matches: boolean;
  media: string;
  onchange: ((event: MediaQueryListEvent) => void) | null;
  addEventListener: (
    type: 'change',
    listener: (event: MediaQueryListEvent) => void
  ) => void;
  removeEventListener: (
    type: 'change',
    listener: (event: MediaQueryListEvent) => void
  ) => void;
  addListener: (listener: (event: MediaQueryListEvent) => void) => void;
  removeListener: (listener: (event: MediaQueryListEvent) => void) => void;
  dispatch: (matches: boolean) => void;
}

function createMockMatchMedia(initialMatches: boolean) {
  const lists = new Map<string, MockMediaQueryList>();

  function getOrCreate(query: string): MockMediaQueryList {
    const existing = lists.get(query);
    if (existing) return existing;

    const listeners = new Set<(event: MediaQueryListEvent) => void>();
    const list: MockMediaQueryList = {
      matches: initialMatches,
      media: query,
      onchange: null,
      addEventListener: (_type, listener) => listeners.add(listener),
      removeEventListener: (_type, listener) => listeners.delete(listener),
      addListener: listener => listeners.add(listener),
      removeListener: listener => listeners.delete(listener),
      dispatch: (matches: boolean) => {
        list.matches = matches;
        for (const listener of listeners) {
          listener({ matches, media: query } as MediaQueryListEvent);
        }
      },
    };
    lists.set(query, list);
    return list;
  }

  const matchMedia = vi.fn((query: string) => getOrCreate(query));
  return { matchMedia, getList: getOrCreate };
}

describe('useMediaQuery', () => {
  let originalMatchMedia: typeof window.matchMedia | undefined;

  beforeEach(() => {
    originalMatchMedia = window.matchMedia;
  });

  afterEach(() => {
    if (originalMatchMedia) {
      window.matchMedia = originalMatchMedia;
    } else {
      // @ts-expect-error — removing the override
      delete window.matchMedia;
    }
  });

  it('returns the initial match state from matchMedia', () => {
    const { matchMedia } = createMockMatchMedia(true);
    window.matchMedia = matchMedia as unknown as typeof window.matchMedia;

    const { result } = renderHook(() => useMediaQuery('(min-width: 600px)'));
    expect(result.current).toBe(true);
  });

  it('updates when the media query changes', () => {
    const mock = createMockMatchMedia(false);
    window.matchMedia = mock.matchMedia as unknown as typeof window.matchMedia;

    const { result } = renderHook(() => useMediaQuery('(min-width: 600px)'));
    expect(result.current).toBe(false);

    act(() => {
      mock.getList('(min-width: 600px)').dispatch(true);
    });
    expect(result.current).toBe(true);
  });

  it('removes the listener on unmount', () => {
    const mock = createMockMatchMedia(false);
    window.matchMedia = mock.matchMedia as unknown as typeof window.matchMedia;

    const { unmount, result } = renderHook(() =>
      useMediaQuery('(min-width: 600px)')
    );
    unmount();

    act(() => {
      mock.getList('(min-width: 600px)').dispatch(true);
    });
    expect(result.current).toBe(false);
  });

  it('falls back to defaultMatches when matchMedia is unavailable', () => {
    // @ts-expect-error — simulate SSR
    delete window.matchMedia;

    const { result } = renderHook(() =>
      useMediaQuery('(min-width: 600px)', { defaultMatches: true })
    );
    expect(result.current).toBe(true);
  });

  it('uses legacy addListener when addEventListener is missing', () => {
    const listeners = new Set<(event: MediaQueryListEvent) => void>();
    const list = {
      matches: false,
      media: '(min-width: 600px)',
      onchange: null,
      addListener: (listener: (event: MediaQueryListEvent) => void) =>
        listeners.add(listener),
      removeListener: (listener: (event: MediaQueryListEvent) => void) =>
        listeners.delete(listener),
    };
    window.matchMedia = vi.fn(() => list as unknown as MediaQueryList);

    const { result } = renderHook(() => useMediaQuery('(min-width: 600px)'));
    expect(result.current).toBe(false);

    act(() => {
      list.matches = true;
      for (const l of listeners) {
        l({ matches: true, media: list.media } as MediaQueryListEvent);
      }
    });
    expect(result.current).toBe(true);
  });
});
