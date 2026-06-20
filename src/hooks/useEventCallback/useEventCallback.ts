'use client';

import { useCallback, useInsertionEffect, useRef } from 'react';

/**
 * Wrap a callback so its identity stays stable for the component lifetime
 * while it always invokes the most recently rendered version — the
 * `useEffectEvent` pattern, backed by `useInsertionEffect`.
 *
 * The stored callback is refreshed in `useInsertionEffect`, which commits
 * before any layout effect. So the freshness guarantee holds even for
 * consumers that read it during the same commit: a child's
 * `useLayoutEffect`, a synchronous external-store subscription, an
 * imperative handle. A passively updated ref (e.g. `useLatest`, which writes
 * in `useEffect`) would still be one render stale in those cases.
 *
 * Pass the result to memoized children, dependency arrays, or external
 * subscriptions without re-subscribing — the reference never changes, yet it
 * still closes over the latest props and state.
 *
 * The one rule: do not call it during render. Like an event handler it reads
 * through a ref, so a render-phase call has no meaningful "latest" value to
 * read. Use it in event handlers, effects, layout effects, timers, and
 * subscriptions only.
 *
 * @example
 * ```tsx
 * const handleChange = useEventCallback((value: string) => {
 *   onChange?.(value, internalState);
 * });
 * useEffect(() => store.subscribe(handleChange), [handleChange]);
 * ```
 */
export function useEventCallback<Args extends unknown[], Return>(
  fn: (...args: Args) => Return
): (...args: Args) => Return {
  const ref = useRef(fn);

  // Refresh the stored callback before layout effects run. useInsertionEffect
  // commits earlier than useEffect / useLayoutEffect, so children's layout
  // effects and synchronous subscriptions firing in the same commit already
  // observe the latest callback.
  useInsertionEffect(() => {
    ref.current = fn;
  }, [fn]);

  // Stable wrapper for the component lifetime. Reading `ref.current` happens
  // only when the wrapper is invoked from an event, effect, or timer — never
  // during render.
  return useCallback((...args: Args): Return => ref.current(...args), []);
}
