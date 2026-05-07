---
'entangle-ui': patch
---

Fix runtime crash in `Slider`, `NumberInput`, and `VectorInput` when used without a manual `KeyboardContextProvider` wrapper, and expose the icon set and provider from the package barrel.

- `useKeyboardContext` now returns a neutral keyboard state (no pressed keys, all modifiers `false`) when no provider is mounted, instead of throwing. This unblocks every minimal setup that renders a `Slider` / `NumberInput` directly under `ThemeProvider`.
- `ThemeProvider` now auto-mounts `KeyboardContextProvider` so apps get full Shift/Ctrl modifier awareness in `Slider` / `NumberInput` for free.
- `KeyboardContextProvider`, `useKeyboardContext`, `useEffectsOnKeyboard`, and the `KeyboardContextProviderProps` type are now exported from the package entry for explicit use in apps that don't render a `ThemeProvider`.
- The 63 built-in icon components (`SaveIcon`, `PlayIcon`, `AddIcon`, …) are now re-exported from the package entry, matching the documentation.
