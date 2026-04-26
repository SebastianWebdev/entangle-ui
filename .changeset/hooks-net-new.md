---
'entangle-ui': minor
---

Add four net-new hooks to the public API: `useDisclosure`, `useClipboard`, `useClickOutside`, and `useHotkey`.

- **`useDisclosure`** — manages a boolean `isOpen` state with stable `open`, `close`, `toggle`, and `setOpen` callbacks. Supports both controlled (`open` / `onOpenChange`) and uncontrolled (`defaultOpen`) modes, built on top of `useControlledState`.
- **`useClipboard`** — copies text to the clipboard with a built-in timeout-driven `copied` feedback flag, an `error` field, and a `reset` callback. Uses `navigator.clipboard.writeText` with a `document.execCommand` fallback; never throws.
- **`useClickOutside`** — fires a callback when a click lands outside one or more refs. Supports both single-ref and array-of-refs forms (useful for popover + trigger pairs) and is configurable to listen on `mousedown`, `click`, or `pointerdown`.
- **`useHotkey`** — binds a single keyboard combo (e.g. `'Ctrl+S'`, `'Cmd+K'`, `'Escape'`) to a callback. `Cmd` automatically maps to `Ctrl` on non-Mac platforms. Skips firing inside editable elements by default; `enableInInputs` opts back in for global shortcuts.

All four hooks are SSR-safe, clean up subscriptions on unmount, and use a stable handler-ref pattern so consumers do not need to memoize callbacks. Each hook ships with a dedicated page on the docs site under the Hooks section.
