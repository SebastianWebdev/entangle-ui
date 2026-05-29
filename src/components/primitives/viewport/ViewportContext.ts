'use client';

import { createContext, useContext, useSyncExternalStore } from 'react';

import type { ViewportContextValue } from './Viewport.types';
import type { ViewportStore } from './ViewportStore';

export const ViewportStoreContext =
  /*#__PURE__*/ createContext<ViewportStore | null>(null);

/**
 * Internal hook returning the store instance. Throws when called outside
 * a `<Viewport>` subtree.
 */
export function useViewportStore(): ViewportStore {
  const store = useContext(ViewportStoreContext);
  if (!store) {
    throw new Error(
      'useViewportContext must be used inside a <Viewport> subtree.'
    );
  }
  return store;
}

/**
 * Read viewport state from inside `<Viewport>` children.
 *
 * Returns `transform`, `size`, `isPanning`, and the imperative `handle`.
 * The hook subscribes to every store mutation — if you only need one slice
 * (e.g. just the transform) reach for `useViewportStore()` directly and
 * subscribe to a single slice with `useSyncExternalStore`.
 *
 * @throws If called outside a `<Viewport>` subtree.
 *
 * @example
 * ```tsx
 * function Minimap() {
 *   const { transform, size, handle } = useViewportContext();
 *   // ...
 * }
 * ```
 */
export function useViewportContext(): ViewportContextValue {
  const store = useViewportStore();
  const snapshot = useSyncExternalStore(store.subscribe, store.getSnapshot);

  return {
    transform: snapshot.transform,
    size: snapshot.size,
    isPanning: snapshot.isPanning,
    handle: store.handle,
  };
}
