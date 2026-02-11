import React, { useCallback } from 'react';
import type { ChatContextChipProps } from './ChatPanel.types';
import { cx } from '@/utils/cx';
import {
  contextChipStyle,
  contextChipIconStyle,
  contextChipLabelStyle,
  contextChipItemsStyle,
  contextChipDismissStyle,
} from './ChatPanel.css';

const CloseIcon: React.FC = () => (
  <svg width="8" height="8" viewBox="0 0 8 8" fill="none" aria-hidden="true">
    <path
      d="M1 1l6 6M7 1L1 7"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  </svg>
);

export const ChatContextChip = /*#__PURE__*/ React.memo<ChatContextChipProps>(
  ({
    label,
    items,
    icon,
    onDismiss,
    className,
    style,
    testId,
    ref,
    ...rest
  }) => {
    const handleDismiss = useCallback(() => {
      onDismiss?.();
    }, [onDismiss]);

    return (
      <div
        ref={ref}
        className={cx(contextChipStyle, className)}
        style={style}
        data-testid={testId}
        {...rest}
      >
        {icon && <span className={contextChipIconStyle}>{icon}</span>}
        <span className={contextChipLabelStyle}>{label}:</span>
        <span className={contextChipItemsStyle}>{items.join(', ')}</span>
        {onDismiss && (
          <button
            type="button"
            className={contextChipDismissStyle}
            onClick={handleDismiss}
            aria-label={`Dismiss ${label}`}
          >
            <CloseIcon />
          </button>
        )}
      </div>
    );
  }
);

ChatContextChip.displayName = 'ChatContextChip';
