'use client';

import {
  useAssetBrowserContext,
  useAssetSelection,
} from './AssetBrowserContext';

/**
 * The polite-live a11y announcement string ("N items, M selected"). Subscribes
 * to the displayed-items count from the item context and the selection-size
 * slice from the store, so consumers can use it inside a tightly-scoped
 * subcomponent without lifting the value to the root.
 */
export function useAssetBrowserAnnouncement(): string {
  const { displayedItems } = useAssetBrowserContext();
  const selectionSet = useAssetSelection();
  const count = displayedItems.length;
  const selected = selectionSet.size;
  return `${count} item${count === 1 ? '' : 's'}${selected > 0 ? `, ${selected} selected` : ''}`;
}
