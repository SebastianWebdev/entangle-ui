---
editUrl: false
next: false
prev: false
title: "UsePropertyUndoReturn"
---

Defined in: [src/components/editor/PropertyInspector/PropertyInspector.types.ts:290](https://github.com/SebastianWebdev/entangle-ui/blob/3a4ec9f4fea9c67f55f22d9132b3047d3a5027ac/src/components/editor/PropertyInspector/PropertyInspector.types.ts#L290)

## Type Parameters

### T

`T` = `unknown`

## Properties

### canRedo

> **canRedo**: `boolean`

Defined in: [src/components/editor/PropertyInspector/PropertyInspector.types.ts:300](https://github.com/SebastianWebdev/entangle-ui/blob/3a4ec9f4fea9c67f55f22d9132b3047d3a5027ac/src/components/editor/PropertyInspector/PropertyInspector.types.ts#L300)

Whether redo is available

***

### canUndo

> **canUndo**: `boolean`

Defined in: [src/components/editor/PropertyInspector/PropertyInspector.types.ts:298](https://github.com/SebastianWebdev/entangle-ui/blob/3a4ec9f4fea9c67f55f22d9132b3047d3a5027ac/src/components/editor/PropertyInspector/PropertyInspector.types.ts#L298)

Whether undo is available

***

### clear()

> **clear**: () => `void`

Defined in: [src/components/editor/PropertyInspector/PropertyInspector.types.ts:304](https://github.com/SebastianWebdev/entangle-ui/blob/3a4ec9f4fea9c67f55f22d9132b3047d3a5027ac/src/components/editor/PropertyInspector/PropertyInspector.types.ts#L304)

Clear all history

#### Returns

`void`

***

### history

> **history**: [`PropertyUndoEntry`](/api/interfaces/propertyundoentry/)\<`T`\>[]

Defined in: [src/components/editor/PropertyInspector/PropertyInspector.types.ts:302](https://github.com/SebastianWebdev/entangle-ui/blob/3a4ec9f4fea9c67f55f22d9132b3047d3a5027ac/src/components/editor/PropertyInspector/PropertyInspector.types.ts#L302)

Full undo history

***

### record()

> **record**: (`entry`) => `void`

Defined in: [src/components/editor/PropertyInspector/PropertyInspector.types.ts:292](https://github.com/SebastianWebdev/entangle-ui/blob/3a4ec9f4fea9c67f55f22d9132b3047d3a5027ac/src/components/editor/PropertyInspector/PropertyInspector.types.ts#L292)

Wrap a value change to record it in the undo stack

#### Parameters

##### entry

`Omit`\<[`PropertyUndoEntry`](/api/interfaces/propertyundoentry/)\<`T`\>, `"timestamp"`\>

#### Returns

`void`

***

### redo()

> **redo**: () => [`PropertyUndoEntry`](/api/interfaces/propertyundoentry/)\<`T`\> \| `null`

Defined in: [src/components/editor/PropertyInspector/PropertyInspector.types.ts:296](https://github.com/SebastianWebdev/entangle-ui/blob/3a4ec9f4fea9c67f55f22d9132b3047d3a5027ac/src/components/editor/PropertyInspector/PropertyInspector.types.ts#L296)

Redo the last undone change — returns the entry, or null

#### Returns

[`PropertyUndoEntry`](/api/interfaces/propertyundoentry/)\<`T`\> \| `null`

***

### undo()

> **undo**: () => [`PropertyUndoEntry`](/api/interfaces/propertyundoentry/)\<`T`\> \| `null`

Defined in: [src/components/editor/PropertyInspector/PropertyInspector.types.ts:294](https://github.com/SebastianWebdev/entangle-ui/blob/3a4ec9f4fea9c67f55f22d9132b3047d3a5027ac/src/components/editor/PropertyInspector/PropertyInspector.types.ts#L294)

Undo the last change — returns the entry that was undone, or null

#### Returns

[`PropertyUndoEntry`](/api/interfaces/propertyundoentry/)\<`T`\> \| `null`
