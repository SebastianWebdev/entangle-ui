'use client';

import React, { useSyncExternalStore } from 'react';
import { cx } from '@/utils/cx';
import {
  groupLabelStyle,
  groupOverlayRecipe,
  groupResizeHandleStyle,
} from './NodeGraph.css';
import type { NodeGraphGroup } from './NodeGraph.types';
import type { NodeGraphGroupResizeHandle } from './NodeGraphStore';
import { useNodeGraphStore } from './NodeGraphContext';
import { applyGroupResize } from './nodeGraphMath';

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
  onBodyContextMenu: (
    event: React.MouseEvent<HTMLDivElement>,
    group: NodeGraphGroup
  ) => void;
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
 * Render a single interactive group overlay positioned in world space.
 * The canvas layer draws the visual fill underneath — this HTML element
 * handles selection, drag-to-move, and corner/edge resize.
 *
 * Subscribes to selection and interaction slices so the overlay reflects
 * the live drag delta or resize bounds without forcing the whole graph
 * to re-render.
 */
export function NodeGraphGroupView({
  group,
  onBodyPointerDown,
  onBodyPointerUp,
  onHandlePointerDown,
  onBodyContextMenu,
}: NodeGraphGroupViewProps): React.ReactElement {
  const store = useNodeGraphStore();
  const selection = useSyncExternalStore(
    store.subscribeSelection,
    store.getSelection
  );
  const interaction = useSyncExternalStore(
    store.subscribeInteraction,
    store.getInteraction
  );

  const selected = selection.groups.includes(group.id);
  const dragging =
    interaction.kind === 'drag-groups' &&
    interaction.groupIds.includes(group.id);
  const resizing =
    interaction.kind === 'resize-group' && interaction.groupId === group.id;

  // Apply in-flight drag/resize deltas so the overlay tracks the gesture
  // 1:1 without waiting for the consumer to commit the new bounds.
  let { x, y, width, height } = group.bounds;
  if (dragging) {
    x += interaction.delta.x;
    y += interaction.delta.y;
  } else if (resizing) {
    const next = applyGroupResize(
      interaction.startBounds,
      interaction.handle,
      interaction.delta
    );
    x = next.x;
    y = next.y;
    width = next.width;
    height = next.height;
  }

  return (
    <div
      className={cx(groupOverlayRecipe({ selected, dragging: dragging }))}
      style={{
        left: x,
        top: y,
        width,
        height,
      }}
      data-group-id={group.id}
      onPointerDown={e => onBodyPointerDown(e, group)}
      onPointerUp={e => onBodyPointerUp(e, group)}
      onContextMenu={e => onBodyContextMenu(e, group)}
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
