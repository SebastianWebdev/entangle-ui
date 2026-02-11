---
'entangle-ui': minor
---

Migrate all components from Emotion CSS-in-JS to Vanilla Extract (zero-runtime, build-time CSS).

**Breaking changes:**

- The `css` prop is no longer supported on migrated components. Use `className` and `style` instead.
- Peer dependency: `@vanilla-extract/css`, `@vanilla-extract/recipes`, and `@vanilla-extract/dynamic` are now required.
- Peer dependency renamed: `@base-ui-components/react` → `@base-ui/react` (^1.1.0). The upstream package was renamed.

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

**Build fixes:**

- Add `@rollup/plugin-commonjs` to fix Rollup build failure caused by `@vanilla-extract/css` importing the CJS-only `cssesc` module with ESM default import syntax.
- Fix dependency classification — move build-only packages to devDependencies for cleaner library output.

**Dependency updates:**

- Migrate `@base-ui-components/react` → `@base-ui/react` ^1.1.0 (upstream rename).
- Bump all dependencies to latest safe versions.
- Narrow `MenuBaseProps` from `HTMLElement` to `HTMLDivElement` to match new `@base-ui/react` API.

**Other fixes:**

- Replace unicode characters with proper Icon components in FloatingPanel.
- Restore custom gradient backgrounds in FullEditor story.
- Fix optional chaining to satisfy stricter `@typescript-eslint/prefer-optional-chain`.

**Documentation:**

- Add `docs/quickstart.md` — installation, setup, full component catalog, common patterns.
- Add `docs/theming.md` — complete token reference, customization methods, CSS property names.
- Add `docs/styling.md` — Vanilla Extract recipes, dynamic vars, Emotion patterns, conventions.
