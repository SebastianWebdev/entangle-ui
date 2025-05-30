// src/hooks/useKeyboard.ts
import { useEffect, useState, useCallback } from 'react';
import { 
  KeyboardState, 
  useKeyboardContext, 
  useKeyPressed as useContextKeyPressed,
  useModifierKeys as useContextModifierKeys
} from '@/contexts/KeyboardContext';

/**
 * Configuration options for the useKeyboard hook
 */
export interface UseKeyboardOptions {
  /**
   * Whether to track all pressed keys or just modifiers
   * @default true
   */
  trackAllKeys?: boolean;
  
  /**
   * Keys to specifically track (if trackAllKeys is false)
   * @default []
   */
  trackedKeys?: string[];
  
  /**
   * Whether the hook should be active
   * @default true
   */
  enabled?: boolean;
}

/**
 * Hook for tracking keyboard state including modifier keys and pressed keys.
 * 
 * Useful for components that need to respond to keyboard modifiers like
 * Ctrl+drag for snapping, Shift+drag for precision, etc.
 * 
 * @param options Configuration options
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
export const useKeyboard = (options: UseKeyboardOptions = {}): KeyboardState => {
  const {
    trackAllKeys = true,
    trackedKeys = [],
    enabled = true,
  } = options;

  // Używamy kontekstu zamiast lokalnego stanu
  const keyboardState = useKeyboardContext();
  
  // Filtrujemy klawisze, jeśli nie śledzimy wszystkich
  if (!trackAllKeys && trackedKeys.length > 0 && enabled) {
    return {
      ...keyboardState,
      pressedKeys: keyboardState.pressedKeys.filter(key => trackedKeys.includes(key))
    };
  }
  
  // Zwracamy pusty stan, jeśli hook jest wyłączony
  if (!enabled) {
    return {
      pressedKeys: [],
      ctrl: false,
      shift: false,
      alt: false,
      meta: false,
    };
  }
  
  return keyboardState;
};

/**
 * Utility hook that returns a function to check if a specific key is currently pressed
 * 
 * @param key The key code to check (e.g., 'Space', 'Enter', 'KeyA')
 * @returns Boolean indicating if the key is pressed
 * 
 * @example
 * ```tsx
 * const isSpacePressed = useKeyPressed('Space');
 * const isEnterPressed = useKeyPressed('Enter');
 * 
 * if (isSpacePressed) {
 *   // Handle space key
 * }
 * ```
 */
export const useKeyPressed = useContextKeyPressed;

/**
 * Utility hook for tracking only modifier keys (more performant than full useKeyboard)
 * 
 * @returns Object with modifier key states
 * 
 * @example
 * ```tsx
 * const modifiers = useModifierKeys();
 * 
 * const handleDrag = (e: MouseEvent) => {
 *   if (modifiers.ctrl) {
 *     // Snap to grid
 *   } else if (modifiers.shift) {
 *     // Precision mode
 *   }
 * };
 * ```
 */
export const useModifierKeys = useContextModifierKeys;

// Eksportujemy typy dla wstecznej kompatybilności
export type { KeyboardState };
