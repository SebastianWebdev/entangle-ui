---
name: entangle-ui
description: Reference for the entangle-ui React component library (primitives, layout, controls, navigation, feedback, shell, editor components, hooks, theming). Use whenever the user is building UI with `entangle-ui`, importing from `entangle-ui`, or asking how an entangle-ui component or hook works. Each component has its own reference file in components/<category>/<name>.md — load the file matching the component(s) being used.
---

# entangle-ui

Entangle UI is a React 19 component library for professional editor interfaces (3D tools, node editors, parameter systems). It is dark-first, zero-runtime CSS via Vanilla Extract, ESM-only, and built on top of `@base-ui/react`.

## How to use this skill

1. Identify which component(s), hook(s) or guide the user is working with.
2. Read the matching reference file from this skill directory before generating code:
   - `components/<category>/<name>.md` for components
   - `hooks/<name>.md` for hooks
   - `guides/<name>.md` for theming, styling, animations, accessibility
3. Follow the project conventions in `CLAUDE.md` and `CONVENTIONS.md` (English-only text, `@/` path aliases, theme tokens via `vars.*`, no `any`).

## Quick install

```bash
npm install entangle-ui react react-dom @base-ui/react @floating-ui/react @tanstack/react-virtual @vanilla-extract/css @vanilla-extract/dynamic @vanilla-extract/recipes
```

```tsx
import 'entangle-ui/styles.css';
import { Button } from 'entangle-ui';

export function App() {
  return <Button variant="filled">Hello</Button>;
}
```

## Component index

### Primitives

- `Avatar` → [components/primitives/avatar.md](./components/primitives/avatar.md) — Identity primitive with image, initials, and icon fallback chain. AvatarGroup handles overlapping clusters with overflow.
- `Badge` → [components/primitives/badge.md](./components/primitives/badge.md) — Inline status indicator and tag primitive with subtle, solid, outline, and dot variants.
- `Button` → [components/primitives/button.md](./components/primitives/button.md) — Versatile button component for editor interfaces with multiple variants, sizes, and states.
- `Checkbox` → [components/primitives/checkbox.md](./components/primitives/checkbox.md) — Checkbox component for boolean selection with indeterminate state, labels, and group support.
- `Code` → [components/primitives/code.md](./components/primitives/code.md) — Inline code primitive backed by the theme inset background and monospace font.
- `Collapsible` → [components/primitives/collapsible.md](./components/primitives/collapsible.md) — Expandable/collapsible section component for organizing content in panels and settings interfaces.
- `HoverCard` → [components/primitives/hover-card.md](./components/primitives/hover-card.md) — Hover- and focus-driven floating panel for previews, with safe-polygon cursor handover from trigger to content.
- `Icon` → [components/primitives/icon.md](./components/primitives/icon.md) — SVG icon wrapper component with standardized sizing and color theming for editor interfaces.
- `IconButton` → [components/primitives/icon-button.md](./components/primitives/icon-button.md) — Square button component for icon-based actions in toolbars and editor interfaces.
- `Input` → [components/primitives/input.md](./components/primitives/input.md) — Versatile text input component for editor interfaces with labels, icons, error states, and multiple sizes.
- `Kbd` → [components/primitives/kbd.md](./components/primitives/kbd.md) — Keyboard shortcut keycaps with platform-aware glyph rendering.
- `Link` → [components/primitives/link.md](./components/primitives/link.md) — Styled anchor primitive with variants, external-link affordances, and polymorphic router integration.
- `Paper` → [components/primitives/paper.md](./components/primitives/paper.md) — Surface component providing elevation, nesting hierarchy, and visual depth for editor interface panels and cards.
- `Popover` → [components/primitives/popover.md](./components/primitives/popover.md) — Floating content container anchored to a trigger element with collision detection and focus management.
- `Radio` → [components/primitives/radio.md](./components/primitives/radio.md) — Radio and RadioGroup for mutually exclusive selection in forms and property panels.
- `Switch` → [components/primitives/switch.md](./components/primitives/switch.md) — Toggle switch component for boolean on/off states in editor toolbars and settings panels.
- `Text` → [components/primitives/text.md](./components/primitives/text.md) — Versatile typography component with semantic variants, flexible sizing, and text styling for editor interfaces.
- `TextArea` → [components/primitives/text-area.md](./components/primitives/text-area.md) — Multi-line text input with optional auto-resize, character count, monospace mode, and Input-parity styling.
- `Tooltip` → [components/primitives/tooltip.md](./components/primitives/tooltip.md) — Contextual information tooltip with flexible positioning, collision handling, and animation support.
- `Viewport` → [components/primitives/viewport.md](./components/primitives/viewport.md) — Pan/zoom canvas + HTML container for editor-style surfaces — node graphs, timelines, 2D world editors. Multi-layer rendering, world/screen overlays, marquee selection.
- `VisuallyHidden` → [components/primitives/visually-hidden.md](./components/primitives/visually-hidden.md) — Hide content visually while keeping it announced by screen readers.

