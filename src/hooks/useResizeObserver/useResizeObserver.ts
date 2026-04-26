'use client';

import { useEffect, useRef, type RefObject } from 'react';

export interface UseResizeObserverOptions {
  /**
   * When false, the observer is not attached. Toggling this from `false` to
   * `true` (re-)attaches the observer; toggling back disconnects it.
   * @default true
   */
  enabled?: boolean;
}

/**
 * Observe size changes on an element. SSR-safe; cleans up on unmount.
 *
 * The callback is wrapped in a ref so that consumers do not have to memoize
 * it — the observer only re-subscribes when the target ref or `enabled` flag
 * changes.
 *
 * @example
 * ```tsx
 * const ref = useRef<HTMLDivElement>(null);
 * useResizeObserver(ref, entry => {
 *   console.log(entry.contentRect.width);
 * });
 *
 * return <div ref={ref} />;
 * ```
 */
export function useResizeObserver<T extends HTMLElement>(
  ref: RefObject<T | null>,
  callback: (entry: ResizeObserverEntry) => void,
  options?: UseResizeObserverOptions
): void {
  const { enabled = true } = options ?? {};

  // Stable callback ref so consumers don't need to memoize.
  const callbackRef = useRef(callback);
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    if (!enabled) return;
    if (typeof ResizeObserver === 'undefined') return;

    const node = ref.current;
    if (!node) return;

    const observer = new ResizeObserver(entries => {
      for (const entry of entries) {
        callbackRef.current(entry);
      }
    });
    observer.observe(node);

    return () => {
      observer.disconnect();
    };
  }, [ref, enabled]);
}
