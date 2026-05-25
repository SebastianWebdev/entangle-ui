'use client';

import React, { useCallback, useDeferredValue, useMemo, useRef } from 'react';
import { assignInlineVars } from '@vanilla-extract/dynamic';
import { useResizeObserver } from '@/hooks';
import { cx } from '@/utils/cx';
import { useViewportStore } from '@/components/primitives/viewport/ViewportContext';
import type { Point2D } from '@/components/primitives/canvas/canvas.types';
import {
  defaultNodeBodyRecipe,
  nodeHeightVar,
  nodeWidthVar,
  nodeWrapperRecipe,
} from './NodeGraph.css';
import type { NodeGraphNode, NodeGraphRenderCtx } from './NodeGraph.types';
import { useNodeGraphStore } from './NodeGraphContext';
import {
  NodeGraphNodeContext,
  type NodeGraphNodeContextValue,
} from './NodeGraphNodeContext';
import { useStoreSlice } from './useStoreSlice';

interface NodeGraphNodeViewProps {
  node: NodeGraphNode;
  renderNode?: (
    node: NodeGraphNode,
    ctx: NodeGraphRenderCtx
  ) => React.ReactNode;
  /** Pointer-down on the node body (drag / select). */
  onBodyPointerDown: (
    event: React.PointerEvent<HTMLDivElement>,
    node: NodeGraphNode
  ) => void;
  /** Pointer-up on the node body (used to detect plain clicks for selection). */
  onBodyPointerUp: (
    event: React.PointerEvent<HTMLDivElement>,
    node: NodeGraphNode
  ) => void;
  /** Pointer-down on a port (starts a connection drag). */
  onPortPointerDown: (
    event: React.PointerEvent<HTMLElement>,
    nodeId: string,
    portId: string
  ) => void;
  /** Native context menu (right-click) — dispatched up to the main component. */
  onBodyContextMenu: (
    event: React.MouseEvent<HTMLDivElement>,
    node: NodeGraphNode
  ) => void;
}

function DefaultNodeBody({
  node,
  selected,
}: {
  node: NodeGraphNode;
  selected: boolean;
}): React.ReactElement {
  let label = node.id;
  if (
    node.data !== null &&
    typeof node.data === 'object' &&
    'label' in node.data
  ) {
    const candidate = (node.data as { label?: unknown }).label;
    if (typeof candidate === 'string') label = candidate;
  }
  return (
    <div className={defaultNodeBodyRecipe({ selected })}>
      <span>{label}</span>
    </div>
  );
}

function pointEqualNullable(a: Point2D | null, b: Point2D | null): boolean {
  if (a === b) return true;
  if (a === null || b === null) return false;
  return a.x === b.x && a.y === b.y;
}

/**
 * Internal — render a single node as an HTML element positioned in world
 * space. Connection endpoints live inside the consumer's `renderNode`
 * tree as `<NodeGraph.Port>` slots; this view just provides the wrapper,
 * the `NodeGraphNodeContext`, and the ResizeObserver that feeds the
 * node's measured size back to the store.
 *
 * Subscribes to per-id slices via `useStoreSlice` so each node re-renders
 * only when its own selection / drag delta / hover state changes — not on
 * every pointermove tick of an unrelated drag.
 *
 * Wrapped in `React.memo` so a parent re-render (e.g. caused by an
 * unrelated controlled-state update) doesn't cascade through every
 * mounted node. Stable identity for the parent-provided handlers
 * (`onBodyPointerDown`, etc.) is ensured by `useCallback` in
 * `NodeGraphImpl`; `node` identity is preserved by consumer immutability.
 */