### Layout

- `Accordion` → [components/layout/accordion.md](./components/layout/accordion.md) — Collapsible sections component using a compound pattern for property inspectors, settings panels, and grouped content.
- `Card` → [components/layout/card.md](./components/layout/card.md) — Bounded surface for a single semantic unit, with outlined, filled, and elevated variants and a compound API for header / media / body / footer.
- `Divider` → [components/layout/divider.md](./components/layout/divider.md) — Thin horizontal or vertical rule for separating content, with optional centered label.
- `Flex` → [components/layout/flex.md](./components/layout/flex.md) — Comprehensive flexbox layout component with full control over direction, alignment, wrapping, spacing, and responsive breakpoints.
- `Grid` → [components/layout/grid.md](./components/layout/grid.md) — A responsive 12-column grid system built on CSS Grid for creating structured layouts with flexible column spans.
- `ListItem` → [components/layout/list-item.md](./components/layout/list-item.md) — Reusable list row primitive with leading and trailing slots, selected/active/hover states, and built-in keyboard activation.
- `PageHeader` → [components/layout/page-header.md](./components/layout/page-header.md) — Structural page or view header with optional icon, subtitle, breadcrumbs, and right-aligned actions.
- `PanelSurface` → [components/layout/panel-surface.md](./components/layout/panel-surface.md) — Structured panel container with compound Header, Body, and Footer sub-components for editor panels and tool windows.
- `ScrollArea` → [components/layout/scroll-area.md](./components/layout/scroll-area.md) — Custom scrollable container with styled scrollbars, drag-to-scroll thumbs, fade masks, and configurable visibility behavior.
- `Spacer` → [components/layout/spacer.md](./components/layout/spacer.md) — A flexible spacer component that expands to fill available space or provides fixed spacing between elements.
- `SplitPane` → [components/layout/split-pane.md](./components/layout/split-pane.md) — Resizable split-pane layout with draggable dividers, collapsible panels, and keyboard-accessible resizing for editor interfaces.
- `Stack` → [components/layout/stack.md](./components/layout/stack.md) — Simple stacking component for arranging elements vertically or horizontally with consistent spacing.

### Controls

- `CartesianPicker` → [components/controls/cartesian-picker.md](./components/controls/cartesian-picker.md) — 2D point picker for selecting coordinates on a cartesian grid with crosshair, snap-to-grid, and custom rendering.
- `ColorPicker` → [components/controls/color-picker.md](./components/controls/color-picker.md) — Full-featured color picker with saturation/value area, hue slider, alpha channel, input modes, presets, and built-in palettes.
- `Combobox` → [components/controls/combobox.md](./components/controls/combobox.md) — Single-value select with an editable input, built-in fuzzy filtering, and optional free-solo or creatable modes.
- `CurveEditor` → [components/controls/curve-editor.md](./components/controls/curve-editor.md) — Interactive bezier curve editor for animation timing, color grading, and value remapping with keyframes, tangent modes, and presets.
- `FileTree` → [components/controls/file-tree.md](./components/controls/file-tree.md) — File-system-flavored TreeView specialization with automatic file-type icons and drag-and-drop import of OS files.
- `FileUploader` → [components/controls/file-uploader.md](./components/controls/file-uploader.md) — Drag-and-drop file uploader with type and size validation, per-row status, and an animated progress bar.
- `MultiSelect` → [components/controls/multi-select.md](./components/controls/multi-select.md) — Multi-value select that renders chosen options as inline chips, with a "+N more" overflow badge and optional search.
- `NumberInput` → [components/controls/number-input.md](./components/controls/number-input.md) — Blender-style numeric input with drag-to-scrub, step buttons, expression evaluation, and modifier key support.
- `Select` → [components/controls/select.md](./components/controls/select.md) — Dropdown select component with searchable mode, grouped options, keyboard navigation, and clearable state.
- `Slider` → [components/controls/slider.md](./components/controls/slider.md) — A professional slider component with drag interaction, keyboard navigation, and modifier key support.
- `TagInput` → [components/controls/tag-input.md](./components/controls/tag-input.md) — Multi-value text input that captures a list of strings as removable chips, with configurable commit keys and validation.
- `TreeView` → [components/controls/tree-view.md](./components/controls/tree-view.md) — Hierarchical collapsible tree for scene hierarchies, file browsers, and layer stacks with multi-selection and inline renaming.
- `VectorInput` → [components/controls/vector-input.md](./components/controls/vector-input.md) — Grouped numeric input for Vec2, Vec3, and Vec4 vectors with per-axis labels, color coding, and linked proportional editing.

