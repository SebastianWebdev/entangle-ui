---
editUrl: false
next: false
prev: false
title: "MenuItem"
---

> **MenuItem** = `object`

Defined in: [src/components/navigation/Menu/Menu.types.ts:16](https://github.com/SebastianWebdev/entangle-ui/blob/3a4ec9f4fea9c67f55f22d9132b3047d3a5027ac/src/components/navigation/Menu/Menu.types.ts#L16)

Configuration for a single menu item.

## Properties

### disabled?

> `optional` **disabled**: `boolean`

Defined in: [src/components/navigation/Menu/Menu.types.ts:26](https://github.com/SebastianWebdev/entangle-ui/blob/3a4ec9f4fea9c67f55f22d9132b3047d3a5027ac/src/components/navigation/Menu/Menu.types.ts#L26)

Whether the item is disabled

***

### icon?

> `optional` **icon**: `React.ReactNode`

Defined in: [src/components/navigation/Menu/Menu.types.ts:24](https://github.com/SebastianWebdev/entangle-ui/blob/3a4ec9f4fea9c67f55f22d9132b3047d3a5027ac/src/components/navigation/Menu/Menu.types.ts#L24)

Optional icon rendered before the label

***

### id

> **id**: `string`

Defined in: [src/components/navigation/Menu/Menu.types.ts:18](https://github.com/SebastianWebdev/entangle-ui/blob/3a4ec9f4fea9c67f55f22d9132b3047d3a5027ac/src/components/navigation/Menu/Menu.types.ts#L18)

Unique identifier for the menu item

***

### label

> **label**: `string`

Defined in: [src/components/navigation/Menu/Menu.types.ts:20](https://github.com/SebastianWebdev/entangle-ui/blob/3a4ec9f4fea9c67f55f22d9132b3047d3a5027ac/src/components/navigation/Menu/Menu.types.ts#L20)

Display text for the menu item

***

### onClick()

> **onClick**: (`id`, `event`) => `void`

Defined in: [src/components/navigation/Menu/Menu.types.ts:22](https://github.com/SebastianWebdev/entangle-ui/blob/3a4ec9f4fea9c67f55f22d9132b3047d3a5027ac/src/components/navigation/Menu/Menu.types.ts#L22)

Click handler called with item id and event

#### Parameters

##### id

`string`

##### event

`MouseEvent`

#### Returns

`void`

***

### subMenu?

> `optional` **subMenu**: [`MenuConfig`](/api/type-aliases/menuconfig/)

Defined in: [src/components/navigation/Menu/Menu.types.ts:28](https://github.com/SebastianWebdev/entangle-ui/blob/3a4ec9f4fea9c67f55f22d9132b3047d3a5027ac/src/components/navigation/Menu/Menu.types.ts#L28)

Nested submenu configuration

***

### submenuTrigger?

> `optional` **submenuTrigger**: [`SubmenuTrigger`](/api/type-aliases/submenutrigger/)

Defined in: [src/components/navigation/Menu/Menu.types.ts:30](https://github.com/SebastianWebdev/entangle-ui/blob/3a4ec9f4fea9c67f55f22d9132b3047d3a5027ac/src/components/navigation/Menu/Menu.types.ts#L30)

How submenu should be triggered when subMenu is present
