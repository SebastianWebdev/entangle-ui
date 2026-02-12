---
editUrl: false
next: false
prev: false
title: "cn"
---

> **cn**(...`classes`): `string`

Defined in: [src/utils/cx.ts:9](https://github.com/SebastianWebdev/entangle-ui/blob/3a4ec9f4fea9c67f55f22d9132b3047d3a5027ac/src/utils/cx.ts#L9)

Combines class names, filtering out falsy values.
Replaces the need for clsx/classnames — keeps it minimal.

## Parameters

### classes

...(`string` \| `false` \| `null` \| `undefined`)[]

## Returns

`string`

## Example

```ts
cx('base', isActive && 'active', className)
// -> 'base active user-class'
```
