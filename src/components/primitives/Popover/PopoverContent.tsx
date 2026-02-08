import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useState,
} from 'react';
import { createPortal } from 'react-dom';
import styled from '@emotion/styled';
import { usePopoverContext } from './Popover';
import type { PopoverContentProps } from './Popover.types';

// --- Positioning ---

interface Position {
  top: number;
  left: number;
}

function computePosition(
  triggerEl: HTMLElement,
  contentEl: HTMLDivElement,
  placement: string,
  offset: number
): Position {
  const triggerRect = triggerEl.getBoundingClientRect();
  const contentRect = contentEl.getBoundingClientRect();
  const scrollX = window.scrollX;
  const scrollY = window.scrollY;

  let top = 0;
  let left = 0;

  // Parse side and alignment
  const [side, align = 'center'] = placement.split('-') as [string, string?];

  switch (side) {
    case 'bottom':
      top = triggerRect.bottom + offset + scrollY;
      break;
    case 'top':
      top = triggerRect.top - contentRect.height - offset + scrollY;
      break;
    case 'left':
      left = triggerRect.left - contentRect.width - offset + scrollX;
      break;
    case 'right':
      left = triggerRect.right + offset + scrollX;
      break;
  }

  // Align (for top/bottom sides)
  if (side === 'top' || side === 'bottom') {
    switch (align) {
      case 'start':
        left = triggerRect.left + scrollX;
        break;
      case 'end':
        left = triggerRect.right - contentRect.width + scrollX;
        break;
      default:
        left =
          triggerRect.left +
          triggerRect.width / 2 -
          contentRect.width / 2 +
          scrollX;
    }
  }

  // Align (for left/right sides)
  if (side === 'left' || side === 'right') {
    switch (align) {
      case 'start':
        top = triggerRect.top + scrollY;
        break;
      case 'end':
        top = triggerRect.bottom - contentRect.height + scrollY;
        break;
      default:
        top =
          triggerRect.top +
          triggerRect.height / 2 -
          contentRect.height / 2 +
          scrollY;
    }
  }

  return { top, left };
}

// --- Transform origin map ---

const TRANSFORM_ORIGIN_MAP: Record<string, string> = {
  bottom: 'top center',
  'bottom-start': 'top left',
  'bottom-end': 'top right',
  top: 'bottom center',
  'top-start': 'bottom left',
  'top-end': 'bottom right',
  left: 'center right',
  'left-start': 'top right',
  'left-end': 'bottom right',
  right: 'center left',
  'right-start': 'top left',
  'right-end': 'bottom left',
};

// --- Styled ---

interface StyledContentProps {
  $width?: number | string;
  $maxHeight?: number | string;
  $padding: 'none' | 'sm' | 'md' | 'lg';
  $visible: boolean;
  $transformOrigin: string;
}

const PADDING_MAP = {
  none: '0',
  sm: 'sm',
  md: 'md',
  lg: 'lg',
} as const;

const StyledContentPanel = styled.div<StyledContentProps>`
  position: absolute;
  top: 0;
  left: 0;
  z-index: 1000;

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
  transform-origin: ${props => props.$transformOrigin};
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
    triggerRef,
    contentRef,
    placement,
    offset,
    portal,
    matchTriggerWidth,
    popoverId,
  } = usePopoverContext();

  const [position, setPosition] = useState<Position>({ top: 0, left: 0 });
  const [visible, setVisible] = useState(false);
  const [triggerWidth, setTriggerWidth] = useState<number | undefined>(
    undefined
  );

  const contentId = `popover-${popoverId}-content`;
  const transformOrigin = TRANSFORM_ORIGIN_MAP[placement] ?? 'top left';

  // Set ref
  const setRef = useCallback(
    (node: HTMLDivElement | null) => {
      contentRef.current = node;
      if (typeof externalRef === 'function') {
        externalRef(node);
      } else if (externalRef && typeof externalRef === 'object') {
        (externalRef as React.MutableRefObject<HTMLDivElement | null>).current =
          node;
      }
    },
    [contentRef, externalRef]
  );

  // Compute position when open
  useLayoutEffect(() => {
    if (!isOpen) {
      setVisible(false);
      return;
    }

    const trigger = triggerRef.current;
    const content = contentRef.current;
    if (!trigger || !content) return;

    if (matchTriggerWidth) {
      setTriggerWidth(trigger.offsetWidth);
    }

    const pos = computePosition(trigger, content, placement, offset);
    setPosition(pos);

    // Trigger enter animation on next frame
    requestAnimationFrame(() => {
      setVisible(true);
    });
  }, [isOpen, placement, offset, matchTriggerWidth, triggerRef, contentRef]);

  // Focus first focusable element on open
  useEffect(() => {
    if (!isOpen) return;

    const timer = setTimeout(() => {
      const content = contentRef.current;
      if (!content) return;

      const focusable = content.querySelector<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (focusable) {
        focusable.focus();
      } else {
        content.focus();
      }
    }, 0);

    return () => clearTimeout(timer);
  }, [isOpen, contentRef]);

  if (!isOpen) {
    return null;
  }

  const computedWidth = matchTriggerWidth ? triggerWidth : width;

  const contentElement = (
    <StyledContentPanel
      ref={setRef}
      role="dialog"
      id={contentId}
      tabIndex={-1}
      $width={computedWidth}
      $maxHeight={maxHeight}
      $padding={padding}
      $visible={visible}
      $transformOrigin={transformOrigin}
      className={className}
      style={{
        ...style,
        transform: `translate(${position.left}px, ${position.top}px) ${visible ? 'scale(1)' : 'scale(0.96)'}`,
        top: 0,
        left: 0,
      }}
      data-testid={testId}
      {...rest}
    >
      {children}
    </StyledContentPanel>
  );

  if (portal) {
    return createPortal(contentElement, document.body);
  }

  return contentElement;
};

PopoverContent.displayName = 'PopoverContent';
