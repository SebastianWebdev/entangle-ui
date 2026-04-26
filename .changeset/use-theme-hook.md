---
'entangle-ui': minor
---

Add `useTheme` hook for runtime theme reads. Returns the resolved CSS
variable snapshot from `:root`, the detected variant (`'dark'` / `'light'` /
`'custom'`), and `getToken(path)` / `getVar(path)` helpers for paths like
`'colors.accent.primary'`. Use it for canvas drawing, third-party libraries
that take colours as plain strings, and conditional logic — keep using
Vanilla Extract `vars.*` for ordinary styling. SSR-safe: returns dark-theme
defaults when no DOM is available.
