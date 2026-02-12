---
editUrl: false
next: false
prev: false
title: "ToastProvider"
---

> `const` **ToastProvider**: `React.FC`\<[`ToastProviderProps`](/api/type-aliases/toastproviderprops/)\>

Defined in: [src/components/feedback/Toast/ToastProvider.tsx:56](https://github.com/SebastianWebdev/entangle-ui/blob/3a4ec9f4fea9c67f55f22d9132b3047d3a5027ac/src/components/feedback/Toast/ToastProvider.tsx#L56)

ToastProvider manages toast notification state and renders them via portal.

Wrap your application (or a section of it) with this provider, then use
the `useToast()` hook to trigger notifications from any child component.

## Example

```tsx
<ToastProvider position="bottom-right" maxVisible={5}>
  <App />
</ToastProvider>
```
