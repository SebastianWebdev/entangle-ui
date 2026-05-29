'use client';

import { createContext, useContext } from 'react';

import type React from 'react';

/**
 * Per-node context wired by `NodeGraphNodeView` so `<NodeGraph.Port>` slots
 * rendered inside `renderNode` can identify their owning node and start a
 * connection drag without the consumer threading any IDs through manually.
 */
export interface NodeGraphNodeContextValue {
  /** Owning node id. */
  nodeId: string;
  /**
   * Start a connection drag from the given port. Wired by the parent to
   * the shared `useNodeGraphConnection` controller.
   */
  onPortPointerDown: (
    event: React.PointerEvent<HTMLElement>,
    portId: string
  ) => void;
}

export const NodeGraphNodeContext =
  /*#__PURE__*/ createContext<NodeGraphNodeContextValue | null>(null);

/**
 * Read the active per-node context. Throws when used outside a node body
 * (i.e. outside `renderNode`) — the throw is intentional, since the
 * library guarantees the context is provided when the consumer's
 * `renderNode` is invoked.
 */
export function useNodeGraphNodeContext(): NodeGraphNodeContextValue {
  const ctx = useContext(NodeGraphNodeContext);
  if (!ctx) {
    throw new Error(
      '<NodeGraph.Port> must be rendered inside the renderNode body of a <NodeGraph>'
    );
  }
  return ctx;
}
