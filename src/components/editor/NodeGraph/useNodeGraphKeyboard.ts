'use client';

import type React from 'react';
import { useCallback } from 'react';
import { useLatest } from '@/hooks';
import type { NodeGraphNode, NodeGraphSelection } from './NodeGraph.types';
import type { NodeGraphStore } from './NodeGraphStore';

interface UseNodeGraphKeyboardOptions {
  store: NodeGraphStore;
  emitNodesChange: (next: NodeGraphNode[]) => void;
  emitSelectionChange: (next: NodeGraphSelection) => void;
  onDelete?: (selection: NodeGraphSelection) => void;
  onActivate?: (node: NodeGraphNode) => void;
  snapToGrid: number | false;
  /** When true, all keyboard handling is skipped. */
  disabled?: boolean;
}

interface UseNodeGraphKeyboardReturn {
  onKeyDown: (event: React.KeyboardEvent<HTMLDivElement>) => void;
}

const NUDGE_STEP_DEFAULT = 1;
const NUDGE_STEP_SHIFT = 10;

/**
 * Keyboard interaction model for `<NodeGraph>`:
 *
 * | Keys                | Action                                       |
 * | ------------------- | -------------------------------------------- |
 * | Arrow keys          | Nudge selected nodes by 1 grid step (or 1 unit) |
 * | Shift + Arrow keys  | Nudge by 10× the base step                    |
 * | Delete / Backspace  | Emit `onDelete(selection)` (non-empty)       |
 * | Enter               | Emit `onActivate(node)` when exactly one node selected |
 * | Cmd/Ctrl + A        | Select all nodes                              |
 * | Escape              | Clear selection (or cancel active gesture)    |
 */
export function useNodeGraphKeyboard(
  options: UseNodeGraphKeyboardOptions
): UseNodeGraphKeyboardReturn {
  const {
    store,
    emitNodesChange,
    emitSelectionChange,
    onDelete,
    onActivate,
    snapToGrid,
    disabled,
  } = options;

  const emitNodesChangeRef = useLatest(emitNodesChange);
  const emitSelectionChangeRef = useLatest(emitSelectionChange);
  const onDeleteRef = useLatest(onDelete);
  const onActivateRef = useLatest(onActivate);
  const snapToGridRef = useLatest(snapToGrid);
  const disabledRef = useLatest(disabled);

  const nudgeSelected = useCallback(
    (dx: number, dy: number): boolean => {
      const data = store.getData();
      const selection = store.getSelection();
      if (selection.nodes.length === 0) return false;
      const selectedIds = new Set(selection.nodes);
      const next = data.nodes.map(node => {
        if (!selectedIds.has(node.id)) return node;
        return {
          ...node,
          position: { x: node.position.x + dx, y: node.position.y + dy },
        };
      });
      emitNodesChangeRef.current(next);
      return true;
    },
    [store, emitNodesChangeRef]
  );

  const onKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>): void => {
      if (disabledRef.current) return;
      // Don't steal input focus — if the event originated in an editable
      // element inside a node body, leave it alone.
      const target = event.target as HTMLElement | null;
      if (
        target &&
        (target.isContentEditable ||
          target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT')
      ) {
        return;
      }

      const grid = snapToGridRef.current;
      const baseStep = grid === false || grid <= 0 ? NUDGE_STEP_DEFAULT : grid;
      const step = event.shiftKey ? baseStep * NUDGE_STEP_SHIFT : baseStep;

      // Dispatch on `event.code` so character keys are matched by physical
      // location (e.g. `KeyA` for Ctrl+A), not by the printed character
      // — which would otherwise differ on non-QWERTY / non-Latin layouts.
      // For special keys (`ArrowUp`, `Delete`, `Backspace`, `Enter`,
      // `Escape`) `event.code` equals `event.key`, so existing cases keep
      // working unchanged.
      switch (event.code) {
        case 'ArrowUp':
          if (nudgeSelected(0, -step)) event.preventDefault();
          return;
        case 'ArrowDown':
          if (nudgeSelected(0, step)) event.preventDefault();
          return;
        case 'ArrowLeft':
          if (nudgeSelected(-step, 0)) event.preventDefault();
          return;
        case 'ArrowRight':
          if (nudgeSelected(step, 0)) event.preventDefault();
          return;
        case 'Delete':
        case 'Backspace': {
          const selection = store.getSelection();
          if (
            selection.nodes.length === 0 &&
            selection.edges.length === 0 &&
            selection.groups.length === 0
          ) {
            return;
          }
          onDeleteRef.current?.(selection);
          event.preventDefault();
          return;
        }
        case 'Enter': {
          const selection = store.getSelection();
          if (selection.nodes.length !== 1) return;
          const id = selection.nodes[0];
          const node = id != null ? store.getNodeById(id) : undefined;
          if (node) {
            onActivateRef.current?.(node);
            event.preventDefault();
          }
          return;
        }
        // `event.code` is layout-independent — matches the physical "A"
        // key regardless of the user's keyboard layout (Polish, Cyrillic,
        // Dvorak, etc., would otherwise fire a different `event.key`).
        case 'KeyA': {
          if (!(event.metaKey || event.ctrlKey)) return;
          const data = store.getData();
          emitSelectionChangeRef.current({
            nodes: data.nodes.map(n => n.id),
            edges: [],
            groups: [],
          });
          event.preventDefault();
          return;
        }
        case 'Escape': {
          // Cancel an in-flight connection first; otherwise clear selection.
          const interaction = store.getInteraction();
          if (interaction.kind !== 'idle') {
            store.setInteraction({ kind: 'idle' });
            event.preventDefault();
            return;
          }
          const selection = store.getSelection();
          if (
            selection.nodes.length === 0 &&
            selection.edges.length === 0 &&
            selection.groups.length === 0
          ) {
            return;
          }
          emitSelectionChangeRef.current({ nodes: [], edges: [], groups: [] });
          event.preventDefault();
          return;
        }
        default:
          return;
      }
    },
    [
      store,
      nudgeSelected,
      onDeleteRef,
      onActivateRef,
      emitSelectionChangeRef,
      snapToGridRef,
      disabledRef,
    ]
  );

  return { onKeyDown };
}
