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
 * The callback is wrapped in a ref so consumers do not have to memoize it —
 * the underlying observer never re-subscribes when the callback identity
 * changes.
 *
 * The hook re-checks `ref.current` on every render so it picks up nodes that
 * mount later (e.g. through conditional rendering). When the observed node
 * has not changed the only cost is a single identity comparison.
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

  const callbackRef = useRef(callback);
  const observerRef = useRef<ResizeObserver | null>(null);
  const observedNodeRef = useRef<T | null>(null);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  // Runs on every render so a node that mounts after the first render
  // (conditional rendering, lazy children, suspense fallback flips, ...) is
  // picked up automatically. Short-circuits on the common case where the
  // observed node has not changed.
  useEffect(() => {
    if (typeof ResizeObserver === 'undefined') return;

    if (!enabled) {
      if (observerRef.current) {
        observerRef.current.disconnect();
        observerRef.current = null;
        observedNodeRef.current = null;
      }
      return;
    }

    const node = ref.current;
    if (node === observedNodeRef.current) return;

    if (observerRef.current) {
      observerRef.current.disconnect();
      observerRef.current = null;
    }
    observedNodeRef.current = node;
    if (!node) return;

    const observer = new ResizeObserver(entries => {
      for (const entry of entries) {
        callbackRef.current(entry);
      }
    });
    observer.observe(node);
    observerRef.current = observer;
  });

  // Final cleanup on unmount.
  useEffect(
    () => () => {
      observerRef.current?.disconnect();
      observerRef.current = null;
      observedNodeRef.current = null;
    },
    []
  );
}
