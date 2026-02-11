import React from 'react';
import type { ChatPanelProps } from './ChatPanel.types';
import { cx } from '@/utils/cx';
import { chatPanelRecipe } from './ChatPanel.css';

export const ChatPanel = /*#__PURE__*/ React.memo<ChatPanelProps>(
  ({
    density = 'comfortable',
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
        className={cx(chatPanelRecipe({ density }), className)}
        style={style}
        data-testid={testId}
        {...rest}
      >
        {children}
      </div>
    );
  }
);

ChatPanel.displayName = 'ChatPanel';
