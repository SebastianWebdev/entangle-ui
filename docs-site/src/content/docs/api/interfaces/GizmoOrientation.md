---
editUrl: false
next: false
prev: false
title: "GizmoOrientation"
---

Defined in: [src/components/editor/ViewportGizmo/ViewportGizmo.types.ts:12](https://github.com/SebastianWebdev/entangle-ui/blob/3a4ec9f4fea9c67f55f22d9132b3047d3a5027ac/src/components/editor/ViewportGizmo/ViewportGizmo.types.ts#L12)

Camera/viewport orientation as Euler angles (degrees).
Convention: intrinsic YXZ (heading-pitch-roll), matching Three.js default.

## Properties

### pitch

> **pitch**: `number`

Defined in: [src/components/editor/ViewportGizmo/ViewportGizmo.types.ts:16](https://github.com/SebastianWebdev/entangle-ui/blob/3a4ec9f4fea9c67f55f22d9132b3047d3a5027ac/src/components/editor/ViewportGizmo/ViewportGizmo.types.ts#L16)

Rotation around X axis (pitch) in degrees

***

### roll?

> `optional` **roll**: `number`

Defined in: [src/components/editor/ViewportGizmo/ViewportGizmo.types.ts:18](https://github.com/SebastianWebdev/entangle-ui/blob/3a4ec9f4fea9c67f55f22d9132b3047d3a5027ac/src/components/editor/ViewportGizmo/ViewportGizmo.types.ts#L18)

Rotation around Z axis (roll) in degrees

#### Default

```ts
0
```

***

### yaw

> **yaw**: `number`

Defined in: [src/components/editor/ViewportGizmo/ViewportGizmo.types.ts:14](https://github.com/SebastianWebdev/entangle-ui/blob/3a4ec9f4fea9c67f55f22d9132b3047d3a5027ac/src/components/editor/ViewportGizmo/ViewportGizmo.types.ts#L14)

Rotation around Y axis (heading/yaw) in degrees
