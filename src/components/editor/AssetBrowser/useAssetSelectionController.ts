'use client';

import {
  useEffectEvent,
  useLayoutEffect,
  useMemo,
  useRef,
  useTransition,
  type MouseEvent,
} from 'react';
import { useControlledState } from '@/hooks';
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
 * shift-ranges survive a re-sort or re-filter between clicks. All handlers are
 * `useEffectEvent`s — stable identity, latest closures.
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

  /** Resolve the anchor id to its current position in the displayed list. */
  const anchorIndex = (): number => {
    if (anchorRef.current === null) return -1;
    return displayed.findIndex(it => it.id === anchorRef.current);
  };

  const commitSelection = useEffectEvent(
    (ids: string[], reason: AssetSelectionReason): void => {
      setSelectionArr(ids);
      onSelectionChange?.(ids, { reason });
    }
  );

  const handleItemClick = useEffectEvent(
    (item: AssetItem, index: number, event: MouseEvent): void => {
      store.setFocusedId(item.id);
      if (
        selectionMode === false ||
        item.selectable === false ||
        item.disabled
      ) {
        return;
      }
      if (selectionMode === 'single') {
        commitSelection([item.id], 'click');
        anchorRef.current = item.id;
        return;
      }
      if (event.shiftKey) {
        const a = anchorIndex();
        if (a !== -1) {
          const [from, to] = indexRange(a, index);
          commitSelection(
            selectableIds(displayed.slice(from, to + 1)),
            'click'
          );
          return;
        }
      }
      if (event.ctrlKey || event.metaKey) {
        const next = new Set(selectionSet);
        if (next.has(item.id)) next.delete(item.id);
        else next.add(item.id);
        commitSelection(Array.from(next), 'click');
        anchorRef.current = item.id;
        return;
      }
      commitSelection([item.id], 'click');
      anchorRef.current = item.id;
    }
  );

  const selectByKeyboard = useEffectEvent(
    (index: number, extend: boolean): void => {
      const item = displayed[index];
      if (!item) return;
      if (extend) {
        const a = anchorIndex();
        if (a !== -1) {
          const [from, to] = indexRange(a, index);
          commitSelection(
            selectableIds(displayed.slice(from, to + 1)),
            'keyboard'
          );
          return;
        }
      }
      commitSelection(item.selectable === false ? [] : [item.id], 'keyboard');
      anchorRef.current = item.id;
    }
  );

  const toggleSelectId = useEffectEvent((id: string): void => {
    const next = new Set(selectionSet);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    commitSelection(Array.from(next), 'keyboard');
  });

  const setSelectionIds = useEffectEvent(
    (ids: string[], reason: AssetSelectionReason): void => {
      commitSelection(ids, reason);
    }
  );

  const commitMarquee = useEffectEvent(
    (ids: string[], additive: boolean): void => {
      startTransition(() => {
        if (additive) {
          const next = new Set(selectionSet);
          ids.forEach(id => next.add(id));
          commitSelection(Array.from(next), 'marquee');
          return;
        }
        commitSelection(ids, 'marquee');
      });
    }
  );

  const selectAll = useEffectEvent((): void => {
    startTransition(() => {
      commitSelection(selectableIds(displayed), 'selectAll');
    });
  });

  const clearSelection = useEffectEvent((): void => {
    commitSelection([], 'clear');
  });

  const contextMenuSelect = useEffectEvent((item: AssetItem): void => {
    store.setFocusedId(item.id);
    if (!selectionSet.has(item.id) && item.selectable !== false) {
      commitSelection([item.id], 'contextMenu');
    }
    anchorRef.current = item.id;
  });

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
