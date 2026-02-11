'use client';

import { useCallback, useReducer } from 'react';
import type {
  PropertyUndoEntry,
  UsePropertyUndoOptions,
  UsePropertyUndoReturn,
} from './PropertyInspector.types';

// --- Reducer ---

interface UndoState<T> {
  undoStack: PropertyUndoEntry<T>[];
  redoStack: PropertyUndoEntry<T>[];
}

type UndoAction<T> =
  | { type: 'RECORD'; entry: PropertyUndoEntry<T>; maxHistory: number }
  | { type: 'UNDO' }
  | { type: 'REDO' }
  | { type: 'CLEAR' };

function undoReducer<T>(
  state: UndoState<T>,
  action: UndoAction<T>
): UndoState<T> {
  switch (action.type) {
    case 'RECORD': {
      const newStack = [...state.undoStack, action.entry];
      if (newStack.length > action.maxHistory) {
        newStack.shift();
      }
      return {
        undoStack: newStack,
        redoStack: [],
      };
    }
    case 'UNDO': {
      if (state.undoStack.length === 0) return state;
      const entry = state.undoStack[
        state.undoStack.length - 1
      ] as PropertyUndoEntry<T>;
      return {
        undoStack: state.undoStack.slice(0, -1),
        redoStack: [...state.redoStack, entry],
      };
    }
    case 'REDO': {
      if (state.redoStack.length === 0) return state;
      const entry = state.redoStack[
        state.redoStack.length - 1
      ] as PropertyUndoEntry<T>;
      return {
        undoStack: [...state.undoStack, entry],
        redoStack: state.redoStack.slice(0, -1),
      };
    }
    case 'CLEAR':
      return { undoStack: [], redoStack: [] };
    default:
      return state;
  }
}

// --- Hook ---

/**
 * Lightweight undo/redo stack for property changes.
 * Records entries with property identifiers and values for precise undo control.
 */
export function usePropertyUndo<T = unknown>(
  options?: UsePropertyUndoOptions
): UsePropertyUndoReturn<T> {
  const maxHistory = options?.maxHistory ?? 50;

  const [state, dispatch] = useReducer(undoReducer<T>, {
    undoStack: [],
    redoStack: [],
  });

  const record = useCallback(
    (entry: Omit<PropertyUndoEntry<T>, 'timestamp'>) => {
      dispatch({
        type: 'RECORD',
        entry: { ...entry, timestamp: Date.now() },
        maxHistory,
      });
    },
    [maxHistory]
  );

  const undo = useCallback((): PropertyUndoEntry<T> | null => {
    if (state.undoStack.length === 0) return null;
    const entry = state.undoStack[
      state.undoStack.length - 1
    ] as PropertyUndoEntry<T>;
    dispatch({ type: 'UNDO' });
    return entry;
  }, [state.undoStack]);

  const redo = useCallback((): PropertyUndoEntry<T> | null => {
    if (state.redoStack.length === 0) return null;
    const entry = state.redoStack[
      state.redoStack.length - 1
    ] as PropertyUndoEntry<T>;
    dispatch({ type: 'REDO' });
    return entry;
  }, [state.redoStack]);

  const clear = useCallback(() => {
    dispatch({ type: 'CLEAR' });
  }, []);

  return {
    record,
    undo,
    redo,
    canUndo: state.undoStack.length > 0,
    canRedo: state.redoStack.length > 0,
    history: state.undoStack,
    clear,
  };
}
