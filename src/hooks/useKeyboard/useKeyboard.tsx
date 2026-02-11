'use client';

// src/hooks/useKeyboard.ts
import { useEffect, useState, useCallback, useMemo } from 'react';
import type { KeyboardState, KeyboardInnerState, AllKeys } from './types';
import { updateState, mapInnerStateToState } from './utils';

export type { ModifierKeys, KeyboardState, AllKeys } from './types';
export { isKeyPressed, isModifierKey } from './utils';

/**
 * Hook for tracking keyboard state including modifier keys and pressed keys.
 *
 * Useful for components that need to respond to keyboard modifiers like
 * Ctrl+drag for snapping, Shift+drag for precision, etc.
 * @returns Current keyboard state
 *
 * @example
 * ```tsx
 * // Track all keys and modifiers
 * const keyboard = useKeyboard();
 *
 * const handleMouseMove = (e: MouseEvent) => {
 *   if (keyboard.ctrl) {
 *     // Snap to grid
 *   } else if (keyboard.shift) {
 *     // Precision mode
 *   }
 * };
 *
 * // Track only specific keys
 * const keyboard = useKeyboard({
 *   trackAllKeys: false,
 *   trackedKeys: ['Space', 'Enter', 'Escape']
 * });
 *
 * // Check if specific key is pressed
 * const isSpacePressed = keyboard.pressedKeys.includes('Space');
 * ```
 */
export const useKeyboard = (): KeyboardState => {
  const [keyboardState, setKeyboardState] = useState<KeyboardInnerState>(
    new Set<AllKeys>()
  );

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    setKeyboardState(prevState => updateState(prevState, event));
  }, []);

  const handleKeyUp = useCallback((event: KeyboardEvent) => {
    setKeyboardState(prevState => updateState(prevState, event));
  }, []);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [handleKeyDown, handleKeyUp]);

  return useMemo(() => mapInnerStateToState(keyboardState), [keyboardState]);
};
