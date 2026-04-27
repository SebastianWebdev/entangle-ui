'use client';

import { useCallback, type Ref, type RefCallback } from 'react';

/**
 * Merge multiple refs into a single callback ref. Each provided ref (object
 * ref, callback ref, or `null`/`undefined`) receives the node when the merged
 * ref fires.
 *
 * Useful when a component needs to keep an internal ref to a DOM node while
 * also forwarding the same node through an externally supplied `ref` prop
 * (ref-as-prop in React 19).
 *
 * @example
 * ```tsx
 * const internalRef = useRef<HTMLDivElement>(null);
 * const mergedRef = useMergedRef(internalRef, props.ref);
 *
 * return <div ref={mergedRef} />;
 * ```
 */
export function useMergedRef<T>(
  ...refs: Array<Ref<T> | undefined | null>
): RefCallback<T> {
  // The spread of refs is intentional — the merged callback must pick up the
  // latest set of refs the consumer is passing in.
  return useCallback((node: T | null) => {
    for (const ref of refs) {
      if (!ref) continue;
      if (typeof ref === 'function') {
        ref(node);
      } else {
        (ref as { current: T | null }).current = node;
      }
    }
  }, refs);
}
