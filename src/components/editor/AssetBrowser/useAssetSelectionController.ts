'use client';

import {
  useCallback,
  useLayoutEffect,
  useMemo,
  useRef,
  useTransition,
} from 'react';

import { useControlledState, useLatest } from '@/hooks';

import { indexRange } from './assetBrowserKeyboard';

import type { AssetItem, AssetSelectionReason } from './AssetBrowser.types';
import type { AssetBrowserStore } from './AssetBrowserStore';
import type { MouseEvent } from 'react';

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

function selectableIds(list: readonly AssetItem[]): string[] {
  return list.filter(it => it.selectable !== false).map(it => it.id);
}

/**
 * Owns selection state and the click/keyboard/marquee gestures that mutate it.
 *
 * Selection stays in React state (so the controlled `selection` prop and
 * `onSelectionChange` work) but is mirrored into the store on commit, letting
 * each cell subscribe to its own `useAssetSelected(id)` slice instead of
 * re-rendering the whole grid. The anchor is tracked by **id**, not index, so
 * shift-ranges survive a re-sort or re-filter between clicks. All handlers have
 * stable identities (`useCallback`) and read the latest props/state through
 * `useLatest` refs, matching `component-patterns.md` rules #3/#11.
 */
export function useAssetSelectionController(
  options: UseAssetSelectionControllerOptions
): AssetSelectionController {
  const { store, displayed, selectionMode, onSelectionChange } = options;
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

  // Live props/state read inside the stable handlers below.
  const displayedRef = useLatest(displayed);
  const selectionModeRef = useLatest(selectionMode);
  const selectionSetRef = useLatest(selectionSet);
  const onSelectionChangeRef = useLatest(onSelectionChange);

  /** Resolve the anchor id to its current position in the displayed list. */
  const anchorIndex = useCallback((): number => {
    if (anchorRef.current === null) return -1;
    return displayedRef.current.findIndex(it => it.id === anchorRef.current);
  }, [displayedRef]);

  const commitSelection = useCallback(
    (ids: string[], reason: AssetSelectionReason): void => {
      setSelectionArr(ids);
      onSelectionChangeRef.current?.(ids, { reason });
    },
    [setSelectionArr, onSelectionChangeRef]
  );

  const handleItemClick = useCallback(
    (item: AssetItem, index: number, event: MouseEvent): void => {
      store.setFocusedId(item.id);
      if (
        selectionModeRef.current === false ||
        item.selectable === false ||
        item.disabled
      ) {
        return;
      }
      if (selectionModeRef.current === 'single') {
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
        const next = new Set(selectionSetRef.current);
        if (next.has(item.id)) next.delete(item.id);
        else next.add(item.id);
        commitSelection(Array.from(next), 'click');
        anchorRef.current = item.id;
        return;
      }
      commitSelection([item.id], 'click');
      anchorRef.current = item.id;
    },
    [
      store,
      commitSelection,
      anchorIndex,
      selectionModeRef,
      displayedRef,
      selectionSetRef,
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
    [commitSelection, anchorIndex, displayedRef]
  );

  const toggleSelectId = useCallback(
    (id: string): void => {
      const next = new Set(selectionSetRef.current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      commitSelection(Array.from(next), 'keyboard');
    },
    [commitSelection, selectionSetRef]
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
          const next = new Set(selectionSetRef.current);
          ids.forEach(id => next.add(id));
          commitSelection(Array.from(next), 'marquee');
          return;
        }
        commitSelection(ids, 'marquee');
      });
    },
    [commitSelection, selectionSetRef]
  );

  const selectAll = useCallback((): void => {
    startTransition(() => {
      commitSelection(selectableIds(displayedRef.current), 'selectAll');
    });
  }, [commitSelection, displayedRef]);

  const clearSelection = useCallback((): void => {
    commitSelection([], 'clear');
  }, [commitSelection]);

  const contextMenuSelect = useCallback(
    (item: AssetItem): void => {
      store.setFocusedId(item.id);
      if (!selectionSetRef.current.has(item.id) && item.selectable !== false) {
        commitSelection([item.id], 'contextMenu');
      }
      anchorRef.current = item.id;
    },
    [store, commitSelection, selectionSetRef]
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
