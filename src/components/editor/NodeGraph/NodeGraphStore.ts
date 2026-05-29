import type {
  NodeGraphEdge,
  NodeGraphNode,
  NodeGraphGroup,
  NodeGraphPortRef,
  NodeGraphPortSide,
  NodeGraphSelection,
} from './NodeGraph.types';
import type { Point2D } from '@/components/primitives/canvas/canvas.types';
import type { WorldRect } from '@/components/primitives/viewport';

/** Snapshot of the data slice — the canonical graph contents. */
export interface NodeGraphDataState {
  nodes: ReadonlyArray<NodeGraphNode>;
  edges: ReadonlyArray<NodeGraphEdge>;
  groups: ReadonlyArray<NodeGraphGroup>;
  defaultNodeSize: { width: number; height: number };
}

/**
 * A port's measured position registered by a `<NodeGraph.Port>` slot.
 * Coordinates are in **node-local pixels** (relative to the node wrapper's
 * top-left). Because the wrapper is positioned in world space but rendered
 * in CSS pixels at zoom = 1 (zoom is applied by the parent `<ViewportWorld>`
 * transform), these pixels are equivalent to node-local world units.
 */
export interface NodeGraphPortPosition {
  x: number;
  y: number;
  side: NodeGraphPortSide;
  dataType?: string;
}

/** Measured DOM size of a node wrapper, in node-local world units. */
export interface NodeGraphMeasuredSize {
  width: number;
  height: number;
}

/**
 * Snapshot of the interaction slice — the active gesture (if any) and its
 * scratch data. Designed so the edge/preview drawing layer can read everything
 * it needs in one slice subscription.
 */
/** Eight points along a rectangle that can be grabbed to resize a group. */
export type NodeGraphGroupResizeHandle =
  | 'nw'
  | 'n'
  | 'ne'
  | 'e'
  | 'se'
  | 's'
  | 'sw'
  | 'w';

export type NodeGraphInteractionState =
  | { kind: 'idle' }
  | {
      kind: 'drag-nodes';
      /**
       * Ids of nodes being dragged together. Set (not Array) so per-node
       * subscribers can do O(1) membership checks in the hot per-frame
       * selector path — a Cartesian `Array.includes` was a measurable cost
       * at high node counts when the user dragged the whole selection.
       */
      nodeIds: ReadonlySet<string>;
      /** Pointer-down world position (start of the drag). */
      startWorld: Point2D;
      /** Cumulative drag delta in world units (snapped if grid active). */
      delta: Point2D;
    }
  | {
      kind: 'drag-groups';
      /** Ids of groups being dragged together. See {@link nodeIds} for why Set. */
      groupIds: ReadonlySet<string>;
      /**
       * Ids of nodes that were fully contained inside one of the dragged
       * groups at gesture start. They ride along with the group(s) and
       * receive the same drag delta — see `rectContains` in `nodeGraphMath`.
       */
      containedNodeIds: ReadonlySet<string>;
      /** Pointer-down world position. */
      startWorld: Point2D;
      /** Cumulative drag delta (snapped if grid active). */
      delta: Point2D;
      /**
       * True when the projected positions of the dragged groups would
       * overlap any other (non-dragged) group. The HTML overlay paints a
       * rejection state and the pointerup handler refuses to commit when
       * this is set.
       */
      blocked: boolean;
    }
  | {
      kind: 'resize-group';
      groupId: string;
      handle: NodeGraphGroupResizeHandle;
      /** Original bounds at the start of the resize. */
      startBounds: { x: number; y: number; width: number; height: number };
      /** Cumulative pointer delta in world units (snapped). */
      delta: Point2D;
      /** Set when the resized bounds would overlap another group. */
      blocked: boolean;
    }
  | {
      kind: 'connect';
      /**
       * Fixed endpoint the preview draws from. For a new connection this is
       * the port the drag started on; for a reconnect it's the *other* end
       * of the edge being edited (the one staying put).
       */
      source: NodeGraphPortRef;
      /** Current pointer position in world coordinates. */
      currentWorld: Point2D;
      /** Hovered candidate target port, or null when none. */
      candidate: NodeGraphPortRef | null;
      /** Whether the candidate is currently rejected by `isValidConnection`. */
      invalid: boolean;
      /**
       * Set while re-dragging an existing edge's endpoint. The edge is hidden
       * from the edge layer for the duration so only the preview shows, and
       * the drop either moves the endpoint, deletes the edge (detach), or —
       * on a click with no drag — selects it.
       */
      reconnectEdgeId?: string;
      /** Which end of `reconnectEdgeId` is being dragged. */
      reconnectEnd?: 'source' | 'target';
    }
  | {
      kind: 'marquee';
      /** Marquee start in world coordinates. */
      startWorld: Point2D;
      /** Current pointer position in world coordinates. */
      currentWorld: Point2D;
      /** Whether the additive modifier was held at gesture start. */
      additive: boolean;
    };

