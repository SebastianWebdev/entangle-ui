'use client';

import { useCallback, type RefObject, type KeyboardEvent } from 'react';

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'textarea:not([disabled])',
  'select:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(', ');

interface UseFocusTrapOptions {
  containerRef: RefObject<HTMLElement | null>;
  enabled?: boolean;
}

/**
 * Reusable focus trap hook.
 *
 * Traps Tab/Shift+Tab navigation within a container element,
 * wrapping focus from last to first element and vice versa.
 *
 * @returns onKeyDown handler to attach to the container element
 *
 * @example
 * ```tsx
 * const handleKeyDown = useFocusTrap({ containerRef: panelRef, enabled: true });
 * <div ref={panelRef} onKeyDown={handleKeyDown}>...</div>
 * ```
 */
export function useFocusTrap({
  containerRef,
  enabled = true,
}: UseFocusTrapOptions) {
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
