---
editUrl: false
next: false
prev: false
title: "DialogFooter"
---

> `const` **DialogFooter**: `React.FC`\<[`DialogFooterProps`](/api/type-aliases/dialogfooterprops/)\>

Defined in: [src/components/feedback/Dialog/DialogFooter.tsx:21](https://github.com/SebastianWebdev/entangle-ui/blob/3a4ec9f4fea9c67f55f22d9132b3047d3a5027ac/src/components/feedback/Dialog/DialogFooter.tsx#L21)

DialogFooter renders the action area at the bottom of a Dialog.

## Example

```tsx
<DialogFooter align="right">
  <Button onClick={onCancel}>Cancel</Button>
  <Button variant="filled" onClick={onConfirm}>Confirm</Button>
</DialogFooter>
```
