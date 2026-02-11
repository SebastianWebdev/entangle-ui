---
'entangle-ui': minor
---

Add shared canvas primitives layer, CartesianPicker, and ViewportGizmo components.

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
