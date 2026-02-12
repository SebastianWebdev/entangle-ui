---
editUrl: false
next: false
prev: false
title: "ValueOf"
---

> **ValueOf**\<`T`\> = `T`\[keyof `T`\]

Defined in: [src/types/utilities.ts:36](https://github.com/SebastianWebdev/entangle-ui/blob/3a4ec9f4fea9c67f55f22d9132b3047d3a5027ac/src/types/utilities.ts#L36)

Extracts the value type from a record/object

## Type Parameters

### T

`T`

## Example

```ts
type Colors = { red: '#ff0000', blue: '#0000ff' }
type ColorValue = ValueOf<Colors> // '#ff0000' | '#0000ff'
```
