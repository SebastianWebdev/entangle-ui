import React, { useCallback } from 'react';
import styled from '@emotion/styled';
import { usePopoverContext } from './Popover';
import type { PopoverCloseProps } from './Popover.types';

// --- Styled ---

const StyledCloseButton = styled.button`
  /* Reset */
  margin: 0;
  padding: 0;
  border: none;
  background: transparent;
  font-family: inherit;
  outline: none;
  cursor: pointer;

  /* Layout */
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  border-radius: ${props => props.theme.borderRadius.sm}px;
  color: ${props => props.theme.colors.text.muted};
  transition: background ${props => props.theme.transitions.fast};

  &:hover {
    background: ${props => props.theme.colors.surface.hover};
    color: ${props => props.theme.colors.text.primary};
  }

  &:focus-visible {
    box-shadow: ${props => props.theme.shadows.focus};
  }
`;

// --- Close icon ---

const CloseIcon: React.FC = () => (
  <svg
    width={10}
    height={10}
    viewBox="0 0 10 10"
    fill="none"
    aria-hidden="true"
  >
    <path
      d="M1.5 1.5L8.5 8.5M8.5 1.5L1.5 8.5"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  </svg>
);

// --- Component ---

export const PopoverClose: React.FC<PopoverCloseProps> = ({
  children,
  className,
  style,
  testId,
  ref,
  ...rest
}) => {
  const { close } = usePopoverContext();

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      e.stopPropagation();
      close();
    },
    [close]
  );

  return (
    <StyledCloseButton
      ref={ref}
      type="button"
      aria-label="Close"
      onClick={handleClick}
      className={className}
      style={style}
      data-testid={testId}
      {...rest}
    >
      {children ?? <CloseIcon />}
    </StyledCloseButton>
  );
};

PopoverClose.displayName = 'PopoverClose';
