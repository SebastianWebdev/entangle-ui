'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { FloatingFocusManager } from '@floating-ui/react';
import { usePopoverContext } from './Popover';
import type { PopoverContentProps } from './Popover.types';
import { cx } from '@/utils/cx';
import { contentPanelRecipe } from './Popover.css';

// --- Component ---

export const PopoverContent: React.FC<PopoverContentProps> = ({
  children,
  width,
  maxHeight,
  padding = 'md',
  className,
  style,
  testId,
  ref: externalRef,
  ...rest
}) => {
  const {
    isOpen,
    contentRef,
    portal,
    matchTriggerWidth,
    popoverId,
    floatingRefs,
    floatingStyles,
    floatingContext,
    getFloatingProps,
  } = usePopoverContext();

  const [visible, setVisible] = useState(false);
  const contentId = `popover-${popoverId}-content`;

  // Set ref
  const setRef = useCallback(
    (node: HTMLDivElement | null) => {
      contentRef.current = node;
      floatingRefs.setFloating(node);
      if (typeof externalRef === 'function') {
        externalRef(node);
      } else if (externalRef && typeof externalRef === 'object') {
        (externalRef as React.MutableRefObject<HTMLDivElement | null>).current =
          node;
      }
    },
    [contentRef, floatingRefs, externalRef]
  );

  // Trigger enter animation on next frame after open
  useEffect(() => {
    if (isOpen) {
      requestAnimationFrame(() => {
        setVisible(true);
      });
    } else {
      setVisible(false);
    }
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  // Get trigger width for matchTriggerWidth
  const triggerWidth = matchTriggerWidth
    ? floatingRefs.reference.current
      ? (floatingRefs.reference.current as HTMLElement).offsetWidth
      : undefined
    : undefined;

  const computedWidth = matchTriggerWidth ? triggerWidth : width;

  const floatingProps = getFloatingProps();

  // Build dimension styles
  const dimensionStyles: React.CSSProperties = {};
  if (computedWidth != null) {
    dimensionStyles.width =
      typeof computedWidth === 'number' ? `${computedWidth}px` : computedWidth;
  }
  if (maxHeight != null) {
    dimensionStyles.maxHeight =
      typeof maxHeight === 'number' ? `${maxHeight}px` : maxHeight;
    dimensionStyles.overflowY = 'auto';
  }

  const contentElement = (
    <FloatingFocusManager context={floatingContext} modal={false}>
      <div
        ref={setRef}
        role="dialog"
        id={contentId}
        tabIndex={-1}
        className={cx(
          contentPanelRecipe({
            padding,
            visible: visible || undefined,
          }),
          className
        )}
        style={{
          ...floatingStyles,
          ...dimensionStyles,
          ...style,
        }}
        data-testid={testId}
        {...floatingProps}
        {...rest}
      >
        {children}
      </div>
    </FloatingFocusManager>
  );

  if (portal) {
    return createPortal(contentElement, document.body);
  }

  return contentElement;
};

PopoverContent.displayName = 'PopoverContent';
