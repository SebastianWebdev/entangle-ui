import React from 'react';
import { useDialogContext } from './Dialog';
import type { DialogHeaderProps } from './Dialog.types';
import { cx } from '@/utils/cx';
import {
  dialogHeaderStyle,
  dialogHeaderContentStyle,
  dialogTitleStyle,
  dialogDescriptionStyle,
  dialogCloseButtonStyle,
} from './Dialog.css';

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
          <svg
            width="12"
            height="12"
            viewBox="0 0 12 12"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M1 1L11 11M11 1L1 11"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </button>
      )}
    </div>
  );
};

DialogHeader.displayName = 'DialogHeader';
