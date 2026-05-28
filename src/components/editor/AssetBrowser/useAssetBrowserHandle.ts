'use client';

import { useImperativeHandle, type Ref, type RefObject } from 'react';
import { useLatest } from '@/hooks';
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
 * `scrollToItem` prefers the store-registered grid scroller (works under
 * virtualization) and falls back to a `data-asset-id` DOM query for the list
 * view or when no grid is mounted.
 */
export function useAssetBrowserHandle(
  options: UseAssetBrowserHandleOptions
): void {
  const { ref, rootRef, store, selectAll, clearSelection } = options;

  const itemsRef = useLatest(options.items);
  const displayedRef = useLatest(options.displayed);

  useImperativeHandle(
    ref,
    (): AssetBrowserHandle => ({
      focus: () => rootRef.current?.focus(),
      getElement: () => rootRef.current,
      selectAll,
      clearSelection,
      scrollToItem: (id: string) => {
        store.setFocusedId(id);
        const index = displayedRef.current.findIndex(it => it.id === id);
        if (index >= 0 && store.scrollToIndex(index)) return;
        const el = rootRef.current?.querySelector(
          `[data-asset-id="${cssEscape(id)}"]`
        );
        el?.scrollIntoView({ block: 'nearest' });
      },
      getSelectedItems: () =>
        itemsRef.current.filter(it => store.getSelection().has(it.id)),
    }),
    [ref, rootRef, store, selectAll, clearSelection, itemsRef, displayedRef]
  );
}
