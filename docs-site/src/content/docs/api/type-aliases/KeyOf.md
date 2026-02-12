---
editUrl: false
next: false
prev: false
title: "KeyOf"
---

> **KeyOf**\<`T`\> = keyof `T`

Defined in: [src/types/utilities.ts:44](https://github.com/SebastianWebdev/entangle-ui/blob/3a4ec9f4fea9c67f55f22d9132b3047d3a5027ac/src/types/utilities.ts#L44)

Creates a union from object keys

## Type Parameters

### T

`T`

## Example

```ts
type Sizes = { sm: 1, md: 2, lg: 3 }
type SizeKey = KeyOf<Sizes> // 'sm' | 'md' | 'lg'
```
