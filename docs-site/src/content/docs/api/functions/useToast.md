---
editUrl: false
next: false
prev: false
title: "useToast"
---

> **useToast**(): [`UseToastReturn`](/api/interfaces/usetoastreturn/)

Defined in: [src/components/feedback/Toast/useToast.ts:28](https://github.com/SebastianWebdev/entangle-ui/blob/3a4ec9f4fea9c67f55f22d9132b3047d3a5027ac/src/components/feedback/Toast/useToast.ts#L28)

Hook to trigger toast notifications from any component
inside a `<ToastProvider>`.

## Returns

[`UseToastReturn`](/api/interfaces/usetoastreturn/)

## Throws

Error if used outside of a `<ToastProvider>`

## Example

```tsx
const { toast, success, error, dismiss } = useToast();

success('File saved successfully');
error('Failed to export', { title: 'Export Error' });

const id = toast({ message: 'Custom toast', severity: 'info' });
dismiss(id);
```