/** Snapshot of the hover slice. */
export interface NodeGraphHoverState {
  hoveredNodeId: string | null;
  hoveredEdgeId: string | null;
  hoveredPort: NodeGraphPortRef | null;
}

const EMPTY_DATA: NodeGraphDataState = {
  nodes: [],
  edges: [],
  groups: [],
  defaultNodeSize: { width: 180, height: 80 },
};

const EMPTY_SELECTION: NodeGraphSelection = {
  nodes: [],
  edges: [],
  groups: [],
};

const EMPTY_HOVER: NodeGraphHoverState = {
  hoveredNodeId: null,
  hoveredEdgeId: null,
  hoveredPort: null,
};

const IDLE: NodeGraphInteractionState = { kind: 'idle' };

/**
 * Hot-path runtime state for `<NodeGraph>` — graph data, selection,
 * interaction, hover. Each slice carries its own subscribe/get pair so
 * subscribers re-render only on relevant changes (e.g. the edge canvas
 * subscribes to data + interaction, individual node bodies subscribe only
 * to selection + drag delta for their own id).
 *
 * Mirrors `ViewportStore` / `MinimapStore` in structure.
 */
export class NodeGraphStore {
  private data: NodeGraphDataState = EMPTY_DATA;
  private selection: NodeGraphSelection = EMPTY_SELECTION;
  private interaction: NodeGraphInteractionState = IDLE;
  private hover: NodeGraphHoverState = EMPTY_HOVER;
  // `Map<id, NodeGraphNode>` mirror of `data.nodes` — rebuilt in `setData`.
  // Enables O(1) `getNodeById` lookups for hot paths (edge drawing,
  // pointer-driven drag handlers) that previously did O(n) `nodes.find`
  // per call.
  private nodeIndex = new Map<string, NodeGraphNode>();
  // Set of `"${node}\0${port}"` keys for every port referenced by an edge
  // endpoint — recomputed in `setData` only when the edges reference
  // changes. Lets `<NodeGraph.Port>` slots auto-derive their "connected"
  // visual state without the consumer threading a parallel index down
  // through `renderNode`.
  private connectedPorts: ReadonlySet<string> = new Set<string>();

  // Map<nodeId, Map<portId, NodeGraphPortPosition>>.
  // Mutated in place by `<NodeGraph.Port>` slots on mount/resize. Listeners
  // are notified whenever any port's position, side, or dataType changes.
  private portPositions = new Map<string, Map<string, NodeGraphPortPosition>>();
  // Map<nodeId, NodeGraphMeasuredSize>. Populated by NodeGraphNodeView's
  // ResizeObserver — used by getNodeBox when node.width/height are absent.
  private measuredSizes = new Map<string, NodeGraphMeasuredSize>();

