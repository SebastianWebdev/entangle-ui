---
'entangle-ui': minor
---

Add `Minimap` component — shared navigation widget for editor viewports (NodeGraph, Timeline, custom 2D editor surfaces).

**Core primitive (`<Minimap>`)** — fully controlled:

- Controlled API: pass `items`, `worldBounds`, current `transform`, and `viewportSize` from your `<Viewport>`; translate `onNavigate.worldPoint` into a `viewport.centerOn(...)` call.
- Item shapes: `rect`, `circle`, `line`, plus `custom` for caller-drawn shapes (each with per-item color and hover hit-testing).
- Aspect-driven sizing: explicit `width`, height auto-derived from `worldBounds` aspect ratio and clamped — wide-thin bounds give a Timeline strip, square bounds give a NodeGraph box.
- Three pointer gestures (click, drag from empty, drag the rect) + tab-focusable keyboard navigation with arrow keys (Shift × 5 step). Each gesture independently toggleable.
- Single `onNavigate` callback with phase metadata (`'click' | 'drag-start' | 'drag' | 'drag-end'`) — enough to drive undo groups, smooth-follow, or analytics without multiple handlers.
- `renderOverlay(ctx, info)` escape hatch for global canvas annotations (playheads, selection regions, debug markers) drawn after items and before the viewport-rect shroud.

**Slot subcomponents** for chrome around the canvas body:

- `<Minimap.Title>` — `'top-outside'` or `'top-inside'` placement.
- `<Minimap.Footer>` — `'bottom-outside'` or `'bottom-inside'` placement.
- `<Minimap.Corner side="…">` — anchored in any of the four corners.

Non-marker children render as a free-form absolute overlay above the canvas. All children have access to live state via `useMinimapContext()` — exposes hover world point, hovered item id, transform, drag state — enabling coordinate readouts, zoom chips, tooltips with built-in hit-testing.

**Compound `<ViewportMinimap>`** — drop-in inside a `<Viewport>`:

- Reads live `transform` / `size` from `useViewportContext()`.
- Default `onNavigate` wires to the viewport handle's `centerOn`.
- `placement` accepts four corner presets or a custom anchor object.
- `responsive` prop tracks wrapper width via `ResizeObserver`.
- Recognized by `<Viewport>` as an overlay slot — no explicit `<ViewportOverlay>` wrapper needed.

**Helpers exported**:

- `computeBoundsFromItems(items, padding?)` — tight bbox of an items array.
- `useMinimapContext()` — children of `<Minimap>` read live state without re-implementing hit-testing.

Plus a comprehensive docs page with interactive demo composing all of the above.
