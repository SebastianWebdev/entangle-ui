'use client';

import { useCallback, useEffect, useMemo, useRef } from 'react';
import type {
  DebouncedCallback,
  UseDebouncedCallbackOptions,
} from './useDebounced.types';

/**
 * Wrap a function so rapid calls collapse into one. By default the call
 * fires on the trailing edge — pass `leading: true` to also fire
 * immediately. `maxWait` forces a call even when calls keep coming.
 *
 * The wrapper identity is stable; passing fresh inline functions across
 * renders is safe and does not reset pending timers.
 *
 * @example
 * ```tsx
 * const onResize = useDebouncedCallback(measure, 150);
 * useEffect(() => {
 *   window.addEventListener('resize', onResize);
 *   return () => window.removeEventListener('resize', onResize);
 * }, [onResize]);
 * ```
 */
export function useDebouncedCallback<Args extends unknown[]>(
  fn: (...args: Args) => void,
  delay: number,
  options: UseDebouncedCallbackOptions = {}
): DebouncedCallback<Args> {
  const { leading = false, maxWait } = options;

  const fnRef = useRef(fn);
  fnRef.current = fn;

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const maxTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastArgsRef = useRef<Args | null>(null);
  const lastInvokeRef = useRef<number>(0);

  const clearTimers = useCallback(() => {
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (maxTimerRef.current !== null) {
      clearTimeout(maxTimerRef.current);
      maxTimerRef.current = null;
    }
  }, []);

  const invoke = useCallback(() => {
    const args = lastArgsRef.current;
    lastArgsRef.current = null;
    lastInvokeRef.current = Date.now();
    clearTimers();
    if (args) fnRef.current(...args);
  }, [clearTimers]);

  const debounced = useMemo<DebouncedCallback<Args>>(() => {
    const wrapper = (...args: Args): void => {
      lastArgsRef.current = args;
      const now = Date.now();
      const isLeadingCall =
        leading && timerRef.current === null && maxTimerRef.current === null;

      if (isLeadingCall) {
        // Fire immediately, then suppress trailing for `delay` ms unless
        // additional calls happen — in that case the trailing handler will
        // pick them up.
        lastArgsRef.current = null;
        lastInvokeRef.current = now;
        fnRef.current(...args);
      }

      if (timerRef.current !== null) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        timerRef.current = null;
        if (lastArgsRef.current !== null) invoke();
        else if (maxTimerRef.current !== null) {
          clearTimeout(maxTimerRef.current);
          maxTimerRef.current = null;
        }
      }, delay);

      if (maxWait !== undefined && maxTimerRef.current === null) {
        maxTimerRef.current = setTimeout(() => {
          maxTimerRef.current = null;
          if (lastArgsRef.current !== null) invoke();
        }, maxWait);
      }
    };

    wrapper.cancel = () => {
      lastArgsRef.current = null;
      clearTimers();
    };
    wrapper.flush = () => {
      if (lastArgsRef.current !== null) invoke();
      else clearTimers();
    };

    return wrapper;
  }, [delay, leading, maxWait, invoke, clearTimers]);

  // Cleanup on unmount.
  useEffect(() => clearTimers, [clearTimers]);

  return debounced;
}
