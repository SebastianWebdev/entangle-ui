'use client';

import type React from 'react';
import { useCallback, useEffect, useRef } from 'react';
import { useLatest } from '@/hooks';
import { screenToWorld as worldFromScreen } from '@/components/primitives/viewport';
import type { ViewportTransform } from '@/components/primitives/viewport';
import type { Point2D } from '@/components/primitives/canvas/canvas.types';
import type { NodeGraphNode, NodeGraphSelection } from './NodeGraph.types';
import type { NodeGraphStore } from './NodeGraphStore';
import { snapDelta, toggleSelected } from './nodeGraphMath';
import { useDragGesture } from './useDragGesture';

const DRAG_START_THRESHOLD_PX = 3;

/** Pending drag state buffered between pointermove and the next rAF flush. */
interface PendingDragMove {
  ids: ReadonlySet<string>;
  startWorld: Point2D;
  delta: Point2D;
}

interface UseNodeGraphNodeDragOptions {
  store: NodeGraphStore;
  getTransform: () => ViewportTransform;
  localScreenPoint: (clientX: number, clientY: number) => Point2D;
  snapToGrid: number | false;
  disabled?: boolean;
  emitNodesChange: (next: NodeGraphNode[]) => void;
  emitSelectionChange: (next: NodeGraphSelection) => void;
}

interface UseNodeGraphNodeDragReturn {
  onNodeBodyPointerDown: (
    event: React.PointerEvent<HTMLDivElement>,
    node: NodeGraphNode
  ) => void;
  onNodeBodyPointerUp: (
    event: React.PointerEvent<HTMLDivElement>,
    node: NodeGraphNode
  ) => void;
}

interface DragSession {
  pointerId: number;
  clickedNodeId: string;
  startScreen: Point2D;
  startWorld: Point2D;
  /** Snapshot of selection at gesture start (for shift-toggle reset). */
  selectionAtStart: NodeGraphSelection;
  /** Snapshot of node positions at gesture start. */
  nodeStartPositions: Map<string, Point2D>;
  additive: boolean;
  didDrag: boolean;
}

/**
 * Pointer-driven drag + click-select controller for node bodies. Owns the
 * gesture lifecycle (`pointerdown` → document `pointermove` → `pointerup`
 * or `pointercancel`), commits position updates through the
 * controlled-state emitter on success, and falls back to plain click
 * selection when the pointer moves less than the drag threshold.
 *
 * Document listeners are attached only while a gesture is in flight, so
 * pointermove cost is zero between drags.
 */
