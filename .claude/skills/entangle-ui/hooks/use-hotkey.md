# useHotkey

> Bind a single keyboard combo to a callback with platform-aware Cmd/Ctrl mapping.

`useHotkey` wires a single keyboard combo to a callback. It uses the same `+`-separated string format as `MenuBar`'s `shortcut` prop, automatically maps `Cmd` to `Ctrl` on non-Mac platforms, and skips firing while the user is typing in editable elements unless you opt in.

**Live preview**

## Import

```ts
import { useHotkey } from 'entangle-ui';
```

## Signature

```ts
function useHotkey(
  combo: string,
  handler: (event: KeyboardEvent) => void,
  options?: UseHotkeyOptions
): void;

interface UseHotkeyOptions {
  enabled?: boolean;
  enableInInputs?: boolean;
  preventDefault?: boolean;
  stopPropagation?: boolean;
  target?: EventTarget | RefObject<EventTarget | null> | null;
}
```

## Usage

```tsx
useHotkey('Ctrl+S', () => save());
useHotkey('Escape', () => setOpen(false));
useHotkey('Cmd+K', () => openCommandPalette()); // Cmd on Mac, Ctrl elsewhere
```

### Escape to close

**Escape**

### Letting hotkeys fire inside inputs

By default, `useHotkey` does not fire while focus is inside `<input>`, `<textarea>`, or `[contenteditable]`. Set `enableInInputs: true` for global app shortcuts that should trump typing.

**enableInInputs**

### Platform-aware combos

Use `Cmd` in the combo string and the hook maps it to `Meta` on Mac and `Ctrl` everywhere else, matching native conventions.

**Platform aware**

## Combo syntax

Modifiers are case-insensitive and order-insensitive. The non-modifier key is the last segment.

| Token            | Meaning                                                                |
| ---------------- | ---------------------------------------------------------------------- |
| `Ctrl`           | Control key                                                            |
| `Cmd`            | Meta on Mac, Ctrl on Windows / Linux                                   |
| `Meta`           | Meta key (does not auto-map across platforms)                          |
| `Alt` / `Option` | Alt key                                                                |
| `Shift`          | Shift key                                                              |
| Single character | Letter, digit, or punctuation (`A`, `1`, `.`, `/`)                     |
| Named keys       | `Escape`, `Enter`, `Tab`, `Space`, `ArrowUp` / `ArrowDown` / `↑` / `↓` |

Examples: `"Ctrl+S"`, `"Cmd+Shift+P"`, `"Escape"`, `"Alt+ArrowUp"`.

## API

| Prop                      | Type                               | Default | Description                                                                                                                                                                                           |
| ------------------------- | ---------------------------------- | ------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `combo` _(required)_      | `string`                           | —       | `+`-separated combo string. Modifiers in any order; the non-modifier key comes last.                                                                                                                  |
| `handler` _(required)_    | `(event: KeyboardEvent) => void`   | —       | Called when the combo matches. The latest handler is invoked even if its identity changed since the listener was attached.                                                                            |
| `options.enabled`         | `boolean`                          | `true`  | When false, the listener is detached.                                                                                                                                                                 |
| `options.enableInInputs`  | `boolean`                          | `false` | When true, the hotkey fires even while focus is in an editable element.                                                                                                                               |
| `options.preventDefault`  | `boolean`                          | `true`  | Whether to call `event.preventDefault()` before invoking the handler.                                                                                                                                 |
| `options.stopPropagation` | `boolean`                          | `false` | Whether to call `event.stopPropagation()` after the handler runs.                                                                                                                                     |
| `options.target`          | `EventTarget \| RefObject \| null` | —       | Override the listener target. Accepts an `EventTarget` directly or a `RefObject` whose `.current` resolves to one — the latter form attaches the listener after the ref mounts. Defaults to `window`. |

## Common pitfalls

- **Modifier mismatch:** `'Ctrl+S'` does NOT match `Ctrl+Shift+S`. The hook checks every modifier — extra ones cause the combo to miss. If you want a "Ctrl+S regardless of Shift" behavior, write a manual handler.
- **Editable focus:** Forgetting to set `enableInInputs` for global app shortcuts (Save, Find, Command Palette) leads to confusing "shortcut works on the page but not while I'm typing" reports.
- **Browser-reserved combos:** `Ctrl+W`, `Ctrl+T`, `Ctrl+N` and friends cannot be intercepted reliably. Pick combos that aren't bound by the browser chrome.
- **`target` lifecycle:** Prefer passing the ref directly (e.g. `target: ref`) over `target: ref.current`. The `RefObject` form re-resolves once the element mounts; the `.current` form is `null` on the first render and the listener never attaches.
