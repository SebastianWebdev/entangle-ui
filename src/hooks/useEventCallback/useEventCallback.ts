'use client';

import { useCallback } from 'react';

import { useLatest } from '@/hooks/useLatest';

/**
 * Wrap a callback so its identity stays stable for the component lifetime
 * while it always invokes the most recently rendered version.
 *
 * This is the function-shaped companion to `useLatest`: where `useLatest`
 * hands back a ref you read inside a handler, `useEventCallback` hands back
 * a ready-to-pass function. Use it for callbacks you place in dependency
 * arrays, pass to memoized children, or hand to external subscriptions —
 * the reference never changes, so it never invalidates a memo or re-attaches
 * a listener, yet it still closes over the latest props and state.
 *
 * Do not call the returned function during render. Like an event handler it
 * reads the latest value through a ref committed in an effect, so a
 * render-phase call could read a stale value. Use it in event handlers,
 * effects, timers, and subscriptions only.
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
  // Latest fn, refreshed after each commit so the stable wrapper below
  // always invokes the current callback.
  const fnRef = useLatest(fn);

  // The wrapper identity is stable for the component lifetime. Reading
  // `fnRef.current` happens only when the wrapper is invoked from an event,
  // effect, or timer — never during render.
  return useCallback(
    (...args: Args): Return => fnRef.current(...args),
    [fnRef]
  );
}
