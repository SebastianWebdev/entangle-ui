import React from 'react';
import type { ChatBubbleProps } from './ChatPanel.types';
import { cx } from '@/utils/cx';
import { bubbleRecipe } from './ChatPanel.css';

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
