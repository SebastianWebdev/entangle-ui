'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import type {
  UseChatScrollOptions,
  UseChatScrollReturn,
} from './ChatPanel.types';

export function useChatScroll(
  options: UseChatScrollOptions
): UseChatScrollReturn {
  const { messages, enabled = true, threshold = 100 } = options;

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const [hasNewMessages, setHasNewMessages] = useState(false);
  const prevMessageCountRef = useRef(messages.length);

  const checkIfAtBottom = useCallback(() => {
    const container = scrollContainerRef.current;
    if (!container) return true;

    const { scrollTop, scrollHeight, clientHeight } = container;
    return scrollHeight - scrollTop - clientHeight <= threshold;
  }, [threshold]);

  const scrollToBottom = useCallback((behavior: ScrollBehavior = 'auto') => {
    const container = scrollContainerRef.current;
    if (!container) return;

    container.scrollTo({
      top: container.scrollHeight,
      behavior,
    });
    setIsAtBottom(true);
    setHasNewMessages(false);
  }, []);

  // Listen for scroll events to track position
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const atBottom = checkIfAtBottom();
      setIsAtBottom(atBottom);
      if (atBottom) {
        setHasNewMessages(false);
      }
    };

    container.addEventListener('scroll', handleScroll, { passive: true });
    return () => container.removeEventListener('scroll', handleScroll);
  }, [checkIfAtBottom]);

  // Auto-scroll or show indicator on new messages
  useEffect(() => {
    const currentCount = messages.length;
    const prevCount = prevMessageCountRef.current;
    prevMessageCountRef.current = currentCount;

    if (currentCount <= prevCount) return;

    if (!enabled) return;

    if (isAtBottom) {
      // Use requestAnimationFrame for DOM to update first
      requestAnimationFrame(() => {
        scrollToBottom();
      });
    } else {
      setHasNewMessages(true);
    }
  }, [messages.length, enabled, isAtBottom, scrollToBottom]);

  return {
    scrollContainerRef,
    isAtBottom,
    hasNewMessages,
    scrollToBottom,
  };
}
