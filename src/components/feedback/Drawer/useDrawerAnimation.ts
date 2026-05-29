'use client';

import { useEffect, useRef, useState } from 'react';

import { FOCUSABLE_SELECTOR } from '@/hooks/useFocusTrap';

import { DRAWER_ANIMATION_MS } from './Drawer.css';

import type { RefObject } from 'react';

interface UseDrawerAnimationOptions {
  open: boolean;
  panelRef: RefObject<HTMLElement | null>;
  initialFocusRef?: RefObject<HTMLElement | null>;
  shouldFocus: boolean;
}

interface UseDrawerAnimationReturn {
  mounted: boolean;
  closing: boolean;
}

/**
 * Mount/unmount animation lifecycle plus focus management for Drawer.
 * Mirrors the Dialog hook so behavior stays consistent: mount on open,
 * delay unmount on close to play the slide-out, return focus to the
 * previously focused element. `prefers-reduced-motion: reduce` collapses
 * the animation delay to zero.
 */
export function useDrawerAnimation({
  open,
  panelRef,
  initialFocusRef,
  shouldFocus,
}: UseDrawerAnimationOptions): UseDrawerAnimationReturn {
  const [mounted, setMounted] = useState(false);
  const [closing, setClosing] = useState(false);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const wasOpenRef = useRef(false);

  useEffect(() => {
    if (open) {
      previousFocusRef.current = document.activeElement as HTMLElement;
      setClosing(false);
      setMounted(true);
      wasOpenRef.current = true;
      return undefined;
    }
    if (wasOpenRef.current) {
      wasOpenRef.current = false;
      setClosing(true);
      const prefersReducedMotion =
        typeof window !== 'undefined' &&
        typeof window.matchMedia === 'function' &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const delay = prefersReducedMotion ? 0 : DRAWER_ANIMATION_MS;
      const timer = setTimeout(() => {
        setMounted(false);
        setClosing(false);
        if (previousFocusRef.current) {
          previousFocusRef.current.focus();
          previousFocusRef.current = null;
        }
      }, delay);
      return () => {
        clearTimeout(timer);
      };
    }
    return undefined;
  }, [open]);

  useEffect(() => {
    if (!open || !mounted || !shouldFocus) return undefined;
    const timer = setTimeout(() => {
      if (initialFocusRef?.current) {
        initialFocusRef.current.focus();
        return;
      }
      const panel = panelRef.current;
      if (!panel) return;
      const firstFocusable =
        panel.querySelector<HTMLElement>(FOCUSABLE_SELECTOR);
      if (firstFocusable) {
        firstFocusable.focus();
      } else {
        panel.focus();
      }
    }, 0);
    return () => {
      clearTimeout(timer);
    };
  }, [open, mounted, initialFocusRef, panelRef, shouldFocus]);

  return { mounted, closing };
}
