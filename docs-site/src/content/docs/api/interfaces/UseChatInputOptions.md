---
editUrl: false
next: false
prev: false
title: "UseChatInputOptions"
---

Defined in: [src/components/editor/ChatPanel/ChatPanel.types.ts:441](https://github.com/SebastianWebdev/entangle-ui/blob/3a4ec9f4fea9c67f55f22d9132b3047d3a5027ac/src/components/editor/ChatPanel/ChatPanel.types.ts#L441)

## Properties

### maxLines?

> `optional` **maxLines**: `number`

Defined in: [src/components/editor/ChatPanel/ChatPanel.types.ts:453](https://github.com/SebastianWebdev/entangle-ui/blob/3a4ec9f4fea9c67f55f22d9132b3047d3a5027ac/src/components/editor/ChatPanel/ChatPanel.types.ts#L453)

Maximum visible rows before scrolling.

#### Default

```ts
6
```

***

### onSubmit()?

> `optional` **onSubmit**: (`value`) => `void`

Defined in: [src/components/editor/ChatPanel/ChatPanel.types.ts:448](https://github.com/SebastianWebdev/entangle-ui/blob/3a4ec9f4fea9c67f55f22d9132b3047d3a5027ac/src/components/editor/ChatPanel/ChatPanel.types.ts#L448)

Called when submit key is pressed and input is non-empty

#### Parameters

##### value

`string`

#### Returns

`void`

***

### submitKey?

> `optional` **submitKey**: `"enter"` \| `"ctrl+enter"`

Defined in: [src/components/editor/ChatPanel/ChatPanel.types.ts:446](https://github.com/SebastianWebdev/entangle-ui/blob/3a4ec9f4fea9c67f55f22d9132b3047d3a5027ac/src/components/editor/ChatPanel/ChatPanel.types.ts#L446)

Key combo that triggers submit.

#### Default

```ts
"enter"
```