export function useNodeGraphNodeDrag(
  options: UseNodeGraphNodeDragOptions
): UseNodeGraphNodeDragReturn {
  const {
    store,
    getTransform,
    localScreenPoint,
    snapToGrid,
    disabled,
    emitNodesChange,
    emitSelectionChange,
  } = options;

  const snapToGridRef = useLatest(snapToGrid);
  const disabledRef = useLatest(disabled);
  const emitNodesChangeRef = useLatest(emitNodesChange);
  const emitSelectionChangeRef = useLatest(emitSelectionChange);

  const dragRef = useRef<DragSession | null>(null);
  const gesture = useDragGesture();

  // ── rAF-throttled interaction commits ──
  //
  // Native pointermove fires at the display's refresh rate (up to several
  // hundred Hz on high-refresh monitors) — without throttling, every event
  // triggers a full notification cycle through every NodeGraphStore
  // subscriber (one per node + one per edge label). Buffering the latest
  // delta in a ref and flushing once per frame caps the commit rate at
  // requestAnimationFrame, which already matches the refresh rate the
  // canvas layers are drawing at.
  const pendingMoveRef = useRef<PendingDragMove | null>(null);
  const rafRef = useRef<number>(0);

  const commitPending = useCallback((): void => {
    const pending = pendingMoveRef.current;
    if (!pending) return;
    pendingMoveRef.current = null;
    store.setInteraction({
      kind: 'drag-nodes',
      nodeIds: pending.ids,
      startWorld: pending.startWorld,
      delta: pending.delta,
    });
  }, [store]);

  const cancelRaf = useCallback((): void => {
    if (rafRef.current !== 0) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = 0;
    }
  }, []);

  /** Synchronous flush — cancels any pending rAF and commits immediately. */
  const flushPending = useCallback((): void => {
    cancelRaf();
    commitPending();
  }, [cancelRaf, commitPending]);

  // Cancel any in-flight rAF on unmount so a teardown mid-drag doesn't fire
  // a commit into a torn-down store.
  useEffect(() => {
    return () => {
      cancelRaf();
      pendingMoveRef.current = null;
    };
  }, [cancelRaf]);

  const onNodeBodyPointerDown = useCallback(
    (event: React.PointerEvent<HTMLDivElement>, node: NodeGraphNode): void => {
      if (event.button !== 0) return; // only primary button
      // Always stop propagation for clicks on a node body so the Viewport
      // beneath us doesn't fire a marquee. This applies even when disabled
      // or non-interactive — the click is consumed by the node hit target.
      event.stopPropagation();
      if (disabledRef.current) return;
      if (node.selectable === false && node.draggable === false) return;

      const additive = event.shiftKey || event.metaKey || event.ctrlKey;
      const currentSelection = store.getSelection();
      const alreadySelected = currentSelection.nodes.includes(node.id);

      // Decide which node ids should drag together. If clicked node is in
      // the selection, drag all selected nodes; otherwise just this one.
      let dragIds: string[];
      if (alreadySelected) {
        dragIds = currentSelection.nodes;
      } else if (!additive) {
        // Pre-emptively select just this node so the drag matches what the
        // user sees as "selected" mid-gesture. The actual selection emit
        // happens in pointerup if no drag occurred.
        dragIds = [node.id];
      } else {
        dragIds = [...currentSelection.nodes, node.id];
      }

      const positions = new Map<string, Point2D>();
      for (const n of store.getData().nodes) {
        if (dragIds.includes(n.id)) {
          positions.set(n.id, { ...n.position });
        }
      }

      const startScreen = localScreenPoint(event.clientX, event.clientY);
      const startWorld = worldFromScreen(startScreen, getTransform());
      const pointerId = event.pointerId;

      const handleMove = (e: PointerEvent): void => {
        const session = dragRef.current;
        if (session?.pointerId !== pointerId) return;
        const current = localScreenPoint(e.clientX, e.clientY);
        const dx = current.x - session.startScreen.x;
        const dy = current.y - session.startScreen.y;
        if (!session.didDrag) {
          if (Math.hypot(dx, dy) < DRAG_START_THRESHOLD_PX) return;
          const clicked = store.getNodeById(session.clickedNodeId);
          if (clicked?.draggable === false) {
            // Not draggable — promote to a no-op drag flag so pointerup falls
            // through to click selection logic.
            session.didDrag = false;
            return;
          }
          session.didDrag = true;
        }
        const transform = getTransform();
        const worldDelta = {
          x: dx / transform.zoom,
          y: dy / transform.zoom,
        };
        const snapped = snapDelta(worldDelta, snapToGridRef.current);
        const ids: ReadonlySet<string> = new Set(
          session.nodeStartPositions.keys()
        );
        // Buffer the latest delta; the rAF callback below picks the most
        // recent value when the frame fires, so any intermediate moves
        // between frames are coalesced into one commit.
        pendingMoveRef.current = {
          ids,
          startWorld: session.startWorld,
          delta: snapped,
        };
        if (rafRef.current !== 0) return;
        rafRef.current = requestAnimationFrame(() => {
          rafRef.current = 0;
          commitPending();
        });
      };

      gesture.begin(event, {
        onMove: handleMove,
        onCancel: () => {
          cancelRaf();
          pendingMoveRef.current = null;
          dragRef.current = null;
          store.setInteraction({ kind: 'idle' });
        },
      });

      dragRef.current = {
        pointerId,
        clickedNodeId: node.id,
        startScreen,
        startWorld,
        selectionAtStart: currentSelection,
        nodeStartPositions: positions,
        additive,
        didDrag: false,
      };
    },
    [
      store,
      getTransform,
      localScreenPoint,
      snapToGridRef,
      disabledRef,
      gesture,
      cancelRaf,
      commitPending,
    ]
  );

  const onNodeBodyPointerUp = useCallback(
    (event: React.PointerEvent<HTMLDivElement>, node: NodeGraphNode): void => {
      const session = dragRef.current;
      if (session?.pointerId !== event.pointerId) return;
      event.stopPropagation();
      gesture.finish(event);

      // Drain any deferred pointermove update before reading from the store —
      // otherwise the commit would use the previous frame's delta and drop
      // the final sub-frame movement before pointerup.
      flushPending();

      if (session.didDrag) {
        // Commit positions from store's interaction delta.
        const interaction = store.getInteraction();
        if (interaction.kind === 'drag-nodes') {
          const delta = interaction.delta;
          const nextNodes = store.getData().nodes.map(n => {
            const start = session.nodeStartPositions.get(n.id);
            if (!start) return n;
            return {
              ...n,
              position: { x: start.x + delta.x, y: start.y + delta.y },
            };
          });
          emitNodesChangeRef.current(nextNodes);
        }
        store.setInteraction({ kind: 'idle' });
      } else {
        // Plain click — handle selection semantics.
        if (node.selectable !== false) {
          const current = session.selectionAtStart;
          emitSelectionChangeRef.current({
            nodes: toggleSelected(current.nodes, node.id, session.additive),
            edges: session.additive ? current.edges : [],
            groups: session.additive ? current.groups : [],
          });
        }
      }

      dragRef.current = null;
    },
    [store, emitNodesChangeRef, emitSelectionChangeRef, gesture, flushPending]
  );

  return { onNodeBodyPointerDown, onNodeBodyPointerUp };
}
