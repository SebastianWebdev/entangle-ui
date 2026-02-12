---
editUrl: false
next: false
prev: false
title: "ChatToolCallData"
---

Defined in: [src/components/editor/ChatPanel/ChatPanel.types.ts:69](https://github.com/SebastianWebdev/entangle-ui/blob/3a4ec9f4fea9c67f55f22d9132b3047d3a5027ac/src/components/editor/ChatPanel/ChatPanel.types.ts#L69)

Represents a single tool/function invocation within a message.

## Properties

### durationMs?

> `optional` **durationMs**: `number`

Defined in: [src/components/editor/ChatPanel/ChatPanel.types.ts:83](https://github.com/SebastianWebdev/entangle-ui/blob/3a4ec9f4fea9c67f55f22d9132b3047d3a5027ac/src/components/editor/ChatPanel/ChatPanel.types.ts#L83)

Duration of execution in milliseconds

***

### error?

> `optional` **error**: `string`

Defined in: [src/components/editor/ChatPanel/ChatPanel.types.ts:81](https://github.com/SebastianWebdev/entangle-ui/blob/3a4ec9f4fea9c67f55f22d9132b3047d3a5027ac/src/components/editor/ChatPanel/ChatPanel.types.ts#L81)

Error message if status is 'error'

***

### id

> **id**: `string`

Defined in: [src/components/editor/ChatPanel/ChatPanel.types.ts:71](https://github.com/SebastianWebdev/entangle-ui/blob/3a4ec9f4fea9c67f55f22d9132b3047d3a5027ac/src/components/editor/ChatPanel/ChatPanel.types.ts#L71)

Unique identifier

***

### input?

> `optional` **input**: `Record`\<`string`, `unknown`\>

Defined in: [src/components/editor/ChatPanel/ChatPanel.types.ts:77](https://github.com/SebastianWebdev/entangle-ui/blob/3a4ec9f4fea9c67f55f22d9132b3047d3a5027ac/src/components/editor/ChatPanel/ChatPanel.types.ts#L77)

Input parameters passed to the tool

***

### name

> **name**: `string`

Defined in: [src/components/editor/ChatPanel/ChatPanel.types.ts:73](https://github.com/SebastianWebdev/entangle-ui/blob/3a4ec9f4fea9c67f55f22d9132b3047d3a5027ac/src/components/editor/ChatPanel/ChatPanel.types.ts#L73)

Tool/function name (e.g., "create_nodes", "modify_material")

***

### output?

> `optional` **output**: `Record`\<`string`, `unknown`\>

Defined in: [src/components/editor/ChatPanel/ChatPanel.types.ts:79](https://github.com/SebastianWebdev/entangle-ui/blob/3a4ec9f4fea9c67f55f22d9132b3047d3a5027ac/src/components/editor/ChatPanel/ChatPanel.types.ts#L79)

Result returned by the tool

***

### status

> **status**: [`ChatToolCallStatus`](/api/type-aliases/chattoolcallstatus/)

Defined in: [src/components/editor/ChatPanel/ChatPanel.types.ts:75](https://github.com/SebastianWebdev/entangle-ui/blob/3a4ec9f4fea9c67f55f22d9132b3047d3a5027ac/src/components/editor/ChatPanel/ChatPanel.types.ts#L75)

Current execution status
