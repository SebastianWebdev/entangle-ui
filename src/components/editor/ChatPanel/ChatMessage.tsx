'use client';

import React from 'react';
import type { ChatMessageProps } from './ChatPanel.types';
import { cx } from '@/utils/cx';
import { ChatBubble } from './ChatBubble';
import {
  messageRecipe,
  messageContentStyle,
  messageAvatarStyle,
  messageAvatarImgStyle,
  messageTimestampStyle,
  messageTextStyle,
  bubbleErrorStyle,
  messageErrorCaptionStyle,
  messageErrorIconStyle,
} from './ChatPanel.css';

function formatTimestamp(iso: string): string {
  try {
    const date = new Date(iso);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } catch {
    return '';
  }
}

function getInitials(name?: string): string {
  if (!name) return '?';
  return name
    .split(' ')
    .map(part => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
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

    return (
      <div
        ref={ref}
        className={cx(messageRecipe({ role }), className)}
        style={style}
        data-testid={testId}
        {...rest}
      >
        {showAvatar && role !== 'system' && (
          <div className={messageAvatarStyle} aria-hidden="true">
            {avatar ? (
              <img
                src={avatar}
                alt={displayName ?? role}
                className={messageAvatarImgStyle}
              />
            ) : (
              getInitials(displayName ?? role)
            )}
          </div>
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
