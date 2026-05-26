'use client';

import React, { useSyncExternalStore } from 'react';
import type { Point2D } from '@/components/primitives/canvas/canvas.types';
import type { NodeGraphEdge } from './NodeGraph.types';
import type { NodeGraphInteractionState } from './NodeGraphStore';
import { useNodeGraphStore } from './NodeGraphContext';
import { resolvePortRef } from './nodeGraphMath';
import { useStoreSlice } from './useStoreSlice';

interface RenderEdgeLabelRef {
  current: ((edge: NodeGraphEdge) => React.ReactNode) | undefined;
}

/** Live drag deltas for an edge's two endpoints during the current gesture. */
interface EdgeEndpointDeltas {
  src: Point2D | null;
  tgt: Point2D | null;
}

// Shared sentinel for "this edge isn't affected by the current gesture" —
// one reference so the equality check below short-circuits cleanly.
const NO_EDGE_DELTAS: EdgeEndpointDeltas = { src: null, tgt: null };

function pointEqualNullable(a: Point2D | null, b: Point2D | null): boolean {
  if (a === b) return true;
  if (a === null || b === null) return false;
  return a.x === b.x && a.y === b.y;
}

function edgeDeltasEqual(
  a: EdgeEndpointDeltas,
  b: EdgeEndpointDeltas
): boolean {
  return pointEqualNullable(a.src, b.src) && pointEqualNullable(a.tgt, b.tgt);
}

/**
 * Live drag delta for an edge's endpoints, or {@link NO_EDGE_DELTAS} when
 * neither endpoint's node is part of the current drag. Mirrors the per-node
 * selector in `NodeGraphNode` so a label only updates when an endpoint it
 * actually owns is moving.
 */
function selectEdgeDeltas(
  interaction: NodeGraphInteractionState,
  sourceNode: string,
  targetNode: string
): EdgeEndpointDeltas {
  let ids: ReadonlySet<string> | null = null;
  let delta: Point2D | null = null;
  if (interaction.kind === 'drag-nodes') {
    ids = interaction.nodeIds;
    delta = interaction.delta;
  } else if (interaction.kind === 'drag-groups') {
    ids = interaction.containedNodeIds;
    delta = interaction.delta;
  }
  if (!ids || !delta) return NO_EDGE_DELTAS;
  const src = ids.has(sourceNode) ? delta : null;
  const tgt = ids.has(targetNode) ? delta : null;
  if (src === null && tgt === null) return NO_EDGE_DELTAS;
  return { src, tgt };
}

/**
 * Mounts one `<EdgeLabel>` per edge as a world-space sibling inside
 * `<ViewportWorld>`. Each label subscribes to the interaction slice on
 * its own so a drag of an unrelated node doesn't re-render every label
 * in the graph — only the labels whose endpoints actually move.
 *
 * One subscriber per edge: each `EdgeLabel` subscribes to the `interaction`
 * slice through `useStoreSlice` with an endpoint-delta selector + equality,
 * so it re-renders only when an endpoint it actually owns moves. Labels on
 * edges untouched by the current gesture short-circuit on the equality check
 * and skip the per-frame re-render entirely.
 */
export function EdgeLabelsLayer({
  renderEdgeLabelRef,
}: {
  renderEdgeLabelRef: RenderEdgeLabelRef;
}): React.ReactElement | null {
  const store = useNodeGraphStore();
  // Subscribe to data + port positions at this level so we know which
  // edges exist. Each `EdgeLabel` below subscribes to interaction on its
  // own for live drag tracking.
  const data = useSyncExternalStore(store.subscribeData, store.getData);
  useSyncExternalStore(
    store.subscribePortPositions,
    store.getPortPositionsVersion
  );

  return (
    <>
      {data.edges.map(edge => (
        <EdgeLabel
          key={edge.id}
          edge={edge}
          renderEdgeLabelRef={renderEdgeLabelRef}
        />
      ))}
    </>
  );
}

function EdgeLabel({
  edge,
  renderEdgeLabelRef,
}: {
  edge: NodeGraphEdge;
  renderEdgeLabelRef: RenderEdgeLabelRef;
}): React.ReactElement | null {
  const store = useNodeGraphStore();
  // Per-edge slice of the interaction state — yields this edge's endpoint
  // deltas (or the shared empty sentinel). Paired with `edgeDeltasEqual`,
  // a drag of nodes this edge doesn't touch leaves the selection equal, so
  // the label bails out of the re-render instead of churning every frame —
  // the same per-id pattern `NodeGraphNode` uses. (A raw interaction
  // subscription re-rendered *every* label on *every* gesture tick.)
  const { src: srcDelta, tgt: tgtDelta } = useStoreSlice<
    NodeGraphInteractionState,
    EdgeEndpointDeltas
  >(
    store.subscribeInteraction,
    store.getInteraction,
    interaction =>
      selectEdgeDeltas(interaction, edge.source.node, edge.target.node),
    edgeDeltasEqual
  );
  // Re-render when port positions update too (initial measure + body
  // re-layout shift the anchor).
  useSyncExternalStore(
    store.subscribePortPositions,
    store.getPortPositionsVersion
  );

  const src = resolvePortRef(
    edge.source,
    store.getNodeById,
    store.getPortPosition
  );
  const tgt = resolvePortRef(
    edge.target,
    store.getNodeById,
    store.getPortPosition
  );
  if (!src || !tgt) return null;

  const sx = src.position.x + (srcDelta?.x ?? 0);
  const sy = src.position.y + (srcDelta?.y ?? 0);
  const tx = tgt.position.x + (tgtDelta?.x ?? 0);
  const ty = tgt.position.y + (tgtDelta?.y ?? 0);
  const midX = (sx + tx) / 2;
  const midY = (sy + ty) / 2;
  const content = renderEdgeLabelRef.current
    ? renderEdgeLabelRef.current(edge)
    : (edge.label ?? null);
  if (content == null || content === false) return null;

  return (
    <div
      style={{
        position: 'absolute',
        left: 0,
        top: 0,
        // World-space position via `transform` so each frame's update is
        // a GPU-friendly transform mutation (no CSS layout). The
        // -50%/-50% piece centres the label on its midpoint.
        transform: `translate3d(${midX}px, ${midY}px, 0) translate(-50%, -50%)`,
        pointerEvents: 'auto',
        willChange: 'transform',
      }}
    >
      {content}
    </div>
  );
}