  private dataListeners = new Set<() => void>();
  private connectedPortsListeners = new Set<() => void>();
  private selectionListeners = new Set<() => void>();
  private interactionListeners = new Set<() => void>();
  // Per-node interaction subscriptions. Each `<NodeGraphNodeView>` registers
  // for its own id and is woken only when the interaction state changes in
  // a way that could affect that node's drag delta — i.e. the node was, or
  // now is, part of the active drag set. This cuts the notify fan-out from
  // O(all-nodes) to O(dragged-nodes) per pointermove flush, which is the
  // dominant cost when dragging a single node out of a large graph.
  private nodeInteractionListeners = new Map<string, Set<() => void>>();
  private hoverListeners = new Set<() => void>();
  private portPositionListeners = new Set<() => void>();
  private measuredSizeListeners = new Set<() => void>();

  // Monotonic counters used as `useSyncExternalStore` snapshots for the
  // notify-only port-positions / measured-sizes channels. A stable null
  // snapshot would let React skip the update via `Object.is(prev, next)`,
  // even when the subscription fired.
  private portPositionsVersion = 0;
  private measuredSizesVersion = 0;
  private spawnRequestListeners = new Set<
    (info: { worldPoint: Point2D; screenPoint: Point2D }) => void
  >();

  // ── Public read API ──

  getData = (): NodeGraphDataState => this.data;
  getSelection = (): NodeGraphSelection => this.selection;
  getInteraction = (): NodeGraphInteractionState => this.interaction;
  getHover = (): NodeGraphHoverState => this.hover;

  /**
   * The set of `"${node}\0${port}"` keys that are referenced by at least
   * one edge endpoint. Reference is stable until the membership actually
   * changes, so it can back a `useSyncExternalStore` snapshot directly.
   */
  getConnectedPorts = (): ReadonlySet<string> => this.connectedPorts;

  /** True when the given port is referenced by at least one edge endpoint. */
  isPortConnected = (nodeId: string, portId: string): boolean => {
    return this.connectedPorts.has(portKey(nodeId, portId));
  };

  /**
   * O(1) node lookup by id, backed by an internal Map rebuilt on each
   * `setData`. Use this from hot paths instead of `data.nodes.find(...)`.
   */
  getNodeById = (id: string): NodeGraphNode | undefined => {
    return this.nodeIndex.get(id);
  };

  /**
   * Read the registered position of a single port. Returns `null` when the
   * port hasn't yet been measured (e.g. on first paint before
   * `useLayoutEffect` has run, or after the slot unmounted).
   */
  getPortPosition = (
    nodeId: string,
    portId: string
  ): NodeGraphPortPosition | null => {
    return this.portPositions.get(nodeId)?.get(portId) ?? null;
  };

  /** Read the measured DOM size of a node wrapper. */
  getMeasuredSize = (nodeId: string): NodeGraphMeasuredSize | null => {
    return this.measuredSizes.get(nodeId) ?? null;
  };

  /**
   * Monotonic snapshot of the port-positions channel — pass to
   * `useSyncExternalStore` alongside `subscribePortPositions` so React
   * actually re-renders consumers on every real change. Incremented
   * whenever a port position is added, updated, removed, or GC'd by
   * `setData`. Skipped on no-op writes.
   */
  getPortPositionsVersion = (): number => this.portPositionsVersion;

  /**
   * Monotonic snapshot of the measured-sizes channel — same role as
   * `getPortPositionsVersion`, for `subscribeMeasuredSizes`.
   */
  getMeasuredSizesVersion = (): number => this.measuredSizesVersion;

  // ── Subscriptions ──

  subscribeData = (cb: () => void): (() => void) => {
    this.dataListeners.add(cb);
    return () => {
      this.dataListeners.delete(cb);
    };
  };

  /**
   * Subscribe to the connected-ports channel — fires only when the set of
   * edge-referenced ports actually changes membership (not on every node
   * move). Backs the auto-`connected` state on `<NodeGraph.Port>`.
   */
  subscribeConnectedPorts = (cb: () => void): (() => void) => {
    this.connectedPortsListeners.add(cb);
    return () => {
      this.connectedPortsListeners.delete(cb);
    };
  };

