'use client';

import React, { useMemo, useSyncExternalStore } from 'react';
import { assignInlineVars } from '@vanilla-extract/dynamic';
import { cx } from '@/utils/cx';
import {
  defaultNodeBodyRecipe,
  nodeHeightVar,
  nodeWidthVar,
  nodeWrapperRecipe,
} from './NodeGraph.css';
import type {
  NodeGraphNode,
  NodeGraphPort,
  NodeGraphPortSide,
  NodeGraphRenderCtx,
} from './NodeGraph.types';
import { NodeGraphPortView } from './NodeGraphPort';
import { useNodeGraphStore } from './NodeGraphContext';
import { resolvePortOffsets } from './nodeGraphMath';

interface NodeGraphNodeViewProps {
  node: NodeGraphNode;
  defaultSize: { width: number; height: number };
  zoom: number;
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
    event: React.PointerEvent<HTMLDivElement>,
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

/**
 * Internal — render a single node as an HTML element positioned in world
 * space. Ports are absolutely positioned around the wrapper using
 * percentage offsets relative to the wrapper size.
 *
 * Subscribes to selection, interaction (drag delta) and hover slices —
 * each subscription only triggers a re-render of this node when *its*
 * state changes.
 */
export function NodeGraphNodeView(
  props: NodeGraphNodeViewProps
): React.ReactElement {
  const {
    node,
    defaultSize,
    zoom,
    renderNode,
    onBodyPointerDown,
    onBodyPointerUp,
    onPortPointerDown,
    onBodyContextMenu,
  } = props;
  const store = useNodeGraphStore();

  const selection = useSyncExternalStore(
    store.subscribeSelection,
    store.getSelection
  );
  const interaction = useSyncExternalStore(
    store.subscribeInteraction,
    store.getInteraction
  );
  const hover = useSyncExternalStore(store.subscribeHover, store.getHover);

  const selected = selection.nodes.includes(node.id);
  const dragging =
    interaction.kind === 'drag-nodes' && interaction.nodeIds.includes(node.id);
  const hovered = hover.hoveredNodeId === node.id;
  const dragDelta =
    interaction.kind === 'drag-nodes' && interaction.nodeIds.includes(node.id)
      ? interaction.delta
      : null;

  const width = node.width ?? defaultSize.width;
  const height = node.height ?? defaultSize.height;

  const draggable = node.draggable !== false;
  const selectable = node.selectable !== false;

  const wrapperStyle = useMemo<React.CSSProperties>(() => {
    const x = node.position.x + (dragDelta?.x ?? 0);
    const y = node.position.y + (dragDelta?.y ?? 0);
    return {
      transform: `translate(${x}px, ${y}px)`,
      ...assignInlineVars({
        [nodeWidthVar]: `${width}px`,
        [nodeHeightVar]: `${height}px`,
      }),
    };
  }, [
    node.position.x,
    node.position.y,
    dragDelta?.x,
    dragDelta?.y,
    width,
    height,
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

  // Resolve port offsets per side so port positioning stays consistent
  // between the rendering layer and the math layer.
  const portsBySide = useMemo<
    Record<NodeGraphPortSide, Array<{ port: NodeGraphPort; offset: number }>>
  >(() => {
    const result: Record<
      NodeGraphPortSide,
      Array<{ port: NodeGraphPort; offset: number }>
    > = { left: [], right: [], top: [], bottom: [] };
    if (!node.ports) return result;
    const sides: NodeGraphPortSide[] = ['left', 'right', 'top', 'bottom'];
    for (const side of sides) {
      const sidePorts = node.ports.filter(p => p.side === side);
      const offsets = resolvePortOffsets(sidePorts);
      result[side] = sidePorts.map((port, i) => ({
        port,
        offset: offsets[i] ?? 0.5,
      }));
    }
    return result;
  }, [node.ports]);

  return (
    <div
      className={cx(
        nodeWrapperRecipe({
          draggable,
          selectable,
          dragging,
        })
      )}
      style={wrapperStyle}
      data-node-id={node.id}
      data-hovered={hovered ? 'true' : undefined}
      onPointerDown={e => onBodyPointerDown(e, node)}
      onPointerUp={e => onBodyPointerUp(e, node)}
      onContextMenu={e => onBodyContextMenu(e, node)}
    >
      {body}
      {(['left', 'right', 'top', 'bottom'] as const).map(side =>
        portsBySide[side].map(({ port, offset }) => (
          <NodeGraphPortView
            key={port.id}
            nodeId={node.id}
            port={port}
            offset={offset}
            onStartConnection={e => onPortPointerDown(e, node.id, port.id)}
          />
        ))
      )}
    </div>
  );
}
