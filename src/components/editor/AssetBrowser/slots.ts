import type React from 'react';

/**
 * Symbol marker identifying an AssetBrowser compound slot. Survives
 * `React.memo`, function wrapping, and minification — unlike `displayName`.
 */
export const ASSET_BROWSER_SLOT: unique symbol = Symbol.for(
  'etui.assetBrowser.slot'
);

export type AssetBrowserSlotKind = 'toolbar' | 'sidebar';

interface SlotMarker {
  [ASSET_BROWSER_SLOT]: AssetBrowserSlotKind;
}

/** Tags a component function with its slot kind. */
export function markSlot<T>(component: T, kind: AssetBrowserSlotKind): T {
  (component as unknown as SlotMarker)[ASSET_BROWSER_SLOT] = kind;
  return component;
}

/** Reads the slot kind off a React element's component type, or `null`. */
export function getSlotKind(
  el: React.ReactElement
): AssetBrowserSlotKind | null {
  const type = el.type as Partial<SlotMarker> | null | undefined;
  return type?.[ASSET_BROWSER_SLOT] ?? null;
}