function NodeGraphNodeViewImpl(
  props: NodeGraphNodeViewProps
): React.ReactElement {
  const {
    node,
    renderNode,
    onBodyPointerDown,
    onBodyPointerUp,
    onPortPointerDown,
    onBodyContextMenu,
  } = props;
  const store = useNodeGraphStore();
  const viewportStore = useViewportStore();
  const wrapperRef = useRef<HTMLDivElement>(null);

  const selected = useStoreSlice(
    store.subscribeSelection,
    store.getSelection,
    sel => sel.nodes.includes(node.id)
  );

  const dragDelta = useStoreSlice<
    ReturnType<typeof store.getInteraction>,
    Point2D | null
  >(
    store.subscribeInteraction,
    store.getInteraction,
    interaction => {
      if (
        interaction.kind === 'drag-nodes' &&
        interaction.nodeIds.includes(node.id)
      ) {
        return interaction.delta;
      }
      // Nodes fully contained inside a dragged group move with the group.
      if (
        interaction.kind === 'drag-groups' &&
        interaction.containedNodeIds.includes(node.id)
      ) {
        return interaction.delta;
      }
      return null;
    },
    pointEqualNullable
  );
  const dragging = dragDelta !== null;

  const hovered = useStoreSlice(
    store.subscribeHover,
    store.getHover,
    hover => hover.hoveredNodeId === node.id
  );

  const liveZoom = useStoreSlice(
    viewportStore.subscribeTransform,
    viewportStore.getTransform,
    transform => transform.zoom
  );
  // Defer the zoom value passed into consumer renderNode so heavy node
  // bodies don't block the pointer gesture loop during a zoom-while-drag.
  const zoom = useDeferredValue(liveZoom);

  // ── Auto-size: feed measured wrapper size back to the store ──
  //
  // When the consumer omits `node.width`/`height`, the library reads the
  // measured DOM size for hit-testing, marquee, and fitToContent. Explicit
  // overrides on the node still win — this just records the rendered size.
  useResizeObserver(wrapperRef, entry => {
    store.setMeasuredSize(node.id, {
      width: entry.contentRect.width,
      height: entry.contentRect.height,
    });
  });

  const explicitWidth = node.width;
  const explicitHeight = node.height;
  const autoSize = explicitWidth === undefined && explicitHeight === undefined;
  const draggable = node.draggable !== false;
  const selectable = node.selectable !== false;

  const wrapperStyle = useMemo<React.CSSProperties>(() => {
    const x = node.position.x + (dragDelta?.x ?? 0);
    const y = node.position.y + (dragDelta?.y ?? 0);
    // assignInlineVars only emits the keys it's given — when explicit
    // dimensions are absent the auto-sized recipe variant kicks in.
    const dimensionVars: Record<string, string> = {};
    if (explicitWidth !== undefined) {
      dimensionVars[nodeWidthVar] = `${explicitWidth}px`;
    }
    if (explicitHeight !== undefined) {
      dimensionVars[nodeHeightVar] = `${explicitHeight}px`;
    }
    return {
      transform: `translate(${x}px, ${y}px)`,
      ...assignInlineVars(dimensionVars),
    };
  }, [
    node.position.x,
    node.position.y,
    dragDelta?.x,
    dragDelta?.y,
    explicitWidth,
    explicitHeight,
  ]);

  const renderCtx: NodeGraphRenderCtx = {
    selected,
    dragging,
    hovered,
    zoom,
  };

  const body = renderNode ? (
    renderNode(node, renderCtx)
  ) : (
    <DefaultNodeBody node={node} selected={selected} />
  );

  // ── Hover wiring ──
  const onPointerEnter = useCallback((): void => {
    const current = store.getHover();
    if (current.hoveredNodeId === node.id) return;
    store.setHover({ ...current, hoveredNodeId: node.id });
  }, [store, node.id]);

  const onPointerLeave = useCallback((): void => {
    const current = store.getHover();
    if (current.hoveredNodeId !== node.id) return;
    store.setHover({ ...current, hoveredNodeId: null });
  }, [store, node.id]);

  // ── Per-node context for `<NodeGraph.Port>` slots ──
  const nodeContext = useMemo<NodeGraphNodeContextValue>(
    () => ({
      nodeId: node.id,
      onPortPointerDown: (event, portId) =>
        onPortPointerDown(event, node.id, portId),
    }),
    [node.id, onPortPointerDown]
  );

  return (
    <div
      ref={wrapperRef}
      className={cx(
        nodeWrapperRecipe({
          draggable,
          selectable,
          dragging,
          autoSize,
        })
      )}
      style={wrapperStyle}
      data-node-id={node.id}
      data-hovered={hovered ? 'true' : undefined}
      data-selected={selected ? 'true' : undefined}
      data-dragging={dragging ? 'true' : undefined}
      onPointerDown={e => onBodyPointerDown(e, node)}
      onPointerUp={e => onBodyPointerUp(e, node)}
      onPointerEnter={onPointerEnter}
      onPointerLeave={onPointerLeave}
      onContextMenu={e => onBodyContextMenu(e, node)}
    >
      <NodeGraphNodeContext.Provider value={nodeContext}>
        {body}
      </NodeGraphNodeContext.Provider>
    </div>
  );
}

export const NodeGraphNodeView = React.memo(NodeGraphNodeViewImpl);
NodeGraphNodeView.displayName = 'NodeGraphNodeView';
