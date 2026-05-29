'use client';

import React from 'react';

import { cx } from '@/utils/cx';

import { actionBarStyle } from './ChatPanel.css';

import type { ChatActionBarProps } from './ChatPanel.types';

export const ChatActionBar = /*#__PURE__*/ React.memo<ChatActionBarProps>(
  ({ children, className, style, testId, ref, ...rest }) => {
    return (
      <div
        ref={ref}
        className={cx(actionBarStyle, className)}
        style={style}
        data-testid={testId}
        {...rest}
      >
        {children}
      </div>
    );
  }
);

ChatActionBar.displayName = 'ChatActionBar';
