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
   * Handler attached to each `<NodeGraph.Port>` slot. Starts a connection
   * drag and wires up document-level pointer listeners until the drag
   * terminates.
   */
  onPortPointerDown: (
    event: React.PointerEvent<HTMLElement>,
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
 * Build the validation info object passed to `isValidConnection`. Looks up
 * the per-port side + dataType in the store so the consumer doesn't have
 * to maintain a parallel port index.
 */
function buildValidationInfo(
  store: NodeGraphStore,
  source: NodeGraphPortRef,
  target: NodeGraphPortRef
): NodeGraphConnectionValidationInfo {
  const src = store.getPortPosition(source.node, source.port);
  const tgt = store.getPortPosition(target.node, target.port);
  const sideCombo = src && tgt ? `${src.side}->${tgt.side}` : 'unknown';
  return {
    sameNode: source.node === target.node,
    sideCombo,
    ...(src?.dataType !== undefined ? { sourceDataType: src.dataType } : {}),
    ...(tgt?.dataType !== undefined ? { targetDataType: tgt.dataType } : {}),
  };
}

/**
 * Connection-drag controller. Owns the lifecycle from `pointerdown` on a
 * port through document-level `pointermove` / `pointerup` to the eventual
 * edge emission.
 *
 * Document listeners are attached only while a drag is in flight — outside
 * of a gesture there is zero pointermove cost. Move events are coalesced
 * to one hit-test per animation frame so `document.elementFromPoint`
 * doesn't force a layout flush on every pointer poll.
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

  const teardownRef = useRef<(() => void) | null>(null);

  // If the component unmounts mid-drag, release the document listeners so
  // we don't leak handlers attached to the page.
  useEffect(() => {
    return () => {
      teardownRef.current?.();
      teardownRef.current = null;
    };
  }, []);

  const screenPointToWorld = useCallback(
    (clientX: number, clientY: number): Point2D => {
      const viewport = viewportRef.current;
      if (!viewport) return { x: 0, y: 0 };
      const rect = viewport.getBoundingClientRect();
      return screenToWorld(
        { x: clientX - rect.left, y: clientY - rect.top },
        getTransform()
      );
    },
    [viewportRef, getTransform]
  );

  const onPortPointerDown = useCallback(
    (
      event: React.PointerEvent<HTMLElement>,
      nodeId: string,
      portId: string
    ): void => {
      // Only react to the primary mouse button (or touch / pen).
      if (event.button !== 0) return;
      event.stopPropagation();
      event.preventDefault();

      // Bail when the port hasn't measured yet — without a registered
      // position the preview curve has no anchor.
      const sourcePos = store.getPortPosition(nodeId, portId);
      if (!sourcePos) return;

      // If a previous gesture didn't tear down for some reason, clean it now.
      teardownRef.current?.();

      const source: NodeGraphPortRef = { node: nodeId, port: portId };
      const sourceNode = store.getData().nodes.find(n => n.id === nodeId);
      const sourceWorldPoint = sourceNode
        ? {
            x: sourceNode.position.x + sourcePos.x,
            y: sourceNode.position.y + sourcePos.y,
          }
        : screenPointToWorld(event.clientX, event.clientY);
      const worldPoint = screenPointToWorld(event.clientX, event.clientY);

      store.setInteraction({
        kind: 'connect',
        source,
        currentWorld: worldPoint,
        candidate: null,
        invalid: false,
      });
      onConnectStartRef.current?.({
        source,
        worldPoint: sourceWorldPoint,
      });

      // RAF-coalesced move handler. `elementFromPoint` forces a layout flush,
      // so we run at most one hit-test per frame instead of one per pointer
      // poll (high-poll mice can emit 1000+ events/s).
      let pendingPoint: { x: number; y: number } | null = null;
      let rafId = 0;

      const runMove = (): void => {
        rafId = 0;
        const point = pendingPoint;
        pendingPoint = null;
        if (!point) return;
        const state = store.getInteraction();
        if (state.kind !== 'connect') return;

        const currentWorld = screenPointToWorld(point.x, point.y);
        const candidate = document.elementFromPoint(point.x, point.y);
        const candidateRef = readPortRefFromElement(candidate);

        let nextCandidate: NodeGraphPortRef | null = null;
        let invalid = false;
        if (candidateRef) {
          if (
            candidateRef.node === state.source.node &&
            candidateRef.port === state.source.port
          ) {
            // Hovering back over the source — treat as no candidate.
            nextCandidate = null;
          } else {
            nextCandidate = candidateRef;
            const info = buildValidationInfo(store, state.source, candidateRef);
            const validator = isValidRef.current;
            if (validator) {
              invalid = !validator(state.source, candidateRef, info);
            } else if (info.sameNode) {
              // Default policy: reject same-node connections when consumer
              // has no validator opinion (most graphs don't want self-loops).
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

      const handleMove = (e: PointerEvent): void => {
        pendingPoint = { x: e.clientX, y: e.clientY };
        if (rafId === 0) {
          rafId = requestAnimationFrame(runMove);
        }
      };

      const teardown = (): void => {
        if (rafId !== 0) {
          cancelAnimationFrame(rafId);
          rafId = 0;
        }
        document.removeEventListener('pointermove', handleMove);
        document.removeEventListener('pointerup', handleUp);
        document.removeEventListener('pointercancel', handleCancel);
        teardownRef.current = null;
      };

      function handleUp(e: PointerEvent): void {
        teardown();
        const state = store.getInteraction();
        store.setInteraction({ kind: 'idle' });
        if (state.kind !== 'connect') return;

        // Re-read candidate at release point — pointer can drift between
        // the last move event and pointerup, especially on slow devices.
        const dropEl = document.elementFromPoint(e.clientX, e.clientY);
        const finalCandidate = readPortRefFromElement(dropEl);
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
          const info = buildValidationInfo(store, state.source, candidate);
          const validator = isValidRef.current;
          const accepted = validator
            ? validator(state.source, candidate, info)
            : !info.sameNode;
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
      }

      function handleCancel(): void {
        teardown();
        const state = store.getInteraction();
        store.setInteraction({ kind: 'idle' });
        if (state.kind !== 'connect') return;
        onConnectEndRef.current?.({
          source: state.source,
          target: null,
          cancelled: true,
        });
      }

      teardownRef.current = teardown;
      document.addEventListener('pointermove', handleMove);
      document.addEventListener('pointerup', handleUp);
      document.addEventListener('pointercancel', handleCancel);
    },
    [
      store,
      screenPointToWorld,
      onConnectStartRef,
      onConnectEndRef,
      emitEdgesChangeRef,
      isValidRef,
    ]
  );

  return { onPortPointerDown };
}
