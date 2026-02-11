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
    const { role, content, timestamp, avatar, displayName } = message;

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
          <ChatBubble role={role}>{renderedContent}</ChatBubble>

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
