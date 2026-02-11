'use client';

import React from 'react';
import type { ChatContextChipProps } from './ChatPanel.types';
import { cx } from '@/utils/cx';
import {
  contextChipStyle,
  contextChipIconStyle,
  contextChipLabelStyle,
  contextChipItemsStyle,
  contextChipDismissStyle,
} from './ChatPanel.css';
import { MiniCloseIcon } from './ChatIcons';

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
            onClick={onDismiss}
            aria-label={`Dismiss ${label}`}
          >
            <MiniCloseIcon />
          </button>
        )}
      </div>
    );
  }
);

ChatContextChip.displayName = 'ChatContextChip';
