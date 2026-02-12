---
editUrl: false
next: false
prev: false
title: "Brand"
---

> **Brand**\<`T`, `B`\> = `T` & `object`

Defined in: [src/types/utilities.ts:71](https://github.com/SebastianWebdev/entangle-ui/blob/3a4ec9f4fea9c67f55f22d9132b3047d3a5027ac/src/types/utilities.ts#L71)

Creates a branded type for better type safety

## Type Declaration

### \_\_brand

> **\_\_brand**: `B`

## Type Parameters

### T

`T`

### B

`B`

## Example

```ts
type UserId = Brand<string, 'UserId'>
type ProductId = Brand<string, 'ProductId'>
// UserId and ProductId are not assignable to each other
```
