'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { cx } from '@/utils/cx';
import { ColorPicker } from '@/components/controls/ColorPicker/ColorPicker';
import { Popover } from '@/components/primitives/Popover/Popover';
import { PopoverContent } from '@/components/primitives/Popover/PopoverContent';
import { PopoverTrigger } from '@/components/primitives/Popover/PopoverTrigger';
import {
  groupColorSwatchStyle,
  groupLabelBarStyle,
  groupLabelInputStyle,
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
  /**
   * Commit a label or colour edit. The library calls this when the user
   * finishes editing the label (Enter / blur) or picks a new colour from
   * the swatch. Parent forwards to `setGroups` / `onGroupsChange`.
   */
  onLabelChange: (group: NodeGraphGroup, nextLabel: string) => void;
  onColorChange: (group: NodeGraphGroup, nextColor: string) => void;
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

const DEFAULT_PICKER_COLOR = '#5d8dff';

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
      blocked: boolean;
    }
  | {
      kind: 'resize';
      handle: NodeGraphGroupResizeHandle;
      startBounds: WorldRect;
      delta: { x: number; y: number };
      blocked: boolean;
    }
  | null;

function gestureStateEqual(
  a: GroupGestureState,
  b: GroupGestureState
): boolean {
  if (a === b) return true;
  if (a === null || b === null) return false;
  if (a.kind !== b.kind) return false;
  if (a.blocked !== b.blocked) return false;
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
    return {
      kind: 'drag',
      delta: interaction.delta,
      blocked: interaction.blocked,
    };
  }
  if (interaction.kind === 'resize-group' && interaction.groupId === groupId) {
    return {
      kind: 'resize',
      handle: interaction.handle,
      startBounds: interaction.startBounds,
      delta: interaction.delta,
      blocked: interaction.blocked,
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
 * handles selection, drag-to-move, corner/edge resize, label editing,
 * and the colour swatch.
 *
 * Uses per-id selectors so a group only re-renders when *its* selection
 * or gesture state changes — drag deltas of other groups never reach the
 * subscriber.
 *
 * Wrapped in `React.memo` for the same reason as
 * {@link NodeGraphNodeView}: a parent render caused by an unrelated
 * controlled-state update would otherwise iterate every group. Handlers
 * passed from `NodeGraphImpl` are all `useCallback`-stable.
 */
function NodeGraphGroupViewImpl({
  group,
  onBodyPointerDown,
  onBodyPointerUp,
  onHandlePointerDown,
  onBodyContextMenu,
  onLabelChange,
  onColorChange,
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
  const blocked = gesture?.blocked ?? false;
  const bounds = computeLiveBounds(group, gesture);

  // ── Inline label edit ──
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(group.label ?? '');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!editing) {
      setDraft(group.label ?? '');
    }
  }, [editing, group.label]);

  useEffect(() => {
    if (editing) {
      // Defer focus until the input has been mounted.
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [editing]);

  const commitLabel = useCallback((): void => {
    const trimmed = draft.trim();
    setEditing(false);
    if (trimmed === (group.label ?? '')) return;
    onLabelChange(group, trimmed);
  }, [draft, group, onLabelChange]);

  const cancelLabel = useCallback((): void => {
    setEditing(false);
    setDraft(group.label ?? '');
  }, [group.label]);

  const handleLabelDoubleClick = useCallback(
    (event: React.MouseEvent<HTMLSpanElement>): void => {
      event.stopPropagation();
      setEditing(true);
    },
    []
  );

  const handleInputKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>): void => {
      if (event.key === 'Enter') {
        event.preventDefault();
        commitLabel();
      } else if (event.key === 'Escape') {
        event.preventDefault();
        cancelLabel();
      }
      // Stop arrow keys from triggering the graph's nudge handler.
      event.stopPropagation();
    },
    [commitLabel, cancelLabel]
  );

  // ── Colour picker ──
  //
  // The swatch is a `<button>` that triggers the entangle-ui `<ColorPicker>`
  // popover. The picker has `showAlpha` enabled so it returns proper
  // `rgba(...)` strings when the user lowers opacity — the canvas
  // `drawGroups` fill plumbs that straight through with no transform.
  const handleColorChange = useCallback(
    (next: string): void => {
      onColorChange(group, next);
    },
    [group, onColorChange]
  );

  // Picker value falls back to a sensible default when the group hasn't
  // been coloured yet (the library doesn't impose a default).
  const pickerValue = group.color ?? DEFAULT_PICKER_COLOR;

  return (
    <div
      className={cx(groupOverlayRecipe({ selected, dragging, blocked }))}
      style={{
        left: bounds.x,
        top: bounds.y,
        width: bounds.width,
        height: bounds.height,
      }}
      data-group-id={group.id}
      data-blocked={blocked || undefined}
      onPointerDown={e => onBodyPointerDown(e, group)}
      onPointerUp={e => onBodyPointerUp(e, group)}
      onContextMenu={onBodyContextMenu}
    >
      <div
        className={groupLabelBarStyle}
        // Don't let pointerdown on the label bar (label text, color swatch,
        // input) fall through to the body drag handler — the label bar is
        // an interactive control row, not a draggable handle.
        onPointerDown={e => e.stopPropagation()}
      >
        {editing ? (
          <input
            ref={inputRef}
            className={groupLabelInputStyle}
            value={draft}
            placeholder="Group name"
            spellCheck={false}
            onChange={e => setDraft(e.target.value)}
            onBlur={commitLabel}
            onKeyDown={handleInputKeyDown}
          />
        ) : (
          <span
            className={groupLabelStyle}
            onDoubleClick={handleLabelDoubleClick}
            title="Double-click to rename"
          >
            {group.label?.trim() ? group.label : 'Group'}
          </span>
        )}
        <Popover placement="bottom-end">
          <PopoverTrigger>
            <button
              type="button"
              aria-label="Change group colour"
              title="Change group colour"
              className={groupColorSwatchStyle}
              style={{ background: group.color ?? DEFAULT_PICKER_COLOR }}
            />
          </PopoverTrigger>
          <PopoverContent padding="md">
            {/* Uncontrolled picker — `useColor` only mutates its internal
                state when `value` is undefined, so passing `defaultValue`
                lets the user actually drag the sliders / click the
                palette. PopoverContent unmounts on close, so each open
                gets a fresh mount that picks up the current
                `group.color` via `defaultValue`. `showAlpha` lets the
                picker emit translucent fills directly — we ask for
                `format="rgba"` so the alpha channel is actually included
                in the output string (`"rgb"` strips it). Survives
                round-trip through the canvas group fill with no
                consumer-side transform. */}
            <ColorPicker
              inline
              showAlpha
              defaultValue={pickerValue}
              format="rgba"
              palette="material"
              onChangeComplete={handleColorChange}
            />
          </PopoverContent>
        </Popover>
      </div>
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

export const NodeGraphGroupView = React.memo(NodeGraphGroupViewImpl);
NodeGraphGroupView.displayName = 'NodeGraphGroupView';
