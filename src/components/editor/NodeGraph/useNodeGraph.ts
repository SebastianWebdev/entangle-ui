'use client';

import {
  useCallback,
  useMemo,
  useState,
  type Dispatch,
  type SetStateAction,
} from 'react';
import { useLatest } from '@/hooks';
import type { WorldRect } from '@/components/primitives/viewport';
import type {
  NodeGraphEdge,
  NodeGraphGroup,
  NodeGraphNode,
  NodeGraphPortRef,
  NodeGraphSelection,
} from './NodeGraph.types';
import { applyCascadeDelete } from './nodeGraphMath';
import {
  duplicateNodes as duplicateNodesImpl,
  edgesConnectedToPort,
} from './nodeGraphActions';
import type { DuplicateNodesOptions } from './nodeGraphActions';
import { generateEdgeId, generateNodeId } from './nodeGraphIds';

const EMPTY_SELECTION: NodeGraphSelection = {
  nodes: [],
  edges: [],
  groups: [],
};

/** A node accepted by `addNode` — the `id` is generated when omitted. */
export type NodeGraphNodeInput = Omit<NodeGraphNode, 'id'> & { id?: string };

export interface UseNodeGraphOptions {
  /** Initial nodes. @default [] */
  nodes?: NodeGraphNode[];
  /** Initial edges. @default [] */
  edges?: NodeGraphEdge[];
  /** Initial groups. @default [] */
  groups?: NodeGraphGroup[];
  /** Initial selection. @default { nodes: [], edges: [], groups: [] } */
  selection?: NodeGraphSelection;
}

export interface AddGroupOptions {
  /** Group id. Generated when omitted. */
  id?: string;
  label?: string;
  color?: string;
}

/** The four controlled props + change handlers, ready to spread. */
export interface NodeGraphBind {
  nodes: NodeGraphNode[];
  edges: NodeGraphEdge[];
  groups: NodeGraphGroup[];
  selection: NodeGraphSelection;
  onNodesChange: (nodes: NodeGraphNode[]) => void;
  onEdgesChange: (edges: NodeGraphEdge[]) => void;
  onGroupsChange: (groups: NodeGraphGroup[]) => void;
  onSelectionChange: (selection: NodeGraphSelection) => void;
}

export interface UseNodeGraphReturn {
  nodes: NodeGraphNode[];
  edges: NodeGraphEdge[];
  groups: NodeGraphGroup[];
  selection: NodeGraphSelection;

  setNodes: Dispatch<SetStateAction<NodeGraphNode[]>>;
  setEdges: Dispatch<SetStateAction<NodeGraphEdge[]>>;
  setGroups: Dispatch<SetStateAction<NodeGraphGroup[]>>;
  setSelection: Dispatch<SetStateAction<NodeGraphSelection>>;

  /** Append a node (generating an id when omitted). Returns the node id. */
  addNode: (node: NodeGraphNodeInput) => string;
  /**
   * Cascade-delete the given nodes — removes them, drops any edge touching
   * them, and prunes them from the selection.
   */
  removeNodes: (ids: ReadonlyArray<string>) => void;
  /** Remove the given edges and prune them from the selection. */
  removeEdges: (ids: ReadonlyArray<string>) => void;
  /** Remove every edge connected to a port — "detach all" for one socket. */
  disconnectPort: (node: string, port: string) => void;
  /**
   * Cascade-delete the current selection (nodes + edges + groups) and clear
   * it — the programmatic equivalent of pressing Delete.
   */
  removeSelection: () => void;
  /**
   * Clone nodes (defaults to the current selection), append the copies, and
   * select them. Returns the new node ids.
   */
  duplicateNodes: (
    ids?: ReadonlyArray<string>,
    options?: DuplicateNodesOptions
  ) => string[];
  /**
   * Add an edge between two ports, de-duplicating identical endpoints.
   * Returns the new (or existing) edge id.
   */
  connect: (
    source: NodeGraphPortRef,
    target: NodeGraphPortRef,
    data?: unknown
  ) => string;
  /** Append a group. Returns the group id. */
  addGroup: (bounds: WorldRect, options?: AddGroupOptions) => string;
  /** Remove the given groups and prune them from the selection. */
  removeGroups: (ids: ReadonlyArray<string>) => void;
  /** Clear the selection. */
  clearSelection: () => void;

