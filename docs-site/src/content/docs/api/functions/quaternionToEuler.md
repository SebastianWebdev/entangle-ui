---
editUrl: false
next: false
prev: false
title: "quaternionToEuler"
---

> **quaternionToEuler**(`qx`, `qy`, `qz`, `qw`): [`GizmoOrientation`](/api/interfaces/gizmoorientation/)

Defined in: [src/components/editor/ViewportGizmo/gizmoMath.ts:310](https://github.com/SebastianWebdev/entangle-ui/blob/3a4ec9f4fea9c67f55f22d9132b3047d3a5027ac/src/components/editor/ViewportGizmo/gizmoMath.ts#L310)

Convert quaternion [x, y, z, w] to Euler representation (YXZ order, degrees).
Utility for Three.js integration where `camera.quaternion` is available.

## Parameters

### qx

`number`

### qy

`number`

### qz

`number`

### qw

`number`

## Returns

[`GizmoOrientation`](/api/interfaces/gizmoorientation/)
