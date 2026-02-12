---
editUrl: false
next: false
prev: false
title: "DeepReadonly"
---

> **DeepReadonly**\<`T`\> = `{ readonly [P in keyof T]: T[P] extends object ? DeepReadonly<T[P]> : T[P] }`

Defined in: [src/types/utilities.ts:76](https://github.com/SebastianWebdev/entangle-ui/blob/3a4ec9f4fea9c67f55f22d9132b3047d3a5027ac/src/types/utilities.ts#L76)

Recursive readonly type

## Type Parameters

### T

`T`
