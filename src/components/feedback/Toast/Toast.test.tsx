import React from 'react';
import { screen, fireEvent, act, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, afterEach, beforeEach } from 'vitest';
import { renderWithTheme } from '@/tests/testUtils';
import { ToastProvider } from './ToastProvider';
import { useToast } from './useToast';
import type { ToastData } from './Toast.types';

// --- Test helper component ---

interface ToastTriggerProps {
  onMounted?: (api: ReturnType<typeof useToast>) => void;
  triggerData?: ToastData;
  triggerMethod?: 'toast' | 'info' | 'success' | 'warning' | 'error';
}

const ToastTrigger: React.FC<ToastTriggerProps> = ({
  onMounted,
  triggerData,
  triggerMethod = 'toast',
}) => {
  const api = useToast();

  React.useEffect(() => {
    onMounted?.(api);
  }, [onMounted, api]);

  const handleTrigger = () => {
    if (!triggerData) return;
    switch (triggerMethod) {
      case 'info':
        api.info(triggerData.message, triggerData);
        break;
      case 'success':
        api.success(triggerData.message, triggerData);
        break;
      case 'warning':
        api.warning(triggerData.message, triggerData);
        break;
      case 'error':
        api.error(triggerData.message, triggerData);
        break;
      default:
        api.toast(triggerData);
    }
  };

  return (
    <div>
      <button data-testid="trigger" onClick={handleTrigger}>
        Trigger
      </button>
      <button data-testid="dismiss-all" onClick={() => api.dismissAll()}>
        Dismiss All
      </button>
    </div>
  );
};

// --- Helper to render with provider ---

function renderWithProvider(
  triggerProps?: Partial<ToastTriggerProps>,
  providerProps?: Record<string, unknown>
) {
  return renderWithTheme(
    <ToastProvider {...providerProps}>
      <ToastTrigger {...triggerProps} />
    </ToastProvider>
  );
}

// --- Tests ---