### Navigation

- `Breadcrumbs` → [components/navigation/breadcrumbs.md](./components/navigation/breadcrumbs.md) — Hierarchical navigation trail for pages, editor paths, and nested resources.
- `ContextMenu` → [components/navigation/context-menu.md](./components/navigation/context-menu.md) — Composable right-click context menu. Scope menus per area, reuse the shared Menu item primitives, or drop in a fully custom panel.
- `Menu` → [components/navigation/menu.md](./components/navigation/menu.md) — Composable menu with icon/label/shortcut items, radio and checkbox selection, grouped items, nested submenus, and keyboard navigation.
- `Pagination` → [components/navigation/pagination.md](./components/navigation/pagination.md) — Page navigator with sibling/boundary ellipsis logic, controlled and uncontrolled modes, three sizes, and optional first/last jump buttons.
- `PathBar` → [components/navigation/path-bar.md](./components/navigation/path-bar.md) — File-path breadcrumbs like the VS Code editor bar — clickable segments, sibling dropdowns, and overflow collapsing.
- `SegmentedControl` → [components/navigation/segmented-control.md](./components/navigation/segmented-control.md) — Toolbar-density mutually exclusive selector for view modes, layout toggles, and other small option groups.
- `Tabs` → [components/navigation/tabs.md](./components/navigation/tabs.md) — Compound tab component for switching between views with underline, pills, and enclosed variants.

### Feedback

- `Alert` → [components/feedback/alert.md](./components/feedback/alert.md) — Persistent inline status banner with semantic variants, three appearances, optional close button, and a compound API for richer layouts.
- `CommandPalette` → [components/feedback/command-palette.md](./components/feedback/command-palette.md) — Search-driven command list shown as a centred floating dialog, with fuzzy filtering, keyboard navigation, grouping, and recent-item tracking.
- `Dialog` → [components/feedback/dialog.md](./components/feedback/dialog.md) — Accessible modal dialog with overlay, focus trap, keyboard support, and compound sub-components for headers, bodies, and footers.
- `Drawer` → [components/feedback/drawer.md](./components/feedback/drawer.md) — Anchored sliding panel for filters, navigation, or detail views. Four anchors, modal and non-modal modes, and a compound API.
- `EmptyState` → [components/feedback/empty-state.md](./components/feedback/empty-state.md) — Generic empty / loading state surface with icon, title, description, and action slots.
- `LogView` → [components/feedback/log-view.md](./components/feedback/log-view.md) — Virtualized console output panel with level coloring, filtering, text search, follow-tail auto-scroll, timestamps, and copy.
- `ProgressBar` → [components/feedback/progress-bar.md](./components/feedback/progress-bar.md) — Linear and circular progress indicators with determinate, indeterminate, striped, and labeled variants.
- `Skeleton` → [components/feedback/skeleton.md](./components/feedback/skeleton.md) — Loading-placeholder primitive with rect, circle, and line shapes plus pulse, wave, and static animations.
- `Spinner` → [components/feedback/spinner.md](./components/feedback/spinner.md) — Loading and activity indicator with ring, dots, and pulse variants. Honors prefers-reduced-motion.
- `Stat` → [components/feedback/stat.md](./components/feedback/stat.md) — KPI / metric display with label, value, optional trend delta, helper, and leading icon.
- `Toast` → [components/feedback/toast.md](./components/feedback/toast.md) — Toast notification system with severity levels, auto-dismiss, progress indicator, action buttons, and configurable positioning.

### Shell

- `AppShell` → [components/shell/app-shell.md](./components/shell/app-shell.md) — Top-level layout shell for editor applications with slots for menu bar, toolbars, dock area, and status bar.
- `FloatingPanel` → [components/shell/floating-panel.md](./components/shell/floating-panel.md) — Draggable, resizable floating panel with collapse/expand, z-index stacking, and controlled/uncontrolled modes.
- `MenuBar` → [components/shell/menu-bar.md](./components/shell/menu-bar.md) — Application menu bar with dropdown menus, sub-menus, keyboard shortcuts, and full keyboard navigation.
- `StatusBar` → [components/shell/status-bar.md](./components/shell/status-bar.md) — Application status bar with left/right sections, interactive items, badges, and color variants.
- `Toolbar` → [components/shell/toolbar.md](./components/shell/toolbar.md) — Configurable toolbar with buttons, toggles, groups, separators, and roving tabindex keyboard navigation.

