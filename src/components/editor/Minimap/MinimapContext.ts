'use client';

import { createContext, useContext } from 'react';
import type { MinimapContextValue } from './Minimap.types';

export const MinimapContext = createContext<MinimapContextValue | null>(null);

/**
 * Access live Minimap state from children rendered inside a `<Minimap>`.
 *
 * @throws when called outside a `<Minimap>` tree.
 */
export function useMinimapContext(): MinimapContextValue {
  const ctx = useContext(MinimapContext);
  if (!ctx) {
    throw new Error(
      'useMinimapContext must be called inside a <Minimap> component'
    );
  }
  return ctx;
}
