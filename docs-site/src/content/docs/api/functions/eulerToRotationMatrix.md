---
editUrl: false
next: false
prev: false
title: "eulerToRotationMatrix"
---

> **eulerToRotationMatrix**(`yaw`, `pitch`, `roll?`): \[[`Vec3`](/api/interfaces/vec3/), [`Vec3`](/api/interfaces/vec3/), [`Vec3`](/api/interfaces/vec3/)\]

Defined in: [src/components/editor/ViewportGizmo/gizmoMath.ts:33](https://github.com/SebastianWebdev/entangle-ui/blob/3a4ec9f4fea9c67f55f22d9132b3047d3a5027ac/src/components/editor/ViewportGizmo/gizmoMath.ts#L33)

Build a 3×3 rotation matrix from Euler angles (YXZ intrinsic order).
Matches Three.js default Euler order.

## Parameters

### yaw

`number`

Y-axis rotation in degrees

### pitch

`number`

X-axis rotation in degrees

### roll?

`number` = `0`

Z-axis rotation in degrees

## Returns

\[[`Vec3`](/api/interfaces/vec3/), [`Vec3`](/api/interfaces/vec3/), [`Vec3`](/api/interfaces/vec3/)\]

[right, up, forward] basis vectors (columns of rotation matrix)
