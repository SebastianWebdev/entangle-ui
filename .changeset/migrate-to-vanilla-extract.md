---
'entangle-ui': minor
---

Migrate all components from Emotion CSS-in-JS to Vanilla Extract (zero-runtime, build-time CSS).

**Breaking changes:**

- The `css` prop is no longer supported on migrated components. Use `className` and `style` instead.
- Peer dependency: `@vanilla-extract/css`, `@vanilla-extract/recipes`, and `@vanilla-extract/dynamic` are now required.

**New exports:**

- `vars` — Theme contract object (`vars.colors.*`, `vars.spacing.*`, etc.) mapping to stable `--etui-*` CSS custom properties.
- `darkThemeValues` — Default dark theme token values.
- `createCustomTheme(selector, overrides)` — Helper to create custom themes in `.css.ts` files.
- `VanillaThemeProvider` — Optional scoped theme wrapper component.
- `cx(...classes)` — Utility for composing class names.

**Migration details:**

- ~60 styled components across all categories (primitives, layout, controls, form, navigation, feedback, editor, shell) now use Vanilla Extract recipes and styles.
- Theme tokens are exposed as CSS custom properties (`--etui-color-*`, `--etui-spacing-*`, etc.) that can be overridden with plain CSS.
- Legacy `Dialog.styled.ts` and `Menu.styled.ts` files removed.
- Emotion dependencies remain for the transition period but are no longer used by any library component.
