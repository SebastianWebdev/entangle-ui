# entangle-ui

## 0.3.0

### Minor Changes

- [#24](https://github.com/SebastianWebdev/entangle-ui/pull/24) [`7c350bb`](https://github.com/SebastianWebdev/entangle-ui/commit/7c350bb1ec812a4c4e3ab44c36bc280920aa61c0) Thanks [@SebastianWebdev](https://github.com/SebastianWebdev)! - Switch to fully tree-shakeable ESM build with preserveModules
  - Replace monolithic bundle with per-module ESM output (`dist/esm/`)
  - Drop CJS output — ESM-only package
  - Add `sideEffects: false` and `exports` field to package.json
  - Fix externals: add @emotion/react, @emotion/styled, @floating-ui/react, react/jsx-runtime
  - Fix wrong external name: @base-ui/react → @base-ui-components/react
  - Remove @emotion/react and @emotion/styled from dependencies (keep in peerDependencies only)
  - Add `/*#__PURE__*/` annotations for tree-shaking (Object.assign, createContext, React.memo, forwardRef)
  - Add `entangle-ui/palettes` deep import entry point
  - Add size-limit bundle size guards
  - Create tsconfig.build.json (excludes tests/stories from build)

### Patch Changes

- [#23](https://github.com/SebastianWebdev/entangle-ui/pull/23) [`1e67018`](https://github.com/SebastianWebdev/entangle-ui/commit/1e6701877b283cdd954d61e726d323f98d59c56a) Thanks [@SebastianWebdev](https://github.com/SebastianWebdev)! - Replace hardcoded rgba values with theme tokens (whiteOverlay, separator shadows, thumb) and deduplicate AppShell toolbar slots. Fix SplitPane panel collapse regression where collapsed panels were clamped back to minSize.

- [#21](https://github.com/SebastianWebdev/entangle-ui/pull/21) [`df53065`](https://github.com/SebastianWebdev/entangle-ui/commit/df53065ac21a89a257ca5a66d7943c19399940a9) Thanks [@SebastianWebdev](https://github.com/SebastianWebdev)! - Optimize new components: memoize context values, wrap leaf components with React.memo, replace hardcoded z-index/spacing with theme tokens, extract constants

## 0.2.0

### Minor Changes

- [#19](https://github.com/SebastianWebdev/entangle-ui/pull/19) [`497d0f5`](https://github.com/SebastianWebdev/entangle-ui/commit/497d0f540f8abdf853cdf88aff8e944fee59d378) Thanks [@SebastianWebdev](https://github.com/SebastianWebdev)! - ### App Shell and Navigation
  - Added `topChromeSeparator` and `sideChromeSeparator` props in `AppShell` to control border/shadow separation between top and side chrome areas.
  - Refined `Tabs` visual behavior for compact editor layouts and added `pillsFrame` prop to optionally disable the pills container frame.
  - Updated closable tabs to use the library `CloseIcon` by default.

  ### Menu and Inspector Improvements
  - Added configurable menu dropdown gap via `menuOffset` in `MenuBar`.
  - Extended `PropertyPanel` with configurable `contentTopSpacing` and new `contentBottomSpacing` for better control of inspector spacing.
  - Adjusted property row padding and full-width control layout to better support dense controls (including sliders and curve editor rows).

  ### Typography
  - Bumped default UI text from 10px (`fontSize.xs`) to 12px (`fontSize.md`) across interactive components: `Menu`, `MenuBar`, `Select`, `Button`, `Input`, `NumberInput`, `TreeView`, `StatusBar`, `FloatingPanel`, and `PropertyInspector` (rows, sections, search, panel).
  - Kept 10px for true secondary text: helper text, tooltips, group labels, toast messages, axis labels.
  - `TreeView`: fixed `line-height: 1` cutting off descenders (p/q/g/y), now uses theme `lineHeight.normal`.
  - `TreeView`: simplified selected item indicator to background-only (removed left border and box-shadow on selected).
  - `FloatingPanel`: replaced hardcoded `12px` font-size with theme token.
  - Added `ContextMenu` component with submenu support, icon slots, and keyboard navigation.

  ### Layout and Rendering Fixes
  - Fixed `SplitPane` size reconciliation to avoid 1-2px layout drift caused by rounding.
  - Improved overflow behavior in shell regions (`Toolbar`, `StatusBar`, tabs panels, and side slots) to prevent content from bleeding outside container bounds.
  - Improved `CurveEditor` axis label layout and spacing when `labelX` / `labelY` are provided.

## 0.1.0

### Minor Changes

- [#17](https://github.com/SebastianWebdev/entangle-ui/pull/17) [`0854066`](https://github.com/SebastianWebdev/entangle-ui/commit/0854066dbf38c5d45bca24dc861c9eb03a1e98b3) Thanks [@SebastianWebdev](https://github.com/SebastianWebdev)! - ### New Components
  - **Checkbox & CheckboxGroup** — Controlled/uncontrolled boolean input with indeterminate state, label positioning, sizes (sm/md/lg), variants (default/filled), and array value management via CheckboxGroup
  - **Switch** — Toggle control with controlled/uncontrolled modes, label positioning, sizes, error state, and animated track/thumb
  - **Select** — Dropdown single-value selection with search/filter, grouped options, keyboard navigation, clearable option, portal-based dropdown, sizes and variants (default/ghost/filled)
  - **Tabs** — Compound component (Tabs, TabList, Tab, TabPanel) with variants (underline/pills/enclosed), vertical orientation, closable tabs, fullWidth mode, and keepMounted option
  - **Accordion** — Compound component (Accordion, AccordionItem, AccordionTrigger, AccordionContent) with single/multiple expansion, collapsible option, variants, CSS grid animation
  - **Popover** — Floating content container with focus trap, click outside/Escape handling, 12 placements, matchTriggerWidth, portal rendering, and scale+opacity animation
  - **ScrollArea** — Custom scrollbar styling with keyboard scrolling support
  - **SplitPane** — Draggable panel divider with configurable min/max sizes and collapse/expand
  - **TreeView** — Hierarchical tree with keyboard navigation, selection management, and useTreeState hook
  - **VectorInput** — Multi-value input (x/y/z/w) with linked/unlinked mode and per-component NumberInput editing
  - **ColorPicker** — Full-featured color input with ColorArea, HueSlider, AlphaSlider, ColorInputs (Hex/RGB/HSL), ColorPalette, ColorPresets (700+ colors), ColorSwatch, and EyeDropper
  - **Dialog** — Modal overlay with DialogHeader, DialogBody, DialogFooter, DialogClose, focus trap, and animations
  - **Toast** — Notification system with ToastProvider, ToastContainer, ToastItem, useToast hook, auto-dismiss, progress bar, and severity variants
  - **Collapsible** — Headless collapsible primitive for expandable content

  ### Refactoring & Improvements
  - Translated all Polish comments and JSDoc to English across the entire codebase
  - Added `forwardRef` and `displayName` to all primitive and layout components
  - Added `React.memo` to stateless presentational components (Icon, Paper, Text, Spacer, FormLabel, FormHelperText, InputWrapper)
  - Split monolithic Menu.tsx (693 lines) into modular files (types, hook, helpers, styled, component)
  - Migrated Stack, Flex, Grid, Spacer to BaseComponent pattern with `css` prop support
  - Hardened `mathExpression.ts` with blocked identifiers whitelist and 20 adversarial security tests
  - Added comprehensive keyboard navigation tests for Button, Input, NumberInput, Slider, and Menu

  ### CI/CD
  - Added GitHub Actions CI workflow (lint, build, type-check, test on PRs and main)
  - Added GitHub Actions release workflow with Changesets and npm OIDC Trusted Publishing
  - Configured Changesets for automated version management and changelog generation

## 0.1.0-alpha.0

Initial alpha release.
