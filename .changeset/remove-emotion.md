---
'entangle-ui': minor
---

Remove Emotion CSS-in-JS dependency entirely — all styling now uses Vanilla Extract (zero-runtime, compile-time CSS)

### Breaking Changes

- `@emotion/react` and `@emotion/styled` are no longer peer dependencies
- Removed exports: `createTheme`, `tokens`, `Theme`, `Tokens` types
- Removed `css` prop from `BaseComponent` interface
- `ThemeProvider` is now a no-op pass-through (kept for compatibility)

### Migration

- Replace `import { createTheme, tokens } from 'entangle-ui'` with `import { vars, darkThemeValues } from 'entangle-ui'`
- Replace `import type { Theme } from 'entangle-ui'` with `import type { ThemeVars } from 'entangle-ui'`
- Use `className` + `style` props instead of `css` prop
- Theme tokens: use `vars.colors.*`, `vars.spacing.*` from Vanilla Extract contract
