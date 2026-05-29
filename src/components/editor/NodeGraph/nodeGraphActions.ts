import { generateNodeId } from './nodeGraphIds';

import type {
  NodeGraphEdge,
  NodeGraphNode,
  NodeGraphPortRef,
} from './NodeGraph.types';
import type { Point2D } from '@/components/primitives/canvas/canvas.types';

/**
 * Ids of every edge with an endpoint on the given port — i.e. all wires
 * connected to one socket. Use it to "detach all" or select a socket's wires
 * without maintaining a parallel index.
 */
export function edgesConnectedToPort(
  edges: ReadonlyArray<NodeGraphEdge>,
  ref: NodeGraphPortRef
): string[] {
  const ids: string[] = [];
  for (const edge of edges) {
    if (
      (edge.source.node === ref.node && edge.source.port === ref.port) ||
      (edge.target.node === ref.node && edge.target.port === ref.port)
    ) {
      ids.push(edge.id);
    }
  }
  return ids;
}

export interface DuplicateNodesOptions {
  /**
   * World-unit offset applied to each clone so it doesn't sit exactly on
   * top of its source. @default { x: 32, y: 32 }
   */
  offset?: Point2D;
  /**
   * Build the id for a clone from its source id. Defaults to a unique id
   * derived from `${sourceId}-copy`. Override to keep your own id scheme.
   */
  idFactory?: (sourceId: string) => string;
}

/**
 * Clone the nodes whose ids are listed in `ids`, offsetting each copy.
 * Pure — returns only the new node objects (not merged into the source
 * list), so callers stay in control of ordering and selection:
 *
 * ```ts
 * const copies = duplicateNodes(nodes, selection.nodes);
 * setNodes(prev => [...prev, ...copies]);
 * setSelection({ nodes: copies.map(n => n.id), edges: [], groups: [] });
 * ```
 *
 * Edges between duplicated nodes are intentionally not copied — wire that
 * in at the call site if your editor needs it.
 */
export function duplicateNodes(
  nodes: ReadonlyArray<NodeGraphNode>,
  ids: ReadonlyArray<string>,
  options?: DuplicateNodesOptions
): NodeGraphNode[] {
  const offset = options?.offset ?? { x: 32, y: 32 };
  const makeId = options?.idFactory ?? (sid => generateNodeId(`${sid}-copy`));
  const wanted = new Set(ids);
  const copies: NodeGraphNode[] = [];
  for (const node of nodes) {
    if (!wanted.has(node.id)) continue;
    copies.push({
      ...node,
      id: makeId(node.id),
      position: {
        x: node.position.x + offset.x,
        y: node.position.y + offset.y,
      },
    });
  }
  return copies;
}
