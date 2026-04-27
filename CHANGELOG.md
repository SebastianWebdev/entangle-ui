# entangle-ui

## 0.8.0

### Minor Changes

- [#49](https://github.com/SebastianWebdev/entangle-ui/pull/49) [`0cd0997`](https://github.com/SebastianWebdev/entangle-ui/commit/0cd0997e236b822e9cd6b7d140e4285a1cbe365f) Thanks [@SebastianWebdev](https://github.com/SebastianWebdev)! - Add `Alert` component for persistent inline status banners — read-only
  notices, expired-credentials warnings, unsaved-changes banners, and similar
  in-layout messages. Five semantic variants (`info`, `success`, `warning`,
  `error`, `neutral`) drive the color and the default icon, with three visual
  treatments: `subtle` (default), `solid`, and `outline`. Provide `onClose`
  to render a dismiss button. Ships a compound API — `Alert.Title`,
  `Alert.Description`, `Alert.Actions` — also exported as standalone
  `AlertTitle`, `AlertDescription`, `AlertActions`. ARIA roles are derived
  from the variant (`alert` for error/warning, `status` for info/success,
  `region` for neutral). For transient confirmations like "File saved", reach
  for `useToast` instead.

- [#50](https://github.com/SebastianWebdev/entangle-ui/pull/50) [`cad70ba`](https://github.com/SebastianWebdev/entangle-ui/commit/cad70ba1c6cbf4137345fe473448fd80697ae744) Thanks [@SebastianWebdev](https://github.com/SebastianWebdev)! - Add `Avatar` and `AvatarGroup` primitives for rendering people, agents, and
  named entities consistently across editor UIs. `Avatar` resolves an `src`
  when one is available and falls back through initials (derived from `name`,
  or set explicitly) to a generic user glyph; the fallback is always rendered
  underneath the image so a slow load never produces a blank flash. Six sizes
  (`xs` 16px → `xxl` 56px), three shapes (`circle`, `square`, `rounded`),
  deterministic auto colour hashed from `name`, optional presence indicator
  (`online` / `away` / `busy` / `offline`), and an interactive mode (`onClick`
  makes it a focusable, Enter/Space-activatable button). `AvatarGroup`
  overlaps multiple avatars with configurable spacing and collapses overflow
  beyond `max` into a `+N` indicator with a tooltip listing the hidden names.

- [#51](https://github.com/SebastianWebdev/entangle-ui/pull/51) [`31469af`](https://github.com/SebastianWebdev/entangle-ui/commit/31469afb423b6eeb60791ab8762a0e06c7111159) Thanks [@SebastianWebdev](https://github.com/SebastianWebdev)! - Add Breadcrumbs navigation for hierarchical paths, including link/current/disabled item states, automatic or custom separators, collapsed trails with expandable ellipsis, truncation tooltips, Storybook coverage, and Starlight documentation.

- [#57](https://github.com/SebastianWebdev/entangle-ui/pull/57) [`434e750`](https://github.com/SebastianWebdev/entangle-ui/commit/434e7507c0df6c2a6f250340d0cdbd66ee0b2d3f) Thanks [@SebastianWebdev](https://github.com/SebastianWebdev)! - Promote three internal patterns into public hooks: `useFocusTrap`, `useMergedRef`, and `useResizeObserver`.
  - `useFocusTrap` was previously a private helper inside `Dialog`. It now lives in the public hooks API with the same `({ containerRef, enabled }) => onKeyDown` signature.
  - `useMergedRef` replaces inline ref-merge boilerplate in `Dialog`, `ChatMessageList`, `FloatingPanel`, and `ScrollArea`. Pass any number of object refs, callback refs, `null`, or `undefined`, and get a single callback ref that fans the node out to all of them.
  - `useResizeObserver` wraps the browser API with the conventions used elsewhere in the library: SSR-safe, stable callback identity (no re-subscription on callback change), and an `enabled` flag for toggling without unmount. `SplitPane`, `ScrollArea`, and the chat scroll hook (`useChatScroll`) now use it.

  All three hooks have full documentation pages with runnable demos.

  This is a pure extraction — no behavior changes in the affected components, all existing tests pass.

- [#57](https://github.com/SebastianWebdev/entangle-ui/pull/57) [`434e750`](https://github.com/SebastianWebdev/entangle-ui/commit/434e7507c0df6c2a6f250340d0cdbd66ee0b2d3f) Thanks [@SebastianWebdev](https://github.com/SebastianWebdev)! - Establish the public hooks library and ship the first reference hook, `useControlledState`. The hook codifies the controlled / uncontrolled state pattern that every input-like component in the library reimplements: it accepts an optional `value`, `defaultValue`, `onChange`, and a required `fallback`, and returns a `[value, setValue]` tuple just like `useState`. Switching between controlled and uncontrolled modes during a component's lifetime emits a development-only warning that mirrors React's own `<input value/defaultValue>` warning.

  Also adds a small `devWarn` / `devError` helper used internally by the library to gate developer-facing warnings to development builds. Several internal warnings that previously logged in production (Skeleton circle aspect, SegmentedControl a11y warning, NumberInput parse errors, useKeyboard fallback) are now silent in production.

  The hooks documentation site gets a new top-level "Hooks" section with a landing page and a dedicated page for `useControlledState`.

- [#59](https://github.com/SebastianWebdev/entangle-ui/pull/59) [`583f19f`](https://github.com/SebastianWebdev/entangle-ui/commit/583f19fa12aef2c861c622e008a8ceafee03e7c5) Thanks [@SebastianWebdev](https://github.com/SebastianWebdev)! - Add four net-new hooks to the public API: `useDisclosure`, `useClipboard`, `useClickOutside`, and `useHotkey`.
  - **`useDisclosure`** — manages a boolean `isOpen` state with stable `open`, `close`, `toggle`, and `setOpen` callbacks. Supports both controlled (`open` / `onOpenChange`) and uncontrolled (`defaultOpen`) modes, built on top of `useControlledState`.
  - **`useClipboard`** — copies text to the clipboard with a built-in timeout-driven `copied` feedback flag, an `error` field, and a `reset` callback. Uses `navigator.clipboard.writeText` with a `document.execCommand` fallback; never throws.
  - **`useClickOutside`** — fires a callback when a click lands outside one or more refs. Supports both single-ref and array-of-refs forms (useful for popover + trigger pairs) and is configurable to listen on `mousedown`, `click`, or `pointerdown`.
  - **`useHotkey`** — binds a single keyboard combo (e.g. `'Ctrl+S'`, `'Cmd+K'`, `'Escape'`) to a callback. `Cmd` automatically maps to `Ctrl` on non-Mac platforms. Skips firing inside editable elements by default; `enableInInputs` opts back in for global shortcuts.

  All four hooks are SSR-safe, clean up subscriptions on unmount, and use a stable handler-ref pattern so consumers do not need to memoize callbacks. Each hook ships with a dedicated page on the docs site under the Hooks section.

- [#58](https://github.com/SebastianWebdev/entangle-ui/pull/58) [`ac62afb`](https://github.com/SebastianWebdev/entangle-ui/commit/ac62afb6329ca533e0987973e0802c50229bb9c0) Thanks [@SebastianWebdev](https://github.com/SebastianWebdev)! - Add a maintained light theme preset. Ships `lightThemeValues` and a
  `createLightTheme()` helper that generates a build-time CSS class via
  Vanilla Extract. Unlike the dark theme, the light preset is not applied
  on `:root` — consumers opt in by wrapping a subtree with
  `VanillaThemeProvider` and the generated class, so the same theming
  machinery powers both whole-app light mode and scoped light surfaces
  inside a dark app (and vice versa). Structural tokens (spacing,
  typography, border-radius, transitions, z-index) are identical between
  themes so layout and rhythm don't drift when users switch modes.
  Storybook gains a global theme toggle for inspecting any story under
  either theme.

- [#55](https://github.com/SebastianWebdev/entangle-ui/pull/55) [`d01fe9e`](https://github.com/SebastianWebdev/entangle-ui/commit/d01fe9ea1b8d9d59e99ee4e639559872b2f83abe) Thanks [@SebastianWebdev](https://github.com/SebastianWebdev)! - Add `Link` styled-anchor primitive. Provides theme-aware color, underline,
  hover, and focus behavior, plus `default` / `subtle` / `inline` variants
  and `sm` / `md` / `lg` sizes. External links are auto-detected from
  `http(s)://` hrefs (or set explicitly), get an external-link icon, and
  ship `target="_blank" rel="noopener noreferrer"` along with an "(opens in
  new tab)" screen-reader announcement. Polymorphic via `as` with a typed
  generic so consumers can pass a router's link component (react-router,
  TanStack Router, Next.js) and get the router's own props (`to`, …)
  type-checked. `disabled` renders as a non-anchor span regardless of `as`,
  strips navigation handlers, and suppresses the external affordance —
  disabled router links cannot navigate via mouse, keyboard, or
  programmatic activation.

- [#52](https://github.com/SebastianWebdev/entangle-ui/pull/52) [`ce4240e`](https://github.com/SebastianWebdev/entangle-ui/commit/ce4240ede8cbabe7c4da09ad919d1e7d46408567) Thanks [@SebastianWebdev](https://github.com/SebastianWebdev)! - Add `ProgressBar` and `CircularProgress` feedback components for measurable
  operations like uploads, exports, renders, and batch jobs. Both share `value`
  / `min` / `max` semantics and four named colors (`primary`, `success`,
  `warning`, `error`) plus arbitrary CSS color pass-through. Omitting `value`
  renders an indeterminate variant — a sliding gradient on the linear bar, a
  rotating arc on the circular one — with a `prefers-reduced-motion` fallback.
  `ProgressBar` ships in three heights (`sm` 2px → `lg` 8px), supports inline /
  overlay / custom labels, and an optional striped (optionally animated)
  texture overlay; `CircularProgress` ranges from `xs` (16px) to `xl` (48px),
  auto-derives stroke thickness from size (overridable via `thickness`), and
  can render a center label for `lg`+ sizes. Both expose
  `role="progressbar"` with the appropriate `aria-value*` attributes.

- [#47](https://github.com/SebastianWebdev/entangle-ui/pull/47) [`0300928`](https://github.com/SebastianWebdev/entangle-ui/commit/0300928f4e1cce6e48dbcb15b657cbe77d6fa650) Thanks [@SebastianWebdev](https://github.com/SebastianWebdev)! - Add `Radio` and `RadioGroup` primitives. Closes the last gap in Phase 1 by providing a styled, accessible alternative to native radio inputs for mutually exclusive selection.
  - `Radio`: standalone (controlled or uncontrolled) or context-driven, with sizes (sm/md/lg), label position, helper text, and error state.
  - `RadioGroup`: manages exclusive selection, propagates `name`, `size`, `disabled`, and `error` via context, supports vertical/horizontal orientation, custom spacing, required/error states, and helper text.
  - Native `<input type="radio">` under the hood so browser arrow-key navigation and form submission work out of the box.
  - Honors `prefers-reduced-motion`.

- [#54](https://github.com/SebastianWebdev/entangle-ui/pull/54) [`7e88083`](https://github.com/SebastianWebdev/entangle-ui/commit/7e8808322ec022ba7a7290f4686c315c09103123) Thanks [@SebastianWebdev](https://github.com/SebastianWebdev)! - Add SegmentedControl, a toolbar-density mutually exclusive selector for view modes, layout toggles, and small option groups. Compound API (`SegmentedControl` + `SegmentedControlItem`) with controlled and uncontrolled modes, three visual variants (subtle / solid / outline), three sizes, horizontal and vertical orientations, optional fullWidth, icon and icon-only segments with tooltip support, an animated sliding indicator that respects `prefers-reduced-motion`, full roving-tabindex keyboard navigation (Arrow keys / Home / End), `role="group"` + `aria-pressed` accessibility, Storybook coverage, and Starlight documentation.

- [#46](https://github.com/SebastianWebdev/entangle-ui/pull/46) [`014eecc`](https://github.com/SebastianWebdev/entangle-ui/commit/014eeccc4f4d96f2d6ea39f6dcfe427acb51d62d) Thanks [@SebastianWebdev](https://github.com/SebastianWebdev)! - Add `Skeleton` and `SkeletonGroup` components for loading-placeholder
  states. Supports `rect`, `circle`, and `line` shapes with `pulse`, `wave`,
  or no animation. Animations honor `prefers-reduced-motion`. `SkeletonGroup`
  auto-generates a configurable number of skeletons with consistent spacing
  and direction, or lays out custom children.

- [#63](https://github.com/SebastianWebdev/entangle-ui/pull/63) [`f86981d`](https://github.com/SebastianWebdev/entangle-ui/commit/f86981dea383ea91027437998285001e3e535f98) Thanks [@SebastianWebdev](https://github.com/SebastianWebdev)! - Ship machine-readable token artifacts alongside the JS bundle. Each release
  now publishes `entangle-ui/tokens.json` (a loosely DTCG-aligned export of
  both themes), `entangle-ui/tokens.dark.css` (the dark `--etui-*` custom
  properties scoped to `:root`), and `entangle-ui/tokens.light.css` (the light
  preset scoped to the documented `etui-theme-light` class). Figma plugins,
  Style Dictionary pipelines, and projects that don't use Vanilla Extract can
  now consume the same values the components compile against. The tree-shaking
  guarantees of the main entry point are unchanged — these files are only
  loaded by consumers that explicitly import them.

- [#61](https://github.com/SebastianWebdev/entangle-ui/pull/61) [`fb25779`](https://github.com/SebastianWebdev/entangle-ui/commit/fb25779de140def961c0ace8fad70399e676c7b5) Thanks [@SebastianWebdev](https://github.com/SebastianWebdev)! - Add `TransformControl` — the canonical position / rotation / scale property
  control for 3D editor interfaces. Composes `VectorInput`, `Select` and
  `PropertyRow` into a single high-level component, mirroring the transform
  widget found in Blender, Unity and Unreal. Renders three rows (position,
  rotation, scale) plus a coordinate-space dropdown and a linked-scale lock
  toggle, with sensible defaults for precision (`3 / 1 / 3`), step
  (`0.1 / 1 / 0.01`) and units (`m / ° / ''`). Three independent atoms —
  `value`, `coordinateSpace`, `linkedScale` — each support controlled and
  uncontrolled usage. `linkedScale` performs uniform (not proportional)
  scaling and does not snap values when toggled. Hide rows via `show`,
  swap the coordinate-space options via `coordinateSpaceOptions`, and turn
  on per-row reset buttons with `showReset`. The component intentionally
  renders no `PropertySection` wrapper — slot it inside one of your own.
  Note: changing the coordinate-space dropdown does not transform the
  numeric values; the consumer's editor logic is responsible for re-projecting
  them.

- [#53](https://github.com/SebastianWebdev/entangle-ui/pull/53) [`f6a6580`](https://github.com/SebastianWebdev/entangle-ui/commit/f6a6580344a2b591ca6549bdc46f7320793d6704) Thanks [@SebastianWebdev](https://github.com/SebastianWebdev)! - Add the Kbd primitive for consistent keyboard shortcut rendering across menus, tooltips, command palettes, and help panels. Includes platform-aware glyph utilities for macOS, Windows, and Linux shortcut labels.

- [#60](https://github.com/SebastianWebdev/entangle-ui/pull/60) [`27b61f0`](https://github.com/SebastianWebdev/entangle-ui/commit/27b61f02a69b37672cc279e67dd0481dfd717698) Thanks [@SebastianWebdev](https://github.com/SebastianWebdev)! - Add `useTheme` hook for runtime theme reads. Returns the resolved CSS
  variable snapshot from `:root`, the detected variant (`'dark'` / `'light'` /
  `'custom'`), and `getToken(path)` / `getVar(path)` helpers for paths like
  `'colors.accent.primary'`. Use it for canvas drawing, third-party libraries
  that take colours as plain strings, and conditional logic — keep using
  Vanilla Extract `vars.*` for ordinary styling. SSR-safe: returns dark-theme
  defaults when no DOM is available.

- [#56](https://github.com/SebastianWebdev/entangle-ui/pull/56) [`af3f44a`](https://github.com/SebastianWebdev/entangle-ui/commit/af3f44a17d173f192f2e376a73760c82fe6a86f5) Thanks [@SebastianWebdev](https://github.com/SebastianWebdev)! - Add `VisuallyHidden` primitive for hiding content visually while keeping
  it accessible to screen readers. Implements the canonical SR-only style
  and supports a `focusable` mode for skip-to-content links (revealed via
  `:focus-within`). Renders as `<span>` by default with `as` overrides for
  `div`, `label`, and `p`.

### Patch Changes

- [#50](https://github.com/SebastianWebdev/entangle-ui/pull/50) [`5763f0e`](https://github.com/SebastianWebdev/entangle-ui/commit/5763f0ea29a7820bee11a0c6860a3015849c83c6) Thanks [@SebastianWebdev](https://github.com/SebastianWebdev)! - Internal refactor: `ChatMessage` now renders the new `Avatar` primitive
  instead of inline JSX. The visual output (24px circle, initials fallback,
  image when available) is unchanged from a consumer's perspective, but the
  chat avatar now picks up Avatar's deterministic auto color, image-error
  fallback chain, and standard accessible-name handling for free.

- [#62](https://github.com/SebastianWebdev/entangle-ui/pull/62) [`91f2c7b`](https://github.com/SebastianWebdev/entangle-ui/commit/91f2c7b18463d684f19a4e9a25f56b8fe70fcc69) Thanks [@SebastianWebdev](https://github.com/SebastianWebdev)! - Honor `prefers-reduced-motion: reduce` across every existing component that
  animates anything. Loading spinners (Button, IconButton), Dialog overlay
  and panel fade-in/out, Toast slide-in and auto-dismiss progress bar,
  Select dropdown scale-in, Popover entry, Tooltip popup transition, Switch
  thumb travel, Checkbox check-mark draw, expand/collapse chevrons (Accordion,
  Collapsible, Select, TreeView, PropertySection, ChatPanel tool-call),
  Accordion and Collapsible content height transitions, Avatar / Slider /
  ColorPicker hover scale effects, and every `transition: all` block on
  interactive primitives now collapse to a static state under reduced
  motion. Direct-manipulation interactions (drag, scrub, gizmo rotation,
  focus rings, hover color changes) are preserved. A new
  [Accessibility](https://entangle-ui.dev/guides/accessibility) guide page
  documents the library's reduced-motion stance and shows how to follow the
  same pattern in consumer code.

- [#48](https://github.com/SebastianWebdev/entangle-ui/pull/48) [`249a2aa`](https://github.com/SebastianWebdev/entangle-ui/commit/249a2aa11801a45871dffd11286a2535e895d7f4) Thanks [@SebastianWebdev](https://github.com/SebastianWebdev)! - Add a CSS-free `entangle-ui/theme-values` export for Node, SSR, and tooling consumers that need raw theme data without importing Vanilla Extract CSS runtime files.

- [#61](https://github.com/SebastianWebdev/entangle-ui/pull/61) [`7bce1c9`](https://github.com/SebastianWebdev/entangle-ui/commit/7bce1c93a4432ddac252be65f6334211c68674b9) Thanks [@SebastianWebdev](https://github.com/SebastianWebdev)! - Fix `VectorInput` axis inputs overflowing their column in narrow layouts.
  The `NumberInput` inside each axis previously took its intrinsic content
  width, causing values to clip and visually overlap when the row was tight
  (typical inside property panels or alongside a lock toggle). The
  `NumberInput` container now fills the remaining axis space with
  `flex: 1; min-width: 0`, so axes share width evenly and shrink gracefully.

## 0.7.0

### Minor Changes

- [#44](https://github.com/SebastianWebdev/entangle-ui/pull/44) [`5529de0`](https://github.com/SebastianWebdev/entangle-ui/commit/5529de0c0eebb780e117f361997c52733ff8b66a) Thanks [@SebastianWebdev](https://github.com/SebastianWebdev)! - **v0.7.0 release — addresses the agent-ui audit findings.**

  ### New components
  - **Badge** (primitives): inline status indicator with `subtle`, `solid`, `outline`, and `dot` variants; named or raw colors; optional icon and remove button.
  - **TextArea** (primitives): multi-line input with label / helper text / auto-resize (`minRows`/`maxRows`), char counter, and monospace mode. Visual parity with `Input`.
  - **Divider** (layout): horizontal/vertical rule with `solid` / `dashed` / `dotted` variants and an optional centered label.
  - **Spinner** (feedback): `ring` / `dots` / `pulse` variants; `xs`–`lg` sizes; honors `prefers-reduced-motion`.
  - **EmptyState** (feedback): title + description + icon + action slots, `default`/`compact` variants, and a `loading` swap that renders a `Spinner`.
  - **PageHeader** (layout): semantic `<header>` with icon, title, subtitle, breadcrumbs, and right-aligned actions.
  - **Code** (primitives): small inline `<code>` primitive backed by the new `background.inset` token.
  - **ListItem** (layout): list row with leading/trailing slots, selected/active/disabled states, keyboard-activatable when `onClick` is provided.
  - **ChatMarkdownRenderer**: opt-in markdown renderer for `ChatMessage.renderContent` (bold/italic/code, lists, blockquotes, fenced code, GFM tables, safe links).

  ### Bug fixes
  - `ChatInput` now allows attachments-only submit — both controlled and uncontrolled paths check `attachments.length` in addition to the trimmed value; the send button stays enabled when attachments are queued.
  - `ChatMessageList` auto-scroll is now streaming-aware: `useChatScroll` observes the content element's height via `ResizeObserver`, so the list stays pinned to the bottom when the last message grows token-by-token.
  - `SplitPanePanel` now fills its wrapper (`width: 100%; height: 100%; minWidth: 0; minHeight: 0; box-sizing: border-box`) so nested `PanelSurface` / `ScrollArea` children with `height: 100%` lay out correctly.

  ### New props & APIs
  - `ChatMessage.maxWidth` and `ChatPanel.messageMaxWidth` — per-message and panel-level bubble width control via the new public `--etui-chat-message-max-width` CSS variable.
  - `ChatMessageList.scrollApiRef` — imperative handle exposing `scrollToBottom`, `scrollTo`, `scrollToElement`, and `isAtBottom` for driving scroll from outside (search results, "jump to top" actions, etc.).
  - `useChatScroll` now returns `scrollContentRef`, `scrollTo`, and `scrollToElement` alongside the existing API.
  - `useChatInput` accepts `attachmentsCount` for attachments-only submit support.
  - `Tabs.keepMounted` — parent-level cascade so every `TabPanel` stays mounted unless a child explicitly sets `keepMounted={false}`.

  ### New theme tokens
  - `colors.background.inset` — sunken surface for inline code, textarea backgrounds, and recessed preview areas.
  - `colors.surface.row` / `colors.surface.rowHover` — list-row backgrounds that are lighter than `surface.hover` (which is reserved for interactive controls like buttons).

  ### Developer experience
  - `ThemeProvider` now accepts `globalScrollbars` (opt-in) which toggles consistent dark-theme scrollbar styling on `document.body`.
  - Shared animation utilities (`animSpin`, `animPulse`, `animBlink`, `animFadeIn`) and keyframes (`spinKeyframe`, `pulseKeyframe`, `blinkKeyframe`, `fadeInKeyframe`) exported from the root. Each utility honors `prefers-reduced-motion`.

  No breaking changes.

## 0.6.3

### Patch Changes

- [#42](https://github.com/SebastianWebdev/entangle-ui/pull/42) [`e728388`](https://github.com/SebastianWebdev/entangle-ui/commit/e7283883d5323ff9eba8764991dd6b6af393b09a) Thanks [@SebastianWebdev](https://github.com/SebastianWebdev)! - Update README: remove alpha tag, add missing peer dependencies, export createCustomTheme from main entry point

## 0.6.2

### Patch Changes

- [#40](https://github.com/SebastianWebdev/entangle-ui/pull/40) [`e741f82`](https://github.com/SebastianWebdev/entangle-ui/commit/e741f828607ed018073d8b597b6f7695bba94ec7) Thanks [@SebastianWebdev](https://github.com/SebastianWebdev)! - Reword mathExpression JSDoc to avoid socket.dev false positive alerts

## 0.6.1

### Patch Changes

- [#38](https://github.com/SebastianWebdev/entangle-ui/pull/38) [`3a3222f`](https://github.com/SebastianWebdev/entangle-ui/commit/3a3222f6e007f8fe2d0969df17c0d7e21b67cfc4) Thanks [@SebastianWebdev](https://github.com/SebastianWebdev)! - Default NumberInput precision to 2 decimal places. Fixes floating-point artifacts (e.g. `1.0000000000000002`) when dragging to change values.

- [#38](https://github.com/SebastianWebdev/entangle-ui/pull/38) [`1b9540f`](https://github.com/SebastianWebdev/entangle-ui/commit/1b9540f5008a71c53549d6882b3e52e8c4f6bf5e) Thanks [@SebastianWebdev](https://github.com/SebastianWebdev)! - Replace eval-based math expression parser with recursive descent parser. Removes `new Function()` to eliminate Socket.dev "Uses eval" flag. Adds modulo operator, implicit multiplication, multi-arg functions (min, max, pow, clamp, lerp, smoothstep), hyperbolic trig, unit conversion (deg/rad), and context-aware comma handling.

- [#38](https://github.com/SebastianWebdev/entangle-ui/pull/38) [`536e037`](https://github.com/SebastianWebdev/entangle-ui/commit/536e037280821dc4c9e9d4833514fbd04b579675) Thanks [@SebastianWebdev](https://github.com/SebastianWebdev)! - Move @vanilla-extract/dynamic and @vanilla-extract/recipes from dependencies to peerDependencies. Mark them as external in Rollup to avoid bundling duplicate runtime code.

## 0.6.0

### Minor Changes

- [#37](https://github.com/SebastianWebdev/entangle-ui/pull/37) [`4ef7ec8`](https://github.com/SebastianWebdev/entangle-ui/commit/4ef7ec868c6887a6e23ca7ef38dcdb28a3f15d5b) Thanks [@SebastianWebdev](https://github.com/SebastianWebdev)! - Changed Input onChange from (event) to (value: string) for API consistency with all other components

### Patch Changes

- [#37](https://github.com/SebastianWebdev/entangle-ui/pull/37) [`4ef7ec8`](https://github.com/SebastianWebdev/entangle-ui/commit/4ef7ec868c6887a6e23ca7ef38dcdb28a3f15d5b) Thanks [@SebastianWebdev](https://github.com/SebastianWebdev)! - Fixed CurveEditor handle values resetting when moving keyframes. Manually adjusting a handle on an auto-tangent keyframe now promotes the tangent mode from auto to free, preventing recalculation from overwriting user changes.

- [#37](https://github.com/SebastianWebdev/entangle-ui/pull/37) [`4ef7ec8`](https://github.com/SebastianWebdev/entangle-ui/commit/4ef7ec868c6887a6e23ca7ef38dcdb28a3f15d5b) Thanks [@SebastianWebdev](https://github.com/SebastianWebdev)! - Fixed CurveEditor bezier curves producing vertical spikes and loops when control handles exceeded segment bounds. Auto-tangent handles now scale proportionally to segment length, and all handles are clamped at evaluation time as a safety net.

- [#35](https://github.com/SebastianWebdev/entangle-ui/pull/35) [`a0d9e87`](https://github.com/SebastianWebdev/entangle-ui/commit/a0d9e87729b86d6f0a495c4be6abcaaa80d8a495) Thanks [@SebastianWebdev](https://github.com/SebastianWebdev)! - Fix tree-shaking by replacing barrel imports with direct file imports and adding \*.css.js to sideEffects config.

- [#37](https://github.com/SebastianWebdev/entangle-ui/pull/37) [`4ef7ec8`](https://github.com/SebastianWebdev/entangle-ui/commit/4ef7ec868c6887a6e23ca7ef38dcdb28a3f15d5b) Thanks [@SebastianWebdev](https://github.com/SebastianWebdev)! - Hardened math expression evaluator security: expanded blocked identifiers with JS keywords, added expression length limit (200 chars), and made isExpression case-sensitive to match evaluator behavior.

## 0.5.1

### Patch Changes

- [#33](https://github.com/SebastianWebdev/entangle-ui/pull/33) [`35efe46`](https://github.com/SebastianWebdev/entangle-ui/commit/35efe463b0f1b8e4b92ccabbb792c80160eec593) Thanks [@SebastianWebdev](https://github.com/SebastianWebdev)! - Add documentation site at entangle-ui.dev, update package homepage, and update README with complete component list.

## 0.5.0

### Minor Changes

- [#30](https://github.com/SebastianWebdev/entangle-ui/pull/30) [`a471804`](https://github.com/SebastianWebdev/entangle-ui/commit/a4718046f68e41953c3efcf1987c82daf1a124ad) Thanks [@SebastianWebdev](https://github.com/SebastianWebdev)! - ### Breaking Changes
  - **Shell component props**: Removed `$` prefix from all shell component props. `$size` → `size`, `$variant` → `variant`, `$side` → `side`, `$orientation` → `orientation` across StatusBar, Toolbar, and MenuBar.
  - **BaseButton removed**: Deleted dead `BaseButton` primitive (was not exported from public API).

  ### Fixes
  - **sideEffects**: Changed `sideEffects: false` to `["*.css", "*.css.ts"]` so bundlers preserve Vanilla Extract CSS.
  - **Theme export**: Added `entangle-ui/theme` export path for `darkThemeValues` and `DarkThemeValues` type.
  - **Hardcoded 26px**: Replaced hardcoded StatusBar medium height with `vars.shell.statusBar.heightMd` theme token.
  - **Lockfile**: Regenerated `package-lock.json` to remove stale Emotion peerDeps.

  ### Performance
  - **Icons memoized**: All 63 icon components wrapped with `React.memo` and `/*#__PURE__*/` annotations for better tree-shaking and fewer re-renders.

  ### Internal
  - **Chat SVG deduplication**: Extracted shared mini-icons into `ChatIcons.tsx`, removed duplicated inline SVGs from `ChatAttachment` and `ChatContextChip`.
  - **`cn` deprecated**: `cn` utility is now a re-export alias of `cx`. Use `cx` directly.
  - **`'use client'` directives**: Added to all icon files for Next.js App Router compatibility.

### Patch Changes

- [#32](https://github.com/SebastianWebdev/entangle-ui/pull/32) [`c080cd7`](https://github.com/SebastianWebdev/entangle-ui/commit/c080cd7def25fca19061ff366ea98144fcd4b6ba) Thanks [@SebastianWebdev](https://github.com/SebastianWebdev)! - ### Internal
  - **ChatToolCall SVG deduplication**: Moved inline `WrenchIcon` and `ChevronIcon` from `ChatToolCall.tsx` to shared `ChatIcons.tsx` as `MiniWrenchIcon` and `MiniChevronIcon`.
  - **vite.config.ts cleanup**: Removed stale `build.lib` section with UMD format reference (Rollup handles the real build, Vite is only used for Storybook).

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
