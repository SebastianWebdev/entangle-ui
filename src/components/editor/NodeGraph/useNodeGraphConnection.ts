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
  NodeGraphSelection,
  NodeGraphConnectStartInfo,
  NodeGraphConnectEndInfo,
  NodeGraphConnectionValidationInfo,
} from './NodeGraph.types';
import type { NodeGraphStore } from './NodeGraphStore';
import { generateEdgeId } from './nodeGraphIds';

/** Pointer travel (screen px) before a reconnect grab counts as a drag. */
const RECONNECT_DRAG_THRESHOLD_PX = 4;

/**
 * What a connection drag is doing: creating a brand-new edge from a port, or
 * re-dragging one endpoint of an existing edge (which on drop moves the
 * endpoint, deletes the edge, or — with no drag — selects it).
 */
type ConnectMode =
  | { kind: 'create' }
  | { kind: 'reconnect'; edgeId: string; end: 'source' | 'target' };

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
  /** Used to select an edge when a reconnect grab ends as a plain click. */
  emitSelectionChange?: (next: NodeGraphSelection) => void;
}

interface UseNodeGraphConnectionReturn {
  /**
   * Handler attached to each `<NodeGraph.Port>` slot. Starts a connection
   * drag (create mode) and wires up document-level pointer listeners until
   * the drag terminates.
   */
  onPortPointerDown: (
    event: React.PointerEvent<HTMLElement>,
    nodeId: string,
    portId: string
  ) => void;
  /**
   * Start re-dragging one endpoint of an existing edge. Invoked by the
   * parent when the pointer grabs near an edge endpoint on the background.
   */
  onEdgeReconnectStart: (
    edgeId: string,
    end: 'source' | 'target',
    clientX: number,
    clientY: number
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
 * Connection-drag controller. Owns the lifecycle from `pointerdown` (on a
 * port for a new edge, or near an edge endpoint for a reconnect) through
 * document-level `pointermove` / `pointerup` to the eventual edge emission.
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
    emitSelectionChange,
  } = options;

  const isValidRef = useLatest(isValidConnection);
  const onConnectStartRef = useLatest(onConnectStart);
  const onConnectEndRef = useLatest(onConnectEnd);
  const emitEdgesChangeRef = useLatest(emitEdgesChange);
  const emitSelectionChangeRef = useLatest(emitSelectionChange);

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

  // Shared drag lifecycle for both modes. `source` is the fixed endpoint the
  // preview draws from and the one passed to `isValidConnection` as the
  // source argument.
  const beginDrag = useCallback(
    (params: {
      source: NodeGraphPortRef;
      startClientX: number;
      startClientY: number;
      mode: ConnectMode;
    }): void => {
      const { source, startClientX, startClientY, mode } = params;

      // If a previous gesture didn't tear down for some reason, clean it now.
      teardownRef.current?.();

      const startWorld = screenPointToWorld(startClientX, startClientY);
      store.setInteraction({
        kind: 'connect',
        source,
        currentWorld: startWorld,
        candidate: null,
        invalid: false,
        ...(mode.kind === 'reconnect'
          ? { reconnectEdgeId: mode.edgeId, reconnectEnd: mode.end }
          : {}),
      });
      if (mode.kind === 'create') {
        onConnectStartRef.current?.({ source, worldPoint: startWorld });
      }

      let pendingPoint: { x: number; y: number } | null = null;
      let rafId = 0;
      let didMove = false;

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
            // Hovering back over the fixed endpoint — treat as no candidate.
            nextCandidate = null;
          } else {
            nextCandidate = candidateRef;
            const info = buildValidationInfo(store, state.source, candidateRef);
            const validator = isValidRef.current;
            if (validator) {
              invalid = !validator(state.source, candidateRef, info);
            } else if (info.sameNode) {
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
          ...(mode.kind === 'reconnect'
            ? { reconnectEdgeId: mode.edgeId, reconnectEnd: mode.end }
            : {}),
        });
      };

