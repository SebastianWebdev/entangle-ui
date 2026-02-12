---
editUrl: false
next: false
prev: false
title: "projectToCanvas"
---

> **projectToCanvas**(`point`, `orientation`, `center`, `scale`): `object`

Defined in: [src/components/editor/ViewportGizmo/gizmoMath.ts:79](https://github.com/SebastianWebdev/entangle-ui/blob/3a4ec9f4fea9c67f55f22d9132b3047d3a5027ac/src/components/editor/ViewportGizmo/gizmoMath.ts#L79)

Project a 3D point to 2D canvas coordinates using orthographic projection.

## Parameters

### point

[`Vec3`](/api/interfaces/vec3/)

3D point to project

### orientation

[`GizmoOrientation`](/api/interfaces/gizmoorientation/)

Camera orientation

### center

Canvas center in pixels

#### x

`number`

#### y

`number`

### scale

`number`

Pixels per unit

## Returns

`object`

Projected position { x, y, depth }

### depth

> **depth**: `number`

### x

> **x**: `number`

### y

> **y**: `number`
