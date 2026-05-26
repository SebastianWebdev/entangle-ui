'use client';

import React, {
  useCallback,
  useImperativeHandle,
  useLayoutEffect,
  useMemo,
  useRef,
  useTransition,
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
  NodeGraphTarget,
} from './NodeGraph.types';
import { sortSlots } from './sortSlots';
import { NodeGraphStore } from './NodeGraphStore';
import { NodeGraphStoreContext } from './NodeGraphContext';
import { NodeGraphNodeView } from './NodeGraphNode';
import { NodeGraphGroupView } from './NodeGraphGroup';
import { NodeGraphMinimapInner } from './NodeGraphMinimap';
import {
  NodeGraphBackground,
  NodeGraphMinimap,
  NodeGraphSpawnPalette,
  NodeGraphToolbar,
} from './NodeGraphSlots';
import { NodeGraphSpawnPaletteInner } from './NodeGraphSpawnPalette';
import {
  NodeGraphToolbarInner,
  NodeGraphFitContentButton,
  NodeGraphFitSelectionButton,
  NodeGraphZoomInButton,
  NodeGraphZoomOutButton,
  NodeGraphResetZoomButton,
  NodeGraphToolbarSeparator,
} from './NodeGraphToolbar';
import { NodeGraphPort } from './NodeGraphPort';
import { NodeGraphPortVisual } from './NodeGraphPortVisual';
import { NodeGraphPin } from './NodeGraphPin';
import { NodeGraphNodeSection } from './NodeGraphNodeSection';
import { EdgeLabelsLayer } from './NodeGraphEdgeLabels';
import {
  NodeGraphNodeBody,
  NodeGraphNodeHeader,
  NodeGraphPinList,
  NodeGraphPinRow,
} from './NodeGraphNodeParts';
import {
  buildDrawTheme,
  drawBackground,
  drawConnectionPreview,
  drawEdges,
  drawGroups,
} from './nodeGraphDrawing';
import {
  computeNodesBounds,
  findEdgeAtPoint,
  getNodeBox,
  isPointInNode,
  isPointInRect,
  rectsIntersect,
  resolvePortRef,
  toggleSelected,
} from './nodeGraphMath';
import { useNodeGraphConnection } from './useNodeGraphConnection';
import { useNodeGraphKeyboard } from './useNodeGraphKeyboard';
import { useNodeGraphNodeDrag } from './useNodeGraphNodeDrag';
import { useNodeGraphGroupDrag } from './useNodeGraphGroupDrag';
import {
  useNodeGraphEdgeInteraction,
  EDGE_HIT_PX,
} from './useNodeGraphEdgeInteraction';
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
  edgeStyle,
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
        if (
          node &&
          isPointInNode(
            worldPoint,
            node,
            store.getMeasuredSize(node.id),
            defaultNodeSize
          )
        ) {
          return { kind: 'node', id: node.id };
        }
      }
      // Edges sit above groups / background but below nodes, so hit-test them
      // after nodes and before groups. Drawn on a canvas → no DOM to walk.
      const edgeThreshold = EDGE_HIT_PX / (getTransform().zoom || 1);
      const edgeId = findEdgeAtPoint(
        worldPoint,
        store.getData().edges,
        store.getNodeById,
        store.getPortPosition,
        edgeThreshold
      );
      if (edgeId) return { kind: 'edge', id: edgeId };
      for (let i = currentGroups.length - 1; i >= 0; i--) {
        const group = currentGroups[i];
        if (group && isPointInRect(worldPoint, group.bounds)) {
          return { kind: 'group', id: group.id };
        }
      }
      return { kind: 'empty', worldPoint };
    },
    [
      defaultNodeSize,
      screenToWorldLocal,
      nodesRef,
      groupsRef,
      store,
      getTransform,
    ]
  );

  // ── Connection drag (ports) ──
  const { onPortPointerDown, onEdgeReconnectStart } = useNodeGraphConnection({
    viewportRef: rootRef,
    store,
    getTransform,
    isValidConnection,
    onConnectStart,
    onConnectEnd,
    emitEdgesChange: setEdges,
    emitSelectionChange: setSelection,
  });

  // ── Node body pointerdown — drag (single/multi) + select on release ──
  const { onNodeBodyPointerDown, onNodeBodyPointerUp } = useNodeGraphNodeDrag({
    store,
    getTransform,
    localScreenPoint,
    snapToGrid,
    disabled,
    emitNodesChange: setNodes,
    emitSelectionChange: setSelection,
  });

  // ── Group interaction (drag + resize + click-select) ──
  const setGroupsRef = useLatest(setGroups);
  const {
    onGroupBodyPointerDown,
    onGroupHandlePointerDown,
    onGroupBodyPointerUp,
  } = useNodeGraphGroupDrag({
    store,
    getTransform,
    localScreenPoint,
    snapToGrid,
    disabled,
    defaultNodeSize,
    emitGroupsChange: setGroups,
    emitNodesChange: setNodes,
    emitSelectionChange: setSelection,
  });

  // ── Group label / colour edits ──
  //
  // The library's group overlay owns the inline label editor and the
  // colour swatch — these handlers translate UI commits into a controlled
  // `onGroupsChange` emission so the consumer receives the full next
  // groups array, same as every other group mutation.
  const handleGroupLabelChange = useCallback(
    (group: NodeGraphGroup, nextLabel: string): void => {
      const trimmed = nextLabel.trim();
      const nextGroups = groupsRef.current.map(g => {
        if (g.id !== group.id) return g;
        if ((g.label ?? '') === trimmed) return g;
        if (trimmed === '') {
          // Empty label collapses back to `undefined` so the default
          // "Group" placeholder shows up cleanly on next render.
          const { label: _omit, ...rest } = g;
          void _omit;
          return rest;
        }
        return { ...g, label: trimmed };
      });
      setGroupsRef.current(nextGroups);
    },
    [groupsRef, setGroupsRef]
  );

  const handleGroupColorChange = useCallback(
    (group: NodeGraphGroup, nextColor: string): void => {
      if (group.color === nextColor) return;
      const nextGroups = groupsRef.current.map(g =>
        g.id === group.id ? { ...g, color: nextColor } : g
      );
      setGroupsRef.current(nextGroups);
    },
    [groupsRef, setGroupsRef]
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

      // A near-zero-area rect is a plain click, not a drag. Use it to select
      // an edge — edges are drawn on a canvas and never receive the pointer
      // event directly, so this is where edge clicks are resolved. Falls
      // through to the normal node-marquee / clear path when no edge is hit.
      const zoom = getTransform().zoom || 1;
      const isClick =
        rect.width * zoom <= EDGE_HIT_PX && rect.height * zoom <= EDGE_HIT_PX;
      if (isClick) {
        const edgeId = findEdgeAtPoint(
          { x: rect.x, y: rect.y },
          store.getData().edges,
          store.getNodeById,
          store.getPortPosition,
          EDGE_HIT_PX / zoom
        );
        if (edgeId) {
          const current = selectionRef.current;
          setSelectionRef.current({
            nodes: info.additive ? current.nodes : [],
            edges: toggleSelected(current.edges, edgeId, info.additive),
            groups: info.additive ? current.groups : [],
          });
          return;
        }
      }

      const hits: string[] = [];
      for (const node of nodesRef.current) {
        const box = getNodeBox(
          node,
          store.getMeasuredSize(node.id),
          defaultNodeSize
        );
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
      getTransform,
    ]
  );

  // ── Context menu ──
  const onContextMenuRef = useLatest(onContextMenu);
  const handleContextMenu = useCallback(
    (event: React.MouseEvent<HTMLDivElement>): void => {
      if (disabledRef.current) return;
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
      // Consumer callback fires first — they may render their own menu,
      // log telemetry, etc.
      onContextMenuRef.current?.(info);
      // SpawnPalette subscribers (if mounted) get pinged for empty /
      // group targets: those are the "drop a new node here" spots.
      if (resolvedTarget.kind === 'empty' || resolvedTarget.kind === 'group') {
        store.requestSpawn({ worldPoint, screenPoint });
      }
    },
    [
      findHitTarget,
      localScreenPoint,
      getTransform,
      onContextMenuRef,
      disabledRef,
      store,
    ]
  );

  // ── Edge hover + endpoint grab (canvas edges → pointer hit-test) ──
  const { onRootPointerMove, onRootPointerLeave, onRootPointerDownCapture } =
    useNodeGraphEdgeInteraction({
      store,
      getTransform,
      screenToWorldLocal,
      localScreenPoint,
      onEdgeReconnectStart,
      disabled,
    });

  // ── Delete ──
  //
  // Without a consumer-supplied `onDelete`, the library cascades the
  // selection through nodes / edges / groups automatically: nodes get
  // removed, edges are filtered out when either endpoint is gone (or
  // when the edge itself is selected), groups in the selection drop.
  // Saves every consumer the same 8-line filter and avoids the classic
  // "I forgot to clean up orphan edges" bug.
  //
  // If the consumer provides `onDelete`, they take over completely —
  // they can still call the exported `applyCascadeDelete` helper to do
  // the same filtering plus their own snapshot / undo / confirmation
  // logic on top.
  const handleDeleteInternal = useCallback(
    (sel: NodeGraphSelection): void => {
      if (onDelete) {
        onDelete(sel);
        return;
      }
      const currentNodes = nodesRef.current;
      const currentEdges = store.getData().edges;
      const currentGroups = groupsRef.current;
      const removedNodeIds = new Set(sel.nodes);
      const removedEdgeIds = new Set(sel.edges);
      const removedGroupIds = new Set(sel.groups);
      if (
        removedNodeIds.size === 0 &&
        removedEdgeIds.size === 0 &&
        removedGroupIds.size === 0
      ) {
        return;
      }
      if (removedNodeIds.size > 0) {
        setNodesRef.current(
          currentNodes.filter(n => !removedNodeIds.has(n.id))
        );
      }
      const nextEdges = currentEdges.filter(
        e =>
          !removedEdgeIds.has(e.id) &&
          !removedNodeIds.has(e.source.node) &&
          !removedNodeIds.has(e.target.node)
      );
      if (nextEdges.length !== currentEdges.length) {
        setEdges(nextEdges);
      }
      if (removedGroupIds.size > 0) {
        setGroupsRef.current(
          currentGroups.filter(g => !removedGroupIds.has(g.id))
        );
      }
      setSelectionRef.current({ nodes: [], edges: [], groups: [] });
    },
    [
      onDelete,
      store,
      nodesRef,
      groupsRef,
      setNodesRef,
      setGroupsRef,
      setSelectionRef,
      setEdges,
    ]
  );

  // ── Keyboard ──
  const { onKeyDown } = useNodeGraphKeyboard({
    store,
    emitNodesChange: setNodes,
    emitSelectionChange: setSelection,
    onDelete: handleDeleteInternal,
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

  const edgeStyleRef = useLatest(edgeStyle);
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
      drawEdges(
        ctx,
        info,
        data,
        sel,
        hover.hoveredEdgeId,
        interaction,
        store.getNodeById,
        store.getPortPosition,
        edgeStyleRef.current,
        theme
      );
    },
    [store, edgeStyleRef]
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
        portRef => {
          const resolved = resolvePortRef(
            portRef,
            store.getNodeById,
            store.getPortPosition
          );
          if (!resolved) return null;
          return { position: resolved.position, side: resolved.side };
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
      // Port positions (re)registered by `<NodeGraph.Port>` slots — edges
      // anchor at the registered point, so any change must redraw.
      store.subscribePortPositions(() => invalidate('edges')),
      // Measured node sizes feed the marquee / hit-test bounds — no canvas
      // redraw needed, but subscribe so React-side reads in renderers see
      // the updates if they depend on it.
      store.subscribeMeasuredSizes(() => undefined),
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
        const bounds = computeNodesBounds(
          nodesRef.current,
          store.getMeasuredSize,
          defaultNodeSize
        );
        if (bounds.width === 0 && bounds.height === 0) return;
        vp.fitToContent(bounds, padding ?? 32);
      },
      fitToSelection: padding => {
        const vp = viewportHandleRef.current;
        if (!vp) return;
        const sel = selectionRef.current.nodes;
        if (sel.length === 0) return;
        const selectedIds = new Set(sel);
        const selectedNodes = nodesRef.current.filter(n =>
          selectedIds.has(n.id)
        );
        const bounds = computeNodesBounds(
          selectedNodes,
          store.getMeasuredSize,
          defaultNodeSize
        );
        if (bounds.width === 0 && bounds.height === 0) return;
        vp.fitToContent(bounds, padding ?? 64);
      },
      focusNode: idStr => {
        const vp = viewportHandleRef.current;
        if (!vp) return;
        const node = store.getNodeById(idStr);
        if (!node) return;
        const box = getNodeBox(
          node,
          store.getMeasuredSize(node.id),
          defaultNodeSize
        );
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
    [nodesRef, selectionRef, defaultNodeSize, getTransform, store]
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
        onPointerDownCapture={onRootPointerDownCapture}
        onPointerMove={onRootPointerMove}
        onPointerLeave={onRootPointerLeave}
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
                onLabelChange={handleGroupLabelChange}
                onColorChange={handleGroupColorChange}
              />
            ))}
            {nodes.map(node => (
              <NodeGraphNodeView
                key={node.id}
                node={node}
                renderNode={renderNode}
                onBodyPointerDown={onNodeBodyPointerDown}
                onBodyPointerUp={onNodeBodyPointerUp}
                onPortPointerDown={onPortPointerDown}
                onBodyContextMenu={handleContextMenu}
              />
            ))}
            <EdgeLabelsLayer
              renderEdgeLabelRef={renderEdgeLabelRef}
              hasRenderEdgeLabel={renderEdgeLabel !== undefined}
            />
          </ViewportWorld>
          <ViewportLayer name="preview" draw={drawPreviewLayer} />
          {slots.hasMinimap || slots.toolbars.length > 0 ? (
            <ViewportOverlay>
              {slots.hasMinimap ? (
                <NodeGraphMinimapInner {...(slots.minimapProps ?? {})} />
              ) : null}
              {slots.toolbars.map((toolbarProps, i) => (
                <NodeGraphToolbarInner
                  // Placement is part of the identity — multiple toolbars
                  // in the same NodeGraph use different placements as
                  // their natural key.
                  key={toolbarProps.placement ?? `toolbar-${i}`}
                  {...toolbarProps}
                />
              ))}
            </ViewportOverlay>
          ) : null}
        </Viewport>
        {/* SpawnPalette renders in a portal (via CommandPalette) so it
            sits at the React tree root, outside the Viewport. Subscribes
            to the store's spawn-request channel for right-click triggers. */}
        {slots.spawnPaletteProps ? (
          <NodeGraphSpawnPaletteInner {...slots.spawnPaletteProps} />
        ) : null}
      </div>
    </NodeGraphStoreContext.Provider>
  );
};

