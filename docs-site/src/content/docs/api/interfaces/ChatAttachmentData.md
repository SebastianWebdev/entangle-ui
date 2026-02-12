---
editUrl: false
next: false
prev: false
title: "ChatAttachmentData"
---

Defined in: [src/components/editor/ChatPanel/ChatPanel.types.ts:39](https://github.com/SebastianWebdev/entangle-ui/blob/3a4ec9f4fea9c67f55f22d9132b3047d3a5027ac/src/components/editor/ChatPanel/ChatPanel.types.ts#L39)

File or editor context attached to a message.

## Properties

### content?

> `optional` **content**: `string`

Defined in: [src/components/editor/ChatPanel/ChatPanel.types.ts:59](https://github.com/SebastianWebdev/entangle-ui/blob/3a4ec9f4fea9c67f55f22d9132b3047d3a5027ac/src/components/editor/ChatPanel/ChatPanel.types.ts#L59)

Raw content for code/selection type

***

### id

> **id**: `string`

Defined in: [src/components/editor/ChatPanel/ChatPanel.types.ts:41](https://github.com/SebastianWebdev/entangle-ui/blob/3a4ec9f4fea9c67f55f22d9132b3047d3a5027ac/src/components/editor/ChatPanel/ChatPanel.types.ts#L41)

Unique identifier

***

### meta?

> `optional` **meta**: `Record`\<`string`, `unknown`\>

Defined in: [src/components/editor/ChatPanel/ChatPanel.types.ts:61](https://github.com/SebastianWebdev/entangle-ui/blob/3a4ec9f4fea9c67f55f22d9132b3047d3a5027ac/src/components/editor/ChatPanel/ChatPanel.types.ts#L61)

Additional metadata (consumer-defined)

***

### mimeType?

> `optional` **mimeType**: `string`

Defined in: [src/components/editor/ChatPanel/ChatPanel.types.ts:53](https://github.com/SebastianWebdev/entangle-ui/blob/3a4ec9f4fea9c67f55f22d9132b3047d3a5027ac/src/components/editor/ChatPanel/ChatPanel.types.ts#L53)

MIME type for file/image attachments

***

### name

> **name**: `string`

Defined in: [src/components/editor/ChatPanel/ChatPanel.types.ts:43](https://github.com/SebastianWebdev/entangle-ui/blob/3a4ec9f4fea9c67f55f22d9132b3047d3a5027ac/src/components/editor/ChatPanel/ChatPanel.types.ts#L43)

Display name shown in the chip

***

### size?

> `optional` **size**: `number`

Defined in: [src/components/editor/ChatPanel/ChatPanel.types.ts:55](https://github.com/SebastianWebdev/entangle-ui/blob/3a4ec9f4fea9c67f55f22d9132b3047d3a5027ac/src/components/editor/ChatPanel/ChatPanel.types.ts#L55)

File size in bytes

***

### thumbnailUrl?

> `optional` **thumbnailUrl**: `string`

Defined in: [src/components/editor/ChatPanel/ChatPanel.types.ts:57](https://github.com/SebastianWebdev/entangle-ui/blob/3a4ec9f4fea9c67f55f22d9132b3047d3a5027ac/src/components/editor/ChatPanel/ChatPanel.types.ts#L57)

Thumbnail URL for image type

***

### type

> **type**: `"file"` \| `"image"` \| `"code"` \| `"selection"`

Defined in: [src/components/editor/ChatPanel/ChatPanel.types.ts:51](https://github.com/SebastianWebdev/entangle-ui/blob/3a4ec9f4fea9c67f55f22d9132b3047d3a5027ac/src/components/editor/ChatPanel/ChatPanel.types.ts#L51)

Attachment category
- `file`: Generic file (document, config, etc.)
- `image`: Image with thumbnail preview
- `code`: Code snippet from the editor
- `selection`: Selected objects/entities from the editor scene
