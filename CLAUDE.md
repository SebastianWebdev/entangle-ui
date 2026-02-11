# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Entangle UI is a React component library for professional editor interfaces (3D tools, node editors, parameter systems). Alpha stage, published as `entangle-ui@alpha`. Uses Vanilla Extract (zero-runtime, compile-time CSS) with a dark-first theme system, built on top of `@base-ui/react`.

## Commands

| Task            | Command                                                                     |
| --------------- | --------------------------------------------------------------------------- |
| Dev (Storybook) | `npm dev` or `npm storybook` (port 6006)                                    |
| Build           | `npm build` (Rollup → ESM + DTS in `dist/`)                                 |
| Test            | `npm test` (Vitest, run mode)                                               |
| Test with UI    | `npm test:ui`                                                               |
| Test coverage   | `npm test:coverage` (80% threshold for branches/functions/lines/statements) |
| Run single test | `npm vitest run src/components/primitives/Button/Button.test.tsx`           |
| Lint            | `npm lint`                                                                  |
| Lint fix        | `npm lint:fix`                                                              |
| Type check      | `npm type-check`                                                            |
| Format          | `npm format`                                                                |
| Format check    | `npm format:check`                                                          |
| Bundle size     | `npm size` (size-limit)                                                     |

## Architecture

**Component categories** in `src/components/`:

- `primitives/` — Button, Input, Paper, Text, Icon, IconButton, Tooltip
- `layout/` — Flex, Grid, Stack, Spacer (responsive breakpoints: 576/768/992/1200px)
- `controls/` — Slider, NumberInput
- `form/` — FormLabel, FormHelperText, InputWrapper
- `navigation/` — Menu
- `Icons/` — 40+ SVG icon components

**Theme system** in `src/theme/`: tokens (colors, spacing, typography, shadows, transitions, borderRadius) defined as a Vanilla Extract theme contract. All tokens are exposed as CSS custom properties (`--etui-*`). Components access tokens via `vars` from `@/theme/contract.css`.

**Barrel exports**: `src/index.ts` is the single entry point. Each component folder has its own `index.ts` re-exporting the component and its types.

## Key Conventions (from CONVENTIONS.md)

**All text must be in English** — comments, JSDoc, test descriptions, commit messages. No Polish text.

**Path aliases are mandatory**: always use `@/` imports (e.g., `@/theme`, `@/types/utilities`), never relative paths for cross-directory imports.

**Type utilities** from `@/types/utilities`:

- `Prettify<T>` — always use for exported intersection types
- `LiteralUnion<T, U>` — only when values need to be extensible (colors, icons)
- Strict unions for controlled APIs (e.g., `ButtonSize = 'sm' | 'md' | 'lg'`)

**Theme tokens over hardcoded values**: use `vars.colors.*`, `vars.spacing.*`, etc. from `@/theme/contract.css`. Never hardcode colors or spacing.

**No `any` types** — ESLint enforces this as an error.

## Component File Structure

```
ComponentName/
├── ComponentName.tsx
├── ComponentName.css.ts       (Vanilla Extract styles)
├── ComponentName.test.tsx
├── ComponentName.stories.tsx
├── ComponentName.types.ts     (if types are complex)
├── useComponentName.ts        (if hooks needed)
└── index.ts
```

## Testing

- Test environment: jsdom with `@testing-library/react`
- Use `renderWithTheme()` from `@/tests/testUtils` instead of plain `render()` — components need the theme CSS custom properties
- `createTestTheme()` for testing with custom theme overrides
- `styleAssertions` helpers: `expectBackgroundColor`, `expectTextColor`, `expectDimensions`, `expectBorderRadius`
- Tests organized in `describe` blocks: Rendering, Interactions, Accessibility

## Build System

- **Rollup** produces ESM modules (`dist/esm/`) with `preserveModules` and types (`dist/types/`)
- **No CJS output** — package is ESM-only (`"type": "module"`)
- **Tree-shakeable**: `sideEffects: false` + `preserveModules` + `/*#__PURE__*/` annotations
- **Build config**: `tsconfig.build.json` (extends `tsconfig.json`, excludes tests/stories)
- **Vite** is only used for Storybook dev server, not library builds
- **Vanilla Extract**: Rollup uses `@vanilla-extract/rollup-plugin`, Storybook uses `@vanilla-extract/vite-plugin`
- Externals: react, react-dom, react/jsx-runtime, @base-ui/react, @floating-ui/react
- Peer deps: React 19.1+, @base-ui/react ^1.1.0, @floating-ui/react ^0.27.17
- Deep imports: `entangle-ui/palettes` available via `"exports"` field
- Size guard: `npm run size` (size-limit)

## Storybook

Storybook 10 with Vite. Dark theme CSS is loaded globally via `@vanilla-extract/vite-plugin`. Dark background default. Story pattern: Meta config with argTypes + individual Story exports for each variant/state.
