---
editUrl: false
next: false
prev: false
title: "CurveBottomBarInfo"
---

Defined in: [src/components/controls/CurveEditor/CurveEditor.types.ts:309](https://github.com/SebastianWebdev/entangle-ui/blob/3a4ec9f4fea9c67f55f22d9132b3047d3a5027ac/src/components/controls/CurveEditor/CurveEditor.types.ts#L309)

Information passed to the `renderBottomBar` render prop.

## Properties

### curve

> **curve**: [`CurveData`](/api/interfaces/curvedata/)

Defined in: [src/components/controls/CurveEditor/CurveEditor.types.ts:311](https://github.com/SebastianWebdev/entangle-ui/blob/3a4ec9f4fea9c67f55f22d9132b3047d3a5027ac/src/components/controls/CurveEditor/CurveEditor.types.ts#L311)

Current curve data

***

### disabled

> **disabled**: `boolean`

Defined in: [src/components/controls/CurveEditor/CurveEditor.types.ts:319](https://github.com/SebastianWebdev/entangle-ui/blob/3a4ec9f4fea9c67f55f22d9132b3047d3a5027ac/src/components/controls/CurveEditor/CurveEditor.types.ts#L319)

Whether the editor is disabled

***

### evaluate()

> **evaluate**: (`x`) => `number`

Defined in: [src/components/controls/CurveEditor/CurveEditor.types.ts:317](https://github.com/SebastianWebdev/entangle-ui/blob/3a4ec9f4fea9c67f55f22d9132b3047d3a5027ac/src/components/controls/CurveEditor/CurveEditor.types.ts#L317)

Evaluate the curve at a given X position

#### Parameters

##### x

`number`

#### Returns

`number`

***

### readOnly

> **readOnly**: `boolean`

Defined in: [src/components/controls/CurveEditor/CurveEditor.types.ts:321](https://github.com/SebastianWebdev/entangle-ui/blob/3a4ec9f4fea9c67f55f22d9132b3047d3a5027ac/src/components/controls/CurveEditor/CurveEditor.types.ts#L321)

Whether the editor is read-only

***

### selectedIds

> **selectedIds**: `string`[]

Defined in: [src/components/controls/CurveEditor/CurveEditor.types.ts:313](https://github.com/SebastianWebdev/entangle-ui/blob/3a4ec9f4fea9c67f55f22d9132b3047d3a5027ac/src/components/controls/CurveEditor/CurveEditor.types.ts#L313)

IDs of currently selected keyframes

***

### selectedKeyframes

> **selectedKeyframes**: [`CurveKeyframe`](/api/interfaces/curvekeyframe/)[]

Defined in: [src/components/controls/CurveEditor/CurveEditor.types.ts:315](https://github.com/SebastianWebdev/entangle-ui/blob/3a4ec9f4fea9c67f55f22d9132b3047d3a5027ac/src/components/controls/CurveEditor/CurveEditor.types.ts#L315)

The actual selected keyframe objects
