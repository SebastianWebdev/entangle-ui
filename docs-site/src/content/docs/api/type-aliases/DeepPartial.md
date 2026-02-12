---
editUrl: false
next: false
prev: false
title: "DeepPartial"
---

> **DeepPartial**\<`T`\> = `{ [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P] }`

Defined in: [src/types/utilities.ts:26](https://github.com/SebastianWebdev/entangle-ui/blob/3a4ec9f4fea9c67f55f22d9132b3047d3a5027ac/src/types/utilities.ts#L26)

Makes all properties optional recursively

## Type Parameters

### T

`T`
