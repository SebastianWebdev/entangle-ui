---
editUrl: false
next: false
prev: false
title: "useMenu"
---

> **useMenu**(`selectedItems?`, `onChange?`): `object`

Defined in: [src/components/navigation/Menu/useMenu.ts:11](https://github.com/SebastianWebdev/entangle-ui/blob/3a4ec9f4fea9c67f55f22d9132b3047d3a5027ac/src/components/navigation/Menu/useMenu.ts#L11)

Hook for managing menu selection state and interactions.
Handles radio/checkbox logic, state updates, and submenu visibility.

## Parameters

### selectedItems?

[`MenuSelection`](/api/type-aliases/menuselection/) = `{}`

### onChange?

(`selection`) => `void`

## Returns

`object`

### closeSubmenu()

> **closeSubmenu**: (`itemId`) => `void`

#### Parameters

##### itemId

`string`

#### Returns

`void`

### handleItemClick()

> **handleItemClick**: (`groupId`, `itemId`, `group`) => `void`

#### Parameters

##### groupId

`string`

##### itemId

`string`

##### group

[`MenuGroup`](/api/type-aliases/menugroup/)

#### Returns

`void`

### isItemSelected()

> **isItemSelected**: (`groupId`, `itemId`) => `boolean`

#### Parameters

##### groupId

`string`

##### itemId

`string`

#### Returns

`boolean`

### isSubmenuOpen()

> **isSubmenuOpen**: (`itemId`) => `boolean`

#### Parameters

##### itemId

`string`

#### Returns

`boolean`

### openSubmenu()

> **openSubmenu**: (`itemId`) => `void`

#### Parameters

##### itemId

`string`

#### Returns

`void`

### toggleSubmenu()

> **toggleSubmenu**: (`itemId`) => `void`

#### Parameters

##### itemId

`string`

#### Returns

`void`
