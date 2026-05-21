'use client';

import { createContext, useContext, useSyncExternalStore } from 'react';
import type {
  NodeGraphDataState,
  NodeGraphHoverState,
  NodeGraphInteractionState,
  NodeGraphStore,
} from './NodeGraphStore';
import type { NodeGraphSelection } from './NodeGraph.types';

export const NodeGraphStoreContext =
  /*#__PURE__*/ createContext<NodeGraphStore | null>(null);

function useStoreInternal(): NodeGraphStore {
  const store = useContext(NodeGraphStoreContext);
  if (!store) {
    throw new Error(
      'useNodeGraph* hooks must be called inside a <NodeGraph> component'
    );
  }
  return store;
}

/**
 * Access the underlying `NodeGraphStore` instance — escape hatch for
 * subscribing to custom slice combinations or for imperative reads from
 * non-React code paths (gesture handlers, canvas draw frames).
 */
export function useNodeGraphStore(): NodeGraphStore {
  return useStoreInternal();
}

/**
 * Subscribe to the data slice — re-renders when the graph contents
 * (`nodes`, `edges`, `groups`, default size) change.
 */
export function useNodeGraphData(): NodeGraphDataState {
  const store = useStoreInternal();
  return useSyncExternalStore(store.subscribeData, store.getData);
}

/**
 * Subscribe to the selection slice — re-renders when the selection changes.
 */
export function useNodeGraphSelection(): NodeGraphSelection {
  const store = useStoreInternal();
  return useSyncExternalStore(store.subscribeSelection, store.getSelection);
}

/**
 * Subscribe to the interaction slice — re-renders on gesture lifecycle
 * (drag, connect, marquee) and on per-frame deltas during a drag.
 */
export function useNodeGraphInteraction(): NodeGraphInteractionState {
  const store = useStoreInternal();
  return useSyncExternalStore(store.subscribeInteraction, store.getInteraction);
}

/**
 * Subscribe to the hover slice — re-renders when the hovered node / edge /
 * port changes.
 */
export function useNodeGraphHover(): NodeGraphHoverState {
  const store = useStoreInternal();
  return useSyncExternalStore(store.subscribeHover, store.getHover);
}
