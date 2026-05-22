'use client';

import React, {
  useCallback,
  useImperativeHandle,
  useLayoutEffect,
  useMemo,
  useRef,
  useSyncExternalStore,
  useTransition,
} from 'react';
import { useControlledState, useLatest } from '@/hooks';
import { devWarn } from '@/utils/devWarn';
import {
  Viewport,
  ViewportLayer,
  ViewportWorld,
  ViewportOverlay,
  screenToWorld as worldFromScreen,
  worldToScreen as screenFromWorld,
} from '@/components/primitives/viewport';
import type {
  ViewportHandle,
  ViewportSelectionEvent,
  ViewportTransform,
  WorldRect,
} from '@/components/primitives/viewport';
import { cx } from '@/utils/cx';
import type { Point2D } from '@/components/primitives/canvas/canvas.types';
import type {
  NodeGraphContextMenuInfo,
  NodeGraphEdge,
  NodeGraphGroup,
  NodeGraphHandle,
  NodeGraphLayerName,
  NodeGraphNode,
  NodeGraphPortRef,
  NodeGraphProps,
  NodeGraphSelection,
  NodeGraphSlotKind,
  NodeGraphSlotMarker,
  NodeGraphTarget,
} from './NodeGraph.types';
import { NODE_GRAPH_SLOT } from './NodeGraph.types';
import {
  NodeGraphStore,
  type NodeGraphGroupResizeHandle,
} from './NodeGraphStore';
import { NodeGraphStoreContext, useNodeGraphStore } from './NodeGraphContext';
import { NodeGraphNodeView } from './NodeGraphNode';
import { NodeGraphGroupView } from './NodeGraphGroup';
import { NodeGraphMinimapInner } from './NodeGraphMinimap';
import { NodeGraphBackground, NodeGraphMinimap } from './NodeGraphSlots';
import {
  buildDrawTheme,
  drawBackground,
  drawConnectionPreview,
  drawEdges,
  drawGroups,
} from './nodeGraphDrawing';
import {
  applyGroupResize,
  computeNodesBounds,
  getNodeBox,
  isPointInNode,
  isPointInRect,
  rectsIntersect,
  resolvePortRef,
  snapDelta,
} from './nodeGraphMath';
import { useNodeGraphConnection } from './useNodeGraphConnection';
import { useNodeGraphKeyboard } from './useNodeGraphKeyboard';
import { nodeGraphRootStyle } from './NodeGraph.css';

const EMPTY_NODES: NodeGraphNode[] = [];
const EMPTY_EDGES: NodeGraphEdge[] = [];
const EMPTY_GROUPS: NodeGraphGroup[] = [];
const EMPTY_SELECTION: NodeGraphSelection = {
  nodes: [],
  edges: [],
  groups: [],
};
const DEFAULT_NODE_SIZE = { width: 180, height: 80 };
const DRAG_START_THRESHOLD_PX = 3;

// ─── Slot helpers ───

type NodeGraphBackgroundProps = React.ComponentProps<
  typeof NodeGraphBackground
>;
type NodeGraphMinimapProps = React.ComponentProps<typeof NodeGraphMinimap>;

interface SortedSlots {
  hasBackground: boolean;
  backgroundProps: NodeGraphBackgroundProps | null;
  hasMinimap: boolean;
  minimapProps: NodeGraphMinimapProps | null;
}

function getSlotKind(el: React.ReactElement): NodeGraphSlotKind | null {
  if (typeof el.type !== 'function' && typeof el.type !== 'object') {
    return null;
  }
  const marker = (el.type as Partial<NodeGraphSlotMarker>)[NODE_GRAPH_SLOT];
  return marker ?? null;
}

function readSlotProps<P>(el: React.ReactElement): P {
  return el.props as P;
}

function sortSlots(children: React.ReactNode): SortedSlots {
  let backgroundProps: NodeGraphBackgroundProps | null = null;
  let minimapProps: NodeGraphMinimapProps | null = null;
  React.Children.forEach(children, child => {
    if (!React.isValidElement(child)) {
      if (child != null && child !== false) {
        devWarn(
          '[NodeGraph] children must be <NodeGraph.Minimap /> or <NodeGraph.Background />.'
        );
      }
      return;
    }
    const kind = getSlotKind(child);
    if (kind === 'background') {
      backgroundProps = readSlotProps<NodeGraphBackgroundProps>(child);
    } else if (kind === 'minimap') {
      minimapProps = readSlotProps<NodeGraphMinimapProps>(child);
    } else {
      const dn = (child.type as { displayName?: string } | undefined)
        ?.displayName;
      if (dn?.startsWith('NodeGraph.')) {
        devWarn(
          `[NodeGraph] child "${dn}" looks like a slot subcomponent but lacks the ` +
            'NODE_GRAPH_SLOT marker. If you wrapped it in React.memo or HOCs, copy the ' +
            'marker symbol over to the wrapper.'
        );
      }
    }
  });
  return {
    hasBackground: backgroundProps !== null,
    backgroundProps,
    hasMinimap: minimapProps !== null,
    minimapProps,
  };
}

// ─── Main component ───