  subscribeSelection = (cb: () => void): (() => void) => {
    this.selectionListeners.add(cb);
    return () => {
      this.selectionListeners.delete(cb);
    };
  };

  subscribeInteraction = (cb: () => void): (() => void) => {
    this.interactionListeners.add(cb);
    return () => {
      this.interactionListeners.delete(cb);
    };
  };

  /**
   * Subscribe to interaction changes that affect a specific node id. The
   * callback fires only when the node enters or leaves the active drag set
   * (drag-nodes `nodeIds`, drag-groups `containedNodeIds`) — every other
   * tick where the drag set is unchanged for this id is filtered out at the
   * store layer instead of waking the subscriber for a no-op compare.
   *
   * Use this from per-node React subscribers; the global
   * {@link subscribeInteraction} channel stays in place for canvas layers
   * and other consumers that care about every interaction change.
   */
  subscribeNodeInteraction = (nodeId: string, cb: () => void): (() => void) => {
    let set = this.nodeInteractionListeners.get(nodeId);
    if (!set) {
      set = new Set();
      this.nodeInteractionListeners.set(nodeId, set);
    }
    set.add(cb);
    return () => {
      const current = this.nodeInteractionListeners.get(nodeId);
      if (!current) return;
      current.delete(cb);
      if (current.size === 0) {
        this.nodeInteractionListeners.delete(nodeId);
      }
    };
  };

  subscribeHover = (cb: () => void): (() => void) => {
    this.hoverListeners.add(cb);
    return () => {
      this.hoverListeners.delete(cb);
    };
  };

  subscribePortPositions = (cb: () => void): (() => void) => {
    this.portPositionListeners.add(cb);
    return () => {
      this.portPositionListeners.delete(cb);
    };
  };

  subscribeMeasuredSizes = (cb: () => void): (() => void) => {
    this.measuredSizeListeners.add(cb);
    return () => {
      this.measuredSizeListeners.delete(cb);
    };
  };

  // ── Spawn-palette request channel ──
  //
  // Notification-only channel used by `<NodeGraph.SpawnPalette>` to
  // listen for "user wants to spawn a node here" events without forcing
  // the consumer to wire context-menu state through their own React
  // tree. The main `NodeGraph` component pumps this channel from its
  // `handleContextMenu` when the right-click target is `empty` or
  // `group` (i.e. a place where it makes sense to drop a new node).
  subscribeSpawnRequest = (
    cb: (info: { worldPoint: Point2D; screenPoint: Point2D }) => void
  ): (() => void) => {
    this.spawnRequestListeners.add(cb);
    return () => {
      this.spawnRequestListeners.delete(cb);
    };
  };

  requestSpawn(info: { worldPoint: Point2D; screenPoint: Point2D }): void {
    this.spawnRequestListeners.forEach(cb => {
      cb(info);
    });
  }

  // ── Mutators ──

