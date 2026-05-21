'use client';

import type React from 'react';
import { useCallback, useEffect, useRef } from 'react';
import { useLatest } from '@/hooks';
import type { Point2D } from '@/components/primitives/canvas/canvas.types';
import { screenToWorld } from '@/components/primitives/viewport';
import type { ViewportTransform } from '@/components/primitives/viewport';
import type {
  NodeGraphEdge,
  NodeGraphPortRef,
  NodeGraphConnectStartInfo,
  NodeGraphConnectEndInfo,
  NodeGraphConnectionValidationInfo,
} from './NodeGraph.types';
import type { NodeGraphStore } from './NodeGraphStore';
import { resolvePortRef } from './nodeGraphMath';

interface UseNodeGraphConnectionOptions {
  viewportRef: React.RefObject<HTMLDivElement | null>;
  store: NodeGraphStore;
  getTransform: () => ViewportTransform;
  isValidConnection?: (
    source: NodeGraphPortRef,
    target: NodeGraphPortRef,
    info: NodeGraphConnectionValidationInfo
  ) => boolean;
  onConnectStart?: (info: NodeGraphConnectStartInfo) => void;
  onConnectEnd?: (info: NodeGraphConnectEndInfo) => void;
  emitEdgesChange: (next: NodeGraphEdge[]) => void;
}

interface UseNodeGraphConnectionReturn {
  /**
   * Handler attached to each port. Starts a connection drag and wires up
   * document-level pointer listeners until the drag terminates.
   */
  onPortPointerDown: (
    event: React.PointerEvent<HTMLDivElement>,
    nodeId: string,
    portId: string
  ) => void;
}

/**
 * Read the port id/node id encoded in `data-*` attributes of an element
 * (or its ancestors). Returns null when the element isn't a port handle.
 */
function readPortRefFromElement(el: Element | null): NodeGraphPortRef | null {
  let cursor: Element | null = el;
  while (cursor) {
    const node = cursor.getAttribute('data-node-id');
    const port = cursor.getAttribute('data-port-id');
    if (node && port) return { node, port };
    cursor = cursor.parentElement;
  }
  return null;
}

/**
 * Connection-drag controller. Owns the lifecycle from `pointerdown` on a
 * port through document-level `pointermove` / `pointerup` to the eventual
 * edge emission.
 *
 * Reads "live" props through `useLatest` so the document listeners are
 * attached exactly once and never re-bind on consumer prop identity churn.
 */