/**
 * `NodeGraph` — interactive, data-driven node editor surface built on
 * `Viewport`. Renders nodes as HTML in world space (`renderNode`) and
 * edges as Béziers on a perf-isolated canvas layer.
 *
 * The component is fully controlled-or-uncontrolled across four data
 * dimensions (nodes / edges / groups / selection) — each emits a full
 * array on change. Connection drags, marquee selection, drag-to-move,
 * snap-to-grid, and keyboard nav are all wired in.
 *
 * @example
 * ```tsx
 * <NodeGraph
 *   nodes={nodes}
 *   edges={edges}
 *   onNodesChange={setNodes}
 *   onEdgesChange={setEdges}
 *   renderNode={node => <MyNode data={node.data} />}
 *   isValidConnection={(src, tgt) => src.node !== tgt.node}
 *   responsive
 * >
 *   <NodeGraph.Background variant="dots" gap={24} />
 *   <NodeGraph.Minimap placement="bottom-right" />
 * </NodeGraph>
 * ```
 */
const NodeGraphImpl = ({
  nodes: nodesProp,
  defaultNodes,
  onNodesChange,
  edges: edgesProp,
  defaultEdges,
  onEdgesChange,
  groups: groupsProp,
  defaultGroups,
  onGroupsChange,
  selection: selectionProp,
  defaultSelection,
  onSelectionChange,
  renderNode,
  renderPort,
  renderEdgeLabel,
  isValidConnection,
  snapToGrid = false,
  onConnectStart,
  onConnectEnd,
  onContextMenu,
  onDelete,
  onActivate,
  pan,
  zoom,
  minZoom = 0.1,
  maxZoom = 4,
  selectionRect = true,
  responsive = false,
  height = 480,
  defaultNodeSize: defaultNodeSizeProp = DEFAULT_NODE_SIZE,
  disabled = false,
  ariaLabel = 'Node graph',
  className,
  style,
  testId,
  id,
  children,
  ref,
}: NodeGraphProps): React.ReactElement => {
  // ── Refs ──
  const rootRef = useRef<HTMLDivElement>(null);
  const viewportHandleRef = useRef<ViewportHandle>(null);
  const store = useMemo(() => new NodeGraphStore(), []);

  // Stabilize defaultNodeSize identity across renders when the consumer
  // passes an inline literal — downstream effects/memos depend on its
  // reference and would otherwise re-fire every render.
  const defaultNodeSize = useMemo(
    () => ({
      width: defaultNodeSizeProp.width,
      height: defaultNodeSizeProp.height,
    }),
    [defaultNodeSizeProp.width, defaultNodeSizeProp.height]
  );

  // ── Controlled / uncontrolled data ──
  const [nodes, setNodes] = useControlledState<NodeGraphNode[]>({
    value: nodesProp,
    defaultValue: defaultNodes,
    onChange: onNodesChange,
    fallback: EMPTY_NODES,
  });
  const [edges, setEdges] = useControlledState<NodeGraphEdge[]>({
    value: edgesProp,
    defaultValue: defaultEdges,
    onChange: onEdgesChange,
    fallback: EMPTY_EDGES,
  });
  const [groups, setGroups] = useControlledState<NodeGraphGroup[]>({
    value: groupsProp,
    defaultValue: defaultGroups,
    onChange: onGroupsChange,
    fallback: EMPTY_GROUPS,
  });
  const [selection, setSelection] = useControlledState<NodeGraphSelection>({
    value: selectionProp,
    defaultValue: defaultSelection,
    onChange: onSelectionChange,
    fallback: EMPTY_SELECTION,
  });

  // ── Mirror React state into the store ──
  useLayoutEffect(() => {
    store.setData({
      nodes,
      edges,
      groups,
      defaultNodeSize,
    });
  }, [store, nodes, edges, groups, defaultNodeSize]);

  useLayoutEffect(() => {
    store.setSelection(selection);
  }, [store, selection]);

  // ── Transform tracking (mirror Viewport transform into a ref for math) ──
  const transformRef = useRef<ViewportTransform>({ x: 0, y: 0, zoom: 1 });
  const handleTransformChange = useCallback((next: ViewportTransform) => {
    transformRef.current = next;
  }, []);

  // ── Slot sorting ──
  const slots = useMemo(() => sortSlots(children), [children]);

  // ── Helpers ──
  const getTransform = useCallback((): ViewportTransform => {
    return viewportHandleRef.current?.getTransform() ?? transformRef.current;
  }, []);

  const localScreenPoint = useCallback(
    (clientX: number, clientY: number): Point2D => {
      const el = rootRef.current;
      if (!el) return { x: 0, y: 0 };
      const rect = el.getBoundingClientRect();
      return { x: clientX - rect.left, y: clientY - rect.top };
    },
    []
  );

  const screenToWorldLocal = useCallback(
    (clientX: number, clientY: number): Point2D => {
      const local = localScreenPoint(clientX, clientY);
      return worldFromScreen(local, getTransform());
    },
    [localScreenPoint, getTransform]
  );

  // ── Targets / hit testing ──
  const nodesRef = useLatest(nodes);
  const groupsRef = useLatest(groups);
  const selectionRef = useLatest(selection);
  const snapToGridRef = useLatest(snapToGrid);
  const setSelectionRef = useLatest(setSelection);
  const setNodesRef = useLatest(setNodes);
  const disabledRef = useLatest(disabled);

  const findHitTarget = useCallback(
    (clientX: number, clientY: number): NodeGraphTarget => {
      const worldPoint = screenToWorldLocal(clientX, clientY);
      const currentNodes = nodesRef.current;
      const currentGroups = groupsRef.current;
      // Iterate top-to-bottom so the last-rendered node "wins" — matches what
      // the user sees on top.
      for (let i = currentNodes.length - 1; i >= 0; i--) {
        const node = currentNodes[i];
        if (node && isPointInNode(worldPoint, node, defaultNodeSize)) {
          return { kind: 'node', id: node.id };
        }
      }
      for (let i = currentGroups.length - 1; i >= 0; i--) {
        const group = currentGroups[i];
        if (group && isPointInRect(worldPoint, group.bounds)) {
          return { kind: 'group', id: group.id };
        }
      }
      return { kind: 'empty', worldPoint };
    },
    [defaultNodeSize, screenToWorldLocal, nodesRef, groupsRef]
  );

  // ── Connection drag (ports) ──
  const { onPortPointerDown } = useNodeGraphConnection({
    viewportRef: rootRef,
    store,
    getTransform,
    isValidConnection,
    onConnectStart,
    onConnectEnd,
    emitEdgesChange: setEdges,
  });

  // ── Node body pointerdown — drag (single/multi) + select on release ──
  type DragSession = {
    pointerId: number;
    clickedNodeId: string;
    startScreen: Point2D;
    startWorld: Point2D;
    /** Snapshot of selection at gesture start (for shift-toggle reset). */
    selectionAtStart: NodeGraphSelection;
    /** Snapshot of node positions at gesture start. */
    nodeStartPositions: Map<string, Point2D>;
    additive: boolean;
    didDrag: boolean;
    cleanup: () => void;
  };
  const dragRef = useRef<DragSession | null>(null);

  // Release any in-flight document listeners if the component unmounts mid-drag.
  useLayoutEffect(() => {
    return () => {
      dragRef.current?.cleanup();
      dragRef.current = null;
    };
  }, []);

  const onNodeBodyPointerDown = useCallback(
    (event: React.PointerEvent<HTMLDivElement>, node: NodeGraphNode): void => {
      if (event.button !== 0) return; // only primary button
      // Always stop propagation for clicks on a node body so the Viewport
      // beneath us doesn't fire a marquee. This applies even when disabled
      // or non-interactive — the click is consumed by the node hit target.
      event.stopPropagation();
      if (disabled) return;
      if (node.selectable === false && node.draggable === false) return;

      const target = event.currentTarget;
      target.setPointerCapture(event.pointerId);

      const additive = event.shiftKey || event.metaKey || event.ctrlKey;
      const currentSelection = selectionRef.current;
      const alreadySelected = currentSelection.nodes.includes(node.id);

      // Decide which node ids should drag together. If clicked node is in
      // the selection, drag all selected nodes; otherwise just this one.
      let dragIds: string[];
      if (alreadySelected) {
        dragIds = currentSelection.nodes;
      } else if (!additive) {
        // Pre-emptively select just this node so the drag matches what the
        // user sees as "selected" mid-gesture. The actual selection emit
        // happens in pointerup if no drag occurred.
        dragIds = [node.id];
      } else {
        dragIds = [...currentSelection.nodes, node.id];
      }

      const positions = new Map<string, Point2D>();
      for (const n of nodesRef.current) {
        if (dragIds.includes(n.id)) {
          positions.set(n.id, { ...n.position });
        }
      }

      const startScreen = localScreenPoint(event.clientX, event.clientY);
      const startWorld = worldFromScreen(startScreen, getTransform());
      const pointerId = event.pointerId;

      const handleMove = (e: PointerEvent): void => {
        const session = dragRef.current;
        if (session?.pointerId !== pointerId) return;
        const current = localScreenPoint(e.clientX, e.clientY);
        const dx = current.x - session.startScreen.x;
        const dy = current.y - session.startScreen.y;
        if (!session.didDrag) {
          if (Math.hypot(dx, dy) < DRAG_START_THRESHOLD_PX) return;
          const clicked = nodesRef.current.find(
            n => n.id === session.clickedNodeId
          );
          if (clicked?.draggable === false) {
            // Not draggable — promote to a no-op drag flag so pointerup falls
            // through to click selection logic.
            session.didDrag = false;
            return;
          }
          session.didDrag = true;
        }
        const transform = getTransform();
        const worldDelta = {
          x: dx / transform.zoom,
          y: dy / transform.zoom,
        };
        const snapped = snapDelta(worldDelta, snapToGridRef.current);
        const ids = Array.from(session.nodeStartPositions.keys());
        store.setInteraction({
          kind: 'drag-nodes',
          nodeIds: ids,
          startWorld: session.startWorld,
          delta: snapped,
        });
      };

      const handleCancel = (): void => {
        const session = dragRef.current;
        if (!session) return;
        session.cleanup();
        dragRef.current = null;
        store.setInteraction({ kind: 'idle' });
      };

      const cleanup = (): void => {
        document.removeEventListener('pointermove', handleMove);
        document.removeEventListener('pointercancel', handleCancel);
      };

      document.addEventListener('pointermove', handleMove);
      document.addEventListener('pointercancel', handleCancel);

      dragRef.current = {
        pointerId,
        clickedNodeId: node.id,
        startScreen,
        startWorld,
        selectionAtStart: currentSelection,
        nodeStartPositions: positions,
        additive,
        didDrag: false,
        cleanup,
      };
    },
    [
      disabled,
      selectionRef,
      nodesRef,
      localScreenPoint,
      getTransform,
      snapToGridRef,
      store,
    ]
  );

  const onNodeBodyPointerUp = useCallback(
    (event: React.PointerEvent<HTMLDivElement>, node: NodeGraphNode): void => {
      const session = dragRef.current;
      if (session?.pointerId !== event.pointerId) return;
      event.stopPropagation();
      const target = event.currentTarget;
      if (target.hasPointerCapture(event.pointerId)) {
        target.releasePointerCapture(event.pointerId);
      }

      session.cleanup();

      if (session.didDrag) {
        // Commit positions from store's interaction delta.
        const interaction = store.getInteraction();
        if (interaction.kind === 'drag-nodes') {
          const delta = interaction.delta;
          const nextNodes = nodesRef.current.map(n => {
            const start = session.nodeStartPositions.get(n.id);
            if (!start) return n;
            return {
              ...n,
              position: { x: start.x + delta.x, y: start.y + delta.y },
            };
          });
          setNodesRef.current(nextNodes);
        }
        store.setInteraction({ kind: 'idle' });
      } else {
        // Plain click — handle selection semantics.
        if (node.selectable !== false) {
          const current = session.selectionAtStart;
          let nextNodes: string[];
          if (session.additive) {
            nextNodes = current.nodes.includes(node.id)
              ? current.nodes.filter(id => id !== node.id)
              : [...current.nodes, node.id];
          } else {
            nextNodes = [node.id];
          }
          setSelectionRef.current({
            nodes: nextNodes,
            edges: session.additive ? current.edges : [],
            groups: session.additive ? current.groups : [],
          });
        }
      }

      dragRef.current = null;
    },
    [store, nodesRef, setNodesRef, setSelectionRef]
  );

  // ── Group interaction (drag + resize + click-select) ──
  type GroupDragSession = {
    kind: 'drag' | 'resize';
    pointerId: number;
    clickedGroupId: string;
    /** Handle being dragged (only for kind === 'resize'). */
    handle: NodeGraphGroupResizeHandle | null;
    startScreen: Point2D;
    startWorld: Point2D;
    selectionAtStart: NodeGraphSelection;
    /** Snapshot of bounds keyed by group id (for drag). */
    groupStartBounds: Map<string, WorldRect>;
    /** Bounds of the resized group at start (for resize). */
    resizeStartBounds: WorldRect | null;
    additive: boolean;
    didDrag: boolean;
    cleanup: () => void;
  };
  const groupSessionRef = useRef<GroupDragSession | null>(null);
  const setGroupsRef = useLatest(setGroups);

  // Release any in-flight group listeners if the component unmounts mid-drag.
  useLayoutEffect(() => {
    return () => {
      groupSessionRef.current?.cleanup();
      groupSessionRef.current = null;
    };
  }, []);

  /**
   * Wire up the shared move + cancel document listeners used by both the
   * drag-groups and resize-group gestures. Returns a `cleanup` function the
   * pointerup / pointercancel handler is expected to call.
   */
  const beginGroupSession = useCallback(
    (pointerId: number): (() => void) => {
      const handleMove = (e: PointerEvent): void => {
        const session = groupSessionRef.current;
        if (session?.pointerId !== pointerId) return;
        const current = localScreenPoint(e.clientX, e.clientY);
        const dx = current.x - session.startScreen.x;
        const dy = current.y - session.startScreen.y;
        const transform = getTransform();
        const worldDelta = {
          x: dx / transform.zoom,
          y: dy / transform.zoom,
        };
        const snapped = snapDelta(worldDelta, snapToGridRef.current);

        if (session.kind === 'drag') {
          if (!session.didDrag) {
            if (Math.hypot(dx, dy) < DRAG_START_THRESHOLD_PX) return;
            session.didDrag = true;
          }
          const ids = Array.from(session.groupStartBounds.keys());
          store.setInteraction({
            kind: 'drag-groups',
            groupIds: ids,
            startWorld: session.startWorld,
            delta: snapped,
          });
        } else if (
          session.kind === 'resize' &&
          session.resizeStartBounds &&
          session.handle
        ) {
          store.setInteraction({
            kind: 'resize-group',
            groupId: session.clickedGroupId,
            handle: session.handle,
            startBounds: session.resizeStartBounds,
            delta: snapped,
          });
        }
      };

      const handleCancel = (): void => {
        const session = groupSessionRef.current;
        if (!session) return;
        session.cleanup();
        groupSessionRef.current = null;
        store.setInteraction({ kind: 'idle' });
      };

      const cleanup = (): void => {
        document.removeEventListener('pointermove', handleMove);
        document.removeEventListener('pointercancel', handleCancel);
      };

      document.addEventListener('pointermove', handleMove);
      document.addEventListener('pointercancel', handleCancel);
      return cleanup;
    },
    [store, localScreenPoint, getTransform, snapToGridRef]
  );

  const onGroupBodyPointerDown = useCallback(
    (
      event: React.PointerEvent<HTMLDivElement>,
      group: NodeGraphGroup
    ): void => {
      if (event.button !== 0) return;
      event.stopPropagation();
      if (disabled) return;
      const target = event.currentTarget;
      target.setPointerCapture(event.pointerId);

      const additive = event.shiftKey || event.metaKey || event.ctrlKey;
      const currentSelection = selectionRef.current;
      const alreadySelected = currentSelection.groups.includes(group.id);

      let dragIds: string[];
      if (alreadySelected) {
        dragIds = currentSelection.groups;
      } else if (!additive) {
        dragIds = [group.id];
      } else {
        dragIds = [...currentSelection.groups, group.id];
      }

      const startBounds = new Map<string, WorldRect>();
      for (const g of groupsRef.current) {
        if (dragIds.includes(g.id)) {
          startBounds.set(g.id, { ...g.bounds });
        }
      }

      const startScreen = localScreenPoint(event.clientX, event.clientY);
      const startWorld = worldFromScreen(startScreen, getTransform());
      const pointerId = event.pointerId;
      const cleanup = beginGroupSession(pointerId);

      groupSessionRef.current = {
        kind: 'drag',
        pointerId,
        clickedGroupId: group.id,
        handle: null,
        startScreen,
        startWorld,
        selectionAtStart: currentSelection,
        groupStartBounds: startBounds,
        resizeStartBounds: null,
        additive,
        didDrag: false,
        cleanup,
      };
    },
    [
      disabled,
      selectionRef,
      groupsRef,
      localScreenPoint,
      getTransform,
      beginGroupSession,
    ]
  );

  const onGroupHandlePointerDown = useCallback(
    (
      event: React.PointerEvent<HTMLDivElement>,
      group: NodeGraphGroup,
      handle: NodeGraphGroupResizeHandle
    ): void => {
      if (event.button !== 0) return;
      event.stopPropagation();
      event.preventDefault();
      if (disabled) return;

      const target = event.currentTarget;
      target.setPointerCapture(event.pointerId);

      const startScreen = localScreenPoint(event.clientX, event.clientY);
      const startWorld = worldFromScreen(startScreen, getTransform());
      const pointerId = event.pointerId;
      const cleanup = beginGroupSession(pointerId);

      groupSessionRef.current = {
        kind: 'resize',
        pointerId,
        clickedGroupId: group.id,
        handle,
        startScreen,
        startWorld,
        selectionAtStart: selectionRef.current,
        groupStartBounds: new Map(),
        resizeStartBounds: { ...group.bounds },
        additive: false,
        didDrag: true,
        cleanup,
      };
      // Immediately register the resize interaction so the canvas + overlay
      // start tracking from delta=0 at the click point.
      store.setInteraction({
        kind: 'resize-group',
        groupId: group.id,
        handle,
        startBounds: { ...group.bounds },
        delta: { x: 0, y: 0 },
      });
    },
    [
      disabled,
      selectionRef,
      localScreenPoint,
      getTransform,
      store,
      beginGroupSession,
    ]
  );

  const onGroupBodyPointerUp = useCallback(
    (
      event: React.PointerEvent<HTMLDivElement>,
      group: NodeGraphGroup
    ): void => {
      const session = groupSessionRef.current;
      if (session?.pointerId !== event.pointerId) return;
      event.stopPropagation();
      const target = event.currentTarget;
      if (target.hasPointerCapture(event.pointerId)) {
        target.releasePointerCapture(event.pointerId);
      }

      session.cleanup();
      const interaction = store.getInteraction();

      if (session.kind === 'drag' && session.didDrag) {
        if (interaction.kind === 'drag-groups') {
          const delta = interaction.delta;
          const nextGroups = groupsRef.current.map(g => {
            const start = session.groupStartBounds.get(g.id);
            if (!start) return g;
            return {
              ...g,
              bounds: {
                ...start,
                x: start.x + delta.x,
                y: start.y + delta.y,
              },
            };
          });
          setGroupsRef.current(nextGroups);
        }
        store.setInteraction({ kind: 'idle' });
      } else if (session.kind === 'resize') {
        if (
          interaction.kind === 'resize-group' &&
          session.resizeStartBounds &&
          session.handle
        ) {
          const next = applyGroupResize(
            session.resizeStartBounds,
            session.handle,
            interaction.delta
          );
          const nextGroups = groupsRef.current.map(g =>
            g.id === session.clickedGroupId ? { ...g, bounds: next } : g
          );
          setGroupsRef.current(nextGroups);
        }
        store.setInteraction({ kind: 'idle' });
      } else {
        // Plain click on group body → selection
        const current = session.selectionAtStart;
        let nextGroups: string[];
        if (session.additive) {
          nextGroups = current.groups.includes(group.id)
            ? current.groups.filter(id => id !== group.id)
            : [...current.groups, group.id];
        } else {
          nextGroups = [group.id];
        }
        setSelectionRef.current({
          nodes: session.additive ? current.nodes : [],
          edges: session.additive ? current.edges : [],
          groups: nextGroups,
        });
      }

      groupSessionRef.current = null;
    },
    [store, groupsRef, setGroupsRef, setSelectionRef]
  );

  // ── Marquee selection from the Viewport ──
  const [, startMarqueeTransition] = useTransition();
  const handleViewportSelection = useCallback(
    (info: ViewportSelectionEvent): void => {
      if (disabledRef.current) return;
      if (info.inProgress) {
        // Live preview: drive the marquee overlay via the store so canvas
        // hit-test for hover/edge can also respond if needed.
        store.setInteraction({
          kind: 'marquee',
          startWorld: { x: info.rect.x, y: info.rect.y },
          currentWorld: {
            x: info.rect.x + info.rect.width,
            y: info.rect.y + info.rect.height,
          },
          additive: info.additive,
        });
        return;
      }

      // Final marquee — compute selection from rect intersection.
      store.setInteraction({ kind: 'idle' });
      const rect: WorldRect = info.rect;
      const hits: string[] = [];
      for (const node of nodesRef.current) {
        const box = getNodeBox(node, defaultNodeSize);
        if (
          rectsIntersect(
            { x: box.x, y: box.y, width: box.width, height: box.height },
            rect
          )
        ) {
          hits.push(node.id);
        }
      }
      const current = selectionRef.current;
      const nextNodes = info.additive
        ? Array.from(new Set([...current.nodes, ...hits]))
        : hits;
      // Selection commits can cascade into expensive renderNode bodies for
      // a large hit set — let React schedule it as non-urgent so the
      // gesture release doesn't hitch.
      startMarqueeTransition(() => {
        setSelectionRef.current({
          nodes: nextNodes,
          edges: info.additive ? current.edges : [],
          groups: info.additive ? current.groups : [],
        });
      });
    },
    [
      store,
      nodesRef,
      selectionRef,
      setSelectionRef,
      defaultNodeSize,
      disabledRef,
    ]
  );

  // ── Context menu ──
  const onContextMenuRef = useLatest(onContextMenu);
  const handleContextMenu = useCallback(
    (event: React.MouseEvent<HTMLDivElement>): void => {
      if (disabledRef.current) return;
      const cb = onContextMenuRef.current;
      if (!cb) return;
      event.preventDefault();
      // Walk up the DOM from the event target to find data attributes
      // identifying a port or a node. Ports take priority because they're
      // descendants of nodes — the loop bails on the first match.
      const targetEl = event.target as Element | null;
      let portRef: NodeGraphPortRef | null = null;
      let nodeId: string | null = null;
      let cursor: Element | null = targetEl;
      while (cursor && cursor !== rootRef.current) {
        const portId = cursor.getAttribute('data-port-id');
        const dataNodeId = cursor.getAttribute('data-node-id');
        if (portId && dataNodeId) {
          portRef = { node: dataNodeId, port: portId };
          break;
        }
        if (dataNodeId && !nodeId) {
          nodeId = dataNodeId;
        }
        cursor = cursor.parentElement;
      }
      const screenPoint = localScreenPoint(event.clientX, event.clientY);
      const worldPoint = worldFromScreen(screenPoint, getTransform());
      let resolvedTarget: NodeGraphTarget;
      if (portRef) {
        resolvedTarget = {
          kind: 'port',
          node: portRef.node,
          port: portRef.port,
        };
      } else if (nodeId) {
        resolvedTarget = { kind: 'node', id: nodeId };
      } else {
        resolvedTarget = findHitTarget(event.clientX, event.clientY);
      }
      const info: NodeGraphContextMenuInfo = {
        target: resolvedTarget,
        screenPoint,
        worldPoint,
      };
      cb(info);
    },
    [
      findHitTarget,
      localScreenPoint,
      getTransform,
      onContextMenuRef,
      disabledRef,
    ]
  );

  // Pass-through context menu handler from a single node body — we re-use
  // the global handler so menus on nodes/empty/ports use the same code path.
  const onBodyContextMenuPerNode = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => handleContextMenu(event),
    [handleContextMenu]
  );

  // ── Keyboard ──
  const { onKeyDown } = useNodeGraphKeyboard({
    store,
    emitNodesChange: setNodes,
    emitSelectionChange: setSelection,
    onDelete,
    onActivate,
    snapToGrid,
    disabled,
  });

  // ── Canvas draw callbacks (stable identities via useLatest) ──
  const backgroundProps = slots.backgroundProps;
  const backgroundVariant = backgroundProps?.variant ?? 'dots';
  const backgroundGap = backgroundProps?.gap ?? 24;
  const backgroundColor = backgroundProps?.color;
  const backgroundFill = backgroundProps?.background;

  const drawBackgroundLayer = useCallback(
    (
      ctx: CanvasRenderingContext2D,
      info: Parameters<React.ComponentProps<typeof ViewportLayer>['draw']>[1]
    ): void => {
      const theme = buildDrawTheme(info.theme);
      drawBackground(ctx, info, theme, {
        variant: backgroundVariant,
        gap: backgroundGap,
        color: backgroundColor,
        background: backgroundFill,
      });
    },
    [backgroundVariant, backgroundGap, backgroundColor, backgroundFill]
  );

  const drawGroupsLayer = useCallback(
    (
      ctx: CanvasRenderingContext2D,
      info: Parameters<React.ComponentProps<typeof ViewportLayer>['draw']>[1]
    ): void => {
      const data = store.getData();
      const sel = store.getSelection();
      const interaction = store.getInteraction();
      const theme = buildDrawTheme(info.theme);
      drawGroups(ctx, info, data, sel, interaction, theme);
    },
    [store]
  );

  const drawEdgesLayer = useCallback(
    (
      ctx: CanvasRenderingContext2D,
      info: Parameters<React.ComponentProps<typeof ViewportLayer>['draw']>[1]
    ): void => {
      const data = store.getData();
      const sel = store.getSelection();
      const hover = store.getHover();
      const interaction = store.getInteraction();
      const theme = buildDrawTheme(info.theme);
      drawEdges(ctx, info, data, sel, hover.hoveredEdgeId, interaction, theme);
    },
    [store]
  );

  const drawPreviewLayer = useCallback(
    (
      ctx: CanvasRenderingContext2D,
      info: Parameters<React.ComponentProps<typeof ViewportLayer>['draw']>[1]
    ): void => {
      const interaction = store.getInteraction();
      if (interaction.kind !== 'connect') return;
      const theme = buildDrawTheme(info.theme);
      drawConnectionPreview(
        ctx,
        info,
        interaction,
        ref => {
          const resolved = resolvePortRef(
            ref,
            store.getData().nodes,
            store.getData().defaultNodeSize
          );
          if (!resolved) return null;
          return { position: resolved.position, side: resolved.port.side };
        },
        theme
      );
    },
    [store]
  );

  // Force invalidation of canvas layers when the relevant store slices change.
  // `invalidate` reads `viewportHandleRef.current` at call time so a viewport
  // remount (which would re-bind the imperative handle) doesn't leave us
  // pointing at a stale handle reference.
  useLayoutEffect(() => {
    const invalidate = (layer: NodeGraphLayerName): void => {
      viewportHandleRef.current?.invalidate(layer);
    };
    const unsubs: Array<() => void> = [
      store.subscribeData(() => {
        invalidate('groups');
        invalidate('edges');
      }),
      store.subscribeSelection(() => {
        invalidate('groups');
        invalidate('edges');
      }),
      store.subscribeHover(() => invalidate('edges')),
      // Interaction drives the in-flight drag delta — every canvas layer
      // that visualises something positional needs to redraw on each tick:
      // edges (connectors follow dragged nodes live, not snap on release),
      // groups (drag-groups / resize-group), and the connection preview.
      store.subscribeInteraction(() => {
        invalidate('edges');
        invalidate('groups');
        invalidate('preview');
      }),
    ];
    return () => {
      for (const unsub of unsubs) unsub();
    };
  }, [store]);

  // ── Imperative handle ──
  useImperativeHandle(
    ref,
    (): NodeGraphHandle => ({
      fitToContent: padding => {
        const vp = viewportHandleRef.current;
        if (!vp) return;
        const bounds = computeNodesBounds(nodesRef.current, defaultNodeSize);
        if (bounds.width === 0 && bounds.height === 0) return;
        vp.fitToContent(bounds, padding ?? 32);
      },
      fitToSelection: padding => {
        const vp = viewportHandleRef.current;
        if (!vp) return;
        const sel = selectionRef.current.nodes;
        if (sel.length === 0) return;
        const selectedNodes = nodesRef.current.filter(n => sel.includes(n.id));
        const bounds = computeNodesBounds(selectedNodes, defaultNodeSize);
        if (bounds.width === 0 && bounds.height === 0) return;
        vp.fitToContent(bounds, padding ?? 64);
      },
      focusNode: idStr => {
        const vp = viewportHandleRef.current;
        if (!vp) return;
        const node = nodesRef.current.find(n => n.id === idStr);
        if (!node) return;
        const box = getNodeBox(node, defaultNodeSize);
        vp.centerOn({
          x: box.x + box.width / 2,
          y: box.y + box.height / 2,
        });
      },
      centerOn: (point, z) => {
        viewportHandleRef.current?.centerOn(point, z);
      },
      zoomToRect: (rect, padding) => {
        viewportHandleRef.current?.zoomToRect(rect, padding);
      },
      getTransform: () => getTransform(),
      getSize: () =>
        viewportHandleRef.current?.getSize() ?? { width: 0, height: 0 },
      worldToScreen: point => screenFromWorld(point, getTransform()),
      screenToWorld: point => worldFromScreen(point, getTransform()),
      invalidate: layerName => viewportHandleRef.current?.invalidate(layerName),
    }),
    [nodesRef, selectionRef, defaultNodeSize, getTransform]
  );

  // Edge labels rendered as world-space children at the midpoint of each
  // edge. Mounted as its own subscriber component so the labels follow
  // dragged nodes live without re-rendering the whole NodeGraph.
  const renderEdgeLabelRef = useLatest(renderEdgeLabel);

  return (
    <NodeGraphStoreContext.Provider value={store}>
      <div
        ref={rootRef}
        id={id}
        data-testid={testId}
        onKeyDown={onKeyDown}
        onContextMenu={handleContextMenu}
        className={cx(nodeGraphRootStyle, className)}
        style={style}
      >
        <Viewport
          ref={viewportHandleRef}
          responsive={responsive}
          height={height}
          pan={pan}
          zoom={zoom}
          minZoom={minZoom}
          maxZoom={maxZoom}
          selectionRect={{ enabled: selectionRect, button: 'left' }}
          onSelectionChange={handleViewportSelection}
          onTransformChange={handleTransformChange}
          disabled={disabled}
          ariaLabel={ariaLabel}
          ariaRoledescription="node graph"
        >
          {slots.hasBackground ? (
            <ViewportLayer name="background" draw={drawBackgroundLayer} />
          ) : null}
          <ViewportLayer name="groups" draw={drawGroupsLayer} />
          <ViewportLayer name="edges" draw={drawEdgesLayer} />
          <ViewportWorld>
            {groups.map(group => (
              <NodeGraphGroupView
                key={group.id}
                group={group}
                onBodyPointerDown={onGroupBodyPointerDown}
                onBodyPointerUp={onGroupBodyPointerUp}
                onHandlePointerDown={onGroupHandlePointerDown}
                onBodyContextMenu={handleContextMenu}
              />
            ))}
            {nodes.map(node => (
              <NodeGraphNodeView
                key={node.id}
                node={node}
                defaultSize={defaultNodeSize}
                renderNode={renderNode}
                renderPort={renderPort}
                onBodyPointerDown={onNodeBodyPointerDown}
                onBodyPointerUp={onNodeBodyPointerUp}
                onPortPointerDown={onPortPointerDown}
                onBodyContextMenu={onBodyContextMenuPerNode}
              />
            ))}
            <EdgeLabelsLayer
              defaultSize={defaultNodeSize}
              renderEdgeLabelRef={renderEdgeLabelRef}
            />
          </ViewportWorld>
          <ViewportLayer name="preview" draw={drawPreviewLayer} />
          {slots.hasMinimap ? (
            <ViewportOverlay>
              <NodeGraphMinimapInner {...(slots.minimapProps ?? {})} />
            </ViewportOverlay>
          ) : null}
        </Viewport>
      </div>
    </NodeGraphStoreContext.Provider>
  );
};

