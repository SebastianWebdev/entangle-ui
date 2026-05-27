'use client';

import {
  useCallback,
  useLayoutEffect,
  useMemo,
  useRef,
  useTransition,
  type MouseEvent,
} from 'react';
import { useControlledState, useLatest } from '@/hooks';
import type { AssetItem, AssetSelectionReason } from './AssetBrowser.types';
import type { AssetBrowserStore } from './AssetBrowserStore';
import { indexRange } from './assetBrowserKeyboard';

export interface UseAssetSelectionControllerOptions {
  store: AssetBrowserStore;
  /** The filtered + sorted list, in display order (anchor ranges run over it). */
  displayed: readonly AssetItem[];
  selectionMode: 'single' | 'multiple' | false;
  selection?: readonly string[];
  defaultSelection?: readonly string[];
  onSelectionChange?: (
    ids: string[],
    meta: { reason: AssetSelectionReason }
  ) => void;
}

export interface AssetSelectionHandlers {
  handleItemClick: (item: AssetItem, index: number, event: MouseEvent) => void;
  selectByKeyboard: (index: number, extend: boolean) => void;
  toggleSelectId: (id: string) => void;
  setSelectionIds: (ids: string[], reason: AssetSelectionReason) => void;
  commitMarquee: (ids: string[], additive: boolean) => void;
  selectAll: () => void;
  clearSelection: () => void;
  contextMenuSelect: (item: AssetItem) => void;
}

export interface AssetSelectionController {
  selectionSet: ReadonlySet<string>;
  /** Stable identity — the handlers never change, so they're safe context deps. */
  handlers: AssetSelectionHandlers;
}

/**
 * Owns selection state and the click/keyboard/marquee gestures that mutate it.
 *
 * Selection stays in React state (so the controlled `selection` prop and
 * `onSelectionChange` work) but is mirrored into the store on commit, letting
 * each cell subscribe to its own `useAssetSelected(id)` slice instead of
 * re-rendering the whole grid. The anchor is tracked by **id**, not index, so
 * shift-ranges survive a re-sort or re-filter between clicks.
 */
export function useAssetSelectionController(
  options: UseAssetSelectionControllerOptions
): AssetSelectionController {
  const { store } = options;
  const [, startTransition] = useTransition();

  const [selectionArr, setSelectionArr] = useControlledState<readonly string[]>(
    {
      value: options.selection,
      defaultValue: options.defaultSelection,
      fallback: [],
    }
  );

  const selectionSet = useMemo(() => new Set(selectionArr), [selectionArr]);

  // Mirror into the store so per-id slices stay in sync. useLayoutEffect runs
  // before paint, so initially-selected items never flash unselected.
  useLayoutEffect(() => {
    store.setSelection(selectionSet);
  }, [store, selectionSet]);

  const anchorRef = useRef<string | null>(null);

  const displayedRef = useLatest(options.displayed);
  const selectionRef = useLatest(selectionSet);
  const setSelArrRef = useLatest(setSelectionArr);
  const onSelectionChangeRef = useLatest(options.onSelectionChange);
  const selectionModeRef = useLatest(options.selectionMode);

  const selectableIds = useCallback(
    (list: readonly AssetItem[]): string[] =>
      list.filter(it => it.selectable !== false).map(it => it.id),
    []
  );

  const commitSelection = useCallback(
    (ids: string[], reason: AssetSelectionReason): void => {
      setSelArrRef.current(ids);
      onSelectionChangeRef.current?.(ids, { reason });
    },
    [setSelArrRef, onSelectionChangeRef]
  );

  /** Resolve the anchor id to its current position in the displayed list. */
  const anchorIndex = useCallback((): number => {
    if (anchorRef.current === null) return -1;
    return displayedRef.current.findIndex(it => it.id === anchorRef.current);
  }, [displayedRef]);

  const handleItemClick = useCallback(
    (item: AssetItem, index: number, event: MouseEvent): void => {
      store.setFocusedId(item.id);
      const mode = selectionModeRef.current;
      if (mode === false || item.selectable === false || item.disabled) return;
      if (mode === 'single') {
        commitSelection([item.id], 'click');
        anchorRef.current = item.id;
        return;
      }
      if (event.shiftKey) {
        const a = anchorIndex();
        if (a !== -1) {
          const [from, to] = indexRange(a, index);
          commitSelection(
            selectableIds(displayedRef.current.slice(from, to + 1)),
            'click'
          );
          return;
        }
      }
      if (event.ctrlKey || event.metaKey) {
        const set = new Set(selectionRef.current);
        if (set.has(item.id)) set.delete(item.id);
        else set.add(item.id);
        commitSelection(Array.from(set), 'click');
        anchorRef.current = item.id;
        return;
      }
      commitSelection([item.id], 'click');
      anchorRef.current = item.id;
    },
    [
      store,
      commitSelection,
      selectableIds,
      anchorIndex,
      displayedRef,
      selectionModeRef,
      selectionRef,
    ]
  );

  const selectByKeyboard = useCallback(
    (index: number, extend: boolean): void => {
      const item = displayedRef.current[index];
      if (!item) return;
      if (extend) {
        const a = anchorIndex();
        if (a !== -1) {
          const [from, to] = indexRange(a, index);
          commitSelection(
            selectableIds(displayedRef.current.slice(from, to + 1)),
            'keyboard'
          );
          return;
        }
      }
      commitSelection(item.selectable === false ? [] : [item.id], 'keyboard');
      anchorRef.current = item.id;
    },
    [commitSelection, selectableIds, anchorIndex, displayedRef]
  );

  const toggleSelectId = useCallback(
    (id: string): void => {
      const set = new Set(selectionRef.current);
      if (set.has(id)) set.delete(id);
      else set.add(id);
      commitSelection(Array.from(set), 'keyboard');
    },
    [commitSelection, selectionRef]
  );

  const setSelectionIds = useCallback(
    (ids: string[], reason: AssetSelectionReason): void => {
      commitSelection(ids, reason);
    },
    [commitSelection]
  );

  const commitMarquee = useCallback(
    (ids: string[], additive: boolean): void => {
      startTransition(() => {
        if (additive) {
          const set = new Set(selectionRef.current);
          ids.forEach(id => set.add(id));
          commitSelection(Array.from(set), 'marquee');
          return;
        }
        commitSelection(ids, 'marquee');
      });
    },
    [commitSelection, selectionRef, startTransition]
  );

  const selectAll = useCallback(() => {
    startTransition(() => {
      commitSelection(selectableIds(displayedRef.current), 'selectAll');
    });
  }, [commitSelection, selectableIds, displayedRef, startTransition]);

  const clearSelection = useCallback(() => {
    commitSelection([], 'clear');
  }, [commitSelection]);

  const contextMenuSelect = useCallback(
    (item: AssetItem): void => {
      store.setFocusedId(item.id);
      if (!selectionRef.current.has(item.id) && item.selectable !== false) {
        commitSelection([item.id], 'contextMenu');
      }
      anchorRef.current = item.id;
    },
    [store, commitSelection, selectionRef]
  );

  const handlers = useMemo<AssetSelectionHandlers>(
    () => ({
      handleItemClick,
      selectByKeyboard,
      toggleSelectId,
      setSelectionIds,
      commitMarquee,
      selectAll,
      clearSelection,
      contextMenuSelect,
    }),
    [
      handleItemClick,
      selectByKeyboard,
      toggleSelectId,
      setSelectionIds,
      commitMarquee,
      selectAll,
      clearSelection,
      contextMenuSelect,
    ]
  );

  return { selectionSet, handlers };
}
