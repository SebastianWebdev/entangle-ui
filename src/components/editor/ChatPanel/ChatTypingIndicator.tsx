'use client';

import React from 'react';
import type { ChatTypingIndicatorProps } from './ChatPanel.types';
import { cx } from '@/utils/cx';
import {
  typingIndicatorStyle,
  typingDotsContainerStyle,
  typingDotStyle,
  typingPulseStyle,
  typingLabelStyle,
} from './ChatPanel.css';

export const ChatTypingIndicator =
  /*#__PURE__*/ React.memo<ChatTypingIndicatorProps>(
    ({
      label = 'Thinking...',
      variant = 'dots',
      visible = true,
      className,
      style,
      testId,
      ref,
      ...rest
    }) => {
      if (!visible) return null;

      return (
        <div
          ref={ref}
          className={cx(typingIndicatorStyle, className)}
          style={style}
          data-testid={testId}
          role="status"
          aria-label={label}
          {...rest}
        >
          {variant === 'dots' ? (
            <div className={typingDotsContainerStyle} aria-hidden="true">
              <span className={typingDotStyle} />
              <span className={typingDotStyle} />
              <span className={typingDotStyle} />
            </div>
          ) : (
            <div className={typingPulseStyle} aria-hidden="true" />
          )}
          <span className={typingLabelStyle}>{label}</span>
        </div>
      );
    }
  );

ChatTypingIndicator.displayName = 'ChatTypingIndicator';
