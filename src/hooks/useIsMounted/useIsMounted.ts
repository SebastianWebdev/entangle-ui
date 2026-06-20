'use client';

import { useCallback, useEffect, useRef } from 'react';

/**
 * Returns a stable getter that reports whether the component is still
 * mounted. Call it inside async continuations (promises, timers, fetches)
 * before committing state, so a resolution that lands after unmount becomes
 * a no-op instead of a "set state on an unmounted component" warning.
 *
 * The getter identity is stable for the component lifetime, so it is safe to
 * include in — or omit from — dependency arrays without churn. It reports
 * `false` until the mount effect commits and `false` again after unmount,
 * which also covers the double mount/unmount of React StrictMode.
 *
 * Prefer real cancellation (`AbortController`, effect cleanup) where the
 * async source supports it; reach for this only when the source cannot be
 * cancelled.
 *
 * @example
 * ```tsx
 * const isMounted = useIsMounted();
 * useEffect(() => {
 *   void load().then(data => {
 *     if (isMounted()) setData(data);
 *   });
 * }, [isMounted]);
 * ```
 */
export function useIsMounted(): () => boolean {
  const mountedRef = useRef(false);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // Reading `mountedRef.current` happens only when the getter is invoked from
  // an async continuation or effect — never during render.
  return useCallback(() => mountedRef.current, []);
}
