---
'entangle-ui': patch
---

**G3 — `Viewport` docs lead with "2D only".** The `Viewport` JSDoc, docs page,
and skill reference now lead with the 2D-only boundary (it owns a 2D pan/zoom
transform, not a 3D camera) and point to hosting your own WebGL/WebGPU canvas
for 3D. Docs-only; no API change.
