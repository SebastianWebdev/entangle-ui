'use client';

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useSyncExternalStore,
} from 'react';
import type { TangentMode } from '@/types/keyframe';
import type {
  TimelineContextValue,
  TimelineSelection,
  TimelineTrack,
} from './Timeline.types';
import type {
  TimelineGeometryState,
  TimelinePlayheadState,
  TimelineStore,
} from './TimelineStore';
import { selectedTangentMode, setSelectedTangentMode } from './timelineEdits';

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

export interface TimelineSelectedTangentMode {
  /**
   * The tangent mode shared by all selected keyframes; `'mixed'` if they
   * disagree; `null` when nothing applicable is selected.
   */
  current: TangentMode | 'mixed' | null;
  /** Apply a tangent mode to every selected keyframe. */
  set: (mode: TangentMode) => void;
}

/**
 * Convenience hook for building a tangent-mode toggle UI (the six modes:
 * `auto` / `linear` / `step` / `aligned` / `mirrored` / `free`). Reads the
 * current selection from the Timeline store, exposes the unified mode (or
 * `'mixed'`), and applies a chosen mode to every selected keyframe via the
 * caller's `onTracksChange`.
 *
 * @example
 * ```tsx
 * function TangentBar({ tracks, onTracksChange }) {
 *   const t = useTimelineSelectedTangentMode(tracks, onTracksChange);
 *   if (t.current === null) return null;
 *   return (
 *     <>
 *       <button onClick={() => t.set('auto')} aria-pressed={t.current === 'auto'}>auto</button>
 *       <button onClick={() => t.set('aligned')} aria-pressed={t.current === 'aligned'}>aligned</button>
 *       …
 *     </>
 *   );
 * }
 * ```
 */
export function useTimelineSelectedTangentMode(
  tracks: ReadonlyArray<TimelineTrack>,
  onTracksChange: (next: TimelineTrack[]) => void
): TimelineSelectedTangentMode {
  const selection = useTimelineSelection();
  const current = useMemo(
    () => selectedTangentMode(tracks, selection),
    [tracks, selection]
  );
  const set = useCallback(
    (mode: TangentMode): void => {
      onTracksChange(setSelectedTangentMode(tracks, selection, mode));
    },
    [tracks, selection, onTracksChange]
  );
  return { current, set };
}
