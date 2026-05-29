'use client';

import { createContext, useContext, useSyncExternalStore } from 'react';

import type { MinimapContextValue } from './Minimap.types';
import type {
  MinimapGeometryState,
  MinimapHoverState,
  MinimapStore,
} from './MinimapStore';

export const MinimapStoreContext = createContext<MinimapStore | null>(null);

function useMinimapStoreInternal(): MinimapStore {
  const store = useContext(MinimapStoreContext);
  if (!store) {
    throw new Error(
      'useMinimap* hooks must be called inside a <Minimap> component'
    );
  }
  return store;
}

/**
 * Subscribe to **all** Minimap state. Convenient catch-all but re-renders
 * on every store mutation. For perf-sensitive consumers, prefer the
 * slice-specific hooks (`useMinimapHover`, `useMinimapGeometry`,
 * `useMinimapDragState`).
 */
export function useMinimapContext(): MinimapContextValue {
  const store = useMinimapStoreInternal();
  return useSyncExternalStore(store.subscribe, store.getSnapshot);
}

/**
 * Subscribe to the hover slice. Re-renders only when the pointer position
 * or hovered item id changes.
 */
export function useMinimapHover(): MinimapHoverState {
  const store = useMinimapStoreInternal();
  return useSyncExternalStore(store.subscribeHover, store.getHover);
}

/**
 * Subscribe to the geometry slice (transform / sizes / bounds). Re-renders
 * only on geometry mutations.
 */
export function useMinimapGeometry(): MinimapGeometryState {
  const store = useMinimapStoreInternal();
  return useSyncExternalStore(store.subscribeGeometry, store.getGeometry);
}

/**
 * Subscribe to the drag slice — `true` while a pan/rect-drag gesture is
 * in flight. Re-renders only on drag-state transitions.
 */
export function useMinimapDragState(): boolean {
  const store = useMinimapStoreInternal();
  return useSyncExternalStore(store.subscribeDrag, store.getIsDragging);
}
