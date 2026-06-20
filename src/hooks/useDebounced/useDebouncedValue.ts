'use client';

import { useEffect, useState } from 'react';

/**
 * Returns a copy of `value` that updates only after `delay` ms have elapsed
 * without further changes (trailing-edge debounce).
 *
 * @deprecated Prefer React's `useDeferredValue` for the common case — keeping
 * an input responsive while an expensive derivation (filtering, search) lags
 * behind it. It needs no fixed delay, integrates with concurrent rendering,
 * and gives better interactivity on large lists. Reach for `useDebouncedCallback`
 * when you need to debounce a *side effect* (a network request, an analytics
 * ping) rather than a rendered value. This hook stays exported for now but
 * will not see further work.
 *
 * @example
 * ```tsx
 * // Preferred: defer the value that drives the expensive derivation.
 * const deferredQuery = useDeferredValue(query);
 * const results = useMemo(
 *   () => filter(items, deferredQuery),
 *   [items, deferredQuery]
 * );
 * ```
 */
export function useDebouncedValue<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState<T>(value);

  useEffect(() => {
    if (delay <= 0) {
      // Synchronous passthrough when debouncing is disabled; this hook's whole
      // purpose is to mirror an external value into state.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setDebounced(value);
      return;
    }
    const id = setTimeout(() => {
      setDebounced(value);
    }, delay);
    return () => {
      clearTimeout(id);
    };
  }, [value, delay]);

  return debounced;
}
