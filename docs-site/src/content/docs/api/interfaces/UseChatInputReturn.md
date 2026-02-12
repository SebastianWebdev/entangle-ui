---
editUrl: false
next: false
prev: false
title: "UseChatInputReturn"
---

Defined in: [src/components/editor/ChatPanel/ChatPanel.types.ts:456](https://github.com/SebastianWebdev/entangle-ui/blob/3a4ec9f4fea9c67f55f22d9132b3047d3a5027ac/src/components/editor/ChatPanel/ChatPanel.types.ts#L456)

## Properties

### clear()

> **clear**: () => `void`

Defined in: [src/components/editor/ChatPanel/ChatPanel.types.ts:462](https://github.com/SebastianWebdev/entangle-ui/blob/3a4ec9f4fea9c67f55f22d9132b3047d3a5027ac/src/components/editor/ChatPanel/ChatPanel.types.ts#L462)

Clear input and reset height

#### Returns

`void`

***

### handleChange()

> **handleChange**: (`event`) => `void`

Defined in: [src/components/editor/ChatPanel/ChatPanel.types.ts:468](https://github.com/SebastianWebdev/entangle-ui/blob/3a4ec9f4fea9c67f55f22d9132b3047d3a5027ac/src/components/editor/ChatPanel/ChatPanel.types.ts#L468)

Change event handler — attach to textarea's onChange

#### Parameters

##### event

`ChangeEvent`\<`HTMLTextAreaElement`\>

#### Returns

`void`

***

### handleKeyDown()

> **handleKeyDown**: (`event`) => `void`

Defined in: [src/components/editor/ChatPanel/ChatPanel.types.ts:466](https://github.com/SebastianWebdev/entangle-ui/blob/3a4ec9f4fea9c67f55f22d9132b3047d3a5027ac/src/components/editor/ChatPanel/ChatPanel.types.ts#L466)

Keyboard event handler — attach to textarea's onKeyDown

#### Parameters

##### event

`KeyboardEvent`\<`HTMLTextAreaElement`\>

#### Returns

`void`

***

### setValue()

> **setValue**: (`value`) => `void`

Defined in: [src/components/editor/ChatPanel/ChatPanel.types.ts:460](https://github.com/SebastianWebdev/entangle-ui/blob/3a4ec9f4fea9c67f55f22d9132b3047d3a5027ac/src/components/editor/ChatPanel/ChatPanel.types.ts#L460)

Update input value

#### Parameters

##### value

`string`

#### Returns

`void`

***

### textareaRef

> **textareaRef**: `RefObject`\<`HTMLTextAreaElement` \| `null`\>

Defined in: [src/components/editor/ChatPanel/ChatPanel.types.ts:464](https://github.com/SebastianWebdev/entangle-ui/blob/3a4ec9f4fea9c67f55f22d9132b3047d3a5027ac/src/components/editor/ChatPanel/ChatPanel.types.ts#L464)

Ref to attach to the textarea element

***

### value

> **value**: `string`

Defined in: [src/components/editor/ChatPanel/ChatPanel.types.ts:458](https://github.com/SebastianWebdev/entangle-ui/blob/3a4ec9f4fea9c67f55f22d9132b3047d3a5027ac/src/components/editor/ChatPanel/ChatPanel.types.ts#L458)

Current input value