  /** Spread onto `<NodeGraph {...bind} />` to wire all four controlled props. */
  bind: NodeGraphBind;
}

/**
 * Own a node graph's state (nodes / edges / groups / selection) plus the
 * mutations every editor re-implements — add / remove (with edge cascade) /
 * duplicate / connect / group. Spread `bind` onto `<NodeGraph>` and call the
 * actions from your toolbar / context menu:
 *
 * ```tsx
 * const graph = useNodeGraph({ nodes: initialNodes, edges: initialEdges });
 * return (
 *   <NodeGraph {...graph.bind} renderNode={renderNode}>
 *     <NodeGraph.Background />
 *   </NodeGraph>
 * );
 * // graph.addNode(...), graph.removeSelection(), graph.duplicateNodes(), ...
 * ```
 *
 * Uncontrolled by design — the hook owns the state. For controlled state
 * (Redux / Zustand / external store) wire the four `onChange` props yourself.
 */
export function useNodeGraph(
  options?: UseNodeGraphOptions
): UseNodeGraphReturn {
  const [nodes, setNodes] = useState<NodeGraphNode[]>(
    () => options?.nodes ?? []
  );
  const [edges, setEdges] = useState<NodeGraphEdge[]>(
    () => options?.edges ?? []
  );
  const [groups, setGroups] = useState<NodeGraphGroup[]>(
    () => options?.groups ?? []
  );
  const [selection, setSelection] = useState<NodeGraphSelection>(
    () => options?.selection ?? EMPTY_SELECTION
  );

  // Snapshot refs so multi-slice actions read a consistent view without
  // re-creating the callbacks on every state change.
  const nodesRef = useLatest(nodes);
  const edgesRef = useLatest(edges);
  const groupsRef = useLatest(groups);
  const selectionRef = useLatest(selection);

  const addNode = useCallback((node: NodeGraphNodeInput): string => {
    const id = node.id ?? generateNodeId('node');
    const next: NodeGraphNode = { ...node, id };
    setNodes(prev => [...prev, next]);
    return id;
  }, []);

  const removeNodes = useCallback(
    (ids: ReadonlyArray<string>): void => {
      if (ids.length === 0) return;
      const removed = new Set(ids);
      const result = applyCascadeDelete(
        {
          nodes: nodesRef.current,
          edges: edgesRef.current,
          groups: groupsRef.current,
        },
        { nodes: ids, edges: [], groups: [] }
      );
      setNodes(result.nodes as NodeGraphNode[]);
      setEdges(result.edges as NodeGraphEdge[]);
      const sel = selectionRef.current;
      const keptEdgeIds = new Set(
        (result.edges as NodeGraphEdge[]).map(e => e.id)
      );
      const dropsNode = sel.nodes.some(nodeId => removed.has(nodeId));
      const dropsEdge = sel.edges.some(edgeId => !keptEdgeIds.has(edgeId));
      if (dropsNode || dropsEdge) {
        setSelection({
          nodes: sel.nodes.filter(nodeId => !removed.has(nodeId)),
          edges: sel.edges.filter(edgeId => keptEdgeIds.has(edgeId)),
          groups: sel.groups,
        });
      }
    },
    [nodesRef, edgesRef, groupsRef, selectionRef]
  );

  const removeEdges = useCallback(
    (ids: ReadonlyArray<string>): void => {
      if (ids.length === 0) return;
      const removed = new Set(ids);
      setEdges(prev => prev.filter(e => !removed.has(e.id)));
      const sel = selectionRef.current;
      if (sel.edges.some(edgeId => removed.has(edgeId))) {
        setSelection({
          nodes: sel.nodes,
          edges: sel.edges.filter(edgeId => !removed.has(edgeId)),
          groups: sel.groups,
        });
      }
    },
    [selectionRef]
  );

  const disconnectPort = useCallback(
    (node: string, port: string): void => {
      removeEdges(edgesConnectedToPort(edgesRef.current, { node, port }));
    },
    [edgesRef, removeEdges]
  );

  const removeSelection = useCallback((): void => {
    const sel = selectionRef.current;
    if (
      sel.nodes.length === 0 &&
      sel.edges.length === 0 &&
      sel.groups.length === 0
    ) {
      return;
    }
    const result = applyCascadeDelete(
      {
        nodes: nodesRef.current,
        edges: edgesRef.current,
        groups: groupsRef.current,
      },
      sel
    );
    setNodes(result.nodes as NodeGraphNode[]);
    setEdges(result.edges as NodeGraphEdge[]);
    setGroups(result.groups as NodeGraphGroup[]);
    setSelection(EMPTY_SELECTION);
  }, [nodesRef, edgesRef, groupsRef, selectionRef]);

  const duplicateNodes = useCallback(
    (
      ids?: ReadonlyArray<string>,
      duplicateOptions?: DuplicateNodesOptions
    ): string[] => {
      const targetIds = ids ?? selectionRef.current.nodes;
      const copies = duplicateNodesImpl(
        nodesRef.current,
        targetIds,
        duplicateOptions
      );
      if (copies.length === 0) return [];
      setNodes(prev => [...prev, ...copies]);
      const newIds = copies.map(n => n.id);
      setSelection({ nodes: newIds, edges: [], groups: [] });
      return newIds;
    },
    [nodesRef, selectionRef]
  );

  const connect = useCallback(
    (
      source: NodeGraphPortRef,
      target: NodeGraphPortRef,
      data?: unknown
    ): string => {
      const existing = edgesRef.current.find(
        e =>
          e.source.node === source.node &&
          e.source.port === source.port &&
          e.target.node === target.node &&
          e.target.port === target.port
      );
      if (existing) return existing.id;
      const id = generateEdgeId(source, target);
      const edge: NodeGraphEdge = {
        id,
        source,
        target,
        ...(data !== undefined ? { data } : {}),
      };
      setEdges(prev => [...prev, edge]);
      return id;
    },
    [edgesRef]
  );

  const addGroup = useCallback(
    (bounds: WorldRect, groupOptions?: AddGroupOptions): string => {
      const id = groupOptions?.id ?? generateNodeId('group');
      const group: NodeGraphGroup = {
        id,
        bounds,
        ...(groupOptions?.label !== undefined
          ? { label: groupOptions.label }
          : {}),
        ...(groupOptions?.color !== undefined
          ? { color: groupOptions.color }
          : {}),
      };
      setGroups(prev => [...prev, group]);
      return id;
    },
    []
  );

  const removeGroups = useCallback(
    (ids: ReadonlyArray<string>): void => {
      if (ids.length === 0) return;
      const removed = new Set(ids);
      setGroups(prev => prev.filter(g => !removed.has(g.id)));
      const sel = selectionRef.current;
      if (sel.groups.some(groupId => removed.has(groupId))) {
        setSelection({
          nodes: sel.nodes,
          edges: sel.edges,
          groups: sel.groups.filter(groupId => !removed.has(groupId)),
        });
      }
    },
    [selectionRef]
  );

  const clearSelection = useCallback((): void => {
    setSelection(EMPTY_SELECTION);
  }, []);

  const bind = useMemo<NodeGraphBind>(
    () => ({
      nodes,
      edges,
      groups,
      selection,
      onNodesChange: setNodes,
      onEdgesChange: setEdges,
      onGroupsChange: setGroups,
      onSelectionChange: setSelection,
    }),
    [nodes, edges, groups, selection]
  );

  return {
    nodes,
    edges,
    groups,
    selection,
    setNodes,
    setEdges,
    setGroups,
    setSelection,
    addNode,
    removeNodes,
    removeEdges,
    disconnectPort,
    removeSelection,
    duplicateNodes,
    connect,
    addGroup,
    removeGroups,
    clearSelection,
    bind,
  };
}
