'use client';

import { createContext, useContext } from 'react';

/**
 * Context published by `<NodeGraph.NodeSection>` so the `<NodeGraph.Port>`
 * slots rendered inside it know whether they're currently collapsed. The
 * section never unmounts its children (a collapse is purely visual), so a
 * collapsed port stays in the React tree but unregisters its measured
 * position — which hides its edges until the section is expanded again,
 * without any remount cost or re-anchor bookkeeping.
 */
export interface NodeGraphNodeSectionContextValue {
  collapsed: boolean;
}

const DEFAULT: NodeGraphNodeSectionContextValue = { collapsed: false };

export const NodeGraphNodeSectionContext =
  /*#__PURE__*/ createContext<NodeGraphNodeSectionContextValue>(DEFAULT);

/**
 * Read the enclosing section's collapsed state. Returns `{ collapsed: false }`
 * when the port isn't inside a `<NodeGraph.NodeSection>`, so ports outside a
 * section behave exactly as before.
 */
export function useNodeGraphNodeSection(): NodeGraphNodeSectionContextValue {
  return useContext(NodeGraphNodeSectionContext);
}
