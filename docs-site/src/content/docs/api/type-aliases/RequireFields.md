---
editUrl: false
next: false
prev: false
title: "RequireFields"
---

> **RequireFields**\<`T`, `K`\> = [`Prettify`](/api/type-aliases/prettify/)\<`T` & `Required`\<`Pick`\<`T`, `K`\>\>\>

Defined in: [src/types/utilities.ts:52](https://github.com/SebastianWebdev/entangle-ui/blob/3a4ec9f4fea9c67f55f22d9132b3047d3a5027ac/src/types/utilities.ts#L52)

Makes specific properties required

## Type Parameters

### T

`T`

### K

`K` *extends* keyof `T`

## Example

```ts
type User = { name?: string; age?: number; email?: string }
type UserWithName = RequireFields<User, 'name'> // { name: string; age?: number; email?: string }
```
