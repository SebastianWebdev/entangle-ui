'use client';

import type React from 'react';
import { useCallback, useRef } from 'react';
import { useLatest } from '@/hooks';
import { screenToWorld as worldFromScreen } from '@/components/primitives/viewport';
import type {
  ViewportTransform,
  WorldRect,
} from '@/components/primitives/viewport';
import type { Point2D } from '@/components/primitives/canvas/canvas.types';
import type {
  NodeGraphGroup,
  NodeGraphNode,
  NodeGraphSelection,
} from './NodeGraph.types';
import type {
  NodeGraphGroupResizeHandle,
  NodeGraphStore,
} from './NodeGraphStore';
import {
  applyGroupResize,
  getNodeBox,
  rectContains,
  rectsIntersect,
  snapDelta,
  toggleSelected,
} from './nodeGraphMath';
import { useDragGesture } from './useDragGesture';

const DRAG_START_THRESHOLD_PX = 3;

interface UseNodeGraphGroupDragOptions {
  store: NodeGraphStore;
  getTransform: () => ViewportTransform;
  localScreenPoint: (clientX: number, clientY: number) => Point2D;
  snapToGrid: number | false;
  disabled?: boolean;
  defaultNodeSize: { width: number; height: number };
  emitGroupsChange: (next: NodeGraphGroup[]) => void;
  emitNodesChange: (next: NodeGraphNode[]) => void;
  emitSelectionChange: (next: NodeGraphSelection) => void;
}

interface UseNodeGraphGroupDragReturn {
  onGroupBodyPointerDown: (
    event: React.PointerEvent<HTMLDivElement>,
    group: NodeGraphGroup
  ) => void;
  onGroupHandlePointerDown: (
    event: React.PointerEvent<HTMLDivElement>,
    group: NodeGraphGroup,
    handle: NodeGraphGroupResizeHandle
  ) => void;
  onGroupBodyPointerUp: (
    event: React.PointerEvent<HTMLDivElement>,
    group: NodeGraphGroup
  ) => void;
}

interface GroupDragSession {
  kind: 'drag' | 'resize';
  pointerId: number;
  clickedGroupId: string;
  /** Handle being dragged (only for kind === 'resize'). */
  handle: NodeGraphGroupResizeHandle | null;
  startScreen: Point2D;
  startWorld: Point2D;
  selectionAtStart: NodeGraphSelection;
  /** Snapshot of bounds keyed by group id (for drag). */
  groupStartBounds: Map<string, WorldRect>;
  /**
   * Nodes fully contained inside one of the dragged groups at gesture
   * start — they ride along with the group(s).
   */
  containedNodeIds: ReadonlyArray<string>;
  /** Start positions of the contained nodes, keyed by node id. */
  nodeStartPositions: Map<string, Point2D>;
  /** Bounds of the resized group at start (for resize). */
  resizeStartBounds: WorldRect | null;
  additive: boolean;
  didDrag: boolean;
}

/**
 * Pointer-driven controller for group bodies and resize handles. Three
 * gestures share the same session state machine:
 *
 * - **drag**: pointerdown on a group body → snap-aware translation that
 *   carries fully-contained nodes along, refused on overlap with other
 *   groups, click-selection fallback when below the drag threshold.
 * - **resize**: pointerdown on a handle → eight-direction resize via
 *   {@link applyGroupResize}, refused on overlap.
 * - **click**: pointerup before the drag threshold → selection toggle.
 *
 * Document listeners are attached only while a gesture is in flight.
 */
