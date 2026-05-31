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
  const { displayedItems, labels } = useAssetBrowserContext();
  const selectionSet = useAssetSelection();
  const count = displayedItems.length;
  const selected = selectionSet.size;
  return `${labels.itemCount(count)}${selected > 0 ? labels.selectedCount(selected) : ''}`;
}
