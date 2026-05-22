import type {
  NodeGraphBackgroundSlotProps,
  NodeGraphMinimapSlotProps,
  NodeGraphSlotMarker,
} from './NodeGraph.types';
import { NODE_GRAPH_SLOT } from './NodeGraph.types';

/**
 * Marker behind `<NodeGraph.Minimap>` — returns `null` and carries a Symbol
 * the parent uses to identify it inside `children`. The actual minimap is
 * mounted by `NodeGraph` itself as `<NodeGraphMinimapInner>`.
 *
 * Pure marker, no hooks — kept out of any `'use client'` boundary so RSC
 * frameworks can keep the type-level slot identity on the server.
 */
const NodeGraphMinimapImpl: (props: NodeGraphMinimapSlotProps) => null = () =>
  null;

export const NodeGraphMinimap = Object.assign(NodeGraphMinimapImpl, {
  displayName: 'NodeGraph.Minimap',
  [NODE_GRAPH_SLOT]: 'minimap' as const,
}) as unknown as ((props: NodeGraphMinimapSlotProps) => null) &
  NodeGraphSlotMarker & { displayName: string };

/**
 * Marker behind `<NodeGraph.Background>` — see {@link NodeGraphMinimap} for
 * the rationale. The parent picks this up and mounts the background canvas
 * layer in the correct position in the layer stack.
 */
const NodeGraphBackgroundImpl: (
  props: NodeGraphBackgroundSlotProps
) => null = () => null;

export const NodeGraphBackground = Object.assign(NodeGraphBackgroundImpl, {
  displayName: 'NodeGraph.Background',
  [NODE_GRAPH_SLOT]: 'background' as const,
}) as unknown as ((props: NodeGraphBackgroundSlotProps) => null) &
  NodeGraphSlotMarker & { displayName: string };
