import type React from 'react';
import type { Prettify } from '@/types/utilities';

export type ToastSeverity = 'info' | 'success' | 'warning' | 'error';

export type ToastPosition =
  | 'top-right'
  | 'top-left'
  | 'top-center'
  | 'bottom-right'
  | 'bottom-left'
  | 'bottom-center';

export interface ToastData {
  id?: string;
  title?: string;
  message: string;
  severity?: ToastSeverity;
  duration?: number;
  closable?: boolean;
  showProgress?: boolean;
  icon?: React.ReactNode;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export interface ToastInternalData extends ToastData {
  id: string;
  severity: ToastSeverity;
  duration: number;
  closable: boolean;
  showProgress: boolean;
  createdAt: number;
}

export interface ToastProviderBaseProps {
  children: React.ReactNode;
  position?: ToastPosition;
  maxVisible?: number;
  defaultDuration?: number;
  gap?: number;
  zIndex?: number;
}

export type ToastProviderProps = Prettify<ToastProviderBaseProps>;

export interface UseToastReturn {
  toast: (data: ToastData) => string;
  info: (message: string, options?: Partial<ToastData>) => string;
  success: (message: string, options?: Partial<ToastData>) => string;
  warning: (message: string, options?: Partial<ToastData>) => string;
  error: (message: string, options?: Partial<ToastData>) => string;
  dismiss: (id: string) => void;
  dismissAll: () => void;
}