  setData(next: NodeGraphDataState): void {
    if (
      next.nodes === this.data.nodes &&
      next.edges === this.data.edges &&
      next.groups === this.data.groups &&
      next.defaultNodeSize.width === this.data.defaultNodeSize.width &&
      next.defaultNodeSize.height === this.data.defaultNodeSize.height
    ) {
      return;
    }
    const edgesChanged = next.edges !== this.data.edges;
    const prevNodeIds = new Set(this.data.nodes.map(n => n.id));
    // Rebuild the id → node lookup in the same pass that collects the
    // next-frame id set, so GC and the index stay in sync without a
    // second iteration.
    this.nodeIndex.clear();
    const nextNodeIds = new Set<string>();
    for (const n of next.nodes) {
      nextNodeIds.add(n.id);
      this.nodeIndex.set(n.id, n);
    }
    // Garbage-collect port positions + measured sizes for nodes that have
    // been removed from the data. Slot unmount effects normally clear their
    // own entries, but if the node disappears in a single render tick (drop
    // from controlled state) the unmount and the data swap can race.
    let didMutatePortPositions = false;
    let didMutateMeasuredSizes = false;
    for (const id of prevNodeIds) {
      if (nextNodeIds.has(id)) continue;
      if (this.portPositions.delete(id)) didMutatePortPositions = true;
      if (this.measuredSizes.delete(id)) didMutateMeasuredSizes = true;
    }
    this.data = next;
    this.dataListeners.forEach(cb => {
      cb();
    });
    // Recompute the connected-ports index when edges changed, and notify
    // its dedicated channel only if the membership actually differs — an
    // edges array that was replaced but carries the same endpoints (e.g.
    // a label edit) leaves port "connected" state untouched.
    if (edgesChanged) {
      const nextConnected = computeConnectedPorts(next.edges);
      if (!connectedSetsEqual(nextConnected, this.connectedPorts)) {
        this.connectedPorts = nextConnected;
        this.connectedPortsListeners.forEach(cb => {
          cb();
        });
      }
    }
    if (didMutatePortPositions) {
      this.portPositionsVersion++;
      this.portPositionListeners.forEach(cb => {
        cb();
      });
    }
    if (didMutateMeasuredSizes) {
      this.measuredSizesVersion++;
      this.measuredSizeListeners.forEach(cb => {
        cb();
      });
    }
  }

  setSelection(next: NodeGraphSelection): void {
    if (selectionEqual(next, this.selection)) return;
    this.selection = next;
    this.selectionListeners.forEach(cb => {
      cb();
    });
  }

  setInteraction(next: NodeGraphInteractionState): void {
    if (interactionEqual(next, this.interaction)) return;
    const prev = this.interaction;
    this.interaction = next;

    // Global listeners: canvas layers, the main NodeGraph component (for
    // layer invalidation), and any consumer hook that wants every change.
    this.interactionListeners.forEach(cb => {
      cb();
    });

    // Per-node listeners: notify ids that are in the next or the prev drag
    // set. A node that *leaves* the drag set needs to clear its local
    // delta, so previously-affected ids must fire too even when they're no
    // longer in `next`.
    const prevIds = getDragAffectedNodeIds(prev);
    const nextIds = getDragAffectedNodeIds(next);
    if (prevIds.size === 0 && nextIds.size === 0) return;

    for (const id of nextIds) {
      this.nodeInteractionListeners.get(id)?.forEach(cb => {
        cb();
      });
    }
    for (const id of prevIds) {
      // Dedupe — already notified above when the node is in both sets.
      if (nextIds.has(id)) continue;
      this.nodeInteractionListeners.get(id)?.forEach(cb => {
        cb();
      });
    }
  }

  setHover(next: NodeGraphHoverState): void {
    if (hoverEqual(next, this.hover)) return;
    this.hover = next;
    this.hoverListeners.forEach(cb => {
      cb();
    });
  }

  /**
   * Register a port's measured position. Called by `<NodeGraph.Port>` from
   * a `useLayoutEffect` + `ResizeObserver`. No-ops when the incoming
   * position is identical to the cached one — protects edge layer from
   * redraw storms when nodes resize without porting any pin movement.
   */
  setPortPosition(
    nodeId: string,
    portId: string,
    next: NodeGraphPortPosition
  ): void {
    let perNode = this.portPositions.get(nodeId);
    if (!perNode) {
      perNode = new Map();
      this.portPositions.set(nodeId, perNode);
    }
    const prev = perNode.get(portId);
    if (
      prev?.x === next.x &&
      prev.y === next.y &&
      prev.side === next.side &&
      prev.dataType === next.dataType
    ) {
      return;
    }
    perNode.set(portId, next);
    this.portPositionsVersion++;
    this.portPositionListeners.forEach(cb => {
      cb();
    });
  }

