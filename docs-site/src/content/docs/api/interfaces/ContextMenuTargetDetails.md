---
editUrl: false
next: false
prev: false
title: "ContextMenuTargetDetails"
---

Defined in: [src/components/navigation/ContextMenu/ContextMenu.types.ts:6](https://github.com/SebastianWebdev/entangle-ui/blob/3a4ec9f4fea9c67f55f22d9132b3047d3a5027ac/src/components/navigation/ContextMenu/ContextMenu.types.ts#L6)

## Type Parameters

### TPayload

`TPayload` = `unknown`

## Properties

### event

> **event**: `MouseEvent` \| `null`

Defined in: [src/components/navigation/ContextMenu/ContextMenu.types.ts:11](https://github.com/SebastianWebdev/entangle-ui/blob/3a4ec9f4fea9c67f55f22d9132b3047d3a5027ac/src/components/navigation/ContextMenu/ContextMenu.types.ts#L11)

Native browser contextmenu event from the latest trigger interaction.
Null until the first right click.

***

### payload?

> `optional` **payload**: `TPayload`

Defined in: [src/components/navigation/ContextMenu/ContextMenu.types.ts:21](https://github.com/SebastianWebdev/entangle-ui/blob/3a4ec9f4fea9c67f55f22d9132b3047d3a5027ac/src/components/navigation/ContextMenu/ContextMenu.types.ts#L21)

Optional payload associated with the trigger area.

***

### target

> **target**: `HTMLElement` \| `null`

Defined in: [src/components/navigation/ContextMenu/ContextMenu.types.ts:16](https://github.com/SebastianWebdev/entangle-ui/blob/3a4ec9f4fea9c67f55f22d9132b3047d3a5027ac/src/components/navigation/ContextMenu/ContextMenu.types.ts#L16)

Element that initiated the context menu interaction.
