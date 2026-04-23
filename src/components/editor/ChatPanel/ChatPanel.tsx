'use client';

import React from 'react';
import type { ChatPanelProps } from './ChatPanel.types';
import { cx } from '@/utils/cx';
import { chatPanelRecipe, messageMaxWidthVarName } from './ChatPanel.css';

function resolveMaxWidth(
  value: number | string | undefined
): string | undefined {
  if (value === undefined) return undefined;
  return typeof value === 'number' ? `${value}px` : value;
}

export const ChatPanel = /*#__PURE__*/ React.memo<ChatPanelProps>(
  ({
    density = 'comfortable',
    messageMaxWidth,
    children,
    className,
    style,
    testId,
    ref,
    ...rest
  }) => {
    const resolvedMaxWidth = resolveMaxWidth(messageMaxWidth);
    const rootStyle: React.CSSProperties = resolvedMaxWidth
      ? ({
          [messageMaxWidthVarName]: resolvedMaxWidth,
          ...style,
        } as React.CSSProperties)
      : (style ?? {});

    return (
      <div
        ref={ref}
        className={cx(chatPanelRecipe({ density }), className)}
        style={rootStyle}
        data-testid={testId}
        {...rest}
      >
        {children}
      </div>
    );
  }
);

ChatPanel.displayName = 'ChatPanel';
