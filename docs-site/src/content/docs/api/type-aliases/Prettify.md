---
editUrl: false
next: false
prev: false
title: "Prettify"
---

> **Prettify**\<`T`\> = `{ [K in keyof T]: T[K] }` & `object`

Defined in: [src/types/utilities.ts:9](https://github.com/SebastianWebdev/entangle-ui/blob/3a4ec9f4fea9c67f55f22d9132b3047d3a5027ac/src/types/utilities.ts#L9)

Makes complex intersection types readable by flattening them

## Type Parameters

### T

`T`

## Example

```ts
type Complex = { a: string } & { b: number } & { c: boolean }
type Pretty = Prettify<Complex> // { a: string; b: number; c: boolean }
```