export function useNodeGraphGroupDrag(
  options: UseNodeGraphGroupDragOptions
): UseNodeGraphGroupDragReturn {
  const {
    store,
    getTransform,
    localScreenPoint,
    snapToGrid,
    disabled,
    defaultNodeSize,
    emitGroupsChange,
    emitNodesChange,
    emitSelectionChange,
  } = options;

  const snapToGridRef = useLatest(snapToGrid);
  const disabledRef = useLatest(disabled);
  const emitGroupsChangeRef = useLatest(emitGroupsChange);
  const emitNodesChangeRef = useLatest(emitNodesChange);
  const emitSelectionChangeRef = useLatest(emitSelectionChange);

  const groupSessionRef = useRef<GroupDragSession | null>(null);

  /**
   * True when applying `delta` to the dragged groups (`session.groupStartBounds`)
   * would put any of them on top of a non-dragged group. Used by the
   * pointermove handler for live visual feedback and by pointerup to
   * refuse the commit.
   */
  const groupDragWouldOverlap = useCallback(
    (groupStartBounds: Map<string, WorldRect>, delta: Point2D): boolean => {
      const currentGroups = store.getData().groups;
      for (const [draggedId, start] of groupStartBounds) {
        const next: WorldRect = {
          x: start.x + delta.x,
          y: start.y + delta.y,
          width: start.width,
          height: start.height,
        };
        for (const other of currentGroups) {
          if (groupStartBounds.has(other.id)) continue;
          // Skip self defensively — already covered by the line above.
          if (other.id === draggedId) continue;
          if (rectsIntersect(next, other.bounds)) return true;
        }
      }
      return false;
    },
    [store]
  );

  /** True when the resized bounds would intersect any non-resized group. */
  const groupResizeWouldOverlap = useCallback(
    (groupId: string, nextBounds: WorldRect): boolean => {
      const currentGroups = store.getData().groups;
      for (const other of currentGroups) {
        if (other.id === groupId) continue;
        if (rectsIntersect(nextBounds, other.bounds)) return true;
      }
      return false;
    },
    [store]
  );

  const gesture = useDragGesture();

  // Shared move handler for both the drag-groups and resize-group gestures.
  // Reads the active session from the ref and pushes the live interaction
  // delta into the store; the threshold-to-start gate lives here for drags.
  const handleGroupMove = useCallback(
    (e: PointerEvent): void => {
      const session = groupSessionRef.current;
      if (session?.pointerId !== e.pointerId) return;
      const current = localScreenPoint(e.clientX, e.clientY);
      const dx = current.x - session.startScreen.x;
      const dy = current.y - session.startScreen.y;
      const transform = getTransform();
      const worldDelta = {
        x: dx / transform.zoom,
        y: dy / transform.zoom,
      };
      const snapped = snapDelta(worldDelta, snapToGridRef.current);

      if (session.kind === 'drag') {
        if (!session.didDrag) {
          if (Math.hypot(dx, dy) < DRAG_START_THRESHOLD_PX) return;
          session.didDrag = true;
        }
        const ids = Array.from(session.groupStartBounds.keys());
        const blocked = groupDragWouldOverlap(
          session.groupStartBounds,
          snapped
        );
        store.setInteraction({
          kind: 'drag-groups',
          groupIds: ids,
          containedNodeIds: session.containedNodeIds,
          startWorld: session.startWorld,
          delta: snapped,
          blocked,
        });
      } else if (
        session.kind === 'resize' &&
        session.resizeStartBounds &&
        session.handle
      ) {
        const nextBounds = applyGroupResize(
          session.resizeStartBounds,
          session.handle,
          snapped
        );
        const blocked = groupResizeWouldOverlap(
          session.clickedGroupId,
          nextBounds
        );
        store.setInteraction({
          kind: 'resize-group',
          groupId: session.clickedGroupId,
          handle: session.handle,
          startBounds: session.resizeStartBounds,
          delta: snapped,
          blocked,
        });
      }
    },
    [
      store,
      localScreenPoint,
      getTransform,
      snapToGridRef,
      groupDragWouldOverlap,
      groupResizeWouldOverlap,
    ]
  );

  const handleGroupCancel = useCallback((): void => {
    groupSessionRef.current = null;
    store.setInteraction({ kind: 'idle' });
  }, [store]);

  const onGroupBodyPointerDown = useCallback(
    (
      event: React.PointerEvent<HTMLDivElement>,
      group: NodeGraphGroup
    ): void => {
      if (event.button !== 0) return;
      event.stopPropagation();
      if (disabledRef.current) return;

      const additive = event.shiftKey || event.metaKey || event.ctrlKey;
      const currentSelection = store.getSelection();
      const alreadySelected = currentSelection.groups.includes(group.id);

      let dragIds: string[];
      if (alreadySelected) {
        dragIds = currentSelection.groups;
      } else if (!additive) {
        dragIds = [group.id];
      } else {
        dragIds = [...currentSelection.groups, group.id];
      }

      const startBounds = new Map<string, WorldRect>();
      for (const g of store.getData().groups) {
        if (dragIds.includes(g.id)) {
          startBounds.set(g.id, { ...g.bounds });
        }
      }

      // Snapshot nodes that are fully inside any of the dragged groups —
      // they ride along with the gesture so the visual grouping stays
      // consistent.
      const containedSet = new Set<string>();
      const nodeStartPositions = new Map<string, Point2D>();
      const measuredFor = store.getMeasuredSize;
      for (const n of store.getData().nodes) {
        const nb = getNodeBox(n, measuredFor(n.id), defaultNodeSize);
        for (const startRect of startBounds.values()) {
          if (rectContains(startRect, nb)) {
            containedSet.add(n.id);
            nodeStartPositions.set(n.id, { ...n.position });
            break;
          }
        }
      }
      const containedNodeIds = Array.from(containedSet);

      const startScreen = localScreenPoint(event.clientX, event.clientY);
      const startWorld = worldFromScreen(startScreen, getTransform());
      const pointerId = event.pointerId;
      gesture.begin(event, {
        onMove: handleGroupMove,
        onCancel: handleGroupCancel,
      });

      groupSessionRef.current = {
        kind: 'drag',
        pointerId,
        clickedGroupId: group.id,
        handle: null,
        startScreen,
        startWorld,
        selectionAtStart: currentSelection,
        groupStartBounds: startBounds,
        containedNodeIds,
        nodeStartPositions,
        resizeStartBounds: null,
        additive,
        didDrag: false,
      };
    },
    [
      disabledRef,
      defaultNodeSize,
      store,
      localScreenPoint,
      getTransform,
      gesture,
      handleGroupMove,
      handleGroupCancel,
    ]
  );

  const onGroupHandlePointerDown = useCallback(
    (
      event: React.PointerEvent<HTMLDivElement>,
      group: NodeGraphGroup,
      handle: NodeGraphGroupResizeHandle
    ): void => {
      if (event.button !== 0) return;
      event.stopPropagation();
      event.preventDefault();
      if (disabledRef.current) return;

      const startScreen = localScreenPoint(event.clientX, event.clientY);
      const startWorld = worldFromScreen(startScreen, getTransform());
      const pointerId = event.pointerId;
      gesture.begin(event, {
        onMove: handleGroupMove,
        onCancel: handleGroupCancel,
      });

      groupSessionRef.current = {
        kind: 'resize',
        pointerId,
        clickedGroupId: group.id,
        handle,
        startScreen,
        startWorld,
        selectionAtStart: store.getSelection(),
        groupStartBounds: new Map(),
        containedNodeIds: [],
        nodeStartPositions: new Map(),
        resizeStartBounds: { ...group.bounds },
        additive: false,
        didDrag: true,
      };
      // Immediately register the resize interaction so the canvas + overlay
      // start tracking from delta=0 at the click point.
      store.setInteraction({
        kind: 'resize-group',
        groupId: group.id,
        handle,
        startBounds: { ...group.bounds },
        delta: { x: 0, y: 0 },
        blocked: false,
      });
    },
    [
      disabledRef,
      localScreenPoint,
      getTransform,
      store,
      gesture,
      handleGroupMove,
      handleGroupCancel,
    ]
  );

  const onGroupBodyPointerUp = useCallback(
    (
      event: React.PointerEvent<HTMLDivElement>,
      group: NodeGraphGroup
    ): void => {
      const session = groupSessionRef.current;
      if (session?.pointerId !== event.pointerId) return;
      event.stopPropagation();
      gesture.finish(event);
      const interaction = store.getInteraction();

      if (session.kind === 'drag' && session.didDrag) {
        if (interaction.kind === 'drag-groups' && !interaction.blocked) {
          const delta = interaction.delta;
          // Apply the delta to both groups and any nodes that were
          // contained at gesture start, in a single set of state writes
          // so consumers get one atomic onGroupsChange + onNodesChange.
          const nextGroups = store.getData().groups.map(g => {
            const start = session.groupStartBounds.get(g.id);
            if (!start) return g;
            return {
              ...g,
              bounds: {
                ...start,
                x: start.x + delta.x,
                y: start.y + delta.y,
              },
            };
          });
          emitGroupsChangeRef.current(nextGroups);
          if (session.nodeStartPositions.size > 0) {
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
        }
        // If `blocked`, drop the gesture without committing — the overlay
        // already snaps back to the start position when we clear the
        // interaction state below.
        store.setInteraction({ kind: 'idle' });
      } else if (session.kind === 'resize') {
        if (
          interaction.kind === 'resize-group' &&
          !interaction.blocked &&
          session.resizeStartBounds &&
          session.handle
        ) {
          const next = applyGroupResize(
            session.resizeStartBounds,
            session.handle,
            interaction.delta
          );
          const nextGroups = store
            .getData()
            .groups.map(g =>
              g.id === session.clickedGroupId ? { ...g, bounds: next } : g
            );
          emitGroupsChangeRef.current(nextGroups);
        }
        store.setInteraction({ kind: 'idle' });
      } else {
        // Plain click on group body → selection
        const current = session.selectionAtStart;
        emitSelectionChangeRef.current({
          nodes: session.additive ? current.nodes : [],
          edges: session.additive ? current.edges : [],
          groups: toggleSelected(current.groups, group.id, session.additive),
        });
      }

      groupSessionRef.current = null;
    },
    [
      store,
      emitGroupsChangeRef,
      emitNodesChangeRef,
      emitSelectionChangeRef,
      gesture,
    ]
  );

  return {
    onGroupBodyPointerDown,
    onGroupHandlePointerDown,
    onGroupBodyPointerUp,
  };
}
