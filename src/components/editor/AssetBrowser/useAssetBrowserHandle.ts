'use client';

import {
  useEffectEvent,
  useImperativeHandle,
  type Ref,
  type RefObject,
} from 'react';
import type { AssetBrowserHandle, AssetItem } from './AssetBrowser.types';
import type { AssetBrowserStore } from './AssetBrowserStore';

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
 * Each handle method is a `useEffectEvent`, so the handle object is built once
 * and its methods always see the latest props. `scrollToItem` prefers the
 * store-registered grid scroller (works under virtualization) and falls back
 * to a `data-asset-id` DOM query for the list view or when no grid is mounted.
 */
export function useAssetBrowserHandle(
  options: UseAssetBrowserHandleOptions
): void {
  const { ref, rootRef, store, items, displayed, selectAll, clearSelection } =
    options;

  const focus = useEffectEvent((): void => {
    rootRef.current?.focus();
  });

  const getElement = useEffectEvent((): HTMLDivElement | null => {
    return rootRef.current;
  });

  const scrollToItem = useEffectEvent((id: string): void => {
    store.setFocusedId(id);
    const index = displayed.findIndex(it => it.id === id);
    if (index >= 0 && store.scrollToIndex(index)) return;
    const el = rootRef.current?.querySelector(
      `[data-asset-id="${cssEscape(id)}"]`
    );
    el?.scrollIntoView({ block: 'nearest' });
  });

  const getSelectedItems = useEffectEvent((): AssetItem[] => {
    return items.filter(it => store.getSelection().has(it.id));
  });

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
