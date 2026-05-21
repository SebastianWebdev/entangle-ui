'use client';

import { useEffect, useRef, type RefObject } from 'react';

/**
 * Keep a ref synced to the latest value of `value` after each render.
 *
 * Useful for reading "live" props/state inside event handlers, timers,
 * or external store subscriptions without re-attaching the listener on
 * every render. The ref is updated in `useEffect` so its value reflects
 * the most recently committed render.
 *
 * @example
 * ```ts
 * const latestOnChange = useLatest(onChange);
 * useEffect(() => {
 *   const handler = (e: Event) => latestOnChange.current(e);
 *   target.addEventListener('change', handler);
 *   return () => target.removeEventListener('change', handler);
 * }, [target]);
 * ```
 */
export function useLatest<T>(value: T): RefObject<T> {
  const ref = useRef(value);
  useEffect(() => {
    ref.current = value;
  });
  return ref;
}
