'use client';

import React, { useCallback, useSyncExternalStore } from 'react';

import { useNodeGraphStore } from './NodeGraphContext';
import { resolvePortRef } from './nodeGraphMath';
import { useStoreSlice } from './useStoreSlice';

import type { NodeGraphEdge } from './NodeGraph.types';
import type { NodeGraphInteractionState } from './NodeGraphStore';
import type { Point2D } from '@/components/primitives/canvas/canvas.types';

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
  hasRenderEdgeLabel,
}: {
  renderEdgeLabelRef: RenderEdgeLabelRef;
  /**
   * Whether the consumer supplied a `renderEdgeLabel` callback. When `false`,
   * edges without an explicit `edge.label` prop are skipped — no `EdgeLabel`
   * subscriber is mounted for them. This avoids the cost of one interaction-
   * slice subscriber per edge in graphs that don't use labels at all (the
   * benchmark, simple recipes, etc.), which is otherwise pure waste — the
   * subscriber fires on every drag tick and the body returns `null`.
   */
  hasRenderEdgeLabel: boolean;
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
      {data.edges.map(edge => {
        // Skip mounting an `EdgeLabel` subscriber when there's nothing it
        // could ever render. When `renderEdgeLabel` is provided the
        // consumer controls visibility per edge from inside their callback
        // (and may return `null`), so we still have to mount — but if no
        // callback exists, the only thing the label could show is
        // `edge.label`, and a `null` value there means there's nothing to
        // draw and no reason to pay for a per-edge store subscription.
        if (!hasRenderEdgeLabel && edge.label == null) return null;
        return (
          <EdgeLabel
            key={edge.id}
            edge={edge}
            renderEdgeLabelRef={renderEdgeLabelRef}
          />
        );
      })}
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
  const sourceNode = edge.source.node;
  const targetNode = edge.target.node;
  // Subscribe to interaction changes affecting either endpoint via the
  // per-node channel — a drag of an unrelated node never wakes this
  // subscriber, even before the selector runs. When source and target
  // sit on the same node, a single subscription is enough (deduplicates
  // the notification).
  const subscribeEndpoints = useCallback(
    (cb: () => void): (() => void) => {
      const unsubSource = store.subscribeNodeInteraction(sourceNode, cb);
      if (sourceNode === targetNode) return unsubSource;
      const unsubTarget = store.subscribeNodeInteraction(targetNode, cb);
      return () => {
        unsubSource();
        unsubTarget();
      };
    },
    [store, sourceNode, targetNode]
  );
  // Selector still reads the global snapshot to compute per-endpoint
  // deltas — the subscription change above only narrows *when* this
  // subscriber gets woken, not *what* it sees.
  const { src: srcDelta, tgt: tgtDelta } = useStoreSlice<
    NodeGraphInteractionState,
    EdgeEndpointDeltas
  >(
    subscribeEndpoints,
    store.getInteraction,
    interaction => selectEdgeDeltas(interaction, sourceNode, targetNode),
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
  // The render callback lives in a `useLatest` ref so swapping it doesn't
  // re-render every edge label; reading the current value here is deliberate.
  // Labels refresh on the next data / interaction tick, which is the only
  // moment their content is consumed anyway.
  // eslint-disable-next-line react-hooks/refs -- intentional latest-callback read
  const render = renderEdgeLabelRef.current;
  const content = render ? render(edge) : (edge.label ?? null);
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
