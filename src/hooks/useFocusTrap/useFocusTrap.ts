'use client';

import { useCallback, type KeyboardEvent, type RefObject } from 'react';

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'textarea:not([disabled])',
  'select:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(', ');

export interface UseFocusTrapOptions {
  /** Ref to the container element whose focusable descendants are trapped. */
  containerRef: RefObject<HTMLElement | null>;
  /**
   * When false, the trap is bypassed (Tab works normally). Useful for toggling
   * trap state without unmounting.
   * @default true
   */
  enabled?: boolean;
}

/**
 * Trap focus within a container element. Tab and Shift+Tab cycle through the
 * focusable descendants without escaping the container.
 *
 * Returns a keyboard event handler to attach to the container's `onKeyDown`.
 *
 * @example
 * ```tsx
 * const ref = useRef<HTMLDivElement>(null);
 * const handleKeyDown = useFocusTrap({ containerRef: ref, enabled: isOpen });
 *
 * return <div ref={ref} onKeyDown={handleKeyDown}>...</div>;
 * ```
 */
export function useFocusTrap({
  containerRef,
  enabled = true,
}: UseFocusTrapOptions): (event: KeyboardEvent) => void {
  return useCallback(
    (e: KeyboardEvent) => {
      if (!enabled || e.key !== 'Tab') return;

      const container = containerRef.current;
      if (!container) return;

      const focusableElements = Array.from(
        container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)
      );

      if (focusableElements.length === 0) {
        e.preventDefault();
        return;
      }

      const firstElement = focusableElements[0] as HTMLElement;
      const lastElement = focusableElements[
        focusableElements.length - 1
      ] as HTMLElement;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    },
    [enabled, containerRef]
  );
}

export { FOCUSABLE_SELECTOR };