      const handleMove = (e: PointerEvent): void => {
        if (!didMove) {
          const dx = e.clientX - startClientX;
          const dy = e.clientY - startClientY;
          if (Math.hypot(dx, dy) >= RECONNECT_DRAG_THRESHOLD_PX) didMove = true;
        }
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

      const resolveCandidate = (
        clientX: number,
        clientY: number
      ): NodeGraphPortRef | null => {
        const dropEl = document.elementFromPoint(clientX, clientY);
        const finalCandidate = readPortRefFromElement(dropEl);
        return finalCandidate &&
          !(
            finalCandidate.node === source.node &&
            finalCandidate.port === source.port
          )
          ? finalCandidate
          : null;
      };

      const dropPoint = (
        clientX: number,
        clientY: number
      ): { worldPoint: Point2D; screenPoint: Point2D } => {
        const viewport = viewportRef.current;
        const rect = viewport?.getBoundingClientRect();
        const screenPoint = rect
          ? { x: clientX - rect.left, y: clientY - rect.top }
          : { x: clientX, y: clientY };
        return {
          worldPoint: screenPointToWorld(clientX, clientY),
          screenPoint,
        };
      };

      function handleUp(e: PointerEvent): void {
        teardown();
        const state = store.getInteraction();
        store.setInteraction({ kind: 'idle' });
        if (state.kind !== 'connect') return;
        const candidate = resolveCandidate(e.clientX, e.clientY);
        const drop = dropPoint(e.clientX, e.clientY);

        if (mode.kind === 'reconnect') {
          // A grab that never moved is a click — select the edge, keep it.
          if (!didMove) {
            emitSelectionChangeRef.current?.({
              nodes: [],
              edges: [mode.edgeId],
              groups: [],
            });
            onConnectEndRef.current?.({
              source,
              target: null,
              cancelled: true,
              ...drop,
            });
            return;
          }
          const accepted = candidate
            ? (isValidRef.current?.(
                source,
                candidate,
                buildValidationInfo(store, source, candidate)
              ) ?? source.node !== candidate.node)
            : false;
          if (candidate && accepted) {
            const next = store
              .getData()
              .edges.map(edge =>
                edge.id === mode.edgeId
                  ? mode.end === 'source'
                    ? { ...edge, source: candidate }
                    : { ...edge, target: candidate }
                  : edge
              );
            emitEdgesChangeRef.current(next);
            onConnectEndRef.current?.({
              source,
              target: candidate,
              cancelled: false,
              ...drop,
            });
          } else {
            // Dropped on empty space or an invalid port → detach (delete).
            emitEdgesChangeRef.current(
              store.getData().edges.filter(edge => edge.id !== mode.edgeId)
            );
            onConnectEndRef.current?.({
              source,
              target: null,
              cancelled: true,
              ...drop,
            });
          }
          return;
        }

        // Create mode.
        let cancelled = !candidate;
        if (candidate) {
          const info = buildValidationInfo(store, source, candidate);
          const validator = isValidRef.current;
          const accepted = validator
            ? validator(source, candidate, info)
            : !info.sameNode;
          if (!accepted) {
            cancelled = true;
          } else {
            const newEdge: NodeGraphEdge = {
              id: generateEdgeId(source, candidate),
              source,
              target: candidate,
            };
            emitEdgesChangeRef.current([...store.getData().edges, newEdge]);
          }
        }
        onConnectEndRef.current?.({
          source,
          target: cancelled ? null : (candidate ?? null),
          cancelled,
          ...drop,
        });
      }

      function handleCancel(e: PointerEvent): void {
        teardown();
        const state = store.getInteraction();
        store.setInteraction({ kind: 'idle' });
        if (state.kind !== 'connect') return;
        onConnectEndRef.current?.({
          source,
          target: null,
          cancelled: true,
          ...dropPoint(e.clientX, e.clientY),
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
      emitSelectionChangeRef,
      isValidRef,
    ]
  );

  const onPortPointerDown = useCallback(
    (
      event: React.PointerEvent<HTMLElement>,
      nodeId: string,
      portId: string
    ): void => {
      if (event.button !== 0) return;
      event.stopPropagation();
      event.preventDefault();
      // Bail when the port hasn't measured yet — without a registered
      // position the preview curve has no anchor.
      if (!store.getPortPosition(nodeId, portId)) return;
      beginDrag({
        source: { node: nodeId, port: portId },
        startClientX: event.clientX,
        startClientY: event.clientY,
        mode: { kind: 'create' },
      });
    },
    [store, beginDrag]
  );

  const onEdgeReconnectStart = useCallback(
    (
      edgeId: string,
      end: 'source' | 'target',
      clientX: number,
      clientY: number
    ): void => {
      const edge = store.getData().edges.find(e => e.id === edgeId);
      if (!edge) return;
      // The fixed endpoint is the *other* end — that's what the preview
      // anchors to and what the dragged end validates against.
      const fixed = end === 'source' ? edge.target : edge.source;
      beginDrag({
        source: fixed,
        startClientX: clientX,
        startClientY: clientY,
        mode: { kind: 'reconnect', edgeId, end },
      });
    },
    [store, beginDrag]
  );

  return { onPortPointerDown, onEdgeReconnectStart };
}
