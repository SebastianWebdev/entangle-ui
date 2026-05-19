'use client';

import { createContext, useContext } from 'react';
import type { ViewportContextValue } from './Viewport.types';

export const ViewportContext =
  /*#__PURE__*/ createContext<ViewportContextValue | null>(null);

export interface LayerSubscriptionContextValue {
  /**
   * Subscribe a layer's redraw trigger to the viewport's invalidation bus.
   * Returns an unsubscribe function.
   */
  subscribeLayer: (name: string, cb: () => void) => () => void;
}

export const LayerSubscriptionContext =
  /*#__PURE__*/ createContext<LayerSubscriptionContextValue | null>(null);

/**
 * Read viewport state from inside `<Viewport>` children.
 *
 * Returns the current `transform`, `size`, imperative `handle`, and
 * `isPanning` flag. Use this in custom Overlay components (e.g., a minimap)
 * that need to react to transform or size changes.
 *
 * @throws If called outside a `<Viewport>` subtree.
 *
 * @example
 * ```tsx
 * function Minimap() {
 *   const { transform, size, handle } = useViewportContext();
 *   // ...
 * }
 * ```
 */
export function useViewportContext(): ViewportContextValue {
  const ctx = useContext(ViewportContext);
  if (!ctx) {
    throw new Error(
      'useViewportContext must be used inside a <Viewport> subtree.'
    );
  }
  return ctx;
}