// ─── Compound exports ───

type NodeGraphCompound = typeof NodeGraphImpl & {
  Minimap: typeof NodeGraphMinimap;
  Background: typeof NodeGraphBackground;
  Port: typeof NodeGraphPort;
  PortVisual: typeof NodeGraphPortVisual;
  Pin: typeof NodeGraphPin;
  NodeBody: typeof NodeGraphNodeBody;
  NodeHeader: typeof NodeGraphNodeHeader;
  NodeSection: typeof NodeGraphNodeSection;
  PinList: typeof NodeGraphPinList;
  PinRow: typeof NodeGraphPinRow;
  Toolbar: typeof NodeGraphToolbar;
  ToolbarSeparator: typeof NodeGraphToolbarSeparator;
  FitContentButton: typeof NodeGraphFitContentButton;
  FitSelectionButton: typeof NodeGraphFitSelectionButton;
  ZoomInButton: typeof NodeGraphZoomInButton;
  ZoomOutButton: typeof NodeGraphZoomOutButton;
  ResetZoomButton: typeof NodeGraphResetZoomButton;
  SpawnPalette: typeof NodeGraphSpawnPalette;
};

NodeGraphImpl.displayName = 'NodeGraph';

const NodeGraphWithSlots = NodeGraphImpl as NodeGraphCompound;
NodeGraphWithSlots.Minimap = NodeGraphMinimap;
NodeGraphWithSlots.Background = NodeGraphBackground;
NodeGraphWithSlots.Port = NodeGraphPort;
NodeGraphWithSlots.PortVisual = NodeGraphPortVisual;
NodeGraphWithSlots.Pin = NodeGraphPin;
NodeGraphWithSlots.NodeBody = NodeGraphNodeBody;
NodeGraphWithSlots.NodeHeader = NodeGraphNodeHeader;
NodeGraphWithSlots.NodeSection = NodeGraphNodeSection;
NodeGraphWithSlots.PinList = NodeGraphPinList;
NodeGraphWithSlots.PinRow = NodeGraphPinRow;
NodeGraphWithSlots.Toolbar = NodeGraphToolbar;
NodeGraphWithSlots.ToolbarSeparator = NodeGraphToolbarSeparator;
NodeGraphWithSlots.FitContentButton = NodeGraphFitContentButton;
NodeGraphWithSlots.FitSelectionButton = NodeGraphFitSelectionButton;
NodeGraphWithSlots.ZoomInButton = NodeGraphZoomInButton;
NodeGraphWithSlots.ZoomOutButton = NodeGraphZoomOutButton;
NodeGraphWithSlots.ResetZoomButton = NodeGraphResetZoomButton;
NodeGraphWithSlots.SpawnPalette = NodeGraphSpawnPalette;

export const NodeGraph = NodeGraphWithSlots;
