---
editUrl: false
next: false
prev: false
title: "ChatMessageData"
---

Defined in: [src/components/editor/ChatPanel/ChatPanel.types.ts:95](https://github.com/SebastianWebdev/entangle-ui/blob/3a4ec9f4fea9c67f55f22d9132b3047d3a5027ac/src/components/editor/ChatPanel/ChatPanel.types.ts#L95)

A single message in the chat conversation.

This is a data type — the component library does not manage
message creation or persistence. The consumer provides messages
as props or via the `useChatMessages` UI state hook.

## Properties

### attachments?

> `optional` **attachments**: [`ChatAttachmentData`](/api/interfaces/chatattachmentdata/)[]

Defined in: [src/components/editor/ChatPanel/ChatPanel.types.ts:107](https://github.com/SebastianWebdev/entangle-ui/blob/3a4ec9f4fea9c67f55f22d9132b3047d3a5027ac/src/components/editor/ChatPanel/ChatPanel.types.ts#L107)

Attached files or editor context

***

### avatar?

> `optional` **avatar**: `string`

Defined in: [src/components/editor/ChatPanel/ChatPanel.types.ts:111](https://github.com/SebastianWebdev/entangle-ui/blob/3a4ec9f4fea9c67f55f22d9132b3047d3a5027ac/src/components/editor/ChatPanel/ChatPanel.types.ts#L111)

Avatar URL or initials fallback

***

### content

> **content**: `string`

Defined in: [src/components/editor/ChatPanel/ChatPanel.types.ts:101](https://github.com/SebastianWebdev/entangle-ui/blob/3a4ec9f4fea9c67f55f22d9132b3047d3a5027ac/src/components/editor/ChatPanel/ChatPanel.types.ts#L101)

Text content (may contain markdown)

***

### displayName?

> `optional` **displayName**: `string`

Defined in: [src/components/editor/ChatPanel/ChatPanel.types.ts:113](https://github.com/SebastianWebdev/entangle-ui/blob/3a4ec9f4fea9c67f55f22d9132b3047d3a5027ac/src/components/editor/ChatPanel/ChatPanel.types.ts#L113)

Display name

***

### id

> **id**: `string`

Defined in: [src/components/editor/ChatPanel/ChatPanel.types.ts:97](https://github.com/SebastianWebdev/entangle-ui/blob/3a4ec9f4fea9c67f55f22d9132b3047d3a5027ac/src/components/editor/ChatPanel/ChatPanel.types.ts#L97)

Unique message identifier

***

### role

> **role**: [`ChatMessageRole`](/api/type-aliases/chatmessagerole/)

Defined in: [src/components/editor/ChatPanel/ChatPanel.types.ts:99](https://github.com/SebastianWebdev/entangle-ui/blob/3a4ec9f4fea9c67f55f22d9132b3047d3a5027ac/src/components/editor/ChatPanel/ChatPanel.types.ts#L99)

Who sent the message

***

### status

> **status**: [`ChatMessageStatus`](/api/type-aliases/chatmessagestatus/)

Defined in: [src/components/editor/ChatPanel/ChatPanel.types.ts:103](https://github.com/SebastianWebdev/entangle-ui/blob/3a4ec9f4fea9c67f55f22d9132b3047d3a5027ac/src/components/editor/ChatPanel/ChatPanel.types.ts#L103)

Visual/delivery status

***

### timestamp

> **timestamp**: `string`

Defined in: [src/components/editor/ChatPanel/ChatPanel.types.ts:105](https://github.com/SebastianWebdev/entangle-ui/blob/3a4ec9f4fea9c67f55f22d9132b3047d3a5027ac/src/components/editor/ChatPanel/ChatPanel.types.ts#L105)

ISO 8601 timestamp

***

### toolCalls?

> `optional` **toolCalls**: [`ChatToolCallData`](/api/interfaces/chattoolcalldata/)[]

Defined in: [src/components/editor/ChatPanel/ChatPanel.types.ts:109](https://github.com/SebastianWebdev/entangle-ui/blob/3a4ec9f4fea9c67f55f22d9132b3047d3a5027ac/src/components/editor/ChatPanel/ChatPanel.types.ts#L109)

Tool invocations within this message (assistant role only)
