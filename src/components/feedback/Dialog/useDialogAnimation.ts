'use client';

import { useEffect, useRef, useState, type RefObject } from 'react';
import { FOCUSABLE_SELECTOR } from '@/hooks/useFocusTrap';
import { DIALOG_ANIMATION_MS } from './Dialog.css';

interface UseDialogAnimationOptions {
  open: boolean;
  panelRef: RefObject<HTMLElement | null>;
  initialFocusRef?: RefObject<HTMLElement | null>;
}

interface UseDialogAnimationReturn {
  mounted: boolean;
  closing: boolean;
}

/**
 * Manages Dialog mount/unmount animation lifecycle and focus management.
 *
 * Combines three concerns into a single hook:
 * 1. Mount/unmount with closing animation delay
 * 2. Initial focus on open (respects initialFocusRef)
 * 3. Return focus to previously focused element on close
 */
export function useDialogAnimation({
  open,
  panelRef,
  initialFocusRef,
}: UseDialogAnimationOptions): UseDialogAnimationReturn {
  const [mounted, setMounted] = useState(false);
  const [closing, setClosing] = useState(false);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const wasOpenRef = useRef(false);

  useEffect(() => {
    if (open) {
      // Opening: capture previous focus, mount immediately
      previousFocusRef.current = document.activeElement as HTMLElement;
      setClosing(false);
      setMounted(true);
      wasOpenRef.current = true;
    } else if (wasOpenRef.current) {
      // Closing: start close animation, unmount after delay. Under
      // prefers-reduced-motion: reduce, the close animation is suppressed
      // (Dialog.css.ts), so honor that here too — snap the unmount to
      // 0 ms instead of holding the dialog focus-trapped for nothing.
      wasOpenRef.current = false;
      setClosing(true);
      const prefersReducedMotion =
        typeof window !== 'undefined' &&
        typeof window.matchMedia === 'function' &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const delay = prefersReducedMotion ? 0 : DIALOG_ANIMATION_MS;
      const timer = setTimeout(() => {
        setMounted(false);
        setClosing(false);

        // Return focus after unmount
        if (previousFocusRef.current) {
          previousFocusRef.current.focus();
          previousFocusRef.current = null;
        }
      }, delay);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [open]);

  // Initial focus after mount
  useEffect(() => {
    if (!open || !mounted) return;

    const timer = setTimeout(() => {
      if (initialFocusRef?.current) {
        initialFocusRef.current.focus();
      } else {
        const panel = panelRef.current;
        if (panel) {
          const firstFocusable = panel.querySelector(
            FOCUSABLE_SELECTOR
          ) as HTMLElement;
          if (firstFocusable) {
            firstFocusable.focus();
          } else {
            panel.focus();
          }
        }
      }
    }, 0);
    return () => clearTimeout(timer);
  }, [open, mounted, initialFocusRef, panelRef]);

  return { mounted, closing };
}