  /** Remove a port registration. Called by `<NodeGraph.Port>` cleanup. */
  removePortPosition(nodeId: string, portId: string): void {
    const perNode = this.portPositions.get(nodeId);
    if (!perNode) return;
    if (!perNode.delete(portId)) return;
    if (perNode.size === 0) this.portPositions.delete(nodeId);
    this.portPositionsVersion++;
    this.portPositionListeners.forEach(cb => {
      cb();
    });
  }

  /**
   * Register / refresh the measured DOM size of a node wrapper. No-ops on
   * identical width+height.
   */
  setMeasuredSize(nodeId: string, next: NodeGraphMeasuredSize): void {
    const prev = this.measuredSizes.get(nodeId);
    if (prev?.width === next.width && prev.height === next.height) {
      return;
    }
    this.measuredSizes.set(nodeId, next);
    this.measuredSizesVersion++;
    this.measuredSizeListeners.forEach(cb => {
      cb();
    });
  }

  /** Clear the measured size of a node (called on unmount). */
  clearMeasuredSize(nodeId: string): void {
    if (!this.measuredSizes.delete(nodeId)) return;
    this.measuredSizesVersion++;
    this.measuredSizeListeners.forEach(cb => {
      cb();
    });
  }

  // ── Convenience selection helpers ──

  /** True when a node id is currently selected. */
  isNodeSelected(id: string): boolean {
    return this.selection.nodes.includes(id);
  }

  /** True when an edge id is currently selected. */
  isEdgeSelected(id: string): boolean {
    return this.selection.edges.includes(id);
  }

  /** True when a group id is currently selected. */
  isGroupSelected(id: string): boolean {
    return this.selection.groups.includes(id);
  }
}

// ─── Connected-ports index ───

/**
 * Key for the connected-ports set. Uses a NUL separator so node / port ids
 * containing dots or dashes can't collide (`"a.b" + "c"` vs `"a" + "b.c"`).
 */
function portKey(node: string, port: string): string {
  return `${node}\u0000${port}`;
}

/** Build the set of `"${node}\0${port}"` keys referenced by any edge. */
function computeConnectedPorts(
  edges: ReadonlyArray<NodeGraphEdge>
): Set<string> {
  const set = new Set<string>();
  for (const edge of edges) {
    set.add(portKey(edge.source.node, edge.source.port));
    set.add(portKey(edge.target.node, edge.target.port));
  }
  return set;
}

function connectedSetsEqual(
  a: ReadonlySet<string>,
  b: ReadonlySet<string>
): boolean {
  if (a === b) return true;
  if (a.size !== b.size) return false;
  for (const key of a) {
    if (!b.has(key)) return false;
  }
  return true;
}

// ─── Equality helpers (shallow, identity-aware) ───

function arrEqual<T>(a: ReadonlyArray<T>, b: ReadonlyArray<T>): boolean {
  if (a === b) return true;
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}

function setEqual<T>(a: ReadonlySet<T>, b: ReadonlySet<T>): boolean {
  if (a === b) return true;
  if (a.size !== b.size) return false;
  for (const item of a) {
    if (!b.has(item)) return false;
  }
  return true;
}

const EMPTY_NODE_ID_SET: ReadonlySet<string> = new Set<string>();

/**
 * Node ids whose drag delta could be affected by the given interaction
 * state — used by `setInteraction` to fan out per-node notifications.
 * Idle / connect / marquee / resize-group don't move nodes, so they
 * return the empty set (no per-node subscriber needs waking).
 */
function getDragAffectedNodeIds(
  state: NodeGraphInteractionState
): ReadonlySet<string> {
  if (state.kind === 'drag-nodes') return state.nodeIds;
  if (state.kind === 'drag-groups') return state.containedNodeIds;
  return EMPTY_NODE_ID_SET;
}

