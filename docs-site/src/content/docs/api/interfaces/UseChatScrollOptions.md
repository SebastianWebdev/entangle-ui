---
editUrl: false
next: false
prev: false
title: "UseChatScrollOptions"
---

Defined in: [src/components/editor/ChatPanel/ChatPanel.types.ts:471](https://github.com/SebastianWebdev/entangle-ui/blob/3a4ec9f4fea9c67f55f22d9132b3047d3a5027ac/src/components/editor/ChatPanel/ChatPanel.types.ts#L471)

## Properties

### enabled?

> `optional` **enabled**: `boolean`

Defined in: [src/components/editor/ChatPanel/ChatPanel.types.ts:478](https://github.com/SebastianWebdev/entangle-ui/blob/3a4ec9f4fea9c67f55f22d9132b3047d3a5027ac/src/components/editor/ChatPanel/ChatPanel.types.ts#L478)

Enable auto-scroll to bottom on new messages.

#### Default

```ts
true
```

***

### messages

> **messages**: [`ChatMessageData`](/api/interfaces/chatmessagedata/)[]

Defined in: [src/components/editor/ChatPanel/ChatPanel.types.ts:473](https://github.com/SebastianWebdev/entangle-ui/blob/3a4ec9f4fea9c67f55f22d9132b3047d3a5027ac/src/components/editor/ChatPanel/ChatPanel.types.ts#L473)

Message array — scroll triggers when length changes

***

### threshold?

> `optional` **threshold**: `number`

Defined in: [src/components/editor/ChatPanel/ChatPanel.types.ts:483](https://github.com/SebastianWebdev/entangle-ui/blob/3a4ec9f4fea9c67f55f22d9132b3047d3a5027ac/src/components/editor/ChatPanel/ChatPanel.types.ts#L483)

Pixel threshold from the bottom to consider "at bottom".

#### Default

```ts
100
```
