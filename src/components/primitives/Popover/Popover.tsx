import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useRef,
  useState,
} from 'react';
import type { PopoverContextValue, PopoverProps } from './Popover.types';

// --- Context ---

const PopoverContext = createContext<PopoverContextValue | null>(null);

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

  const openPopover = useCallback(() => {
    if (!isControlled) {
      setInternalOpen(true);
    }
    onOpenChange?.(true);
  }, [isControlled, onOpenChange]);

  const closePopover = useCallback(() => {
    if (!isControlled) {
      setInternalOpen(false);
    }
    onOpenChange?.(false);
    if (returnFocus) {
      triggerRef.current?.focus();
    }
  }, [isControlled, onOpenChange, returnFocus]);

  const toggle = useCallback(() => {
    if (isOpen) {
      closePopover();
    } else {
      openPopover();
    }
  }, [isOpen, openPopover, closePopover]);

  // Close on click outside
  useEffect(() => {
    if (!isOpen || !closeOnClickOutside) return;

    const handleMouseDown = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        !triggerRef.current?.contains(target) &&
        !contentRef.current?.contains(target)
      ) {
        closePopover();
      }
    };

    document.addEventListener('mousedown', handleMouseDown);
    return () => document.removeEventListener('mousedown', handleMouseDown);
  }, [isOpen, closeOnClickOutside, closePopover]);

  // Close on Escape
  useEffect(() => {
    if (!isOpen || !closeOnEscape) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        closePopover();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, closeOnEscape, closePopover]);

  const contextValue: PopoverContextValue = {
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
  };

  return (
    <PopoverContext.Provider value={contextValue}>
      {children}
    </PopoverContext.Provider>
  );
};

Popover.displayName = 'Popover';
