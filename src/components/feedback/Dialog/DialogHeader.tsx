'use client';

import React from 'react';

import { CloseIcon } from '@/components/Icons/CloseIcon';
import { cx } from '@/utils/cx';

import { useDialogContext } from './Dialog';
import {
  dialogHeaderStyle,
  dialogHeaderContentStyle,
  dialogTitleStyle,
  dialogDescriptionStyle,
  dialogCloseButtonStyle,
} from './Dialog.css';

import type { DialogHeaderProps } from './Dialog.types';

// --- Component ---

/**
 * DialogHeader renders the title, optional description, and close button
 * for a Dialog.
 *
 * @example
 * ```tsx
 * <DialogHeader description="This cannot be undone">
 *   Delete Item
 * </DialogHeader>
 * ```
 */
export const DialogHeader: React.FC<DialogHeaderProps> = ({
  children,
  showClose = true,
  description,
  className,
  style,
  testId,
  ref,
  ...rest
}) => {
  const { onClose, titleId, descriptionId } = useDialogContext();

  return (
    <div
      ref={ref}
      className={cx(dialogHeaderStyle, className)}
      style={style}
      data-testid={testId}
      {...rest}
    >
      <div className={dialogHeaderContentStyle}>
        <div id={titleId} className={dialogTitleStyle}>
          {children}
        </div>
        {description && (
          <div id={descriptionId} className={dialogDescriptionStyle}>
            {description}
          </div>
        )}
      </div>
      {showClose && (
        <button
          type="button"
          onClick={onClose}
          aria-label="Close dialog"
          className={dialogCloseButtonStyle}
          data-testid={testId ? `${testId}-close` : undefined}
        >
          <CloseIcon size="sm" decorative />
        </button>
      )}
    </div>
  );
};

DialogHeader.displayName = 'DialogHeader';
