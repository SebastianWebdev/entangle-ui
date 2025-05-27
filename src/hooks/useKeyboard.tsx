// src/hooks/useKeyboard.ts
import { useEffect, useState, useCallback } from 'react';

/**
 * Represents the state of modifier keys and currently pressed keys
 */
export interface KeyboardState {
  /**
   * Array of currently pressed key codes
   */
  pressedKeys: string[];
  
  /**
   * Whether Ctrl key is currently pressed
   */
  ctrl: boolean;
  
  /**
   * Whether Shift key is currently pressed
   */
  shift: boolean;
  
  /**
   * Whether Alt key is currently pressed
   */
  alt: boolean;
  
  /**
   * Whether Meta key (Cmd on Mac, Win on Windows) is currently pressed
   */
  meta: boolean;
}

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

  const [keyboardState, setKeyboardState] = useState<KeyboardState>({
    pressedKeys: [],
    ctrl: false,
    shift: false,
    alt: false,
    meta: false,
  });

  const updateModifiers = useCallback((event: KeyboardEvent) => {
    return {
      ctrl: event.ctrlKey,
      shift: event.shiftKey,
      alt: event.altKey,
      meta: event.metaKey,
    };
  }, []);

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!enabled) return;

    const modifiers = updateModifiers(event);
    
    setKeyboardState(prevState => {
      // Filter out empty or invalid key codes
      const keyCode = event.code;
      if (!keyCode || keyCode.trim() === '') {
        return {
          ...modifiers,
          pressedKeys: prevState.pressedKeys,
        };
      }

      const shouldTrackKey = trackAllKeys || trackedKeys.includes(keyCode);
      
      const newPressedKeys = shouldTrackKey && !prevState.pressedKeys.includes(keyCode)
        ? [...prevState.pressedKeys, keyCode]
        : prevState.pressedKeys;

      return {
        ...modifiers,
        pressedKeys: newPressedKeys,
      };
    });
  }, [enabled, trackAllKeys, trackedKeys, updateModifiers]);

  const handleKeyUp = useCallback((event: KeyboardEvent) => {
    if (!enabled) return;

    const modifiers = updateModifiers(event);
    
    setKeyboardState(prevState => {
      // Filter out empty or invalid key codes
      const keyCode = event.code;
      if (!keyCode || keyCode.trim() === '') {
        return {
          ...modifiers,
          pressedKeys: prevState.pressedKeys,
        };
      }

      const newPressedKeys = prevState.pressedKeys.filter(key => key !== keyCode);

      return {
        ...modifiers,
        pressedKeys: newPressedKeys,
      };
    });
  }, [enabled, updateModifiers]);

  // Handle focus/blur to reset state when window loses focus
  const handleBlur = useCallback(() => {
    if (!enabled) return;
    
    setKeyboardState({
      pressedKeys: [],
      ctrl: false,
      shift: false,
      alt: false,
      meta: false,
    });
  }, [enabled]);

  useEffect(() => {
    if (!enabled) return;

    // Add event listeners
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('blur', handleBlur);
    window.addEventListener('focus', handleBlur); // Reset on focus too

    // Cleanup
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('blur', handleBlur);
      window.removeEventListener('focus', handleBlur);
    };
  }, [handleKeyDown, handleKeyUp, handleBlur, enabled]);

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
export const useKeyPressed = (key: string): boolean => {
  const keyboard = useKeyboard({
    trackAllKeys: false,
    trackedKeys: [key],
  });
  
  return keyboard.pressedKeys.includes(key);
};

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
export const useModifierKeys = () => {
  const keyboard = useKeyboard({
    trackAllKeys: false,
    trackedKeys: [],
  });
  
  return {
    ctrl: keyboard.ctrl,
    shift: keyboard.shift,
    alt: keyboard.alt,
    meta: keyboard.meta,
  };
};
