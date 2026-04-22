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
  const scrollContentRef = useRef<HTMLDivElement>(null);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const [hasNewMessages, setHasNewMessages] = useState(false);
  const prevMessageCountRef = useRef(messages.length);
  const isAtBottomRef = useRef(isAtBottom);
  const enabledRef = useRef(enabled);
  const lastContentHeightRef = useRef(0);

  // Keep refs in sync for use inside observer callbacks.
  useEffect(() => {
    isAtBottomRef.current = isAtBottom;
  }, [isAtBottom]);
  useEffect(() => {
    enabledRef.current = enabled;
  }, [enabled]);

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

  const scrollTo = useCallback((opts: ScrollToOptions) => {
    const container = scrollContainerRef.current;
    if (!container) return;
    container.scrollTo(opts);
  }, []);

  const scrollToElement = useCallback(
    (el: HTMLElement, opts?: ScrollIntoViewOptions) => {
      el.scrollIntoView(opts);
    },
    []
  );

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

  // Observe content growth — keeps the list pinned to the bottom during streaming
  // (when message text grows but `messages.length` stays constant).
  useEffect(() => {
    if (typeof ResizeObserver === 'undefined') return;

    const content = scrollContentRef.current;
    if (!content) return;

    lastContentHeightRef.current = content.getBoundingClientRect().height;

    const ro = new ResizeObserver(entries => {
      const entry = entries[0];
      if (!entry) return;

      const nextHeight = entry.contentRect.height;
      const prevHeight = lastContentHeightRef.current;
      lastContentHeightRef.current = nextHeight;

      // Only react to growth — shrinks shouldn't force a scroll jump.
      if (nextHeight <= prevHeight) return;
      if (!enabledRef.current) return;

      if (isAtBottomRef.current) {
        scrollToBottom('auto');
      } else {
        setHasNewMessages(true);
      }
    });

    ro.observe(content);
    return () => {
      ro.disconnect();
    };
  }, [scrollToBottom]);

  // Auto-scroll or show indicator on new messages. Fallback for mounts and
  // cleared lists where content height may not grow monotonically.
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
    scrollContentRef,
    isAtBottom,
    hasNewMessages,
    scrollToBottom,
    scrollTo,
    scrollToElement,
  };
}
