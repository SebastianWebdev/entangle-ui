---
editUrl: false
next: false
prev: false
title: "projectAxes"
---

> **projectAxes**(`orientation`, `center`, `armLength`, `upAxis`): [`ProjectedArm`](/api/interfaces/projectedarm/)[]

Defined in: [src/components/editor/ViewportGizmo/gizmoMath.ts:115](https://github.com/SebastianWebdev/entangle-ui/blob/3a4ec9f4fea9c67f55f22d9132b3047d3a5027ac/src/components/editor/ViewportGizmo/gizmoMath.ts#L115)

Get all 6 axis arm endpoints projected to 2D, sorted by depth (furthest first).

## Parameters

### orientation

[`GizmoOrientation`](/api/interfaces/gizmoorientation/)

### center

#### x

`number`

#### y

`number`

### armLength

`number`

### upAxis

[`GizmoUpAxis`](/api/type-aliases/gizmoupaxis/)

## Returns

[`ProjectedArm`](/api/interfaces/projectedarm/)[]
