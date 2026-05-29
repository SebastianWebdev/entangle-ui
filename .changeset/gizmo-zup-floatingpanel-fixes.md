---
'entangle-ui': patch
---

Fix ViewportGizmo z-up rendering and FloatingPanel positioning.

- **ViewportGizmo `upAxis="z-up"`** now actually renders the z-up convention
  (Blender/Unreal/CAD): the Z arm points up and Y points into the scene.
  Previously `upAxis` only affected which preset view an axis click snapped to,
  so `y-up` and `z-up` looked identical.
- **FloatingPanel** is now positioned `absolute` within its `FloatingManager`
  region instead of `fixed` to the viewport. `FloatingManager` renders a
  relative, full-size, pointer-events-pass-through container, and dragging is
  delta-based and clamped to that container. This fixes panels from multiple
  managers stacking at the same viewport coordinates and escaping their
  container.
