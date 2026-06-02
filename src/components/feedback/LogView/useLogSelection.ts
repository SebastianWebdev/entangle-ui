'use client';

import { useCallback, useRef } from 'react';

import { useLatest } from '@/hooks/useLatest';

import type { LogViewSelectionMode, ResolvedLogEntry } from './LogView.types';
import type React from 'react';

export interface UseLogSelectionOptions {
  /** Active selection mode. */
  selectionMode: LogViewSelectionMode;
  /** Currently-selected entry ids. */
  selectedIds: ReadonlySet<string>;
  /** Replace the selection. */
  setSelectedIds: (ids: ReadonlySet<string>) => void;
  /** The currently-filtered entries (for range selection and select-all). */
  filtered: readonly ResolvedLogEntry[];
  /** Fired on row activation regardless of selection mode. */
  onEntryClick: ((entry: ResolvedLogEntry, index: number) => void) | undefined;
  /** True when the user has an active text selection inside the log body. */
  isTextSelected: () => boolean;
  /** Invoked on Cmd/Ctrl+C while a row selection exists. */
  onCopyShortcut: () => void;
}

export interface UseLogSelectionResult {
  /** Click handler for a row (also reused for Enter/Space activation). */
  handleRowClick: (
    entry: ResolvedLogEntry,
    index: number,
    event: React.MouseEvent | React.KeyboardEvent
  ) => void;
  /** Keydown handler for a row: activation, copy, select-all, clear. */
  handleRowKeyDown: (
    entry: ResolvedLogEntry,
    index: number,
    event: React.KeyboardEvent<HTMLDivElement>
  ) => void;
}

/**
 * Row selection + keyboard behavior for the LogView body.
 *
 * - Click selects (single), Cmd/Ctrl+click toggles, Shift+click extends a range
 *   from the anchor (multiple).
 * - Enter/Space activate the focused row; Cmd/Ctrl+C copies the selection (when
 *   present and no text is selected); Cmd/Ctrl+A selects all visible; Escape
 *   clears.
 * - A drag-to-select-text gesture is never treated as a row click.
 *
 * Consumer values are read through `useLatest` so the returned handlers stay
 * identity-stable (they never have to be memoized by the caller). Colocated
 * with LogView (single consumer); promote to `src/hooks/` only if a second
 * component needs it.
 */
export function useLogSelection({
  selectionMode,
  selectedIds,
  setSelectedIds,
  filtered,
  onEntryClick,
  isTextSelected,
  onCopyShortcut,
}: UseLogSelectionOptions): UseLogSelectionResult {
  const anchorRef = useRef<number | null>(null);
  const filteredRef = useLatest(filtered);
  const selectedIdsRef = useLatest(selectedIds);
  const onEntryClickRef = useLatest(onEntryClick);
  const isTextSelectedRef = useLatest(isTextSelected);
  const onCopyShortcutRef = useLatest(onCopyShortcut);

  const handleRowClick = useCallback(
    (
      entry: ResolvedLogEntry,
      index: number,
      event: React.MouseEvent | React.KeyboardEvent
    ) => {
      // Don't treat a drag-to-select-text gesture as a row click.
      if (isTextSelectedRef.current()) return;
      onEntryClickRef.current?.(entry, index);
      if (selectionMode === false) return;

      const { id } = entry;
      if (selectionMode === 'single') {
        anchorRef.current = index;
        setSelectedIds(new Set([id]));
        return;
      }

      if (event.shiftKey && anchorRef.current !== null) {
        const list = filteredRef.current;
        const from = Math.min(anchorRef.current, index);
        const to = Math.max(anchorRef.current, index);
        const range = new Set<string>();
        for (let i = from; i <= to; i += 1) {
          const rangeEntry = list[i];
          if (rangeEntry) range.add(rangeEntry.id);
        }
        setSelectedIds(range);
      } else if (event.metaKey || event.ctrlKey) {
        const next = new Set(selectedIdsRef.current);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        anchorRef.current = index;
        setSelectedIds(next);
      } else {
        anchorRef.current = index;
        setSelectedIds(new Set([id]));
      }
    },
    [
      selectionMode,
      setSelectedIds,
      filteredRef,
      selectedIdsRef,
      onEntryClickRef,
      isTextSelectedRef,
    ]
  );

  const handleRowKeyDown = useCallback(
    (
      entry: ResolvedLogEntry,
      index: number,
      event: React.KeyboardEvent<HTMLDivElement>
    ) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        handleRowClick(entry, index, event);
        return;
      }
      const meta = event.metaKey || event.ctrlKey;
      if (meta && (event.key === 'c' || event.key === 'C')) {
        // Let the browser copy an active text selection instead.
        if (isTextSelectedRef.current() || selectedIdsRef.current.size === 0) {
          return;
        }
        event.preventDefault();
        onCopyShortcutRef.current();
        return;
      }
      if (selectionMode === false) return;
      if (meta && (event.key === 'a' || event.key === 'A')) {
        event.preventDefault();
        setSelectedIds(new Set(filteredRef.current.map(item => item.id)));
        return;
      }
      if (event.key === 'Escape' && selectedIdsRef.current.size > 0) {
        event.preventDefault();
        setSelectedIds(new Set());
      }
    },
    [
      handleRowClick,
      selectionMode,
      setSelectedIds,
      filteredRef,
      selectedIdsRef,
      isTextSelectedRef,
      onCopyShortcutRef,
    ]
  );

  return { handleRowClick, handleRowKeyDown };
}
