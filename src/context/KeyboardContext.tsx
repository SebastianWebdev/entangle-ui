import React from 'react';
import { createContext, useContext, memo, useEffect, useCallback } from 'react';

import { useKeyboard, isKeyPressed } from '@/hooks/useKeyboard';
import type { KeyboardState, AllKeys } from '@/hooks/useKeyboard';

const KeyboardContext = /*#__PURE__*/ createContext<KeyboardState | null>(null);

export interface KeyboardContextProviderProps {
  children: React.ReactNode;
}

export const KeyboardContextProvider = /*#__PURE__*/ memo(
  ({ children }: KeyboardContextProviderProps) => {
    const keyboardState = useKeyboard();
    return (
      <KeyboardContext.Provider value={keyboardState}>
        {children}
      </KeyboardContext.Provider>
    );
  }
);

export const useKeyboardContext = (): KeyboardState => {
  const context = useContext(KeyboardContext);
  if (!context) {
    throw new Error(
      'useKeyboardContext must be used within a KeyboardContextProvider'
    );
  }
  return context;
};

type KeyboardEffectMode = 'keydown' | 'keyup';

type KeyboardEffect = {
  key: AllKeys;
  actions: {
    [mode in KeyboardEffectMode]?: () => void;
  };
};

export function useEffectsOnKeyboard(actions: KeyboardEffect[]): void {
  const keyboard = useKeyboardContext();

  const handleKeyDown = useCallback(() => {
    actions.forEach(action => {
      if (isKeyPressed(keyboard, action.key) && action.actions.keydown) {
        action.actions.keydown();
      }
    });
  }, [keyboard, actions]);

  const handleKeyUp = useCallback(() => {
    actions.forEach(action => {
      if (isKeyPressed(keyboard, action.key) && action.actions.keyup) {
        action.actions.keyup();
      }
    });
  }, [keyboard, actions]);

  useEffect(() => {
    handleKeyDown();
    handleKeyUp();
  }, [handleKeyDown, handleKeyUp]);
}
