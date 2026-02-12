---
editUrl: false
next: false
prev: false
title: "CurveBackgroundInfo"
---

Defined in: [src/components/controls/CurveEditor/CurveEditor.types.ts:329](https://github.com/SebastianWebdev/entangle-ui/blob/3a4ec9f4fea9c67f55f22d9132b3047d3a5027ac/src/components/controls/CurveEditor/CurveEditor.types.ts#L329)

Information passed to the `renderBackground` callback.
Extends the shared CanvasBackgroundInfo — structurally identical,
with CurveViewport (which has zoom/pan) instead of CanvasViewport.

## Extends

- `CanvasBackgroundInfo`

## Properties

### domainX

> **domainX**: \[`number`, `number`\]

Defined in: [src/components/primitives/canvas/canvas.types.ts:48](https://github.com/SebastianWebdev/entangle-ui/blob/3a4ec9f4fea9c67f55f22d9132b3047d3a5027ac/src/components/primitives/canvas/canvas.types.ts#L48)

Domain X range

#### Inherited from

`CanvasBackgroundInfo.domainX`

***

### domainY

> **domainY**: \[`number`, `number`\]

Defined in: [src/components/primitives/canvas/canvas.types.ts:50](https://github.com/SebastianWebdev/entangle-ui/blob/3a4ec9f4fea9c67f55f22d9132b3047d3a5027ac/src/components/primitives/canvas/canvas.types.ts#L50)

Domain Y range

#### Inherited from

`CanvasBackgroundInfo.domainY`

***

### height

> **height**: `number`

Defined in: [src/components/primitives/canvas/canvas.types.ts:44](https://github.com/SebastianWebdev/entangle-ui/blob/3a4ec9f4fea9c67f55f22d9132b3047d3a5027ac/src/components/primitives/canvas/canvas.types.ts#L44)

Canvas height in CSS pixels

#### Inherited from

`CanvasBackgroundInfo.height`

***

### viewport

> **viewport**: `CurveViewport`

Defined in: [src/components/controls/CurveEditor/CurveEditor.types.ts:331](https://github.com/SebastianWebdev/entangle-ui/blob/3a4ec9f4fea9c67f55f22d9132b3047d3a5027ac/src/components/controls/CurveEditor/CurveEditor.types.ts#L331)

Current viewport mapping (use with `domainToCanvas`)

#### Overrides

`CanvasBackgroundInfo.viewport`

***

### width

> **width**: `number`

Defined in: [src/components/primitives/canvas/canvas.types.ts:42](https://github.com/SebastianWebdev/entangle-ui/blob/3a4ec9f4fea9c67f55f22d9132b3047d3a5027ac/src/components/primitives/canvas/canvas.types.ts#L42)

Canvas width in CSS pixels

#### Inherited from

`CanvasBackgroundInfo.width`
