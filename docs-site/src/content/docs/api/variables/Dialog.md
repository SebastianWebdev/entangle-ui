---
editUrl: false
next: false
prev: false
title: "Dialog"
---

> `const` **Dialog**: `React.FC`\<[`DialogProps`](/api/type-aliases/dialogprops/)\>

Defined in: [src/components/feedback/Dialog/Dialog.tsx:54](https://github.com/SebastianWebdev/entangle-ui/blob/3a4ec9f4fea9c67f55f22d9132b3047d3a5027ac/src/components/feedback/Dialog/Dialog.tsx#L54)

Dialog component for modal overlays in editor interfaces.

Renders an accessible modal dialog with overlay, focus trap,
and keyboard support. Compound component pattern: use with
DialogHeader, DialogBody, DialogFooter, and DialogClose.

## Example

```tsx
<Dialog open={isOpen} onClose={() => setIsOpen(false)} title="Confirm">
  <DialogHeader>Confirm Action</DialogHeader>
  <DialogBody>Are you sure?</DialogBody>
  <DialogFooter align="right">
    <Button onClick={() => setIsOpen(false)}>Cancel</Button>
    <Button variant="filled">Confirm</Button>
  </DialogFooter>
</Dialog>
```
