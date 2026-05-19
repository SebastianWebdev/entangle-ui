---
'entangle-ui': minor
---

Add `Viewport` primitive — pan/zoom canvas + HTML container for editor-style surfaces (node graphs, timelines, 2D world editors).

- `Viewport` with controlled/uncontrolled transform (`{ x, y, zoom }`), configurable pan (button + space-key), wheel/pinch zoom-toward-cursor, and optional marquee selection.
- `ViewportLayer` — perf-isolated canvas layers with per-layer `invalidateOn` deps and `handle.invalidate(name)`.
- `ViewportWorld` — HTML children positioned in world coordinates (follow pan/zoom).
- `ViewportOverlay` — HTML children pinned to the viewport (toolbars, minimap slot).
- `useViewportContext()` for live `transform` / `size` / `handle` access from any child.
- Imperative `ViewportHandle` — `fitToContent`, `zoomToRect`, `centerOn`, `getTransform`, `getSize`, `invalidate`.
- Pure helpers: `worldToScreen`, `screenToWorld`, `getViewportPointerPosition`, `computeFitTransform`, `computeCenterTransform`, `computeZoomTowardPivot`, `normalizeRect`.
- Pan lifecycle events (`onPanStart`, `onPanEnd` with end velocity) and zoom lifecycle events for inertia/idle recipes.
- Docs include recipes for snap-to-zoom, minimap, and inertia on top of the v1 surface.
