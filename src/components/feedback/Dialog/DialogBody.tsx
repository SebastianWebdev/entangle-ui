'use client';

import React from 'react';

import { cx } from '@/utils/cx';

import { dialogBodyStyle } from './Dialog.css';

import type { DialogBodyProps } from './Dialog.types';

// --- Component ---

/**
 * DialogBody renders the scrollable content area of a Dialog.
 *
 * @example
 * ```tsx
 * <DialogBody>
 *   <p>Dialog content goes here.</p>
 * </DialogBody>
 * ```
 */
export const DialogBody: React.FC<DialogBodyProps> = ({
  children,
  className,
  style,
  testId,
  ref,
  ...rest
}) => {
  return (
    <div
      ref={ref}
      className={cx(dialogBodyStyle, className)}
      style={style}
      data-testid={testId}
      {...rest}
    >
      {children}
    </div>
  );
};

DialogBody.displayName = 'DialogBody';
