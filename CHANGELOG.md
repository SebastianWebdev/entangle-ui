# entangle-ui

## 0.4.0

### Minor Changes

- [#27](https://github.com/SebastianWebdev/entangle-ui/pull/27) [`2233f75`](https://github.com/SebastianWebdev/entangle-ui/commit/2233f75f7adbf07023bd5c897acc7426a7f1b041) Thanks [@SebastianWebdev](https://github.com/SebastianWebdev)! - Add ChatPanel component set for AI assistant chat interfaces.

  **New components:**
  - `ChatPanel` — top-level container with density variants (`compact` | `default` | `comfortable`)
  - `ChatMessageList` — scrollable message list with auto-scroll and sticky date headers
  - `ChatMessage` — single message row with role-based alignment, error state with red tint
  - `ChatBubble` — styled message bubble (user / assistant / system)
  - `ChatInput` — multiline input with bottom toolbar, themed scrollbar, and submit handling
  - `ChatInputToolbar` — action bar below the input (attach, context, model picker)
  - `ChatTypingIndicator` — animated dot indicator for assistant responses
  - `ChatToolCall` — expandable tool/function call display with status badge
  - `ChatCodeBlock` — syntax-highlighted code block with copy button
  - `ChatAttachmentChip` — file attachment chip with icon, name, and remove action
  - `ChatContextChip` — context reference chip (file, selection, symbol)
  - `ChatEmptyState` — placeholder shown when conversation is empty
  - `ChatActionBar` — per-message action bar (copy, retry, edit)

  **New hooks:**
  - `useChatMessages` — message list state management (add, update, remove, clear)
  - `useChatInput` — input state with submit, history navigation, and composition handling
  - `useChatScroll` — auto-scroll with scroll-to-bottom detection and manual override

  **New icons:**
  - `AiChatIcon` — chat bubble with sparkle accent
  - `AiSparklesIcon` — three 4-pointed sparkle stars (enlarged for better visibility)
  - `RobotIcon` — robot face icon

- [#25](https://github.com/SebastianWebdev/entangle-ui/pull/25) [`3b9eff2`](https://github.com/SebastianWebdev/entangle-ui/commit/3b9eff278fba77b2a945acaed2ad67855ba084bc) Thanks [@SebastianWebdev](https://github.com/SebastianWebdev)! - Migrate all components from Emotion CSS-in-JS to Vanilla Extract (zero-runtime, build-time CSS).

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

- [#29](https://github.com/SebastianWebdev/entangle-ui/pull/29) [`94eb3d0`](https://github.com/SebastianWebdev/entangle-ui/commit/94eb3d015f396151d9344fea378e0ce6dd957e23) Thanks [@SebastianWebdev](https://github.com/SebastianWebdev)! - Remove Emotion CSS-in-JS dependency entirely — all styling now uses Vanilla Extract (zero-runtime, compile-time CSS)

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

- [#28](https://github.com/SebastianWebdev/entangle-ui/pull/28) [`c0cb878`](https://github.com/SebastianWebdev/entangle-ui/commit/c0cb878f6e443e0b42e272f6ec40b23d047cbf01) Thanks [@SebastianWebdev](https://github.com/SebastianWebdev)! - Add shared canvas primitives layer, CartesianPicker, and ViewportGizmo components.

  **New components:**
  - `CartesianPicker` — A 2D point selector with canvas-based rendering, drag interaction, keyboard navigation, and full accessibility support. Supports controlled/uncontrolled modes, custom domains, grid snapping, and extensible bottom bar and background renderers.
  - `ViewportGizmo` — A 3D orientation widget (like Blender/Maya viewport cubes) with orbiting, axis snapping, preset views, keyboard navigation, and depth-sorted rendering. Supports Y-up and Z-up conventions, configurable axis colors, and multiple interaction modes.

  **New shared canvas primitives (`primitives/canvas/`):**
  - `CanvasContainer` — Responsive canvas wrapper with DPR handling, ResizeObserver support, ARIA live region, and pointer event forwarding.
  - `useCanvasSetup` — Hook for canvas DPR setup, resize tracking, and context management.
  - `useCanvasRenderer` — Hook for requestAnimationFrame-based render loops with automatic cleanup.
  - `canvasDrawing` — Pure utility functions for grid, axis labels, crosshair, point marker, origin axes, and domain bounds rendering.
  - `canvasCoords` — Coordinate conversion utilities (domain-to-canvas, canvas-to-domain).
  - `canvasTheme` — Theme resolution from CSS custom properties for canvas 2D contexts.

  **CurveEditor refactor:**
  - CurveEditor now consumes the shared canvas primitives layer with zero test regressions.

  **Next.js compatibility:**
  - Added `'use client'` directives to all components and hooks that require client-side rendering.

  **New exports:**
  - `CartesianPicker`, `CartesianPickerProps`, `CartesianBottomBarInfo`
  - `ViewportGizmo`, `ViewportGizmoProps`, `GizmoOrientation`, `GizmoPresetView`, `GizmoUpAxis`, `GizmoAxisColorPreset`, `GizmoAxisConfig`
  - `eulerToRotationMatrix`, `projectToCanvas`, `projectAxes`, `gizmoHitTest`, `presetViewToOrientation`, `quaternionToEuler`, `axisToPresetView`
  - `CanvasContainer`, `CanvasContainerProps`, `CanvasViewport`, `DomainBounds`, `Point2D`, `CanvasThemeColors`, `CanvasBackgroundInfo`
  - `domainToCanvas`, `canvasToDomain`, `resolveCanvasTheme`
  - `drawGrid`, `drawDomainBounds`, `drawAxisLabels`, `drawCrosshair`, `drawPointMarker`, `drawOriginAxes`, `formatLabel`
  - `useCanvasSetup`, `useCanvasRenderer`

### Patch Changes

- [#29](https://github.com/SebastianWebdev/entangle-ui/pull/29) [`d1ae3c8`](https://github.com/SebastianWebdev/entangle-ui/commit/d1ae3c84fce0b6e5138d57c97614d33d5f5c410d) Thanks [@SebastianWebdev](https://github.com/SebastianWebdev)! - Add 'use client' directives to all component files for Next.js App Router compatibility, upgrade Storybook from 9.0.6 to 10.2.8, use ScrollArea in ChatMessageList, and add ResizeObserver polyfill to test setup

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
