'use client';

import React from 'react';
import type { DialogFooterProps } from './Dialog.types';
import { cx } from '@/utils/cx';
import { dialogFooterRecipe } from './Dialog.css';

// --- Component ---

/**
 * DialogFooter renders the action area at the bottom of a Dialog.
 *
 * @example
 * ```tsx
 * <DialogFooter align="right">
 *   <Button onClick={onCancel}>Cancel</Button>
 *   <Button variant="filled" onClick={onConfirm}>Confirm</Button>
 * </DialogFooter>
 * ```
 */
export const DialogFooter: React.FC<DialogFooterProps> = ({
  children,
  align = 'right',
  className,
  style,
  testId,
  ref,
  ...rest
}) => {
  return (
    <div
      ref={ref}
      className={cx(dialogFooterRecipe({ align }), className)}
      style={style}
      data-testid={testId}
      {...rest}
    >
      {children}
    </div>
  );
};

DialogFooter.displayName = 'DialogFooter';
