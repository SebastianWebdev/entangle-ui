'use client';

import { useMemo, useRef } from 'react';

/**
 * Stabilize an optional consumer callback that may be invoked **during
 * render** (e.g. a render-prop). The returned wrapper has stable identity for
 * the component's lifetime but always invokes the latest closure.
 *
 * This is the render-time companion to `useEffectEvent`. Use `useEffectEvent`
 * for callbacks called from event handlers / effects, and `useStableRenderFn`
 * for ones called during the render phase.
 *
 * Returns `undefined` while `fn` is `undefined`, so consumers can keep using
 * `?.()` and falsy fallbacks.
 *
 * @example
 * ```ts
 * const stableRender = useStableRenderFn(props.renderItem);
 * // pass `stableRender` through context; inline consumer functions no longer
 * // bust the context value.
 * ```
 */
export function useStableRenderFn<F extends (...args: never[]) => unknown>(
  fn: F | undefined
): F | undefined {
  const ref = useRef(fn);
  // Synchronous write during render is the canonical pattern for a
  // render-safe stable callback. The ref is write-only here — it isn't read
  // by this component during render, only by descendants from inside the
  // returned wrapper, so no concurrent-render tearing.
  ref.current = fn;
  const has = fn !== undefined;
  return useMemo(
    () =>
      has
        ? (((...args: Parameters<F>) => (ref.current as F)(...args)) as F)
        : undefined,
    [has]
  );
}
