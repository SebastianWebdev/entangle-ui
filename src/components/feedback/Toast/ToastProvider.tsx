import React, { createContext, useReducer, useMemo } from 'react';
import { createPortal } from 'react-dom';
import type { ToastProviderProps, ToastInternalData } from './Toast.types';
import { ToastContainer } from './ToastContainer';

// --- Toast Actions ---

type ToastAction =
  | { type: 'ADD_TOAST'; toast: ToastInternalData }
  | { type: 'DISMISS_TOAST'; id: string }
  | { type: 'DISMISS_ALL' };

// --- Toast Context ---

export interface ToastContextValue {
  dispatch: React.Dispatch<ToastAction>;
  defaultDuration: number;
}

export const ToastContext = createContext<ToastContextValue | null>(null);

// --- Reducer ---

function toastReducer(
  state: ToastInternalData[],
  action: ToastAction
): ToastInternalData[] {
  switch (action.type) {
    case 'ADD_TOAST':
      return [...state, action.toast];
    case 'DISMISS_TOAST':
      return state.filter(t => t.id !== action.id);
    case 'DISMISS_ALL':
      return [];
    default:
      return state;
  }
}

/**
 * ToastProvider manages toast notification state and renders them via portal.
 *
 * Wrap your application (or a section of it) with this provider, then use
 * the `useToast()` hook to trigger notifications from any child component.
 *
 * @example
 * ```tsx
 * <ToastProvider position="bottom-right" maxVisible={5}>
 *   <App />
 * </ToastProvider>
 * ```
 */
export const ToastProvider: React.FC<ToastProviderProps> = ({
  children,
  position = 'bottom-right',
  maxVisible = 5,
  defaultDuration = 5000,
  gap = 8,
  zIndex = 1200,
}) => {
  const [toasts, dispatch] = useReducer(toastReducer, []);

  const contextValue = useMemo<ToastContextValue>(
    () => ({ dispatch, defaultDuration }),
    [dispatch, defaultDuration]
  );

  const visibleToasts = toasts.slice(-maxVisible);

  const handleDismiss = (id: string) => {
    dispatch({ type: 'DISMISS_TOAST', id });
  };

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      {typeof document !== 'undefined' &&
        createPortal(
          <ToastContainer
            toasts={visibleToasts}
            position={position}
            gap={gap}
            zIndex={zIndex}
            onDismiss={handleDismiss}
          />,
          document.body
        )}
    </ToastContext.Provider>
  );
};

ToastProvider.displayName = 'ToastProvider';
