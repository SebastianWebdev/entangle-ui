'use client';

import { useEffect, useState } from 'react';

import type { UseMediaQueryOptions } from './useMediaQuery.types';

function getInitialMatch(query: string, fallback: boolean): boolean {
  if (
    typeof window === 'undefined' ||
    typeof window.matchMedia !== 'function'
  ) {
    return fallback;
  }
  return window.matchMedia(query).matches;
}

/**
 * Reactive media query matching.
 *
 * Returns `true` when the current viewport matches the query and updates as
 * the viewport changes. SSR-safe — returns `defaultMatches` when `matchMedia`
 * is unavailable. Uses the modern `addEventListener('change')` API with a
 * fallback to the legacy `addListener` for older browsers.
 *
 * @example
 * ```tsx
 * const isWide = useMediaQuery('(min-width: 768px)');
 * return isWide ? <DesktopLayout /> : <MobileLayout />;
 * ```
 */
export function useMediaQuery(
  query: string,
  options: UseMediaQueryOptions = {}
): boolean {
  const { defaultMatches = false } = options;

  const [matches, setMatches] = useState<boolean>(() =>
    getInitialMatch(query, defaultMatches)
  );

  useEffect(() => {
    if (
      typeof window === 'undefined' ||
      typeof window.matchMedia !== 'function'
    ) {
      return;
    }

    const mql = window.matchMedia(query);
    setMatches(mql.matches);

    const handler = (event: MediaQueryListEvent): void => {
      setMatches(event.matches);
    };

    if (typeof mql.addEventListener === 'function') {
      mql.addEventListener('change', handler);
      return () => {
        mql.removeEventListener('change', handler);
      };
    }

    // Legacy Safari fallback.
    mql.addListener(handler);
    return () => {
      mql.removeListener(handler);
    };
  }, [query]);

  return matches;
}
