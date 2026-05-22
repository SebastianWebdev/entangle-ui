'use client';

import React, {
  useCallback,
  useImperativeHandle,
  useLayoutEffect,
  useMemo,
  useRef,
  useSyncExternalStore,
} from 'react';
import { useControlledState, useLatest } from '@/hooks';
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
import { NodeGraphStore, marqueeWorldRect } from './NodeGraphStore';
import { NodeGraphStoreContext, useNodeGraphStore } from './NodeGraphContext';
import { NodeGraphNodeView } from './NodeGraphNode';
import {
  NodeGraphMinimapInner,
  NodeGraphMinimap,
  NodeGraphBackground,
} from './NodeGraphMinimap';
import {
  buildDrawTheme,
  drawBackground,
  drawConnectionPreview,
  drawEdges,
  drawGroups,
} from './nodeGraphDrawing';
import {
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
import { nodeGraphRootStyle, marqueeStyle } from './NodeGraph.css';

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

type AnySlotElement = React.ReactElement<Record<string, unknown>>;

interface SortedSlots {
  hasBackground: boolean;
  backgroundProps: NodeGraphBackgroundProps | null;
  hasMinimap: boolean;
  minimapProps: NodeGraphMinimapProps | null;
}

type NodeGraphBackgroundProps = React.ComponentProps<
  typeof NodeGraphBackground
>;
type NodeGraphMinimapProps = React.ComponentProps<typeof NodeGraphMinimap>;

function getSlotKind(el: React.ReactElement): NodeGraphSlotKind | null {
  const marker = (el.type as Partial<NodeGraphSlotMarker>)[NODE_GRAPH_SLOT];
  return marker ?? null;
}

function sortSlots(children: React.ReactNode): SortedSlots {
  let backgroundProps: NodeGraphBackgroundProps | null = null;
  let minimapProps: NodeGraphMinimapProps | null = null;
  React.Children.forEach(children, child => {
    if (!React.isValidElement(child)) {
      if (
        process.env['NODE_ENV'] !== 'production' &&
        child != null &&
        child !== false
      ) {
        console.warn(
          '[NodeGraph] children must be <NodeGraph.Minimap /> or <NodeGraph.Background />.'
        );
      }
      return;
    }
    const el = child as AnySlotElement;
    const kind = getSlotKind(el);
    if (kind === 'background') {
      backgroundProps = el.props as unknown as NodeGraphBackgroundProps;
    } else if (kind === 'minimap') {
      minimapProps = el.props as unknown as NodeGraphMinimapProps;
    } else if (process.env['NODE_ENV'] !== 'production') {
      const dn = (el.type as { displayName?: string } | undefined)?.displayName;
      if (dn?.startsWith('NodeGraph.')) {
        console.warn(
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
  defaultNodeSize = DEFAULT_NODE_SIZE,
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
  const [groups] = useControlledState<NodeGraphGroup[]>({
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
  const findHitTarget = useCallback(
    (clientX: number, clientY: number): NodeGraphTarget => {
      const worldPoint = screenToWorldLocal(clientX, clientY);
      // Iterate top-to-bottom so the last-rendered node "wins" — matches what
      // the user sees on top.
      for (let i = nodes.length - 1; i >= 0; i--) {
        const node = nodes[i];
        if (node && isPointInNode(worldPoint, node, defaultNodeSize)) {
          return { kind: 'node', id: node.id };
        }
      }
      for (let i = groups.length - 1; i >= 0; i--) {
        const group = groups[i];
        if (group && isPointInRect(worldPoint, group.bounds)) {
          return { kind: 'group', id: group.id };
        }
      }
      return { kind: 'empty', worldPoint };
    },
    [nodes, groups, defaultNodeSize, screenToWorldLocal]
  );

  // ── Connection drag (ports) ──
  const emitEdges = useCallback(
    (next: NodeGraphEdge[]) => setEdges(next),
    [setEdges]
  );
  const { onPortPointerDown } = useNodeGraphConnection({
    viewportRef: rootRef,
    store,
    getTransform,
    isValidConnection,
    onConnectStart,
    onConnectEnd,
    emitEdgesChange: emitEdges,
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
  };
  const dragRef = useRef<DragSession | null>(null);
  const nodesRef = useLatest(nodes);
  const selectionRef = useLatest(selection);
  const snapToGridRef = useLatest(snapToGrid);
  const setSelectionRef = useLatest(setSelection);
  const setNodesRef = useLatest(setNodes);

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

      dragRef.current = {
        pointerId: event.pointerId,
        clickedNodeId: node.id,
        startScreen,
        startWorld,
        selectionAtStart: currentSelection,
        nodeStartPositions: positions,
        additive,
        didDrag: false,
      };
    },
    [disabled, selectionRef, nodesRef, localScreenPoint, getTransform]
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

  // Document-level pointermove during a node drag.
  useLayoutEffect(() => {
    const handleMove = (e: PointerEvent): void => {
      const session = dragRef.current;
      if (session?.pointerId !== e.pointerId) return;
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
    document.addEventListener('pointermove', handleMove);
    return () => document.removeEventListener('pointermove', handleMove);
  }, [store, localScreenPoint, getTransform, snapToGridRef, nodesRef]);

  // Cancel drag on pointercancel.
  useLayoutEffect(() => {
    const handleCancel = (): void => {
      if (!dragRef.current) return;
      dragRef.current = null;
      store.setInteraction({ kind: 'idle' });
    };
    document.addEventListener('pointercancel', handleCancel);
    return () => document.removeEventListener('pointercancel', handleCancel);
  }, [store]);

  // ── Marquee selection from the Viewport ──
  const handleViewportSelection = useCallback(
    (info: ViewportSelectionEvent): void => {
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
      setSelectionRef.current({
        nodes: nextNodes,
        edges: info.additive ? current.edges : [],
        groups: info.additive ? current.groups : [],
      });
    },
    [store, nodesRef, selectionRef, setSelectionRef, defaultNodeSize]
  );

  // ── Context menu ──
  const onContextMenuRef = useLatest(onContextMenu);
  const handleContextMenu = useCallback(
    (event: React.MouseEvent<HTMLDivElement>): void => {
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
    [findHitTarget, localScreenPoint, getTransform, onContextMenuRef]
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
      const theme = buildDrawTheme(info.theme);
      drawGroups(ctx, info, data, sel, theme);
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
  // Each subscription returns whether the layer's deps changed; the actual
  // redraw is scheduled by ViewportLayer via invalidate(name).
  useLayoutEffect(() => {
    const handle = viewportHandleRef.current;
    if (!handle) return undefined;
    const invalidate = (layer: NodeGraphLayerName): void =>
      handle.invalidate(layer);
    return [
      store.subscribeData(() => {
        invalidate('groups');
        invalidate('edges');
      }),
      store.subscribeSelection(() => {
        invalidate('groups');
        invalidate('edges');
      }),
      store.subscribeHover(() => invalidate('edges')),
      // Interaction drives the in-flight drag delta — both the edges layer
      // (so connectors follow the dragged nodes live, not snap on release)
      // and the preview layer need to redraw on every tick.
      store.subscribeInteraction(() => {
        invalidate('edges');
        invalidate('preview');
      }),
    ].reduce<() => void>(
      (prev, unsub) => () => {
        prev();
        unsub();
      },
      () => undefined
    );
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
            {nodes.map(node => (
              <NodeGraphNodeView
                key={node.id}
                node={node}
                defaultSize={defaultNodeSize}
                zoom={transformRef.current.zoom}
                renderNode={renderNode}
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
          <MarqueeOverlay />
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

// ─── Marquee overlay — drawn in screen space ───

function MarqueeOverlay(): React.ReactElement | null {
  // The Viewport already paints its own marquee — but we keep a hook here in
  // case we ever want a NodeGraph-specific styling override. For now, the
  // Viewport marquee suffices and this component renders nothing.
  return null;
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

// Silence unused import warning — exported re-types referenced elsewhere.
void marqueeStyle;
void marqueeWorldRect;
