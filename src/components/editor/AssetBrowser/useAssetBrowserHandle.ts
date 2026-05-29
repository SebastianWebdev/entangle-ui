'use client';

import { useCallback, useImperativeHandle } from 'react';

import { useLatest } from '@/hooks';

import type { AssetBrowserHandle, AssetItem } from './AssetBrowser.types';
import type { AssetBrowserStore } from './AssetBrowserStore';
import type { Ref, RefObject } from 'react';

function cssEscape(value: string): string {
  if (typeof CSS !== 'undefined' && typeof CSS.escape === 'function') {
    return CSS.escape(value);
  }
  return value.replace(/["\\]/g, '\\$&');
}

export interface UseAssetBrowserHandleOptions {
  ref: Ref<AssetBrowserHandle> | undefined;
  rootRef: RefObject<HTMLDivElement | null>;
  store: AssetBrowserStore;
  /** Latest `items` — read by `getSelectedItems`. */
  items: readonly AssetItem[];
  /** Latest displayed (filtered + sorted) list — used to resolve scroll targets. */
  displayed: readonly AssetItem[];
  selectAll: () => void;
  clearSelection: () => void;
}

/**
 * Wires the imperative `AssetBrowserHandle` onto the consumer-provided ref.
 * Each handle method has a stable identity (`useCallback`) and reads the latest
 * props through `useLatest` refs, so the handle object is built once and its
 * methods always see the latest props. `scrollToItem` prefers the
 * store-registered grid scroller (works under virtualization) and falls back
 * to a `data-asset-id` DOM query for the list view or when no grid is mounted.
 */
export function useAssetBrowserHandle(
  options: UseAssetBrowserHandleOptions
): void {
  const { ref, rootRef, store, items, displayed, selectAll, clearSelection } =
    options;

  const itemsRef = useLatest(items);
  const displayedRef = useLatest(displayed);

  const focus = useCallback((): void => {
    rootRef.current?.focus();
  }, [rootRef]);

  const getElement = useCallback(
    (): HTMLDivElement | null => rootRef.current,
    [rootRef]
  );

  const scrollToItem = useCallback(
    (id: string): void => {
      store.setFocusedId(id);
      const index = displayedRef.current.findIndex(it => it.id === id);
      if (index >= 0 && store.scrollToIndex(index)) return;
      const el = rootRef.current?.querySelector(
        `[data-asset-id="${cssEscape(id)}"]`
      );
      el?.scrollIntoView({ block: 'nearest' });
    },
    [store, rootRef, displayedRef]
  );

  const getSelectedItems = useCallback(
    (): AssetItem[] =>
      itemsRef.current.filter(it => store.getSelection().has(it.id)),
    [store, itemsRef]
  );

  useImperativeHandle(
    ref,
    (): AssetBrowserHandle => ({
      focus,
      getElement,
      selectAll,
      clearSelection,
      scrollToItem,
      getSelectedItems,
    }),
    [
      focus,
      getElement,
      selectAll,
      clearSelection,
      scrollToItem,
      getSelectedItems,
    ]
  );
}
