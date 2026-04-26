'use client';

import React from 'react';
import type { ChatMessageProps } from './ChatPanel.types';
import { cx } from '@/utils/cx';
import { Avatar } from '@/components/primitives/Avatar';
import { ChatBubble } from './ChatBubble';
import {
  bubbleErrorStyle,
  messageContentStyle,
  messageErrorCaptionStyle,
  messageErrorIconStyle,
  messageMaxWidthVarName,
  messageRecipe,
  messageTextStyle,
  messageTimestampStyle,
} from './ChatPanel.css';

function resolveMaxWidth(
  value: number | string | undefined
): string | undefined {
  if (value === undefined) return undefined;
  return typeof value === 'number' ? `${value}px` : value;
}

function formatTimestamp(iso: string): string {
  try {
    const date = new Date(iso);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } catch {
    return '';
  }
}

const ErrorIcon: React.FC = () => (
  <svg
    width="12"
    height="12"
    viewBox="0 0 12 12"
    fill="none"
    aria-hidden="true"
  >
    <circle cx="6" cy="6" r="5" stroke="currentColor" strokeWidth="1.2" />
    <line
      x1="6"
      y1="3.5"
      x2="6"
      y2="6.5"
      stroke="currentColor"
      strokeWidth="1.2"
      strokeLinecap="round"
    />
    <circle cx="6" cy="8.5" r="0.6" fill="currentColor" />
  </svg>
);

export const ChatMessage = /*#__PURE__*/ React.memo<ChatMessageProps>(
  ({
    message,
    showTimestamp = false,
    showAvatar = false,
    actions,
    renderContent,
    maxWidth,
    className,
    style,
    testId,
    ref,
    ...rest
  }) => {
    const { role, content, status, timestamp, avatar, displayName } = message;
    const isError = status === 'error';

    const renderedContent = renderContent ? (
      renderContent(content)
    ) : (
      <span className={messageTextStyle}>{content}</span>
    );

    const resolvedMaxWidth = resolveMaxWidth(maxWidth);
    const rootStyle: React.CSSProperties = resolvedMaxWidth
      ? ({
          [messageMaxWidthVarName]: resolvedMaxWidth,
          ...style,
        } as React.CSSProperties)
      : (style ?? {});

    return (
      <div
        ref={ref}
        className={cx(messageRecipe({ role }), className)}
        style={rootStyle}
        data-testid={testId}
        {...rest}
      >
        {showAvatar && role !== 'system' && (
          <Avatar
            size="md"
            src={avatar}
            name={displayName ?? role}
            alt={displayName ?? role}
          />
        )}

        <div className={messageContentStyle}>
          <ChatBubble
            role={role}
            className={isError ? bubbleErrorStyle : undefined}
          >
            {renderedContent}
          </ChatBubble>

          {isError && (
            <span className={messageErrorCaptionStyle}>
              <span className={messageErrorIconStyle}>
                <ErrorIcon />
              </span>
              Error generating response
            </span>
          )}

          {actions && <div>{actions}</div>}

          {showTimestamp && timestamp && (
            <span className={messageTimestampStyle}>
              {formatTimestamp(timestamp)}
            </span>
          )}
        </div>
      </div>
    );
  }
);

ChatMessage.displayName = 'ChatMessage';
