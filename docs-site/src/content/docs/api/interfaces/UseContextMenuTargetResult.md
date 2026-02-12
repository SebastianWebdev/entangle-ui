---
editUrl: false
next: false
prev: false
title: "UseContextMenuTargetResult"
---

Defined in: [src/components/navigation/ContextMenu/ContextMenu.types.ts:78](https://github.com/SebastianWebdev/entangle-ui/blob/3a4ec9f4fea9c67f55f22d9132b3047d3a5027ac/src/components/navigation/ContextMenu/ContextMenu.types.ts#L78)

## Type Parameters

### TPayload

`TPayload` = `unknown`

## Properties

### context

> **context**: [`ContextMenuTargetDetails`](/api/interfaces/contextmenutargetdetails/)\<`TPayload`\>

Defined in: [src/components/navigation/ContextMenu/ContextMenu.types.ts:82](https://github.com/SebastianWebdev/entangle-ui/blob/3a4ec9f4fea9c67f55f22d9132b3047d3a5027ac/src/components/navigation/ContextMenu/ContextMenu.types.ts#L82)

Latest target context captured from right click interaction.

***

### onContextMenuCapture()

> **onContextMenuCapture**: (`event`) => `void`

Defined in: [src/components/navigation/ContextMenu/ContextMenu.types.ts:87](https://github.com/SebastianWebdev/entangle-ui/blob/3a4ec9f4fea9c67f55f22d9132b3047d3a5027ac/src/components/navigation/ContextMenu/ContextMenu.types.ts#L87)

Attach this to an element if you want to capture context manually.

#### Parameters

##### event

`MouseEvent`\<`HTMLElement`\>

#### Returns

`void`

***

### targetRef()

> **targetRef**: (`node`) => `void`

Defined in: [src/components/navigation/ContextMenu/ContextMenu.types.ts:93](https://github.com/SebastianWebdev/entangle-ui/blob/3a4ec9f4fea9c67f55f22d9132b3047d3a5027ac/src/components/navigation/ContextMenu/ContextMenu.types.ts#L93)

Callback ref that captures native right-click interactions on a node.
Useful when you want ref-based wiring.

#### Parameters

##### node

`HTMLElement` | `null`

#### Returns

`void`
