'use client';

import { useEffect, useRef, type RefObject } from 'react';

export interface UseClickOutsideOptions {
  /**
   * When false, the listener is not attached. Useful for toggling without
   * unmount.
   * @default true
   */
  enabled?: boolean;
  /**
   * Mouse / pointer event to listen for.
   * @default 'mousedown'
   */
  event?: 'mousedown' | 'click' | 'pointerdown';
}

type AnyHTMLRef = RefObject<HTMLElement | null>;

function isOutside(target: EventTarget | null, refs: AnyHTMLRef[]): boolean {
  if (!(target instanceof Node)) return true;

  for (const ref of refs) {
    const node = ref.current;
    if (node && (node === target || node.contains(target))) {
      return false;
    }
  }
  return true;
}

/**
 * Fire a callback when a click occurs outside the referenced element(s).
 *
 * Accepts either a single ref or an array of refs. The handler fires only
 * when the click lands outside ALL provided refs — useful for popover +
 * trigger pairs where clicking either should be considered "inside".
 *
 * Defaults to `mousedown` so the handler runs before `click`. SSR-safe;
 * cleans up on unmount and when `enabled` flips to `false`.
 *
 * @example
 * ```tsx
 * const ref = useRef<HTMLDivElement>(null);
 * useClickOutside(ref, () => setOpen(false), { enabled: isOpen });
 *
 * return <div ref={ref}>...</div>;
 * ```
 */
export function useClickOutside<T extends HTMLElement = HTMLElement>(
  ref: RefObject<T | null> | Array<RefObject<HTMLElement | null>>,
  handler: (event: MouseEvent) => void,
  options: UseClickOutsideOptions = {}
): void {
  const { enabled = true, event = 'mousedown' } = options;

  const handlerRef = useRef(handler);
  const refsRef = useRef<AnyHTMLRef[]>([]);

  // Latest handler — invoked from the listener without re-subscribing.
  handlerRef.current = handler;
  // Latest ref(s) — refreshed every render so consumers may pass inline
  // arrays without forcing a re-subscribe of the document listener.
  refsRef.current = Array.isArray(ref) ? ref : [ref as AnyHTMLRef];

  useEffect(() => {
    if (!enabled) return;
    if (typeof document === 'undefined') return;

    const listener = (e: MouseEvent) => {
      if (isOutside(e.target, refsRef.current)) {
        handlerRef.current(e);
      }
    };

    document.addEventListener(event, listener);
    return () => {
      document.removeEventListener(event, listener);
    };
  }, [enabled, event]);
}
