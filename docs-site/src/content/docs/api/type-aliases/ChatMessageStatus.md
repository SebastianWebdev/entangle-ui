---
editUrl: false
next: false
prev: false
title: "ChatMessageStatus"
---

> **ChatMessageStatus** = `"complete"` \| `"streaming"` \| `"error"` \| `"pending"`

Defined in: [src/components/editor/ChatPanel/ChatPanel.types.ts:25](https://github.com/SebastianWebdev/entangle-ui/blob/3a4ec9f4fea9c67f55f22d9132b3047d3a5027ac/src/components/editor/ChatPanel/ChatPanel.types.ts#L25)

Visual status of a message.
- `complete`: Fully received / sent
- `streaming`: Currently receiving tokens
- `error`: Failed to send or receive
- `pending`: Queued, not yet sent