describe('Toast', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('Rendering', () => {
    it('renders toast with message content', () => {
      renderWithProvider({
        triggerData: { message: 'Hello Toast' },
      });

      act(() => {
        fireEvent.click(screen.getByTestId('trigger'));
      });

      expect(screen.getByText('Hello Toast')).toBeInTheDocument();
    });

    it('renders toast with title and message', () => {
      renderWithProvider({
        triggerData: { message: 'Operation completed', title: 'Success' },
      });

      act(() => {
        fireEvent.click(screen.getByTestId('trigger'));
      });

      expect(screen.getByText('Success')).toBeInTheDocument();
      expect(screen.getByText('Operation completed')).toBeInTheDocument();
    });
  });

  describe('Severity methods', () => {
    it('info() creates toast with role="status"', () => {
      renderWithProvider({
        triggerData: { message: 'Info message' },
        triggerMethod: 'info',
      });

      act(() => {
        fireEvent.click(screen.getByTestId('trigger'));
      });

      const toast = screen
        .getByText('Info message')
        .closest('[role]') as HTMLElement;
      expect(toast).toHaveAttribute('role', 'status');
    });

    it('success() creates toast with role="status"', () => {
      renderWithProvider({
        triggerData: { message: 'Success message' },
        triggerMethod: 'success',
      });

      act(() => {
        fireEvent.click(screen.getByTestId('trigger'));
      });

      const toast = screen
        .getByText('Success message')
        .closest('[role]') as HTMLElement;
      expect(toast).toHaveAttribute('role', 'status');
    });

    it('warning() creates toast with role="alert"', () => {
      renderWithProvider({
        triggerData: { message: 'Warning message' },
        triggerMethod: 'warning',
      });

      act(() => {
        fireEvent.click(screen.getByTestId('trigger'));
      });

      const toast = screen
        .getByText('Warning message')
        .closest('[role]') as HTMLElement;
      expect(toast).toHaveAttribute('role', 'alert');
    });

    it('error() creates toast with role="alert"', () => {
      renderWithProvider({
        triggerData: { message: 'Error message' },
        triggerMethod: 'error',
      });

      act(() => {
        fireEvent.click(screen.getByTestId('trigger'));
      });

      const toast = screen
        .getByText('Error message')
        .closest('[role]') as HTMLElement;
      expect(toast).toHaveAttribute('role', 'alert');
    });
  });

  describe('Auto-dismiss', () => {
    it('toast disappears after duration', async () => {
      renderWithProvider(
        {
          triggerData: { message: 'Auto dismiss', duration: 3000 },
        },
        { defaultDuration: 3000 }
      );

      act(() => {
        fireEvent.click(screen.getByTestId('trigger'));
      });

      expect(screen.getByText('Auto dismiss')).toBeInTheDocument();

      act(() => {
        vi.advanceTimersByTime(3100);
      });

      await waitFor(() => {
        expect(screen.queryByText('Auto dismiss')).not.toBeInTheDocument();
      });
    });

    it('duration=0 does NOT auto-dismiss (persistent toast)', () => {
      renderWithProvider({
        triggerData: { message: 'Persistent toast', duration: 0 },
      });

      act(() => {
        fireEvent.click(screen.getByTestId('trigger'));
      });

      expect(screen.getByText('Persistent toast')).toBeInTheDocument();

      act(() => {
        vi.advanceTimersByTime(10000);
      });

      expect(screen.getByText('Persistent toast')).toBeInTheDocument();
    });
  });

  describe('Dismiss interactions', () => {
    it('close button dismisses toast on click', async () => {
      renderWithProvider({
        triggerData: { message: 'Closable toast', duration: 0 },
      });

      act(() => {
        fireEvent.click(screen.getByTestId('trigger'));
      });

      expect(screen.getByText('Closable toast')).toBeInTheDocument();

      const closeButton = screen.getByLabelText('Dismiss notification');
      act(() => {
        fireEvent.click(closeButton);
      });

      await waitFor(() => {
        expect(screen.queryByText('Closable toast')).not.toBeInTheDocument();
      });
    });

    it('dismiss(id) removes specific toast', async () => {
      let toastApi: ReturnType<typeof useToast> | undefined;

      renderWithProvider({
        onMounted: api => {
          toastApi = api;
        },
      });

      let toastId: string = '';
      act(() => {
        toastId = (toastApi as ReturnType<typeof useToast>).toast({
          message: 'Dismissable',
          duration: 0,
        });
        (toastApi as ReturnType<typeof useToast>).toast({
          message: 'Stays visible',
          duration: 0,
        });
      });

      expect(screen.getByText('Dismissable')).toBeInTheDocument();
      expect(screen.getByText('Stays visible')).toBeInTheDocument();

      act(() => {
        (toastApi as ReturnType<typeof useToast>).dismiss(toastId);
      });

      await waitFor(() => {
        expect(screen.queryByText('Dismissable')).not.toBeInTheDocument();
      });
      expect(screen.getByText('Stays visible')).toBeInTheDocument();
    });

    it('dismissAll() removes all toasts', async () => {
      renderWithProvider({
        triggerData: { message: 'Toast A', duration: 0 },
      });

      act(() => {
        fireEvent.click(screen.getByTestId('trigger'));
      });

      expect(screen.getByText('Toast A')).toBeInTheDocument();

      act(() => {
        fireEvent.click(screen.getByTestId('dismiss-all'));
      });

      await waitFor(() => {
        expect(screen.queryByText('Toast A')).not.toBeInTheDocument();
      });
    });
  });

  describe('Action button', () => {
    it('action button fires onClick', () => {
      const handleAction = vi.fn();

      renderWithProvider({
        triggerData: {
          message: 'With action',
          duration: 0,
          action: { label: 'Undo', onClick: handleAction },
        },
      });

      act(() => {
        fireEvent.click(screen.getByTestId('trigger'));
      });

      const actionButton = screen.getByText('Undo');
      fireEvent.click(actionButton);

      expect(handleAction).toHaveBeenCalledTimes(1);
    });
  });

  describe('Queue (maxVisible)', () => {
    it('respects maxVisible limit', () => {
      let toastApi: ReturnType<typeof useToast> | undefined;

      renderWithProvider(
        {
          onMounted: api => {
            toastApi = api;
          },
        },
        { maxVisible: 2 }
      );

      act(() => {
        const api = toastApi as ReturnType<typeof useToast>;
        api.toast({ message: 'First', duration: 0 });
        api.toast({ message: 'Second', duration: 0 });
        api.toast({ message: 'Third', duration: 0 });
      });

      // maxVisible=2 means only the last 2 should be visible
      expect(screen.queryByText('First')).not.toBeInTheDocument();
      expect(screen.getByText('Second')).toBeInTheDocument();
      expect(screen.getByText('Third')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('info toast has aria-live="polite"', () => {
      renderWithProvider({
        triggerData: { message: 'Polite info' },
        triggerMethod: 'info',
      });

      act(() => {
        fireEvent.click(screen.getByTestId('trigger'));
      });

      const toast = screen
        .getByText('Polite info')
        .closest('[aria-live]') as HTMLElement;
      expect(toast).toHaveAttribute('aria-live', 'polite');
    });

    it('success toast has aria-live="polite"', () => {
      renderWithProvider({
        triggerData: { message: 'Polite success' },
        triggerMethod: 'success',
      });

      act(() => {
        fireEvent.click(screen.getByTestId('trigger'));
      });

      const toast = screen
        .getByText('Polite success')
        .closest('[aria-live]') as HTMLElement;
      expect(toast).toHaveAttribute('aria-live', 'polite');
    });

    it('warning toast has aria-live="assertive"', () => {
      renderWithProvider({
        triggerData: { message: 'Assertive warning' },
        triggerMethod: 'warning',
      });

      act(() => {
        fireEvent.click(screen.getByTestId('trigger'));
      });

      const toast = screen
        .getByText('Assertive warning')
        .closest('[aria-live]') as HTMLElement;
      expect(toast).toHaveAttribute('aria-live', 'assertive');
    });

    it('error toast has aria-live="assertive"', () => {
      renderWithProvider({
        triggerData: { message: 'Assertive error' },
        triggerMethod: 'error',
      });

      act(() => {
        fireEvent.click(screen.getByTestId('trigger'));
      });

      const toast = screen
        .getByText('Assertive error')
        .closest('[aria-live]') as HTMLElement;
      expect(toast).toHaveAttribute('aria-live', 'assertive');
    });

    it('notification container has aria-label="Notifications"', () => {
      renderWithProvider({
        triggerData: { message: 'Any toast' },
      });

      act(() => {
        fireEvent.click(screen.getByTestId('trigger'));
      });

      expect(screen.getByLabelText('Notifications')).toBeInTheDocument();
    });
  });

  describe('Closable', () => {
    it('closable=false hides close button', () => {
      renderWithProvider({
        triggerData: { message: 'No close', closable: false, duration: 0 },
      });

      act(() => {
        fireEvent.click(screen.getByTestId('trigger'));
      });

      expect(screen.getByText('No close')).toBeInTheDocument();
      expect(
        screen.queryByLabelText('Dismiss notification')
      ).not.toBeInTheDocument();
    });

    it('closable=true shows close button (default)', () => {
      renderWithProvider({
        triggerData: { message: 'With close', duration: 0 },
      });

      act(() => {
        fireEvent.click(screen.getByTestId('trigger'));
      });

      expect(screen.getByLabelText('Dismiss notification')).toBeInTheDocument();
    });
  });

  describe('useToast outside provider', () => {
    it('throws error when used outside ToastProvider', () => {
      const ErrorComponent = () => {
        useToast();
        return null;
      };

      // Suppress the error boundary console output
      const spy = vi.spyOn(console, 'error').mockImplementation(() => {});

      expect(() => {
        renderWithTheme(<ErrorComponent />);
      }).toThrow('useToast must be used within a ToastProvider');

      spy.mockRestore();
    });
  });
});
