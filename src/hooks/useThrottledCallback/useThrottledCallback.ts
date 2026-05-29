'use client';

import { useEffect, useMemo, useRef } from 'react';

import { useLatest } from '@/hooks/useLatest';

import type {
  ThrottledCallback,
  UseThrottledCallbackOptions,
} from './useThrottledCallback.types';

/**
 * Wrap a function so it fires at most once per `delay` ms. With both
 * `leading` and `trailing` enabled (the default), the first call fires
 * immediately and the most recent call inside the window fires at its
 * end. Set `leading: false` to defer the first call; set
 * `trailing: false` to drop calls inside the window.
 *
 * Typical use: drag handlers, scroll listeners, resize observers — places
 * where the input rate exceeds the work rate and you want to bound the
 * latter.
 *
 * The wrapper identity is stable across renders.
 *
 * @example
 * ```tsx
 * const onPointerMove = useThrottledCallback(updateGuide, 16);
 * ```
 */
export function useThrottledCallback<Args extends unknown[]>(
  fn: (...args: Args) => void,
  delay: number,
  options: UseThrottledCallbackOptions = {}
): ThrottledCallback<Args> {
  const { leading = true, trailing = true } = options;

  // Latest fn, refreshed after each commit so the stable throttled wrapper
  // always invokes the current callback.
  const fnRef = useLatest(fn);

  const lastCallRef = useRef<number>(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastArgsRef = useRef<Args | null>(null);

  const throttled = useMemo<ThrottledCallback<Args>>(() => {
    const invoke = (now: number): void => {
      lastCallRef.current = now;
      const args = lastArgsRef.current;
      lastArgsRef.current = null;
      if (args) fnRef.current(...args);
    };

    const wrapper = (...args: Args): void => {
      // Date.now() runs only when the wrapper is invoked from an event/timer,
      // never during render, so it is not a render-purity concern here.
      // eslint-disable-next-line react-hooks/purity
      const now = Date.now();
      if (lastCallRef.current === 0 && !leading) {
        // Skip the leading fire by anchoring the window to "now".
        lastCallRef.current = now;
      }

      const elapsed = now - lastCallRef.current;
      lastArgsRef.current = args;

      if (elapsed >= delay) {
        if (timerRef.current !== null) {
          clearTimeout(timerRef.current);
          timerRef.current = null;
        }
        invoke(now);
        return;
      }

      if (trailing && timerRef.current === null) {
        timerRef.current = setTimeout(() => {
          timerRef.current = null;
          invoke(Date.now());
        }, delay - elapsed);
      }
    };

    wrapper.cancel = () => {
      if (timerRef.current !== null) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      lastArgsRef.current = null;
      lastCallRef.current = 0;
    };

    return wrapper;
  }, [delay, leading, trailing, fnRef]);

  useEffect(
    () => () => {
      if (timerRef.current !== null) clearTimeout(timerRef.current);
    },
    []
  );

  return throttled;
}
