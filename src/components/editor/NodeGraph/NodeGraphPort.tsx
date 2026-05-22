'use client';

import React, { useCallback } from 'react';
import { cx } from '@/utils/cx';
import { portStyle } from './NodeGraph.css';
import type {
  NodeGraphNode,
  NodeGraphPort,
  NodeGraphPortRenderCtx,
  NodeGraphPortSide,
  NodeGraphRenderPort,
} from './NodeGraph.types';
import { useNodeGraphStore } from './NodeGraphContext';
import { useStoreSlice } from './useStoreSlice';

interface NodeGraphPortViewProps {
  node: NodeGraphNode;
  port: NodeGraphPort;
  /** Resolved offset 0..1 along the port's side. */
  offset: number;
  /** Called when the user starts a connection drag from this port. */
  onStartConnection: (event: React.PointerEvent<HTMLDivElement>) => void;
  /** Optional consumer-supplied renderer for the port visual. */
  renderPort?: NodeGraphRenderPort;
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
 * Subscribes to interaction + hover slices with per-port selectors so the
 * port re-renders only when *its* visual state changes — not on every
 * move event of an in-flight connection drag elsewhere in the graph.
 *
 * When `renderPort` is provided, the consumer-supplied JSX is rendered
 * inside the port wrapper. The wrapper still owns the pointer events and
 * `data-*` attributes used by the connection drag — so consumer rendering
 * can focus purely on the visual.
 */
export function NodeGraphPortView({
  node,
  port,
  offset,
  onStartConnection,
  renderPort,
}: NodeGraphPortViewProps): React.ReactElement {
  const store = useNodeGraphStore();
  const nodeId = node.id;
  const portId = port.id;

  const visual = useStoreSlice(
    store.subscribeInteraction,
    store.getInteraction,
    interaction => {
      if (interaction.kind !== 'connect') return EMPTY_PORT_STATE;
      const isSource =
        interaction.source.node === nodeId &&
        interaction.source.port === portId;
      const isCandidate =
        interaction.candidate !== null &&
        interaction.candidate.node === nodeId &&
        interaction.candidate.port === portId;
      if (!isSource && !isCandidate) return EMPTY_PORT_STATE;
      return {
        isSource,
        isCandidate,
        isInvalid: isCandidate && interaction.invalid,
      };
    },
    portStateEqual
  );

  const isHovered = useStoreSlice(
    store.subscribeHover,
    store.getHover,
    hover =>
      hover.hoveredPort !== null &&
      hover.hoveredPort.node === nodeId &&
      hover.hoveredPort.port === portId
  );

  const handlePointerEnter = useCallback((): void => {
    const current = store.getHover();
    store.setHover({ ...current, hoveredPort: { node: nodeId, port: portId } });
  }, [store, nodeId, portId]);

  const handlePointerLeave = useCallback((): void => {
    const current = store.getHover();
    if (
      current.hoveredPort?.node === nodeId &&
      current.hoveredPort?.port === portId
    ) {
      store.setHover({ ...current, hoveredPort: null });
    }
  }, [store, nodeId, portId]);

  const sharedDataAttrs = {
    'data-node-id': node.id,
    'data-port-id': port.id,
    'data-port-side': port.side,
    'data-port-data-type': port.dataType,
    'data-port-source': visual.isSource || undefined,
    'data-port-candidate': visual.isCandidate || undefined,
    'data-port-invalid': visual.isInvalid || undefined,
  };

  if (renderPort) {
    const ctx: NodeGraphPortRenderCtx = {
      isSource: visual.isSource,
      isCandidate: visual.isCandidate,
      isInvalid: visual.isInvalid,
      isHovered,
    };
    return (
      <div
        className={cx(portStyle({ side: port.side, customRender: true }))}
        style={sideTopStyle(port.side, offset)}
        role="button"
        tabIndex={-1}
        aria-label={port.label ?? `${port.side} port ${port.id}`}
        {...sharedDataAttrs}
        onPointerDown={onStartConnection}
        onPointerEnter={handlePointerEnter}
        onPointerLeave={handlePointerLeave}
      >
        {renderPort(port, node, ctx)}
      </div>
    );
  }

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
      {...sharedDataAttrs}
      onPointerDown={onStartConnection}
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
    />
  );
}
