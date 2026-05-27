'use client';

import { createContext, useContext, useSyncExternalStore } from 'react';
import type { TimelineContextValue, TimelineSelection } from './Timeline.types';
import type {
  TimelineGeometryState,
  TimelinePlayheadState,
  TimelineStore,
} from './TimelineStore';

export const TimelineStoreContext = createContext<TimelineStore | null>(null);

function useTimelineStoreInternal(): TimelineStore {
  const store = useContext(TimelineStoreContext);
  if (!store) {
    throw new Error(
      'useTimeline* hooks must be called inside a <Timeline> component'
    );
  }
  return store;
}

/**
 * Subscribe to **all** Timeline state. Convenient catch-all but re-renders on
 * every store mutation. For perf-sensitive consumers, prefer the slice hooks
 * (`useTimelineGeometry`, `useTimelinePlayhead`, `useTimelineSelection`).
 */
export function useTimelineContext(): TimelineContextValue {
  const store = useTimelineStoreInternal();
  return useSyncExternalStore(store.subscribe, store.getSnapshot);
}

/** Subscribe to the geometry slice (view / sizes / range / mode). */
export function useTimelineGeometry(): TimelineGeometryState {
  const store = useTimelineStoreInternal();
  return useSyncExternalStore(store.subscribeGeometry, store.getGeometry);
}

/** Subscribe to the playhead slice (frame / playing). */
export function useTimelinePlayhead(): TimelinePlayheadState {
  const store = useTimelineStoreInternal();
  return useSyncExternalStore(store.subscribePlayhead, store.getPlayhead);
}

/** Subscribe to the selection slice. */
export function useTimelineSelection(): TimelineSelection {
  const store = useTimelineStoreInternal();
  return useSyncExternalStore(store.subscribeSelection, store.getSelection);
}
