'use client';

import { useCallback, useRef, useSyncExternalStore } from 'react';

interface SliceCache<TSource, TSelected> {
  source: TSource;
  selected: TSelected;
}

/**
 * Subscribe to a slice of an external store, returning a memoized selection.
 *
 * Avoids the re-render storm caused by calling `useSyncExternalStore` with a
 * raw slice getter when the slice mutates at high frequency (e.g. drag
 * deltas at 60–120 Hz) but each subscriber only cares about a per-id payload.
 *
 * The selector is invoked only when the underlying source reference changes;
 * if the freshly computed selection compares equal to the previous one via
 * `isEqual`, the previous selection reference is preserved so downstream
 * `Object.is` checks (including React's reconciler) treat it as unchanged.
 *
 * Inspired by `use-sync-external-store/with-selector`, kept local to avoid
 * pulling in an extra peer dependency for a single call site.
 */
export function useStoreSlice<TSource, TSelected>(
  subscribe: (cb: () => void) => () => void,
  getSnapshot: () => TSource,
  selector: (snapshot: TSource) => TSelected,
  isEqual: (a: TSelected, b: TSelected) => boolean = Object.is
): TSelected {
  const cacheRef = useRef<SliceCache<TSource, TSelected> | null>(null);
  const selectorRef = useRef(selector);
  const isEqualRef = useRef(isEqual);
  // Keep these refs pointed at the latest selector + equality fn so the
  // snapshot getter below always uses current values without forcing a
  // re-subscribe. This mirrors `use-sync-external-store/with-selector`, which
  // deliberately writes these refs during render rather than in an effect.
  // eslint-disable-next-line react-hooks/refs -- intentional with-selector latest refs
  selectorRef.current = selector;
  // eslint-disable-next-line react-hooks/refs -- intentional with-selector latest refs
  isEqualRef.current = isEqual;

  const getSelectedSnapshot = useCallback((): TSelected => {
    const next = getSnapshot();
    const cache = cacheRef.current;
    if (cache && Object.is(cache.source, next)) {
      return cache.selected;
    }
    const selected = selectorRef.current(next);
    if (cache && isEqualRef.current(cache.selected, selected)) {
      cacheRef.current = { source: next, selected: cache.selected };
      return cache.selected;
    }
    cacheRef.current = { source: next, selected };
    return selected;
  }, [getSnapshot]);

  return useSyncExternalStore(subscribe, getSelectedSnapshot);
}
