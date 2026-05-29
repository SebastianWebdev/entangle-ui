'use client';

import { useCallback } from 'react';

import type { Ref, RefCallback } from 'react';

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
  // latest set of refs the consumer is passing in, so the dependency list is
  // dynamic by design (use-memo / exhaustive-deps cannot model that).
  return useCallback((node: T | null) => {
    for (const ref of refs) {
      if (!ref) continue;
      if (typeof ref === 'function') {
        ref(node);
      } else {
        // Assigning a node into an object ref's `.current` is the entire point
        // of a callback ref; it is not a forbidden mutation of hook arguments.
        // eslint-disable-next-line react-hooks/immutability
        (ref as { current: T | null }).current = node;
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps, react-hooks/use-memo
  }, refs);
}
