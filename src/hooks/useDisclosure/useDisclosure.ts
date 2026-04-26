'use client';

import { useCallback, useMemo } from 'react';
import { useControlledState } from '@/hooks/useControlledState';
import type {
  UseDisclosureOptions,
  UseDisclosureReturn,
} from './useDisclosure.types';

/**
 * Manage an open/closed state with stable `open`, `close`, `toggle` callbacks.
 *
 * Supports both controlled (driven by an `open` prop) and uncontrolled
 * (managed internally with `defaultOpen`) modes. Built on top of
 * `useControlledState` so the same controlled / uncontrolled rules apply —
 * including the development warning when switching modes mid-life.
 *
 * @example
 * ```tsx
 * const { isOpen, open, close, toggle } = useDisclosure();
 *
 * return (
 *   <>
 *     <Button onClick={open}>Open</Button>
 *     <Dialog open={isOpen} onClose={close}>...</Dialog>
 *   </>
 * );
 * ```
 */
export function useDisclosure(
  options: UseDisclosureOptions = {}
): UseDisclosureReturn {
  const { defaultOpen, open: controlledOpen, onOpenChange } = options;

  const [isOpen, setOpenState] = useControlledState<boolean>({
    value: controlledOpen,
    defaultValue: defaultOpen,
    onChange: onOpenChange,
    fallback: false,
  });

  const setOpen = useCallback(
    (next: boolean) => {
      setOpenState(next);
    },
    [setOpenState]
  );

  const open = useCallback(() => {
    setOpenState(true);
  }, [setOpenState]);

  const close = useCallback(() => {
    setOpenState(false);
  }, [setOpenState]);

  const toggle = useCallback(() => {
    setOpenState(prev => !prev);
  }, [setOpenState]);

  return useMemo(
    () => ({ isOpen, open, close, toggle, setOpen }),
    [isOpen, open, close, toggle, setOpen]
  );
}
