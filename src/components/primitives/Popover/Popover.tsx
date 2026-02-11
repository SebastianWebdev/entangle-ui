'use client';

import React, {
  createContext,
  useCallback,
  useContext,
  useId,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  useFloating,
  offset as offsetMiddleware,
  flip,
  shift,
  autoUpdate,
  useClick,
  useDismiss,
  useInteractions,
  type Placement,
} from '@floating-ui/react';
import type { PopoverContextValue, PopoverProps } from './Popover.types';

// --- Context ---

const PopoverContext = /*#__PURE__*/ createContext<PopoverContextValue | null>(
  null
);

export function usePopoverContext(): PopoverContextValue {
  const ctx = useContext(PopoverContext);
  if (!ctx) {
    throw new Error(
      'Popover compound components must be used within <Popover>'
    );
  }
  return ctx;
}

// --- Component ---

/**
 * Popover component — a floating content container for interactive content
 * anchored to a trigger element.
 *
 * Uses @floating-ui/react for robust positioning with collision detection,
 * flip/shift behavior, and scroll-aware auto-updating.
 *
 * @example
 * ```tsx
 * <Popover>
 *   <PopoverTrigger>
 *     <Button>Open</Button>
 *   </PopoverTrigger>
 *   <PopoverContent>
 *     <p>Popover content</p>
 *   </PopoverContent>
 * </Popover>
 * ```
 */
export const Popover: React.FC<PopoverProps> = ({
  open: openProp,
  defaultOpen = false,
  placement = 'bottom-start',
  offset = 8,
  closeOnClickOutside = true,
  closeOnEscape = true,
  returnFocus = true,
  portal = true,
  matchTriggerWidth = false,
  children,
  onOpenChange,
}) => {
  const autoId = useId();
  const triggerRef = useRef<HTMLElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);

  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const isControlled = openProp !== undefined;
  const isOpen = isControlled ? openProp : internalOpen;

  const handleOpenChange = useCallback(
    (nextOpen: boolean) => {
      if (!isControlled) {
        setInternalOpen(nextOpen);
      }
      onOpenChange?.(nextOpen);
    },
    [isControlled, onOpenChange]
  );

  const openPopover = useCallback(() => {
    handleOpenChange(true);
  }, [handleOpenChange]);

  const closePopover = useCallback(() => {
    handleOpenChange(false);
    if (returnFocus) {
      triggerRef.current?.focus();
    }
  }, [handleOpenChange, returnFocus]);

  const toggle = useCallback(() => {
    if (isOpen) {
      closePopover();
    } else {
      openPopover();
    }
  }, [isOpen, openPopover, closePopover]);

  // Floating UI setup
  const { refs, floatingStyles, context } = useFloating({
    open: isOpen,
    onOpenChange: handleOpenChange,
    placement: placement as Placement,
    middleware: [offsetMiddleware(offset), flip(), shift({ padding: 8 })],
    whileElementsMounted: autoUpdate,
  });

  // Interactions
  const click = useClick(context);
  const dismiss = useDismiss(context, {
    outsidePress: closeOnClickOutside,
    escapeKey: closeOnEscape,
  });

  const { getReferenceProps, getFloatingProps } = useInteractions([
    click,
    dismiss,
  ]);

  const contextValue: PopoverContextValue = useMemo(
    () => ({
      isOpen,
      open: openPopover,
      close: closePopover,
      toggle,
      triggerRef,
      contentRef,
      placement,
      offset,
      portal,
      matchTriggerWidth,
      popoverId: autoId,
      // Floating UI context
      floatingRefs: refs,
      floatingStyles,
      floatingContext: context,
      getReferenceProps,
      getFloatingProps,
    }),
    [
      isOpen,
      openPopover,
      closePopover,
      toggle,
      placement,
      offset,
      portal,
      matchTriggerWidth,
      autoId,
      refs,
      floatingStyles,
      context,
      getReferenceProps,
      getFloatingProps,
    ]
  );

  return (
    <PopoverContext.Provider value={contextValue}>
      {children}
    </PopoverContext.Provider>
  );
};

Popover.displayName = 'Popover';
