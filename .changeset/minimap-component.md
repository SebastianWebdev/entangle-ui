---
'entangle-ui': minor
---

Add `Minimap` component — shared navigation widget for editor viewports (NodeGraph, Timeline, custom 2D editor surfaces).

- Controlled API: pass `items`, `worldBounds`, current `transform`, and `viewportSize` from your `<Viewport>`; translate `onNavigate.worldPoint` into a `viewport.centerOn(...)` call.
- Item shapes: `rect`, `circle`, `line` (discriminated union with per-item color override).
- Aspect-driven sizing: explicit `width`, height auto-derived from `worldBounds` aspect ratio and clamped to `[minHeight, maxHeight]` — wide thin bounds give a Timeline-style strip, square bounds give a NodeGraph-style box.
- Interactions: click to recenter, drag the viewport rect to pan, drag from empty area to jump-and-pan. Each gesture individually toggleable via `interactions` config; pass `false` to disable everything.
- Single `onNavigate` callback with phase metadata (`'click' | 'drag-start' | 'drag' | 'drag-end'`) — enough to drive undo groups, smooth-follow, or analytics without forcing the consumer into multiple handlers.
- Keyboard navigation: tab-focusable, arrow keys pan by 10% of the current viewport's world extent (configurable via `keyboardPanStep`); Shift × 5.
- Pure helper `computeBoundsFromItems(items, padding?)` exported for ergonomic `worldBounds` computation.
