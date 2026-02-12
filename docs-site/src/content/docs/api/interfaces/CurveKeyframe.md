---
editUrl: false
next: false
prev: false
title: "CurveKeyframe"
---

Defined in: [src/components/controls/CurveEditor/CurveEditor.types.ts:31](https://github.com/SebastianWebdev/entangle-ui/blob/3a4ec9f4fea9c67f55f22d9132b3047d3a5027ac/src/components/controls/CurveEditor/CurveEditor.types.ts#L31)

Single control point (keyframe) on the curve.

## Properties

### handleIn

> **handleIn**: `object`

Defined in: [src/components/controls/CurveEditor/CurveEditor.types.ts:37](https://github.com/SebastianWebdev/entangle-ui/blob/3a4ec9f4fea9c67f55f22d9132b3047d3a5027ac/src/components/controls/CurveEditor/CurveEditor.types.ts#L37)

Left tangent handle offset (relative to keyframe position)

#### x

> **x**: `number`

#### y

> **y**: `number`

***

### handleOut

> **handleOut**: `object`

Defined in: [src/components/controls/CurveEditor/CurveEditor.types.ts:39](https://github.com/SebastianWebdev/entangle-ui/blob/3a4ec9f4fea9c67f55f22d9132b3047d3a5027ac/src/components/controls/CurveEditor/CurveEditor.types.ts#L39)

Right tangent handle offset (relative to keyframe position)

#### x

> **x**: `number`

#### y

> **y**: `number`

***

### id?

> `optional` **id**: `string`

Defined in: [src/components/controls/CurveEditor/CurveEditor.types.ts:43](https://github.com/SebastianWebdev/entangle-ui/blob/3a4ec9f4fea9c67f55f22d9132b3047d3a5027ac/src/components/controls/CurveEditor/CurveEditor.types.ts#L43)

Optional unique ID (auto-generated if not provided)

***

### tangentMode

> **tangentMode**: [`TangentMode`](/api/type-aliases/tangentmode/)

Defined in: [src/components/controls/CurveEditor/CurveEditor.types.ts:41](https://github.com/SebastianWebdev/entangle-ui/blob/3a4ec9f4fea9c67f55f22d9132b3047d3a5027ac/src/components/controls/CurveEditor/CurveEditor.types.ts#L41)

Tangent mode for this keyframe

***

### x

> **x**: `number`

Defined in: [src/components/controls/CurveEditor/CurveEditor.types.ts:33](https://github.com/SebastianWebdev/entangle-ui/blob/3a4ec9f4fea9c67f55f22d9132b3047d3a5027ac/src/components/controls/CurveEditor/CurveEditor.types.ts#L33)

X position in domain space (e.g., 0-1 for normalized, 0-100 for frames)

***

### y

> **y**: `number`

Defined in: [src/components/controls/CurveEditor/CurveEditor.types.ts:35](https://github.com/SebastianWebdev/entangle-ui/blob/3a4ec9f4fea9c67f55f22d9132b3047d3a5027ac/src/components/controls/CurveEditor/CurveEditor.types.ts#L35)

Y value at this position
