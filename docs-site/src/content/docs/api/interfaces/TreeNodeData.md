---
editUrl: false
next: false
prev: false
title: "TreeNodeData"
---

Defined in: [src/components/controls/TreeView/TreeView.types.ts:18](https://github.com/SebastianWebdev/entangle-ui/blob/3a4ec9f4fea9c67f55f22d9132b3047d3a5027ac/src/components/controls/TreeView/TreeView.types.ts#L18)

Generic tree node data structure.

## Properties

### children?

> `optional` **children**: `TreeNodeData`[]

Defined in: [src/components/controls/TreeView/TreeView.types.ts:26](https://github.com/SebastianWebdev/entangle-ui/blob/3a4ec9f4fea9c67f55f22d9132b3047d3a5027ac/src/components/controls/TreeView/TreeView.types.ts#L26)

Child nodes (empty array or undefined for leaf nodes)

***

### data?

> `optional` **data**: `Record`\<`string`, `unknown`\>

Defined in: [src/components/controls/TreeView/TreeView.types.ts:36](https://github.com/SebastianWebdev/entangle-ui/blob/3a4ec9f4fea9c67f55f22d9132b3047d3a5027ac/src/components/controls/TreeView/TreeView.types.ts#L36)

Additional data attached to this node

***

### disabled?

> `optional` **disabled**: `boolean`

Defined in: [src/components/controls/TreeView/TreeView.types.ts:28](https://github.com/SebastianWebdev/entangle-ui/blob/3a4ec9f4fea9c67f55f22d9132b3047d3a5027ac/src/components/controls/TreeView/TreeView.types.ts#L28)

Whether this node is disabled

***

### draggable?

> `optional` **draggable**: `boolean`

Defined in: [src/components/controls/TreeView/TreeView.types.ts:30](https://github.com/SebastianWebdev/entangle-ui/blob/3a4ec9f4fea9c67f55f22d9132b3047d3a5027ac/src/components/controls/TreeView/TreeView.types.ts#L30)

Whether this node can be dragged

***

### droppable?

> `optional` **droppable**: `boolean`

Defined in: [src/components/controls/TreeView/TreeView.types.ts:32](https://github.com/SebastianWebdev/entangle-ui/blob/3a4ec9f4fea9c67f55f22d9132b3047d3a5027ac/src/components/controls/TreeView/TreeView.types.ts#L32)

Whether this node can accept children via drag-and-drop

***

### icon?

> `optional` **icon**: `ReactNode`

Defined in: [src/components/controls/TreeView/TreeView.types.ts:24](https://github.com/SebastianWebdev/entangle-ui/blob/3a4ec9f4fea9c67f55f22d9132b3047d3a5027ac/src/components/controls/TreeView/TreeView.types.ts#L24)

Optional icon rendered before the label

***

### id

> **id**: `string`

Defined in: [src/components/controls/TreeView/TreeView.types.ts:20](https://github.com/SebastianWebdev/entangle-ui/blob/3a4ec9f4fea9c67f55f22d9132b3047d3a5027ac/src/components/controls/TreeView/TreeView.types.ts#L20)

Unique identifier for this node

***

### label

> **label**: `string`

Defined in: [src/components/controls/TreeView/TreeView.types.ts:22](https://github.com/SebastianWebdev/entangle-ui/blob/3a4ec9f4fea9c67f55f22d9132b3047d3a5027ac/src/components/controls/TreeView/TreeView.types.ts#L22)

Display label

***

### renamable?

> `optional` **renamable**: `boolean`

Defined in: [src/components/controls/TreeView/TreeView.types.ts:34](https://github.com/SebastianWebdev/entangle-ui/blob/3a4ec9f4fea9c67f55f22d9132b3047d3a5027ac/src/components/controls/TreeView/TreeView.types.ts#L34)

Whether this node can be renamed inline
