---
editUrl: false
next: false
prev: false
title: "CurveData"
---

Defined in: [src/components/controls/CurveEditor/CurveEditor.types.ts:49](https://github.com/SebastianWebdev/entangle-ui/blob/3a4ec9f4fea9c67f55f22d9132b3047d3a5027ac/src/components/controls/CurveEditor/CurveEditor.types.ts#L49)

Complete curve data model.

## Properties

### domainX

> **domainX**: \[`number`, `number`\]

Defined in: [src/components/controls/CurveEditor/CurveEditor.types.ts:53](https://github.com/SebastianWebdev/entangle-ui/blob/3a4ec9f4fea9c67f55f22d9132b3047d3a5027ac/src/components/controls/CurveEditor/CurveEditor.types.ts#L53)

Domain bounds — x range

***

### domainY

> **domainY**: \[`number`, `number`\]

Defined in: [src/components/controls/CurveEditor/CurveEditor.types.ts:55](https://github.com/SebastianWebdev/entangle-ui/blob/3a4ec9f4fea9c67f55f22d9132b3047d3a5027ac/src/components/controls/CurveEditor/CurveEditor.types.ts#L55)

Domain bounds — y range

***

### keyframes

> **keyframes**: [`CurveKeyframe`](/api/interfaces/curvekeyframe/)[]

Defined in: [src/components/controls/CurveEditor/CurveEditor.types.ts:51](https://github.com/SebastianWebdev/entangle-ui/blob/3a4ec9f4fea9c67f55f22d9132b3047d3a5027ac/src/components/controls/CurveEditor/CurveEditor.types.ts#L51)

Ordered array of keyframes (sorted by x)

***

### postInfinity?

> `optional` **postInfinity**: `"linear"` \| `"constant"` \| `"cycle"` \| `"pingpong"`

Defined in: [src/components/controls/CurveEditor/CurveEditor.types.ts:65](https://github.com/SebastianWebdev/entangle-ui/blob/3a4ec9f4fea9c67f55f22d9132b3047d3a5027ac/src/components/controls/CurveEditor/CurveEditor.types.ts#L65)

Post-infinity behavior — what happens after the last keyframe

#### Default

```ts
"constant"
```

***

### preInfinity?

> `optional` **preInfinity**: `"linear"` \| `"constant"` \| `"cycle"` \| `"pingpong"`

Defined in: [src/components/controls/CurveEditor/CurveEditor.types.ts:60](https://github.com/SebastianWebdev/entangle-ui/blob/3a4ec9f4fea9c67f55f22d9132b3047d3a5027ac/src/components/controls/CurveEditor/CurveEditor.types.ts#L60)

Pre-infinity behavior — what happens before the first keyframe

#### Default

```ts
"constant"
```