### Editor

- `AssetBrowser` → [components/editor/asset-browser.md](./components/editor/asset-browser.md) — Controlled content browser for files and folders — grid/list views, thumbnails, folder navigation, search, filter, sort, selection, marquee, and drag-and-drop.
- `ChatPanel` → [components/editor/chat-panel.md](./components/editor/chat-panel.md) — Complete chat interface system for AI assistant integration with messages, input, tool calls, code blocks, and attachments.
- `Minimap` → [components/editor/minimap.md](./components/editor/minimap.md) — Shared navigation primitive that renders a miniature of editor content alongside a draggable rectangle mirroring the main viewport's visible region. Designed for NodeGraph, Timeline, and custom 2D editor surfaces.
- `NodeGraph` → [components/editor/nodegraph.md](./components/editor/nodegraph.md) — Data-driven node editor surface — ports, Bézier edges, multi-select, drag, marquee, snap-to-grid, connection validation, keyboard nav, groups, a minimap slot, a toolbar slot, a spawn palette, and an imperative camera handle. Composes the Viewport primitive.
- `PropertyInspector` → [components/editor/property-inspector.md](./components/editor/property-inspector.md) — Property inspector system with collapsible sections, label-value rows, groups, search filtering, and undo support.
- `Timeline` → [components/editor/timeline.md](./components/editor/timeline.md) — Horizontal multi-track animation timeline / dope sheet. Frame-based time axis, keyframes (shared CurveEditor model), a scrubbing playhead, zoom/pan, snap-to-frame, full keyframe editing, dope-sheet & graph modes, collapsible track groups, per-track expand-to-graph, and an optional built-in playback loop — all on a perf-isolated canvas.
- `TransformControl` → [components/editor/transform-control.md](./components/editor/transform-control.md) — The canonical position / rotation / scale property control for 3D editor interfaces. Composes VectorInput, Select and PropertyRow into one high-level component.
- `ViewportGizmo` → [components/editor/viewport-gizmo.md](./components/editor/viewport-gizmo.md) — 3D orientation gizmo for viewport navigation with orbit, snap-to-view, axis colors, and multiple interaction modes.

### components/data

- `DataTable` → [components/data/data-table.md](./components/data/data-table.md) — Data-driven table with sortable columns, row selection, sticky header, optional column resizing, and row virtualization for large datasets.

### Hooks

- `Hooks` → [hooks.md](./hooks.md) — Reusable hooks shipped alongside Entangle UI components.
- `useBreakpoint` → [hooks/use-breakpoint.md](./hooks/use-breakpoint.md) — Reactive named-breakpoint matcher for the library's responsive scale.
- `useClickOutside` → [hooks/use-click-outside.md](./hooks/use-click-outside.md) — Fire a callback when a click occurs outside a referenced element.
- `useClipboard` → [hooks/use-clipboard.md](./hooks/use-clipboard.md) — Copy text to the clipboard with a built-in timeout-driven feedback state.
- `useControlledState` → [hooks/use-controlled-state.md](./hooks/use-controlled-state.md) — Manage a value that may be either controlled by a prop or uncontrolled with an internal default.
- `useDebouncedCallback` → [hooks/use-debounced-callback.md](./hooks/use-debounced-callback.md) — Debounce a function with optional leading edge, maxWait, and cancel/flush controls.
- `useDebouncedValue` → [hooks/use-debounced-value.md](./hooks/use-debounced-value.md) — Trailing-edge debounce for a reactive value — defer expensive work until input settles.
- `useDisclosure` → [hooks/use-disclosure.md](./hooks/use-disclosure.md) — Manage an open/closed state with stable open, close, and toggle callbacks.
- `useEventCallback` → [hooks/use-event-callback.md](./hooks/use-event-callback.md) — Stable callback identity that always invokes the most recently rendered version.
- `useFocusTrap` → [hooks/use-focus-trap.md](./hooks/use-focus-trap.md) — Trap keyboard focus within a container element so Tab and Shift+Tab cycle without escaping.
- `useHotkey` → [hooks/use-hotkey.md](./hooks/use-hotkey.md) — Bind a single keyboard combo to a callback with platform-aware Cmd/Ctrl mapping.
- `useIntersectionObserver` → [hooks/use-intersection-observer.md](./hooks/use-intersection-observer.md) — Observe element visibility via IntersectionObserver with SSR-safe setup and a togglable `enabled` flag.
- `useIsMounted` → [hooks/use-is-mounted.md](./hooks/use-is-mounted.md) — Stable getter that reports whether the component is still mounted.
- `useKeyboard` → [hooks/use-keyboard.md](./hooks/use-keyboard.md) — Track the live state of modifier keys and currently pressed keys.
- `useListboxNav` → [hooks/use-listbox-nav.md](./hooks/use-listbox-nav.md) — Shared keyboard navigation for listbox-like surfaces — tracks an active index, skips disabled items, and exposes a single keydown handler.
- `useMediaQuery` → [hooks/use-media-query.md](./hooks/use-media-query.md) — Reactive `matchMedia` listener with an SSR-safe fallback.
- `useMergedRef` → [hooks/use-merged-ref.md](./hooks/use-merged-ref.md) — Merge multiple refs (object or callback) into a single callback ref.
- `useResizeObserver` → [hooks/use-resize-observer.md](./hooks/use-resize-observer.md) — Observe size changes on an element with SSR-safe setup and automatic cleanup.
- `useTheme` → [hooks/use-theme.md](./hooks/use-theme.md) — Read the current theme — resolved CSS variable values, the active variant, and helpers for canvas drawing or third-party libraries.
- `useThrottledCallback` → [hooks/use-throttled-callback.md](./hooks/use-throttled-callback.md) — Rate-limit a function so it fires at most once per delay window, with optional leading/trailing edges.

