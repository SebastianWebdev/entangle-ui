---
editUrl: false
next: false
prev: false
title: "Popover"
---

> `const` **Popover**: `React.FC`\<[`PopoverProps`](/api/type-aliases/popoverprops/)\>

Defined in: [src/components/primitives/Popover/Popover.tsx:62](https://github.com/SebastianWebdev/entangle-ui/blob/3a4ec9f4fea9c67f55f22d9132b3047d3a5027ac/src/components/primitives/Popover/Popover.tsx#L62)

Popover component — a floating content container for interactive content
anchored to a trigger element.

Uses @floating-ui/react for robust positioning with collision detection,
flip/shift behavior, and scroll-aware auto-updating.

## Example

```tsx
<Popover>
  <PopoverTrigger>
    <Button>Open</Button>
  </PopoverTrigger>
  <PopoverContent>
    <p>Popover content</p>
  </PopoverContent>
</Popover>
```
