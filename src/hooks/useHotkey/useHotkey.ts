'use client';

import { useEffect, useMemo, useRef, type RefObject } from 'react';
import { getPlatform, parseShortcut } from '@/utils/platform';
import type { HotkeyTarget, UseHotkeyOptions } from './useHotkey.types';

function isRefObject(value: unknown): value is RefObject<EventTarget | null> {
  return (
    typeof value === 'object' &&
    value !== null &&
    'current' in (value as Record<string, unknown>)
  );
}

function resolveTarget(target: HotkeyTarget | undefined): EventTarget | null {
  if (target === undefined) {
    return typeof window === 'undefined' ? null : window;
  }
  if (target === null) return null;
  if (isRefObject(target)) return target.current;
  return target;
}

interface ParsedCombo {
  ctrl: boolean;
  meta: boolean;
  alt: boolean;
  shift: boolean;
  /** Lower-cased non-modifier key, e.g. "s", "k", "escape", "arrowup". */
  key: string;
}

const MODIFIERS = new Set(['ctrl', 'cmd', 'meta', 'alt', 'option', 'shift']);

const KEY_ALIASES: Record<string, string> = {
  esc: 'escape',
  return: 'enter',
  space: ' ',
  spacebar: ' ',
  up: 'arrowup',
  down: 'arrowdown',
  left: 'arrowleft',
  right: 'arrowright',
  plus: '+',
};

function normalizeKey(key: string): string {
  const lower = key.toLowerCase();
  return KEY_ALIASES[lower] ?? lower;
}

function parseCombo(combo: string): ParsedCombo | null {
  const parts = parseShortcut(combo);
  if (parts.length === 0) return null;

  const platform = getPlatform();
  const isMac = platform === 'mac';

  let ctrl = false;
  let meta = false;
  let alt = false;
  let shift = false;
  let key: string | null = null;

  for (const raw of parts) {
    const lower = raw.toLowerCase();
    if (MODIFIERS.has(lower)) {
      switch (lower) {
        case 'ctrl':
          ctrl = true;
          break;
        case 'cmd':
          // Cmd auto-maps to Ctrl on non-Mac.
          if (isMac) {
            meta = true;
          } else {
            ctrl = true;
          }
          break;
        case 'meta':
          meta = true;
          break;
        case 'alt':
        case 'option':
          alt = true;
          break;
        case 'shift':
          shift = true;
          break;
      }
    } else {
      key = normalizeKey(raw);
    }
  }

  if (key === null) return null;
  return { ctrl, meta, alt, shift, key };
}

function isEditableTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  if (target.isContentEditable) return true;
  const tag = target.tagName;
  if (tag === 'INPUT') {
    const type = (target as HTMLInputElement).type.toLowerCase();
    // Buttons and similar non-text inputs should not block hotkeys.
    const nonEditable = new Set([
      'button',
      'submit',
      'reset',
      'checkbox',
      'radio',
      'file',
      'image',
      'range',
      'color',
    ]);
    return !nonEditable.has(type);
  }
  return tag === 'TEXTAREA' || tag === 'SELECT';
}

function matches(parsed: ParsedCombo, event: KeyboardEvent): boolean {
  if (event.ctrlKey !== parsed.ctrl) return false;
  if (event.metaKey !== parsed.meta) return false;
  if (event.altKey !== parsed.alt) return false;
  if (event.shiftKey !== parsed.shift) return false;

  const eventKey = event.key.toLowerCase();
  return eventKey === parsed.key;
}

/**
 * Bind a single keyboard combo to a callback.
 *
 * Combos use the same `+`-separated string format as `MenuBar`'s `shortcut`
 * prop: `"Ctrl+S"`, `"Cmd+Shift+P"`, `"Escape"`. Modifiers: `Ctrl`, `Cmd`
 * (= Meta), `Alt` / `Option`, `Shift`. `Cmd` automatically maps to `Ctrl` on
 * non-Mac platforms via `getPlatform()`.
 *
 * The handler reference is stable — passing a fresh inline function on every
 * render is safe and does not re-subscribe the underlying listener.
 *
 * @example
 * ```tsx
 * useHotkey('Ctrl+S', e => save(), { preventDefault: true });
 * useHotkey('Escape', () => setOpen(false));
 * useHotkey('Cmd+K', () => openCommandPalette()); // Cmd on Mac, Ctrl elsewhere
 * ```
 */
export function useHotkey(
  combo: string,
  handler: (event: KeyboardEvent) => void,
  options: UseHotkeyOptions = {}
): void {
  const {
    enabled = true,
    enableInInputs = false,
    preventDefault = true,
    stopPropagation = false,
    target,
  } = options;

  const handlerRef = useRef(handler);
  handlerRef.current = handler;

  const parsed = useMemo(() => parseCombo(combo), [combo]);

  useEffect(() => {
    if (!enabled || parsed === null) return;

    // Resolve inside the effect so a `RefObject` target reads its current
    // value after commit — by the time `useEffect` fires, React has already
    // populated `ref.current` with the mounted element.
    const eventTarget = resolveTarget(target);
    if (eventTarget === null) return;

    const listener = (event: Event) => {
      const ke = event as KeyboardEvent;
      if (!matches(parsed, ke)) return;
      if (!enableInInputs && isEditableTarget(ke.target)) return;

      if (preventDefault) ke.preventDefault();
      handlerRef.current(ke);
      if (stopPropagation) ke.stopPropagation();
    };

    eventTarget.addEventListener('keydown', listener);
    return () => {
      eventTarget.removeEventListener('keydown', listener);
    };
  }, [
    enabled,
    enableInInputs,
    preventDefault,
    stopPropagation,
    target,
    parsed,
  ]);
}
