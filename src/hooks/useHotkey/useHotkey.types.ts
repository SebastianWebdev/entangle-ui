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
   * Override the target element. Defaults to `window`.
   */
  target?: HTMLElement | Document | null;
}