function selectionEqual(a: NodeGraphSelection, b: NodeGraphSelection): boolean {
  return (
    arrEqual(a.nodes, b.nodes) &&
    arrEqual(a.edges, b.edges) &&
    arrEqual(a.groups, b.groups)
  );
}

function pointEqual(a: Point2D, b: Point2D): boolean {
  return a.x === b.x && a.y === b.y;
}

function portRefEqual(
  a: NodeGraphPortRef | null,
  b: NodeGraphPortRef | null
): boolean {
  if (a === b) return true;
  if (!a || !b) return false;
  return a.node === b.node && a.port === b.port;
}

function interactionEqual(
  a: NodeGraphInteractionState,
  b: NodeGraphInteractionState
): boolean {
  if (a === b) return true;
  if (a.kind !== b.kind) return false;
  switch (a.kind) {
    case 'idle':
      return true;
    case 'drag-nodes': {
      const bx = b as Extract<
        NodeGraphInteractionState,
        { kind: 'drag-nodes' }
      >;
      return (
        setEqual(a.nodeIds, bx.nodeIds) &&
        pointEqual(a.startWorld, bx.startWorld) &&
        pointEqual(a.delta, bx.delta)
      );
    }
    case 'drag-groups': {
      const bx = b as Extract<
        NodeGraphInteractionState,
        { kind: 'drag-groups' }
      >;
      return (
        setEqual(a.groupIds, bx.groupIds) &&
        setEqual(a.containedNodeIds, bx.containedNodeIds) &&
        pointEqual(a.startWorld, bx.startWorld) &&
        pointEqual(a.delta, bx.delta) &&
        a.blocked === bx.blocked
      );
    }
    case 'resize-group': {
      const bx = b as Extract<
        NodeGraphInteractionState,
        { kind: 'resize-group' }
      >;
      return (
        a.groupId === bx.groupId &&
        a.handle === bx.handle &&
        a.startBounds.x === bx.startBounds.x &&
        a.startBounds.y === bx.startBounds.y &&
        a.startBounds.width === bx.startBounds.width &&
        a.startBounds.height === bx.startBounds.height &&
        pointEqual(a.delta, bx.delta) &&
        a.blocked === bx.blocked
      );
    }
    case 'connect': {
      const bx = b as Extract<NodeGraphInteractionState, { kind: 'connect' }>;
      return (
        portRefEqual(a.source, bx.source) &&
        pointEqual(a.currentWorld, bx.currentWorld) &&
        portRefEqual(a.candidate, bx.candidate) &&
        a.invalid === bx.invalid &&
        a.reconnectEdgeId === bx.reconnectEdgeId &&
        a.reconnectEnd === bx.reconnectEnd
      );
    }
    case 'marquee': {
      const bx = b as Extract<NodeGraphInteractionState, { kind: 'marquee' }>;
      return (
        pointEqual(a.startWorld, bx.startWorld) &&
        pointEqual(a.currentWorld, bx.currentWorld) &&
        a.additive === bx.additive
      );
    }
    default:
      return false;
  }
}

function hoverEqual(a: NodeGraphHoverState, b: NodeGraphHoverState): boolean {
  return (
    a.hoveredNodeId === b.hoveredNodeId &&
    a.hoveredEdgeId === b.hoveredEdgeId &&
    portRefEqual(a.hoveredPort, b.hoveredPort)
  );
}

/**
 * Compute the rectangle of a marquee interaction in world coordinates,
 * normalized so width/height are non-negative.
 */
export function marqueeWorldRect(
  state: Extract<NodeGraphInteractionState, { kind: 'marquee' }>
): WorldRect {
  const x = Math.min(state.startWorld.x, state.currentWorld.x);
  const y = Math.min(state.startWorld.y, state.currentWorld.y);
  return {
    x,
    y,
    width: Math.abs(state.currentWorld.x - state.startWorld.x),
    height: Math.abs(state.currentWorld.y - state.startWorld.y),
  };
}
