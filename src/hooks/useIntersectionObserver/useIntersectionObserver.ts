'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import type {
  UseIntersectionObserverOptions,
  UseIntersectionObserverReturn,
} from './useIntersectionObserver.types';
import type React from 'react';

/**
 * Observe whether an element intersects a root (defaults to the viewport).
 * Returns a ref callback to attach to the observed element plus the latest
 * `IntersectionObserverEntry`. SSR-safe: returns a no-op ref and `null`
 * entry when `IntersectionObserver` is unavailable.
 *
 * @example
 * ```tsx
 * const { ref, isIntersecting } = useIntersectionObserver<HTMLDivElement>({
 *   rootMargin: '200px',
 * });
 * useEffect(() => {
 *   if (isIntersecting) loadMore();
 * }, [isIntersecting]);
 * return <div ref={ref} />;
 * ```
 */
export function useIntersectionObserver<T extends Element = Element>(
  options: UseIntersectionObserverOptions = {}
): UseIntersectionObserverReturn<T> {
  const { root, rootMargin, threshold, enabled = true } = options;

  const [entry, setEntry] = useState<IntersectionObserverEntry | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const nodeRef = useRef<T | null>(null);

  const ref = useCallback<React.RefCallback<T>>(
    node => {
      if (typeof IntersectionObserver === 'undefined') {
        nodeRef.current = node;
        return;
      }

      if (observerRef.current) {
        observerRef.current.disconnect();
        observerRef.current = null;
      }

      nodeRef.current = node;
      if (!enabled || !node) {
        setEntry(null);
        return;
      }

      const observer = new IntersectionObserver(
        entries => {
          const next = entries[0];
          if (next) setEntry(next);
        },
        { root: root ?? null, rootMargin, threshold }
      );
      observer.observe(node);
      observerRef.current = observer;
    },
    [root, rootMargin, threshold, enabled]
  );

  // When toggled off via `enabled`, disconnect proactively so consumers don't
  // have to detach the ref to stop observing.
  useEffect(() => {
    if (enabled) return;
    if (observerRef.current) {
      observerRef.current.disconnect();
      observerRef.current = null;
    }
    // Sync state to the external observer being torn down when disabled.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setEntry(null);
  }, [enabled]);

  // Final cleanup on unmount.
  useEffect(
    () => () => {
      observerRef.current?.disconnect();
      observerRef.current = null;
      nodeRef.current = null;
    },
    []
  );

  return {
    ref,
    entry,
    isIntersecting: entry?.isIntersecting ?? false,
  };
}
