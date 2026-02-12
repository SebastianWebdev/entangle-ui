---
editUrl: false
next: false
prev: false
title: "UseChatMessagesReturn"
---

Defined in: [src/components/editor/ChatPanel/ChatPanel.types.ts:416](https://github.com/SebastianWebdev/entangle-ui/blob/3a4ec9f4fea9c67f55f22d9132b3047d3a5027ac/src/components/editor/ChatPanel/ChatPanel.types.ts#L416)

## Properties

### appendMessage()

> **appendMessage**: (`message`) => `void`

Defined in: [src/components/editor/ChatPanel/ChatPanel.types.ts:422](https://github.com/SebastianWebdev/entangle-ui/blob/3a4ec9f4fea9c67f55f22d9132b3047d3a5027ac/src/components/editor/ChatPanel/ChatPanel.types.ts#L422)

Append a new message to the end

#### Parameters

##### message

[`ChatMessageData`](/api/interfaces/chatmessagedata/)

#### Returns

`void`

***

### clearMessages()

> **clearMessages**: () => `void`

Defined in: [src/components/editor/ChatPanel/ChatPanel.types.ts:436](https://github.com/SebastianWebdev/entangle-ui/blob/3a4ec9f4fea9c67f55f22d9132b3047d3a5027ac/src/components/editor/ChatPanel/ChatPanel.types.ts#L436)

Clear all messages

#### Returns

`void`

***

### getMessage()

> **getMessage**: (`id`) => [`ChatMessageData`](/api/interfaces/chatmessagedata/) \| `undefined`

Defined in: [src/components/editor/ChatPanel/ChatPanel.types.ts:438](https://github.com/SebastianWebdev/entangle-ui/blob/3a4ec9f4fea9c67f55f22d9132b3047d3a5027ac/src/components/editor/ChatPanel/ChatPanel.types.ts#L438)

Find a message by ID

#### Parameters

##### id

`string`

#### Returns

[`ChatMessageData`](/api/interfaces/chatmessagedata/) \| `undefined`

***

### messages

> **messages**: [`ChatMessageData`](/api/interfaces/chatmessagedata/)[]

Defined in: [src/components/editor/ChatPanel/ChatPanel.types.ts:418](https://github.com/SebastianWebdev/entangle-ui/blob/3a4ec9f4fea9c67f55f22d9132b3047d3a5027ac/src/components/editor/ChatPanel/ChatPanel.types.ts#L418)

Current message array

***

### removeMessage()

> **removeMessage**: (`id`) => `void`

Defined in: [src/components/editor/ChatPanel/ChatPanel.types.ts:434](https://github.com/SebastianWebdev/entangle-ui/blob/3a4ec9f4fea9c67f55f22d9132b3047d3a5027ac/src/components/editor/ChatPanel/ChatPanel.types.ts#L434)

Remove a message by ID

#### Parameters

##### id

`string`

#### Returns

`void`

***

### setMessages

> **setMessages**: `Dispatch`\<`SetStateAction`\<[`ChatMessageData`](/api/interfaces/chatmessagedata/)[]\>\>

Defined in: [src/components/editor/ChatPanel/ChatPanel.types.ts:420](https://github.com/SebastianWebdev/entangle-ui/blob/3a4ec9f4fea9c67f55f22d9132b3047d3a5027ac/src/components/editor/ChatPanel/ChatPanel.types.ts#L420)

Replace the entire message array

***

### updateMessage()

> **updateMessage**: (`id`, `update`) => `void`

Defined in: [src/components/editor/ChatPanel/ChatPanel.types.ts:427](https://github.com/SebastianWebdev/entangle-ui/blob/3a4ec9f4fea9c67f55f22d9132b3047d3a5027ac/src/components/editor/ChatPanel/ChatPanel.types.ts#L427)

Update a message by ID.
Accepts a partial update or an updater function.

#### Parameters

##### id

`string`

##### update

`Partial`\<[`ChatMessageData`](/api/interfaces/chatmessagedata/)\> | (`prev`) => `Partial`\<[`ChatMessageData`](/api/interfaces/chatmessagedata/)\>

#### Returns

`void`
