import React from 'react';
import type { ChatMessageListProps } from './ChatPanel.types';
import { cx } from '@/utils/cx';
import { useChatScroll } from './useChatScroll';
import { ChatMessage } from './ChatMessage';
import { messageListStyle, newMessagesBannerStyle } from './ChatPanel.css';

export const ChatMessageList = /*#__PURE__*/ React.memo<ChatMessageListProps>(
  ({
    messages,
    renderMessage,
    emptyState,
    autoScroll = true,
    className,
    style,
    testId,
    ref,
    ...rest
  }) => {
    const { scrollContainerRef, hasNewMessages, scrollToBottom } =
      useChatScroll({
        messages,
        enabled: autoScroll,
      });

    // Merge refs
    const mergedRef = React.useCallback(
      (node: HTMLDivElement | null) => {
        (
          scrollContainerRef as React.MutableRefObject<HTMLDivElement | null>
        ).current = node;
        if (typeof ref === 'function') {
          ref(node);
        } else if (ref) {
          (ref as React.MutableRefObject<HTMLDivElement | null>).current = node;
        }
      },
      [scrollContainerRef, ref]
    );

    if (messages.length === 0 && emptyState) {
      return (
        <div
          ref={mergedRef}
          className={cx(messageListStyle, className)}
          style={style}
          data-testid={testId}
          role="log"
          aria-live="polite"
          {...rest}
        >
          {emptyState}
        </div>
      );
    }

    return (
      <div
        ref={mergedRef}
        className={cx(messageListStyle, className)}
        style={style}
        data-testid={testId}
        role="log"
        aria-live="polite"
        {...rest}
      >
        {messages.map((message, index) =>
          renderMessage ? (
            <React.Fragment key={message.id}>
              {renderMessage(message, index)}
            </React.Fragment>
          ) : (
            <ChatMessage key={message.id} message={message} />
          )
        )}

        {hasNewMessages && (
          <button
            className={newMessagesBannerStyle}
            onClick={() => scrollToBottom('smooth')}
            type="button"
          >
            New messages
          </button>
        )}
      </div>
    );
  }
);

ChatMessageList.displayName = 'ChatMessageList';
