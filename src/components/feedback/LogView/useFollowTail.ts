'use client';

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';

import { useLatest } from '@/hooks/useLatest';

import type { RefObject } from 'react';

export interface UseFollowTailOptions {
  /** The scroll viewport element. */
  scrollRef: RefObject<HTMLElement | null>;
  /** Whether to stick to the bottom as new entries arrive. */
  follow: boolean;
  /** Attach/detach follow. */
  setFollow: (follow: boolean) => void;
  /** Current number of (visible) entries — drives snap-on-append and the new-line badge. */
  entryCount: number;
  /** Distance from the bottom (px) still considered "at bottom". @default 8 */
  threshold?: number;
}

export interface UseFollowTailResult {
  /** Scroll to the latest line and re-attach follow. */
  scrollToBottom: () => void;
  /** True when the user has scrolled up and detached from the tail. */
  isDetached: boolean;
  /** Entries appended since the user detached (0 while following). */
  newSinceDetach: number;
}

/**
 * Follow-tail behavior for a scrollable log body.
 *
 * - While `follow` is on, the viewport snaps to the bottom whenever the entry
 *   count changes (a genuine scroll-position sync → `useLayoutEffect`).
 * - A manual scroll **up** detaches (`setFollow(false)`); scrolling back to the
 *   bottom re-attaches. "At bottom" is read from live scroll metrics, never
 *   from mirrored state, so it can't drift.
 * - Programmatic snaps are flagged so they don't read as a manual scroll.
 *
 * This logic is intentionally colocated with LogView (single consumer); promote
 * it to `src/hooks/` only if a second component needs it.
 */
export function useFollowTail({
  scrollRef,
  follow,
  setFollow,
  entryCount,
  threshold = 8,
}: UseFollowTailOptions): UseFollowTailResult {
  const followRef = useLatest(follow);
  const setFollowRef = useLatest(setFollow);
  const entryCountRef = useLatest(entryCount);

  const isAutoScrollingRef = useRef(false);
  const resetRafRef = useRef(0);

  // Entry count captured at the moment of detach; `null` until the user
  // actually scrolls away (so a consumer starting with follow=false doesn't
  // miscount every existing line as "new"). The badge shows entryCount - this.
  const [detachedAtCount, setDetachedAtCount] = useState<number | null>(null);

  const performScrollToBottom = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    isAutoScrollingRef.current = true;
    el.scrollTop = el.scrollHeight;
    if (typeof requestAnimationFrame === 'function') {
      cancelAnimationFrame(resetRafRef.current);
      resetRafRef.current = requestAnimationFrame(() => {
        isAutoScrollingRef.current = false;
      });
    } else {
      isAutoScrollingRef.current = false;
    }
  }, [scrollRef]);

  // Snap to bottom on mount and whenever the entry count changes while attached.
  useLayoutEffect(() => {
    if (!follow) return;
    performScrollToBottom();
  }, [follow, entryCount, performScrollToBottom]);

  // Detach on manual scroll-up; re-attach on scroll-to-bottom. Listener attaches
  // once and reads live values through refs.
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const handleScroll = (): void => {
      if (isAutoScrollingRef.current) return;
      const atBottom =
        el.scrollHeight - el.clientHeight - el.scrollTop <= threshold;
      if (atBottom) {
        if (!followRef.current) {
          setDetachedAtCount(null);
          setFollowRef.current(true);
        }
      } else if (followRef.current) {
        setDetachedAtCount(entryCountRef.current);
        setFollowRef.current(false);
      }
    };

    el.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      el.removeEventListener('scroll', handleScroll);
    };
  }, [scrollRef, threshold, followRef, setFollowRef, entryCountRef]);

  useEffect(() => {
    return () => {
      if (typeof cancelAnimationFrame === 'function') {
        cancelAnimationFrame(resetRafRef.current);
      }
    };
  }, []);

  const scrollToBottom = useCallback(() => {
    performScrollToBottom();
    setDetachedAtCount(null);
    setFollowRef.current(true);
  }, [performScrollToBottom, setFollowRef]);

  const newSinceDetach =
    follow || detachedAtCount === null
      ? 0
      : Math.max(0, entryCount - detachedAtCount);

  return { scrollToBottom, isDetached: !follow, newSinceDetach };
}
