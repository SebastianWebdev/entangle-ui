import React, { useCallback } from 'react';
import { usePopoverContext } from './Popover';
import type { PopoverTriggerProps } from './Popover.types';

/**
 * Wraps the trigger element for a Popover.
 * Clicking the trigger toggles the popover open/closed.
 */
export const PopoverTrigger: React.FC<PopoverTriggerProps> = ({ children }) => {
  const { toggle, isOpen, triggerRef, popoverId } = usePopoverContext();
  const contentId = `popover-${popoverId}-content`;

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      toggle();
    },
    [toggle]
  );

  const setRef = useCallback(
    (node: HTMLElement | null) => {
      triggerRef.current = node;
    },
    [triggerRef]
  );

  // Clone the child element to add props
  if (!React.isValidElement(children)) {
    return null;
  }

  return React.cloneElement(
    children as React.ReactElement<Record<string, unknown>>,
    {
      ref: setRef,
      onClick: handleClick,
      'aria-haspopup': 'dialog',
      'aria-expanded': isOpen,
      'aria-controls': isOpen ? contentId : undefined,
    }
  );
};

PopoverTrigger.displayName = 'PopoverTrigger';
