'use client';

import React, { useImperativeHandle, useMemo } from 'react';
import type {
  ChatMessageListProps,
  ChatMessageListScrollApi,
} from './ChatPanel.types';
import { useChatScroll } from './useChatScroll';
import { ChatMessage } from './ChatMessage';
import { ScrollArea } from '@/components/layout/ScrollArea';
import {
  messageListContentStyle,
  newMessagesBannerStyle,
} from './ChatPanel.css';

export const ChatMessageList = /*#__PURE__*/ React.memo<ChatMessageListProps>(
  ({
    messages,
    renderMessage,
    emptyState,
    autoScroll = true,
    scrollApiRef,
    className,
    style,
    testId,
    ref,
    ...rest
  }) => {
    const {
      scrollContainerRef,
      scrollContentRef,
      hasNewMessages,
      scrollToBottom,
      scrollTo,
      scrollToElement,
    } = useChatScroll({
      messages,
      enabled: autoScroll,
    });

    // Merge refs — ScrollArea forwards ref to its viewport div
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

    const isAtBottomGetter = React.useCallback(() => {
      const container = scrollContainerRef.current;
      if (!container) return true;
      const { scrollTop, scrollHeight, clientHeight } = container;
      return scrollHeight - scrollTop - clientHeight <= 100;
    }, [scrollContainerRef]);

    const scrollApi = useMemo<ChatMessageListScrollApi>(
      () => ({
        scrollToBottom,
        scrollTo,
        scrollToElement,
        isAtBottom: isAtBottomGetter,
      }),
      [scrollToBottom, scrollTo, scrollToElement, isAtBottomGetter]
    );

    useImperativeHandle(scrollApiRef, () => scrollApi, [scrollApi]);

    if (messages.length === 0 && emptyState) {
      return (
        <ScrollArea
          ref={mergedRef}
          autoFill
          className={className}
          style={style}
          testId={testId}
          {...rest}
        >
          <div
            ref={scrollContentRef}
            className={messageListContentStyle}
            role="log"
            aria-live="polite"
          >
            {emptyState}
          </div>
        </ScrollArea>
      );
    }

    return (
      <ScrollArea
        ref={mergedRef}
        autoFill
        className={className}
        style={style}
        testId={testId}
        {...rest}
      >
        <div
          ref={scrollContentRef}
          className={messageListContentStyle}
          role="log"
          aria-live="polite"
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
      </ScrollArea>
    );
  }
);

ChatMessageList.displayName = 'ChatMessageList';
