---
editUrl: false
next: false
prev: false
title: "MenuGroup"
---

> **MenuGroup** = `object`

Defined in: [src/components/navigation/Menu/Menu.types.ts:45](https://github.com/SebastianWebdev/entangle-ui/blob/3a4ec9f4fea9c67f55f22d9132b3047d3a5027ac/src/components/navigation/Menu/Menu.types.ts#L45)

Configuration for a group of menu items.
Groups are visually separated and can have different selection behaviors.

## Properties

### closeOnItemClick?

> `optional` **closeOnItemClick**: `boolean`

Defined in: [src/components/navigation/Menu/Menu.types.ts:55](https://github.com/SebastianWebdev/entangle-ui/blob/3a4ec9f4fea9c67f55f22d9132b3047d3a5027ac/src/components/navigation/Menu/Menu.types.ts#L55)

Whether to close menu when any item in group is clicked

***

### id

> **id**: `string`

Defined in: [src/components/navigation/Menu/Menu.types.ts:47](https://github.com/SebastianWebdev/entangle-ui/blob/3a4ec9f4fea9c67f55f22d9132b3047d3a5027ac/src/components/navigation/Menu/Menu.types.ts#L47)

Unique identifier for the group

***

### items

> **items**: [`MenuItem`](/api/type-aliases/menuitem/)[]

Defined in: [src/components/navigation/Menu/Menu.types.ts:51](https://github.com/SebastianWebdev/entangle-ui/blob/3a4ec9f4fea9c67f55f22d9132b3047d3a5027ac/src/components/navigation/Menu/Menu.types.ts#L51)

Array of menu items in this group

***

### itemSelectionType

> **itemSelectionType**: [`ItemSelectionType`](/api/type-aliases/itemselectiontype/)

Defined in: [src/components/navigation/Menu/Menu.types.ts:53](https://github.com/SebastianWebdev/entangle-ui/blob/3a4ec9f4fea9c67f55f22d9132b3047d3a5027ac/src/components/navigation/Menu/Menu.types.ts#L53)

Selection behavior for items in this group

***

### label?

> `optional` **label**: `string`

Defined in: [src/components/navigation/Menu/Menu.types.ts:49](https://github.com/SebastianWebdev/entangle-ui/blob/3a4ec9f4fea9c67f55f22d9132b3047d3a5027ac/src/components/navigation/Menu/Menu.types.ts#L49)

Optional label displayed above the group
