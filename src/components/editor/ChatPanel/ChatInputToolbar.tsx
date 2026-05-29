'use client';

import React from 'react';

import { cx } from '@/utils/cx';

import { inputToolbarStyle } from './ChatPanel.css';

import type { ChatInputToolbarProps } from './ChatPanel.types';

export const ChatInputToolbar = /*#__PURE__*/ React.memo<ChatInputToolbarProps>(
  ({ children, className, style, testId, ref, ...rest }) => {
    return (
      <div
        ref={ref}
        className={cx(inputToolbarStyle, className)}
        style={style}
        data-testid={testId}
        role="toolbar"
        aria-label="Chat input actions"
        {...rest}
      >
        {children}
      </div>
    );
  }
);

ChatInputToolbar.displayName = 'ChatInputToolbar';
