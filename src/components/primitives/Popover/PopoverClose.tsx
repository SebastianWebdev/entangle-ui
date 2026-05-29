'use client';

import React, { useCallback } from 'react';

import { CloseIcon } from '@/components/Icons/CloseIcon';
import { cx } from '@/utils/cx';

import { usePopoverContext } from './Popover';
import { closeButtonStyle } from './Popover.css';

import type { PopoverCloseProps } from './Popover.types';

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
      {children ?? <CloseIcon size="sm" decorative />}
    </button>
  );
};

PopoverClose.displayName = 'PopoverClose';
