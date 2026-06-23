---
'entangle-ui': minor
---

Add viewport / 3D icon glyphs: `OrbitIcon`, `RotateIcon`, `SpinIcon`, `CameraIcon`, `CubeIcon`, and `ZoomFitIcon`.

The icon set previously lacked rotate/orbit, camera, cube/axis, and zoom-to-fit glyphs, so editor viewports had to reuse `RefreshIcon`/`HomeIcon` for unrelated meanings. These six additions match the existing 24×24 / 2px-stroke style, are exported from the root barrel, and are tree-shakeable like every other icon. Purely additive — no existing icon changed.
