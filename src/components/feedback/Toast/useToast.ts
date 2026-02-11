'use client';

import { useContext, useCallback, useRef } from 'react';
import { ToastContext } from './ToastProvider';
import type {
  ToastData,
  ToastInternalData,
  UseToastReturn,
} from './Toast.types';

/**
 * Hook to trigger toast notifications from any component
 * inside a `<ToastProvider>`.
 *
 * @throws Error if used outside of a `<ToastProvider>`
 *
 * @example
 * ```tsx
 * const { toast, success, error, dismiss } = useToast();
 *
 * success('File saved successfully');
 * error('Failed to export', { title: 'Export Error' });
 *
 * const id = toast({ message: 'Custom toast', severity: 'info' });
 * dismiss(id);
 * ```
 */
export function useToast(): UseToastReturn {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }

  const { dispatch, defaultDuration } = context;
  const counterRef = useRef(0);

  const generateId = useCallback(() => {
    counterRef.current += 1;
    return `toast-${Date.now()}-${counterRef.current}`;
  }, []);

  const toast = useCallback(
    (data: ToastData): string => {
      const id = data.id ?? generateId();
      const internalData: ToastInternalData = {
        ...data,
        id,
        severity: data.severity ?? 'info',
        duration: data.duration ?? defaultDuration,
        closable: data.closable ?? true,
        showProgress: data.showProgress ?? false,
        createdAt: Date.now(),
      };
      dispatch({ type: 'ADD_TOAST', toast: internalData });
      return id;
    },
    [dispatch, defaultDuration, generateId]
  );

  const info = useCallback(
    (message: string, options?: Partial<ToastData>): string =>
      toast({ message, severity: 'info', ...options }),
    [toast]
  );

  const success = useCallback(
    (message: string, options?: Partial<ToastData>): string =>
      toast({ message, severity: 'success', ...options }),
    [toast]
  );

  const warning = useCallback(
    (message: string, options?: Partial<ToastData>): string =>
      toast({ message, severity: 'warning', ...options }),
    [toast]
  );

  const error = useCallback(
    (message: string, options?: Partial<ToastData>): string =>
      toast({ message, severity: 'error', ...options }),
    [toast]
  );

  const dismiss = useCallback(
    (id: string) => {
      dispatch({ type: 'DISMISS_TOAST', id });
    },
    [dispatch]
  );

  const dismissAll = useCallback(() => {
    dispatch({ type: 'DISMISS_ALL' });
  }, [dispatch]);

  return { toast, info, success, warning, error, dismiss, dismissAll };
}
