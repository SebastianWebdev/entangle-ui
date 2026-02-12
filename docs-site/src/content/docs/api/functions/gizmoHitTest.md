---
editUrl: false
next: false
prev: false
title: "gizmoHitTest"
---

> **gizmoHitTest**(`px`, `py`, `orientation`, `center`, `armLength`, `upAxis`, `tolerancePx?`, `originRadius?`): [`GizmoHitRegion`](/api/interfaces/gizmohitregion/)

Defined in: [src/components/editor/ViewportGizmo/gizmoMath.ts:205](https://github.com/SebastianWebdev/entangle-ui/blob/3a4ec9f4fea9c67f55f22d9132b3047d3a5027ac/src/components/editor/ViewportGizmo/gizmoMath.ts#L205)

Hit test a screen position against the gizmo geometry.

## Parameters

### px

`number`

### py

`number`

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

### tolerancePx?

`number` = `12`

### originRadius?

`number` = `6`

## Returns

[`GizmoHitRegion`](/api/interfaces/gizmohitregion/)
