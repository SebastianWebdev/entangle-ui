---
editUrl: false
next: false
prev: false
title: "TangentMode"
---

> **TangentMode** = `"free"` \| `"aligned"` \| `"mirrored"` \| `"auto"` \| `"linear"` \| `"step"`

Defined in: [src/components/controls/CurveEditor/CurveEditor.types.ts:20](https://github.com/SebastianWebdev/entangle-ui/blob/3a4ec9f4fea9c67f55f22d9132b3047d3a5027ac/src/components/controls/CurveEditor/CurveEditor.types.ts#L20)

Tangent handle mode — controls how handles behave around a keyframe.
- `free`: Each handle moves independently
- `aligned`: Handles stay co-linear but can differ in length
- `mirrored`: Handles are symmetric (same angle and length)
- `auto`: Smooth catmull-rom style — handles auto-computed from neighbors
- `linear`: No handles — straight line segments
- `step`: Constant value until next keyframe (hold / step function)
