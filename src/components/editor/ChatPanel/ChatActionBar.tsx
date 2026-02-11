import React from 'react';
import type { ChatActionBarProps } from './ChatPanel.types';
import { cx } from '@/utils/cx';
import { actionBarStyle } from './ChatPanel.css';

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
