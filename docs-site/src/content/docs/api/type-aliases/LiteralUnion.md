---
editUrl: false
next: false
prev: false
title: "LiteralUnion"
---

> **LiteralUnion**\<`T`, `U`\> = `T` \| `U` & `Record`\<`never`, `never`\>

Defined in: [src/types/utilities.ts:19](https://github.com/SebastianWebdev/entangle-ui/blob/3a4ec9f4fea9c67f55f22d9132b3047d3a5027ac/src/types/utilities.ts#L19)

Allows autocomplete for union values while still accepting any string

## Type Parameters

### T

`T` *extends* `U`

### U

`U` = `string`

## Example

```ts
type Colors = LiteralUnion<'red' | 'blue' | 'green', string>
// Shows autocomplete for 'red', 'blue', 'green' but accepts any string
```
