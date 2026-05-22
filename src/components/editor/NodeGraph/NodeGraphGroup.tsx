'use client';

import React from 'react';
import { cx } from '@/utils/cx';
import {
  groupLabelStyle,
  groupOverlayRecipe,
  groupResizeHandleStyle,
} from './NodeGraph.css';
import type { NodeGraphGroup } from './NodeGraph.types';
import type {
  NodeGraphGroupResizeHandle,
  NodeGraphInteractionState,
} from './NodeGraphStore';
import { useNodeGraphStore } from './NodeGraphContext';
import { applyGroupResize } from './nodeGraphMath';
import { useStoreSlice } from './useStoreSlice';
import type { WorldRect } from '@/components/primitives/viewport';

interface NodeGraphGroupViewProps {
  group: NodeGraphGroup;
  /** Pointer-down on the group body — used for drag / click selection. */
  onBodyPointerDown: (
    event: React.PointerEvent<HTMLDivElement>,
    group: NodeGraphGroup
  ) => void;
  /** Pointer-up on the group body — completes click-to-select if no drag. */
  onBodyPointerUp: (
    event: React.PointerEvent<HTMLDivElement>,
    group: NodeGraphGroup
  ) => void;
  /** Pointer-down on a resize handle. */
  onHandlePointerDown: (
    event: React.PointerEvent<HTMLDivElement>,
    group: NodeGraphGroup,
    handle: NodeGraphGroupResizeHandle
  ) => void;
  onBodyContextMenu: (event: React.MouseEvent<HTMLDivElement>) => void;
}

const RESIZE_CURSORS: Record<NodeGraphGroupResizeHandle, string> = {
  nw: 'nwse-resize',
  n: 'ns-resize',
  ne: 'nesw-resize',
  e: 'ew-resize',
  se: 'nwse-resize',
  s: 'ns-resize',
  sw: 'nesw-resize',
  w: 'ew-resize',
};

const HANDLE_POSITIONS: Record<
  NodeGraphGroupResizeHandle,
  { left?: string; right?: string; top?: string; bottom?: string }
> = {
  nw: { left: '-5px', top: '-5px' },
  n: { left: 'calc(50% - 5px)', top: '-5px' },
  ne: { right: '-5px', top: '-5px' },
  e: { right: '-5px', top: 'calc(50% - 5px)' },
  se: { right: '-5px', bottom: '-5px' },
  s: { left: 'calc(50% - 5px)', bottom: '-5px' },
  sw: { left: '-5px', bottom: '-5px' },
  w: { left: '-5px', top: 'calc(50% - 5px)' },
};

const ALL_HANDLES: NodeGraphGroupResizeHandle[] = [
  'nw',
  'n',
  'ne',
  'e',
  'se',
  's',
  'sw',
  'w',
];

/**
 * Per-group slice of the interaction state — `null` for groups that
 * aren't currently being dragged or resized. Two distinct `null`
 * references would defeat the equality short-circuit, so we share the
 * module-level constant below.
 */
type GroupGestureState =
  | {
      kind: 'drag';
      delta: { x: number; y: number };
    }
  | {
      kind: 'resize';
      handle: NodeGraphGroupResizeHandle;
      startBounds: WorldRect;
      delta: { x: number; y: number };
    }
  | null;

function gestureStateEqual(
  a: GroupGestureState,
  b: GroupGestureState
): boolean {
  if (a === b) return true;
  if (a === null || b === null) return false;
  if (a.kind !== b.kind) return false;
  if (a.kind === 'drag' && b.kind === 'drag') {
    return a.delta.x === b.delta.x && a.delta.y === b.delta.y;
  }
  if (a.kind === 'resize' && b.kind === 'resize') {
    return (
      a.handle === b.handle &&
      a.delta.x === b.delta.x &&
      a.delta.y === b.delta.y &&
      a.startBounds.x === b.startBounds.x &&
      a.startBounds.y === b.startBounds.y &&
      a.startBounds.width === b.startBounds.width &&
      a.startBounds.height === b.startBounds.height
    );
  }
  return false;
}

function selectGroupGesture(
  interaction: NodeGraphInteractionState,
  groupId: string
): GroupGestureState {
  if (
    interaction.kind === 'drag-groups' &&
    interaction.groupIds.includes(groupId)
  ) {
    return { kind: 'drag', delta: interaction.delta };
  }
  if (interaction.kind === 'resize-group' && interaction.groupId === groupId) {
    return {
      kind: 'resize',
      handle: interaction.handle,
      startBounds: interaction.startBounds,
      delta: interaction.delta,
    };
  }
  return null;
}

function computeLiveBounds(
  group: NodeGraphGroup,
  gesture: GroupGestureState
): WorldRect {
  if (gesture === null) return group.bounds;
  if (gesture.kind === 'drag') {
    return {
      x: group.bounds.x + gesture.delta.x,
      y: group.bounds.y + gesture.delta.y,
      width: group.bounds.width,
      height: group.bounds.height,
    };
  }
  return applyGroupResize(gesture.startBounds, gesture.handle, gesture.delta);
}

/**
 * Render a single interactive group overlay positioned in world space.
 * The canvas layer draws the visual fill underneath — this HTML element
 * handles selection, drag-to-move, and corner/edge resize.
 *
 * Uses per-id selectors so a group only re-renders when *its* selection
 * or gesture state changes — drag deltas of other groups never reach the
 * subscriber.
 */
export function NodeGraphGroupView({
  group,
  onBodyPointerDown,
  onBodyPointerUp,
  onHandlePointerDown,
  onBodyContextMenu,
}: NodeGraphGroupViewProps): React.ReactElement {
  const store = useNodeGraphStore();
  const groupId = group.id;

  const selected = useStoreSlice(
    store.subscribeSelection,
    store.getSelection,
    sel => sel.groups.includes(groupId)
  );

  const gesture = useStoreSlice<NodeGraphInteractionState, GroupGestureState>(
    store.subscribeInteraction,
    store.getInteraction,
    interaction => selectGroupGesture(interaction, groupId),
    gestureStateEqual
  );

  const dragging = gesture?.kind === 'drag';
  const bounds = computeLiveBounds(group, gesture);

  return (
    <div
      className={cx(groupOverlayRecipe({ selected, dragging }))}
      style={{
        left: bounds.x,
        top: bounds.y,
        width: bounds.width,
        height: bounds.height,
      }}
      data-group-id={group.id}
      onPointerDown={e => onBodyPointerDown(e, group)}
      onPointerUp={e => onBodyPointerUp(e, group)}
      onContextMenu={onBodyContextMenu}
    >
      {group.label ? (
        <span className={groupLabelStyle}>{group.label}</span>
      ) : null}
      {selected
        ? ALL_HANDLES.map(handle => (
            <div
              key={handle}
              className={groupResizeHandleStyle}
              style={{
                ...HANDLE_POSITIONS[handle],
                cursor: RESIZE_CURSORS[handle],
              }}
              data-group-id={group.id}
              data-group-handle={handle}
              onPointerDown={e => onHandlePointerDown(e, group, handle)}
            />
          ))
        : null}
    </div>
  );
}
