# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Entangle UI is a React component library for professional editor interfaces (3D tools, node editors, parameter systems). Alpha stage, published as `entangle-ui@alpha`. Uses Emotion CSS-in-JS with a dark-first theme system, built on top of `@base-ui-components/react`.

## Commands

| Task | Command |
|------|---------|
| Dev (Storybook) | `yarn dev` or `yarn storybook` (port 6006) |
| Build | `yarn build` (Rollup → CJS + ESM + DTS in `dist/`) |
| Test | `yarn test` (Vitest, run mode) |
| Test with UI | `yarn test:ui` |
| Test coverage | `yarn test:coverage` (80% threshold for branches/functions/lines/statements) |
| Run single test | `yarn vitest run src/components/primitives/Button/Button.test.tsx` |
| Lint | `yarn lint` |
| Lint fix | `yarn lint:fix` |
| Type check | `yarn type-check` |
| Format | `yarn format` |
| Format check | `yarn format:check` |

## Architecture

**Component categories** in `src/components/`:
- `primitives/` — Button, Input, Paper, Text, Icon, IconButton, Tooltip
- `layout/` — Flex, Grid, Stack, Spacer (responsive breakpoints: 576/768/992/1200px)
- `controls/` — Slider, NumberInput
- `form/` — FormLabel, FormHelperText, InputWrapper
- `navigation/` — Menu
- `Icons/` — 40+ SVG icon components

**Theme system** in `src/theme/`: tokens (colors, spacing, typography, shadows, transitions, borderRadius) + ThemeProvider. All components consume theme via Emotion's `ThemeProvider`.

**Barrel exports**: `src/index.ts` is the single entry point. Each component folder has its own `index.ts` re-exporting the component and its types.

## Key Conventions (from CONVENTIONS.md)

**All text must be in English** — comments, JSDoc, test descriptions, commit messages. No Polish text.

**Path aliases are mandatory**: always use `@/` imports (e.g., `@/theme`, `@/types/utilities`), never relative paths for cross-directory imports.

**Styled component props**: prefix with `$` (e.g., `$variant`, `$size`) to prevent DOM forwarding.

**Type utilities** from `@/types/utilities`:
- `Prettify<T>` — always use for exported intersection types
- `LiteralUnion<T, U>` — only when values need to be extensible (colors, icons)
- Strict unions for controlled APIs (e.g., `ButtonSize = 'sm' | 'md' | 'lg'`)

**Theme tokens over hardcoded values**: use `theme.colors.*`, `theme.spacing.*`, etc. Never hardcode colors or spacing.

**No `any` types** — ESLint enforces this as an error.

## Component File Structure

```
ComponentName/
├── ComponentName.tsx
├── ComponentName.test.tsx
├── ComponentName.stories.tsx
├── ComponentName.types.ts     (if types are complex)
├── useComponentName.ts        (if hooks needed)
└── index.ts
```

## Testing

- Test environment: jsdom with `@testing-library/react`
- Use `renderWithTheme()` from `@/tests/testUtils` instead of plain `render()` — components need the Emotion ThemeProvider
- `createTestTheme()` for testing with custom theme overrides
- `styleAssertions` helpers: `expectBackgroundColor`, `expectTextColor`, `expectDimensions`, `expectBorderRadius`
- Tests organized in `describe` blocks: Rendering, Interactions, Accessibility

## Build System

- **Rollup** produces CJS (`dist/index.js`), ESM (`dist/index.esm.js`), and types (`dist/index.d.ts`)
- **Vite** is only used for Storybook dev server, not library builds
- Externals: react, react-dom, @base-ui/react
- Peer deps: React 19.1+, @emotion/react 11+, @emotion/styled 11+

## Storybook

Stories use a ThemeProvider decorator wrapping all components. Dark background default. Story pattern: Meta config with argTypes + individual Story exports for each variant/state.
