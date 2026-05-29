import { NODE_GRAPH_SLOT } from './NodeGraph.types';

import type {
  NodeGraphBackgroundSlotProps,
  NodeGraphMinimapSlotProps,
  NodeGraphSlotMarker,
  NodeGraphSpawnPaletteSlotProps,
  NodeGraphToolbarSlotProps,
} from './NodeGraph.types';

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

/**
 * Marker behind `<NodeGraph.Toolbar>` — picked up from `<NodeGraph>` children
 * and mounted into the viewport overlay layer at the requested
 * placement. Children render via `<NodeGraphToolbarInner>` which keeps
 * the toolbar positioned over the graph.
 */
const NodeGraphToolbarImpl: (props: NodeGraphToolbarSlotProps) => null = () =>
  null;

export const NodeGraphToolbar = Object.assign(NodeGraphToolbarImpl, {
  displayName: 'NodeGraph.Toolbar',
  [NODE_GRAPH_SLOT]: 'toolbar' as const,
}) as unknown as ((props: NodeGraphToolbarSlotProps) => null) &
  NodeGraphSlotMarker & { displayName: string };

/**
 * Marker behind `<NodeGraph.SpawnPalette>` — picked up by the parent
 * and mounted as a portal-rendered fuzzy-search palette. Auto-opens on
 * right-click of empty / group targets via the store's spawn-request
 * channel.
 */
const NodeGraphSpawnPaletteImpl: (
  props: NodeGraphSpawnPaletteSlotProps
) => null = () => null;

export const NodeGraphSpawnPalette = Object.assign(NodeGraphSpawnPaletteImpl, {
  displayName: 'NodeGraph.SpawnPalette',
  [NODE_GRAPH_SLOT]: 'spawn-palette' as const,
}) as unknown as ((props: NodeGraphSpawnPaletteSlotProps) => null) &
  NodeGraphSlotMarker & { displayName: string };
