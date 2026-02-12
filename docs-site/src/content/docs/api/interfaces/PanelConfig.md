---
editUrl: false
next: false
prev: false
title: "PanelConfig"
---

Defined in: [src/components/layout/SplitPane/SplitPane.types.ts:20](https://github.com/SebastianWebdev/entangle-ui/blob/3a4ec9f4fea9c67f55f22d9132b3047d3a5027ac/src/components/layout/SplitPane/SplitPane.types.ts#L20)

Configuration for a single panel.

## Properties

### collapseThreshold?

> `optional` **collapseThreshold**: `number`

Defined in: [src/components/layout/SplitPane/SplitPane.types.ts:41](https://github.com/SebastianWebdev/entangle-ui/blob/3a4ec9f4fea9c67f55f22d9132b3047d3a5027ac/src/components/layout/SplitPane/SplitPane.types.ts#L41)

Size threshold below which the panel snaps to collapsed.
Only used when collapsible is true.

#### Default

```ts
minSize / 2
```

***

### collapsible?

> `optional` **collapsible**: `boolean`

Defined in: [src/components/layout/SplitPane/SplitPane.types.ts:34](https://github.com/SebastianWebdev/entangle-ui/blob/3a4ec9f4fea9c67f55f22d9132b3047d3a5027ac/src/components/layout/SplitPane/SplitPane.types.ts#L34)

Whether this panel can collapse to zero width/height

#### Default

```ts
false
```

***

### defaultSize?

> `optional` **defaultSize**: [`PanelSize`](/api/type-aliases/panelsize/)

Defined in: [src/components/layout/SplitPane/SplitPane.types.ts:22](https://github.com/SebastianWebdev/entangle-ui/blob/3a4ec9f4fea9c67f55f22d9132b3047d3a5027ac/src/components/layout/SplitPane/SplitPane.types.ts#L22)

Initial size in pixels or CSS value (e.g. "30%")

***

### maxSize?

> `optional` **maxSize**: `number`

Defined in: [src/components/layout/SplitPane/SplitPane.types.ts:28](https://github.com/SebastianWebdev/entangle-ui/blob/3a4ec9f4fea9c67f55f22d9132b3047d3a5027ac/src/components/layout/SplitPane/SplitPane.types.ts#L28)

Maximum size in pixels

***

### minSize?

> `optional` **minSize**: `number`

Defined in: [src/components/layout/SplitPane/SplitPane.types.ts:25](https://github.com/SebastianWebdev/entangle-ui/blob/3a4ec9f4fea9c67f55f22d9132b3047d3a5027ac/src/components/layout/SplitPane/SplitPane.types.ts#L25)

Minimum size in pixels
