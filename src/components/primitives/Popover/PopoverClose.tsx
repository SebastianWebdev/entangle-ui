import React, { useCallback } from 'react';
import { usePopoverContext } from './Popover';
import type { PopoverCloseProps } from './Popover.types';
import { cx } from '@/utils/cx';
import { closeButtonStyle } from './Popover.css';

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
    <button
      ref={ref}
      type="button"
      aria-label="Close"
      onClick={handleClick}
      className={cx(closeButtonStyle, className)}
      style={style}
      data-testid={testId}
      {...rest}
    >
      {children ?? <CloseIcon />}
    </button>
  );
};

PopoverClose.displayName = 'PopoverClose';
