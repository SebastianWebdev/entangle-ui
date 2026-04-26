import type { RefObject } from 'react';

export type HotkeyTarget = EventTarget | RefObject<EventTarget | null> | null;

export interface UseHotkeyOptions {
  /**
   * When false, the binding is not active.
   * @default true
   */
  enabled?: boolean;
  /**
   * Whether to fire when focus is inside an editable element
   * (`<input>`, `<textarea>`, `[contenteditable]`).
   * @default false
   */
  enableInInputs?: boolean;
  /**
   * Call `event.preventDefault()` before invoking the handler.
   * @default true
   */
  preventDefault?: boolean;
  /**
   * Call `event.stopPropagation()` after the handler runs.
   * @default false
   */
  stopPropagation?: boolean;
  /**
   * Override the target element. Accepts either an `EventTarget` directly
   * (e.g. `document`, an `HTMLElement`) or a `RefObject` whose `.current`
   * resolves to one. The latter form re-attaches the listener once the ref
   * mounts, so passing `ref` directly works without waiting a render. Defaults
   * to `window`.
   */
  target?: HotkeyTarget;
}
