'use client';

import React, { useSyncExternalStore } from 'react';
import type { Point2D } from '@/components/primitives/canvas/canvas.types';
import type { NodeGraphEdge } from './NodeGraph.types';
import { useNodeGraphStore } from './NodeGraphContext';
import { resolvePortRef } from './nodeGraphMath';

interface RenderEdgeLabelRef {
  current: ((edge: NodeGraphEdge) => React.ReactNode) | undefined;
}

/**
 * Mounts one `<EdgeLabel>` per edge as a world-space sibling inside
 * `<ViewportWorld>`. Each label subscribes to the interaction slice on
 * its own so a drag of an unrelated node doesn't re-render every label
 * in the graph — only the labels whose endpoints actually move.
 *
 * One subscriber per edge: each `EdgeLabel` independently subscribes to
 * the `interaction` slice and computes its own live midpoint. Granular
 * subscriptions guarantee React keeps each label in sync per frame
 * during a drag — when many `useSyncExternalStore` hooks pile up in a
 * single component (each with different stability characteristics), one
 * re-subscribing on every render can starve the others on certain
 * concurrent rendering paths.
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
  // Subscribe directly — every interaction notification (drag-nodes
  // delta, drag-groups delta, marquee, connect) re-renders this label.
  const interaction = useSyncExternalStore(
    store.subscribeInteraction,
    store.getInteraction
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

  // Apply the current frame's live drag delta to any endpoint whose node
  // is being dragged — directly (`drag-nodes`) or as a contained child
  // riding along with a moving group (`drag-groups.containedNodeIds`).
  const liveDelta = (nodeId: string): Point2D | null => {
    if (interaction.kind === 'drag-nodes') {
      return interaction.nodeIds.includes(nodeId) ? interaction.delta : null;
    }
    if (interaction.kind === 'drag-groups') {
      return interaction.containedNodeIds.includes(nodeId)
        ? interaction.delta
        : null;
    }
    return null;
  };
  const srcDelta = liveDelta(edge.source.node);
  const tgtDelta = liveDelta(edge.target.node);

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