### Guides

- `Accessibility` → [guides/accessibility.md](./guides/accessibility.md) — How Entangle UI handles accessibility concerns shared by every component, including reduced-motion support, focus rings, and keyboard semantics.
- `Animations` → [guides/animations.md](./guides/animations.md) — Shared keyframes and utility classes for spinners, pulses, blinks, and fade-ins. Each utility honors prefers-reduced-motion.
- `Styling` → [guides/styling.md](./guides/styling.md) — Learn how to style Entangle UI components using Vanilla Extract and theme tokens.
- `Testing` → [guides/testing.md](./guides/testing.md) — How to test an application built with Entangle UI — Vitest + jsdom setup, loading the theme so CSS variables resolve, and stubbing the browser observers that editor components rely on.
- `Theming` → [guides/theming.md](./guides/theming.md) — Learn how to customize and extend the Entangle UI theme system — colors, spacing, typography, shadows, and more.

### Reference

- `Animation Editor` → [reference/showcase/animation-editor.md](./reference/showcase/animation-editor.md) — A timeline-driven animation editor built around the Entangle UI Timeline — multi-track dope sheet / graph editor, a live 3D-CSS cube driven by the keyframe curves, scene tree, and frame-bound inspector.
- `Docs for LLMs` → [reference/llms-txt.md](./reference/llms-txt.md) — Plain-text documentation tuned for LLM coding assistants — short index and full single-file copy of the entangle-ui docs.
- `Entangle UI` → [reference/overview.md](./reference/overview.md) — React component library for professional editor interfaces
- `Full Editor` → [reference/showcase/editor.md](./reference/showcase/editor.md) — A complete 3D editor interface built entirely with Entangle UI components.
- `Icons` → [reference/icons.md](./reference/icons.md) — Browse and use the 81 built-in SVG icons included with Entangle UI.
- `Installation` → [reference/getting-started/installation.md](./reference/getting-started/installation.md) — How to install and set up Entangle UI in your project.
- `Introduction` → [reference/getting-started/introduction.md](./reference/getting-started/introduction.md) — Entangle UI is a React component library for building professional editor interfaces — 3D tools, node editors, parameter systems, and more.
- `Quick Start` → [reference/getting-started/quick-start.md](./reference/getting-started/quick-start.md) — Get up and running with Entangle UI in under five minutes.

## Authoring rules

- Import the bundled stylesheet exactly once at the app entry: `import 'entangle-ui/styles.css'` — this registers the default dark theme on `:root`; no `<ThemeProvider>` wrapper is required for it.
- Wrap the app in `<ThemeProvider>` only when you need its runtime behaviors (keyboard context, opt-in `globalScrollbars`) or scoped theme overrides.
- Prefer the typed component props documented per file. Do not invent props.
- For custom styling, read `guides/styling.md` and `guides/theming.md` before adding new styles; theme tokens are exposed as `vars.*` from `@/theme/contract.css`.
- Components are tree-shakeable; import directly from `entangle-ui`.
