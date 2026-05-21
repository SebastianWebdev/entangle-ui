'use client';

import React, { useSyncExternalStore } from 'react';
import { cx } from '@/utils/cx';
import { portStyle } from './NodeGraph.css';
import type { NodeGraphPort, NodeGraphPortSide } from './NodeGraph.types';
import { useNodeGraphStore } from './NodeGraphContext';

interface NodeGraphPortViewProps {
  nodeId: string;
  port: NodeGraphPort;
  /** Resolved offset 0..1 along the port's side. */
  offset: number;
  /** Called when the user starts a connection drag from this port. */
  onStartConnection: (event: React.PointerEvent<HTMLDivElement>) => void;
}

function sideTopStyle(
  side: NodeGraphPortSide,
  offset: number
): React.CSSProperties {
  if (side === 'left' || side === 'right') {
    return { top: `${offset * 100}%` };
  }
  return { left: `${offset * 100}%` };
}

/**
 * Render a port handle on a node edge.
 *
 * Selects two pieces of store state (interaction kind + candidate ref) so
 * the port re-renders only when its own visual state changes.
 */
export function NodeGraphPortView({
  nodeId,
  port,
  offset,
  onStartConnection,
}: NodeGraphPortViewProps): React.ReactElement {
  const store = useNodeGraphStore();
  const interaction = useSyncExternalStore(
    store.subscribeInteraction,
    store.getInteraction
  );

  const isSource =
    interaction.kind === 'connect' &&
    interaction.source.node === nodeId &&
    interaction.source.port === port.id;
  const isCandidate =
    interaction.kind === 'connect' &&
    interaction.candidate !== null &&
    interaction.candidate.node === nodeId &&
    interaction.candidate.port === port.id;
  const isInvalid =
    interaction.kind === 'connect' && isCandidate && interaction.invalid;

  return (
    <div
      className={cx(
        portStyle({
          side: port.side,
          connecting: isSource,
          candidate: isCandidate,
          invalid: isInvalid,
        })
      )}
      style={sideTopStyle(port.side, offset)}
      role="button"
      tabIndex={-1}
      aria-label={port.label ?? `${port.side} port ${port.id}`}
      data-node-id={nodeId}
      data-port-id={port.id}
      data-port-side={port.side}
      data-port-data-type={port.dataType}
      onPointerDown={onStartConnection}
    />
  );
}