export function useNodeGraphConnection(
  options: UseNodeGraphConnectionOptions
): UseNodeGraphConnectionReturn {
  const {
    viewportRef,
    store,
    getTransform,
    isValidConnection,
    onConnectStart,
    onConnectEnd,
    emitEdgesChange,
  } = options;

  const isValidRef = useLatest(isValidConnection);
  const onConnectStartRef = useLatest(onConnectStart);
  const onConnectEndRef = useLatest(onConnectEnd);
  const emitEdgesChangeRef = useLatest(emitEdgesChange);
  const getTransformRef = useLatest(getTransform);

  const draggingRef = useRef(false);

  /**
   * Hit-test the current pointer position against any rendered port. Uses
   * `document.elementFromPoint` so the resolver picks up the closest port
   * by stacking order, which matches what the user actually sees.
   */
  const findPortAtPoint = useCallback(
    (clientX: number, clientY: number): NodeGraphPortRef | null => {
      const el = document.elementFromPoint(clientX, clientY);
      return readPortRefFromElement(el);
    },
    []
  );

  const screenPointToWorld = useCallback(
    (clientX: number, clientY: number): Point2D => {
      const viewport = viewportRef.current;
      if (!viewport) return { x: 0, y: 0 };
      const rect = viewport.getBoundingClientRect();
      return screenToWorld(
        { x: clientX - rect.left, y: clientY - rect.top },
        getTransformRef.current()
      );
    },
    [viewportRef, getTransformRef]
  );

  // Document listeners are attached once and read everything through refs.
  useEffect(() => {
    const handleMove = (e: PointerEvent): void => {
      if (!draggingRef.current) return;
      const state = store.getInteraction();
      if (state.kind !== 'connect') return;

      const currentWorld = screenPointToWorld(e.clientX, e.clientY);
      const candidate = findPortAtPoint(e.clientX, e.clientY);

      let nextCandidate: NodeGraphPortRef | null = null;
      let invalid = false;
      if (candidate) {
        if (
          candidate.node === state.source.node &&
          candidate.port === state.source.port
        ) {
          // Hovering back over the source — treat as no candidate.
          nextCandidate = null;
        } else {
          nextCandidate = candidate;
          const sameNode = candidate.node === state.source.node;
          const data = store.getData();
          const srcResolved = resolvePortRef(
            state.source,
            data.nodes,
            data.defaultNodeSize
          );
          const tgtResolved = resolvePortRef(
            candidate,
            data.nodes,
            data.defaultNodeSize
          );
          const sideCombo =
            srcResolved && tgtResolved
              ? `${srcResolved.port.side}->${tgtResolved.port.side}`
              : 'unknown';
          const validator = isValidRef.current;
          if (validator) {
            invalid = !validator(state.source, candidate, {
              sameNode,
              sideCombo,
            });
          } else if (sameNode) {
            // Default policy: reject same-node connections when consumer has
            // no validator opinion (most graphs don't want self-loops).
            invalid = true;
          }
        }
      }

      store.setInteraction({
        kind: 'connect',
        source: state.source,
        currentWorld,
        candidate: nextCandidate,
        invalid,
      });
    };

    const handleUp = (e: PointerEvent): void => {
      if (!draggingRef.current) return;
      draggingRef.current = false;
      const state = store.getInteraction();
      store.setInteraction({ kind: 'idle' });
      if (state.kind !== 'connect') return;

      // Re-read candidate at release point — pointer can drift between
      // the last move event and pointerup, especially on slow devices.
      const finalCandidate = findPortAtPoint(e.clientX, e.clientY);
      const candidate =
        finalCandidate &&
        !(
          finalCandidate.node === state.source.node &&
          finalCandidate.port === state.source.port
        )
          ? finalCandidate
          : null;

      let cancelled = !candidate;
      if (candidate) {
        const sameNode = candidate.node === state.source.node;
        const data = store.getData();
        const srcResolved = resolvePortRef(
          state.source,
          data.nodes,
          data.defaultNodeSize
        );
        const tgtResolved = resolvePortRef(
          candidate,
          data.nodes,
          data.defaultNodeSize
        );
        const sideCombo =
          srcResolved && tgtResolved
            ? `${srcResolved.port.side}->${tgtResolved.port.side}`
            : 'unknown';
        const validator = isValidRef.current;
        const accepted = validator
          ? validator(state.source, candidate, { sameNode, sideCombo })
          : !sameNode;
        if (!accepted) {
          cancelled = true;
        } else {
          const newEdge: NodeGraphEdge = {
            id: `edge-${state.source.node}.${state.source.port}-${candidate.node}.${candidate.port}-${Date.now()}`,
            source: state.source,
            target: candidate,
          };
          emitEdgesChangeRef.current([...store.getData().edges, newEdge]);
        }
      }

      onConnectEndRef.current?.({
        source: state.source,
        target: cancelled ? null : (candidate ?? null),
        cancelled,
      });
    };

    const handleCancel = (): void => {
      if (!draggingRef.current) return;
      draggingRef.current = false;
      const state = store.getInteraction();
      store.setInteraction({ kind: 'idle' });
      if (state.kind !== 'connect') return;
      onConnectEndRef.current?.({
        source: state.source,
        target: null,
        cancelled: true,
      });
    };

    document.addEventListener('pointermove', handleMove);
    document.addEventListener('pointerup', handleUp);
    document.addEventListener('pointercancel', handleCancel);
    return () => {
      document.removeEventListener('pointermove', handleMove);
      document.removeEventListener('pointerup', handleUp);
      document.removeEventListener('pointercancel', handleCancel);
    };
  }, [
    store,
    findPortAtPoint,
    screenPointToWorld,
    isValidRef,
    onConnectEndRef,
    emitEdgesChangeRef,
  ]);

  const onPortPointerDown = useCallback(
    (
      event: React.PointerEvent<HTMLDivElement>,
      nodeId: string,
      portId: string
    ): void => {
      // Only react to the primary mouse button (or touch / pen).
      if (event.button !== 0) return;
      event.stopPropagation();
      event.preventDefault();

      const data = store.getData();
      const resolved = resolvePortRef(
        { node: nodeId, port: portId },
        data.nodes,
        data.defaultNodeSize
      );
      if (!resolved) return;

      const worldPoint = screenPointToWorld(event.clientX, event.clientY);
      draggingRef.current = true;
      store.setInteraction({
        kind: 'connect',
        source: { node: nodeId, port: portId },
        currentWorld: worldPoint,
        candidate: null,
        invalid: false,
      });

      onConnectStartRef.current?.({
        source: { node: nodeId, port: portId },
        worldPoint: resolved.position,
      });
    },
    [store, screenPointToWorld, onConnectStartRef]
  );

  return { onPortPointerDown };
}
