---
'entangle-ui': minor
---

### App Shell and Navigation

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
