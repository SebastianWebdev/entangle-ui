---
editUrl: false
next: false
prev: false
title: "StrictExclude"
---

> **StrictExclude**\<`T`, `U`\> = `Exclude`\<`T`, `U`\>

Defined in: [src/types/utilities.ts:62](https://github.com/SebastianWebdev/entangle-ui/blob/3a4ec9f4fea9c67f55f22d9132b3047d3a5027ac/src/types/utilities.ts#L62)

Strict exclude that shows what was excluded

## Type Parameters

### T

`T`

### U

`U` *extends* `T`

## Example

```ts
type Colors = 'red' | 'blue' | 'green'
type WarmColors = StrictExclude<Colors, 'blue'> // 'red' | 'green'
```
