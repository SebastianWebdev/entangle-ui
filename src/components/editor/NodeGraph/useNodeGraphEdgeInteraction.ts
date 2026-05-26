'use client';

import type React from 'react';
import { useCallback, useEffect, useRef } from 'react';
import { useLatest } from '@/hooks';
import { worldToScreen as screenFromWorld } from '@/components/primitives/viewport';
import type { ViewportTransform } from '@/components/primitives/viewport';
import type { Point2D } from '@/components/primitives/canvas/canvas.types';
import type { NodeGraphStore } from './NodeGraphStore';
import { findEdgeAtPoint, resolveEdgeEndpoints } from './nodeGraphMath';

/**
 * Pointer proximity (screen px) for hovering / clicking / right-clicking an
 * edge. Divided by the current zoom to get the world-space threshold. Also
 * consumed by the parent for marquee-click edge selection and hit-testing.
 */
export const EDGE_HIT_PX = 6;

/**
 * Pointer proximity (screen px) to an edge endpoint that starts a
 * reconnect / detach grab instead of selecting the edge.
 */
const EDGE_ENDPOINT_GRAB_PX = 16;

interface UseNodeGraphEdgeInteractionOptions {
  store: NodeGraphStore;
  getTransform: () => ViewportTransform;
  screenToWorldLocal: (clientX: number, clientY: number) => Point2D;
  localScreenPoint: (clientX: number, clientY: number) => Point2D;
  onEdgeReconnectStart: (
    edgeId: string,
    end: 'source' | 'target',
    clientX: number,
    clientY: number
  ) => void;
  disabled?: boolean;
}

interface UseNodeGraphEdgeInteractionReturn {
  /** Attach to the root surface's `onPointerMove` — RAF-coalesced edge hover. */
  onRootPointerMove: (event: React.PointerEvent<HTMLDivElement>) => void;
  /** Attach to `onPointerLeave` — clears hover + cancels any pending hit-test. */
  onRootPointerLeave: () => void;
  /**
   * Attach to `onPointerDownCapture` — pre-empts the Viewport's marquee / pan
   * when the pointer lands near an edge endpoint, handing off to the
   * connection controller in reconnect mode.
   */
  onRootPointerDownCapture: (event: React.PointerEvent<HTMLDivElement>) => void;
}

/**
 * Edge hover + endpoint-grab interactions for the `<NodeGraph>` root surface.
 * Edges live on a canvas layer (no DOM to receive pointer events), so both
 * hovering an edge and grabbing its endpoint to reconnect are resolved by a
 * Bézier hit-test against the pointer position. Hover is RAF-coalesced to one
 * hit-test per frame; the endpoint grab runs in the capture phase so it wins
 * over the Viewport's own marquee / pan before they begin.
 */
export function useNodeGraphEdgeInteraction(
  options: UseNodeGraphEdgeInteractionOptions
): UseNodeGraphEdgeInteractionReturn {
  const {
    store,
    getTransform,
    screenToWorldLocal,
    localScreenPoint,
    onEdgeReconnectStart,
    disabled,
  } = options;

  const disabledRef = useLatest(disabled);
  const edgeHoverRaf = useRef(0);
  const edgeHoverPoint = useRef<Point2D | null>(null);

  const clearEdgeHover = useCallback((): void => {
    const hover = store.getHover();
    if (hover.hoveredEdgeId !== null) {
      store.setHover({ ...hover, hoveredEdgeId: null });
    }
  }, [store]);

  const onRootPointerMove = useCallback(
    (event: React.PointerEvent<HTMLDivElement>): void => {
      if (disabledRef.current) return;
      if (store.getInteraction().kind !== 'idle') return;
      const el = event.target as Element | null;
      if (el?.closest('[data-node-id]')) {
        clearEdgeHover();
        return;
      }
      edgeHoverPoint.current = { x: event.clientX, y: event.clientY };
      if (edgeHoverRaf.current !== 0) return;
      edgeHoverRaf.current = requestAnimationFrame(() => {
        edgeHoverRaf.current = 0;
        const point = edgeHoverPoint.current;
        edgeHoverPoint.current = null;
        if (!point || store.getInteraction().kind !== 'idle') return;
        const zoom = getTransform().zoom || 1;
        const world = screenToWorldLocal(point.x, point.y);
        const edgeId = findEdgeAtPoint(
          world,
          store.getData().edges,
          store.getNodeById,
          store.getPortPosition,
          EDGE_HIT_PX / zoom
        );
        const hover = store.getHover();
        if (hover.hoveredEdgeId !== edgeId) {
          store.setHover({ ...hover, hoveredEdgeId: edgeId });
        }
      });
    },
    [store, disabledRef, getTransform, screenToWorldLocal, clearEdgeHover]
  );

  const onRootPointerLeave = useCallback((): void => {
    if (edgeHoverRaf.current !== 0) {
      cancelAnimationFrame(edgeHoverRaf.current);
      edgeHoverRaf.current = 0;
    }
    edgeHoverPoint.current = null;
    clearEdgeHover();
  }, [clearEdgeHover]);

  const onRootPointerDownCapture = useCallback(
    (event: React.PointerEvent<HTMLDivElement>): void => {
      if (disabledRef.current) return;
      if (event.button !== 0) return;
      const el = event.target as Element | null;
      if (el?.closest('[data-node-id]')) return;
      const transform = getTransform();
      const zoom = transform.zoom || 1;
      const world = screenToWorldLocal(event.clientX, event.clientY);
      const edges = store.getData().edges;
      const edgeId = findEdgeAtPoint(
        world,
        edges,
        store.getNodeById,
        store.getPortPosition,
        EDGE_HIT_PX / zoom
      );
      if (!edgeId) return;
      const edge = edges.find(e => e.id === edgeId);
      if (!edge) return;
      const ends = resolveEdgeEndpoints(
        edge,
        store.getNodeById,
        store.getPortPosition
      );
      if (!ends) return;
      const srcScreen = screenFromWorld(ends.source, transform);
      const tgtScreen = screenFromWorld(ends.target, transform);
      const local = localScreenPoint(event.clientX, event.clientY);
      const dSrc = Math.hypot(local.x - srcScreen.x, local.y - srcScreen.y);
      const dTgt = Math.hypot(local.x - tgtScreen.x, local.y - tgtScreen.y);
      if (Math.min(dSrc, dTgt) > EDGE_ENDPOINT_GRAB_PX) return;
      event.stopPropagation();
      event.preventDefault();
      const end = dSrc <= dTgt ? 'source' : 'target';
      onEdgeReconnectStart(edgeId, end, event.clientX, event.clientY);
    },
    [
      disabledRef,
      getTransform,
      screenToWorldLocal,
      localScreenPoint,
      store,
      onEdgeReconnectStart,
    ]
  );

  // Cancel a pending hover hit-test if the component unmounts mid-frame.
  useEffect(() => {
    return () => {
      if (edgeHoverRaf.current !== 0) {
        cancelAnimationFrame(edgeHoverRaf.current);
      }
    };
  }, []);

  return { onRootPointerMove, onRootPointerLeave, onRootPointerDownCapture };
}