// ─── Edge labels layer ───
//
// Renders one HTML element per edge label at the world-space midpoint of
// the edge. Subscribes to data + interaction slices so labels follow the
// dragged nodes live without forcing a re-render of the whole NodeGraph.

function EdgeLabelsLayer({
  defaultSize,
  renderEdgeLabelRef,
}: {
  defaultSize: { width: number; height: number };
  renderEdgeLabelRef: {
    current: ((edge: NodeGraphEdge) => React.ReactNode) | undefined;
  };
}): React.ReactElement | null {
  const store = useNodeGraphStore();
  const data = useSyncExternalStore(store.subscribeData, store.getData);
  const interaction = useSyncExternalStore(
    store.subscribeInteraction,
    store.getInteraction
  );

  const dragSet =
    interaction.kind === 'drag-nodes'
      ? { ids: new Set(interaction.nodeIds), delta: interaction.delta }
      : null;

  return (
    <>
      {data.edges.map(edge => {
        const src = resolvePortRef(edge.source, data.nodes, defaultSize);
        const tgt = resolvePortRef(edge.target, data.nodes, defaultSize);
        if (!src || !tgt) return null;
        const srcOffset = dragSet?.ids.has(edge.source.node)
          ? dragSet.delta
          : null;
        const tgtOffset = dragSet?.ids.has(edge.target.node)
          ? dragSet.delta
          : null;
        const sx = src.position.x + (srcOffset?.x ?? 0);
        const sy = src.position.y + (srcOffset?.y ?? 0);
        const tx = tgt.position.x + (tgtOffset?.x ?? 0);
        const ty = tgt.position.y + (tgtOffset?.y ?? 0);
        const midX = (sx + tx) / 2;
        const midY = (sy + ty) / 2;
        const content = renderEdgeLabelRef.current
          ? renderEdgeLabelRef.current(edge)
          : (edge.label ?? null);
        if (content == null || content === false) return null;
        return <EdgeLabel key={edge.id} x={midX} y={midY} content={content} />;
      })}
    </>
  );
}

// ─── Edge label (positioned in world space) ───

function EdgeLabel({
  x,
  y,
  content,
}: {
  x: number;
  y: number;
  content: React.ReactNode;
}): React.ReactElement {
  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        transform: 'translate(-50%, -50%)',
        pointerEvents: 'auto',
      }}
    >
      {content}
    </div>
  );
}

// ─── Compound exports ───

type NodeGraphCompound = typeof NodeGraphImpl & {
  Minimap: typeof NodeGraphMinimap;
  Background: typeof NodeGraphBackground;
};

(NodeGraphImpl as unknown as { displayName: string }).displayName = 'NodeGraph';

const NodeGraphWithSlots = NodeGraphImpl as NodeGraphCompound;
NodeGraphWithSlots.Minimap = NodeGraphMinimap;
NodeGraphWithSlots.Background = NodeGraphBackground;

export const NodeGraph = NodeGraphWithSlots;
