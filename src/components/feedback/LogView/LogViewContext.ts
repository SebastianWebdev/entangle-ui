'use client';

import { createContext, useContext, useSyncExternalStore } from 'react';

import type {
  LogEntryRenderInfo,
  LogLevel,
  LogViewDensity,
  LogViewSelectionMode,
  LogViewVirtualizationMode,
  ResolvedLogEntry,
} from './LogView.types';
import type { ResolvedLevelDefinition } from './logViewLevels';
import type { LogLevelCounts, LogViewStore } from './LogViewStore';
import type React from 'react';

/**
 * Value shared by `<LogView>` and its compound slots.
 *
 * It carries only **low-frequency** state — filter query, visible levels,
 * follow flag, and static config. The high-frequency entry stream is *not*
 * here: the body and level filter read it through {@link useLogEntries} /
 * {@link useLogCounts}, which subscribe to the store directly so a streaming
 * append re-renders only those two slots, not every consumer of the context.
 */
export interface LogViewContextValue {
  store: LogViewStore;

  // Filtering
  query: string;
  setQuery: (query: string) => void;
  caseSensitive: boolean;
  activeLevels: ReadonlySet<LogLevel>;
  knownLevels: ReadonlySet<LogLevel>;
  isLevelActive: (level: LogLevel) => boolean;
  toggleLevel: (level: LogLevel) => void;

  // Follow / auto-scroll
  follow: boolean;
  setFollow: (follow: boolean) => void;

  // Levels
  levelOrder: LogLevel[];
  getLevelDefinition: (level: LogLevel) => ResolvedLevelDefinition;

  // Layout / display config
  wrap: boolean;
  density: LogViewDensity;
  showTimestamps: boolean;
  formatTimestamp: (timestamp: number | Date) => string;
  showSource: boolean;

  // Virtualization config
  virtualized: LogViewVirtualizationMode;
  virtualizationThreshold: number;
  estimatedRowHeight: number | undefined;
  overscan: number;

  // Rendering
  renderEntry: ((info: LogEntryRenderInfo) => React.ReactNode) | undefined;
  emptyState: React.ReactNode;

  // Selection
  selectionMode: LogViewSelectionMode;
  selectedIds: ReadonlySet<string>;
  setSelectedIds: (ids: ReadonlySet<string>) => void;

  // Events / actions
  onEntryClick: ((entry: ResolvedLogEntry, index: number) => void) | undefined;
  onCopy: ((text: string) => void) | undefined;
  clearLog: () => void;

  // Ids
  bodyId: string;

  /** Compute the currently-visible (filtered) entries on demand (used by Copy). */
  getVisibleEntries: () => ResolvedLogEntry[];
  /** Entries to copy: the current selection if non-empty, else all visible. */
  getCopyEntries: () => ResolvedLogEntry[];
}

export const LogViewContext =
  /*#__PURE__*/ createContext<LogViewContextValue | null>(null);

/** Read the LogView context. Throws when used outside `<LogView>`. */
export function useLogViewContext(): LogViewContextValue {
  const ctx = useContext(LogViewContext);
  if (ctx === null) {
    throw new Error(
      'LogView compound components must be rendered inside <LogView>.'
    );
  }
  return ctx;
}

/** Subscribe to the store's entry stream. Re-renders on each (rAF-batched) commit. */
export function useLogEntries(
  store: LogViewStore
): readonly ResolvedLogEntry[] {
  return useSyncExternalStore(
    store.subscribeEntries,
    store.getEntries,
    store.getEntries
  );
}

/** Subscribe to the store's per-level counts. */
export function useLogCounts(store: LogViewStore): LogLevelCounts {
  return useSyncExternalStore(
    store.subscribeCounts,
    store.getCounts,
    store.getCounts
  );
}
