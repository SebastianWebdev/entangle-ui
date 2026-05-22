'use client';

import React from 'react';
import { cx } from '@/utils/cx';
import { portStyle } from './NodeGraph.css';
import type { NodeGraphPort, NodeGraphPortSide } from './NodeGraph.types';
import { useNodeGraphStore } from './NodeGraphContext';
import { useStoreSlice } from './useStoreSlice';

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

interface PortVisualState {
  isSource: boolean;
  isCandidate: boolean;
  isInvalid: boolean;
}

const EMPTY_PORT_STATE: PortVisualState = {
  isSource: false,
  isCandidate: false,
  isInvalid: false,
};

function portStateEqual(a: PortVisualState, b: PortVisualState): boolean {
  return (
    a.isSource === b.isSource &&
    a.isCandidate === b.isCandidate &&
    a.isInvalid === b.isInvalid
  );
}

/**
 * Render a port handle on a node edge.
 *
 * Subscribes to the interaction slice with a per-port selector so the port
 * re-renders only when *its* visual state changes — not on every move event
 * of an in-flight connection drag elsewhere in the graph.
 */
export function NodeGraphPortView({
  nodeId,
  port,
  offset,
  onStartConnection,
}: NodeGraphPortViewProps): React.ReactElement {
  const store = useNodeGraphStore();

  const visual = useStoreSlice(
    store.subscribeInteraction,
    store.getInteraction,
    interaction => {
      if (interaction.kind !== 'connect') return EMPTY_PORT_STATE;
      const isSource =
        interaction.source.node === nodeId &&
        interaction.source.port === port.id;
      const isCandidate =
        interaction.candidate !== null &&
        interaction.candidate.node === nodeId &&
        interaction.candidate.port === port.id;
      if (!isSource && !isCandidate) return EMPTY_PORT_STATE;
      return {
        isSource,
        isCandidate,
        isInvalid: isCandidate && interaction.invalid,
      };
    },
    portStateEqual
  );

  return (
    <div
      className={cx(
        portStyle({
          side: port.side,
          connecting: visual.isSource,
          candidate: visual.isCandidate,
          invalid: visual.isInvalid,
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
