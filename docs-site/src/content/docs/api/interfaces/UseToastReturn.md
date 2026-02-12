---
editUrl: false
next: false
prev: false
title: "UseToastReturn"
---

Defined in: [src/components/feedback/Toast/Toast.types.ts:49](https://github.com/SebastianWebdev/entangle-ui/blob/3a4ec9f4fea9c67f55f22d9132b3047d3a5027ac/src/components/feedback/Toast/Toast.types.ts#L49)

## Properties

### dismiss()

> **dismiss**: (`id`) => `void`

Defined in: [src/components/feedback/Toast/Toast.types.ts:55](https://github.com/SebastianWebdev/entangle-ui/blob/3a4ec9f4fea9c67f55f22d9132b3047d3a5027ac/src/components/feedback/Toast/Toast.types.ts#L55)

#### Parameters

##### id

`string`

#### Returns

`void`

***

### dismissAll()

> **dismissAll**: () => `void`

Defined in: [src/components/feedback/Toast/Toast.types.ts:56](https://github.com/SebastianWebdev/entangle-ui/blob/3a4ec9f4fea9c67f55f22d9132b3047d3a5027ac/src/components/feedback/Toast/Toast.types.ts#L56)

#### Returns

`void`

***

### error()

> **error**: (`message`, `options?`) => `string`

Defined in: [src/components/feedback/Toast/Toast.types.ts:54](https://github.com/SebastianWebdev/entangle-ui/blob/3a4ec9f4fea9c67f55f22d9132b3047d3a5027ac/src/components/feedback/Toast/Toast.types.ts#L54)

#### Parameters

##### message

`string`

##### options?

`Partial`\<[`ToastData`](/api/interfaces/toastdata/)\>

#### Returns

`string`

***

### info()

> **info**: (`message`, `options?`) => `string`

Defined in: [src/components/feedback/Toast/Toast.types.ts:51](https://github.com/SebastianWebdev/entangle-ui/blob/3a4ec9f4fea9c67f55f22d9132b3047d3a5027ac/src/components/feedback/Toast/Toast.types.ts#L51)

#### Parameters

##### message

`string`

##### options?

`Partial`\<[`ToastData`](/api/interfaces/toastdata/)\>

#### Returns

`string`

***

### success()

> **success**: (`message`, `options?`) => `string`

Defined in: [src/components/feedback/Toast/Toast.types.ts:52](https://github.com/SebastianWebdev/entangle-ui/blob/3a4ec9f4fea9c67f55f22d9132b3047d3a5027ac/src/components/feedback/Toast/Toast.types.ts#L52)

#### Parameters

##### message

`string`

##### options?

`Partial`\<[`ToastData`](/api/interfaces/toastdata/)\>

#### Returns

`string`

***

### toast()

> **toast**: (`data`) => `string`

Defined in: [src/components/feedback/Toast/Toast.types.ts:50](https://github.com/SebastianWebdev/entangle-ui/blob/3a4ec9f4fea9c67f55f22d9132b3047d3a5027ac/src/components/feedback/Toast/Toast.types.ts#L50)

#### Parameters

##### data

[`ToastData`](/api/interfaces/toastdata/)

#### Returns

`string`

***

### warning()

> **warning**: (`message`, `options?`) => `string`

Defined in: [src/components/feedback/Toast/Toast.types.ts:53](https://github.com/SebastianWebdev/entangle-ui/blob/3a4ec9f4fea9c67f55f22d9132b3047d3a5027ac/src/components/feedback/Toast/Toast.types.ts#L53)

#### Parameters

##### message

`string`

##### options?

`Partial`\<[`ToastData`](/api/interfaces/toastdata/)\>

#### Returns

`string`
