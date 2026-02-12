---
editUrl: false
next: false
prev: false
title: "UseChatMessagesOptions"
---

Defined in: [src/components/editor/ChatPanel/ChatPanel.types.ts:405](https://github.com/SebastianWebdev/entangle-ui/blob/3a4ec9f4fea9c67f55f22d9132b3047d3a5027ac/src/components/editor/ChatPanel/ChatPanel.types.ts#L405)

## Properties

### initialMessages?

> `optional` **initialMessages**: [`ChatMessageData`](/api/interfaces/chatmessagedata/)[]

Defined in: [src/components/editor/ChatPanel/ChatPanel.types.ts:407](https://github.com/SebastianWebdev/entangle-ui/blob/3a4ec9f4fea9c67f55f22d9132b3047d3a5027ac/src/components/editor/ChatPanel/ChatPanel.types.ts#L407)

Initial messages to populate the list

***

### maxMessages?

> `optional` **maxMessages**: `number`

Defined in: [src/components/editor/ChatPanel/ChatPanel.types.ts:413](https://github.com/SebastianWebdev/entangle-ui/blob/3a4ec9f4fea9c67f55f22d9132b3047d3a5027ac/src/components/editor/ChatPanel/ChatPanel.types.ts#L413)

Maximum number of messages to keep in state.
Oldest messages are dropped when limit is exceeded.

#### Default

```ts
undefined (no limit)
```
