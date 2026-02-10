import React, { useCallback, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { FloatingFocusManager } from '@floating-ui/react';
import styled from '@emotion/styled';
import { usePopoverContext } from './Popover';
import type { PopoverContentProps } from './Popover.types';

// --- Styled ---

interface StyledContentProps {
  $width?: number | string;
  $maxHeight?: number | string;
  $padding: 'none' | 'sm' | 'md' | 'lg';
  $visible: boolean;
}

const PADDING_MAP = {
  none: '0',
  sm: 'sm',
  md: 'md',
  lg: 'lg',
} as const;

const StyledContentPanel = styled.div<StyledContentProps>`
  z-index: ${props => props.theme.zIndex.popover};

  background: ${props => props.theme.colors.background.elevated};
  border: 1px solid ${props => props.theme.colors.border.default};
  border-radius: ${props => props.theme.borderRadius.lg}px;
  box-shadow: ${props => props.theme.shadows.lg};
  color: ${props => props.theme.colors.text.primary};
  font-size: ${props => props.theme.typography.fontSize.sm}px;
  font-family: ${props => props.theme.typography.fontFamily.sans};

  padding: ${props => {
    const key = PADDING_MAP[props.$padding];
    if (key === '0') return '0';
    return `${props.theme.spacing[key]}px`;
  }};

  ${props =>
    props.$width != null
      ? `width: ${typeof props.$width === 'number' ? `${props.$width}px` : props.$width};`
      : ''}
  ${props =>
    props.$maxHeight != null
      ? `max-height: ${typeof props.$maxHeight === 'number' ? `${props.$maxHeight}px` : props.$maxHeight}; overflow-y: auto;`
      : ''}

  /* Animation */
  transition:
    opacity ${props => props.theme.transitions.fast},
    transform ${props => props.theme.transitions.fast};
  opacity: ${props => (props.$visible ? 1 : 0)};
  transform: ${props => (props.$visible ? 'scale(1)' : 'scale(0.96)')};
  pointer-events: ${props => (props.$visible ? 'auto' : 'none')};

  &:focus {
    outline: none;
  }
`;

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

  const contentElement = (
    <FloatingFocusManager context={floatingContext} modal={false}>
      <StyledContentPanel
        ref={setRef}
        role="dialog"
        id={contentId}
        tabIndex={-1}
        $width={computedWidth}
        $maxHeight={maxHeight}
        $padding={padding}
        $visible={visible}
        className={className}
        style={{
          ...floatingStyles,
          ...style,
        }}
        data-testid={testId}
        {...floatingProps}
        {...rest}
      >
        {children}
      </StyledContentPanel>
    </FloatingFocusManager>
  );

  if (portal) {
    return createPortal(contentElement, document.body);
  }

  return contentElement;
};

PopoverContent.displayName = 'PopoverContent';
