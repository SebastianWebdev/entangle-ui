'use client';

import React from 'react';

import { cx } from '@/utils/cx';

import { bubbleRecipe } from './ChatPanel.css';

import type { ChatBubbleProps } from './ChatPanel.types';

export const ChatBubble = /*#__PURE__*/ React.memo<ChatBubbleProps>(
  ({
    role = 'assistant',
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
        className={cx(bubbleRecipe({ role }), className)}
        style={style}
        data-testid={testId}
        {...rest}
      >
        {children}
      </div>
    );
  }
);

ChatBubble.displayName = 'ChatBubble';
