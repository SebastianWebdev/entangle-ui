---
editUrl: false
next: false
prev: false
title: "Menu"
---

> `const` **Menu**: `React.FC`\<[`MenuProps`](/api/type-aliases/menuprops/)\>

Defined in: [src/components/navigation/Menu/Menu.tsx:52](https://github.com/SebastianWebdev/entangle-ui/blob/3a4ec9f4fea9c67f55f22d9132b3047d3a5027ac/src/components/navigation/Menu/Menu.tsx#L52)

A configuration-driven menu component for editor interfaces.

Automatically handles radio/checkbox selection states, grouping,
and nested submenus based on provided configuration object.

## Example

```tsx
const config = {
  groups: [{
    id: 'actions',
    items: [
      {
        id: 'copy',
        label: 'Copy',
        onClick: handleCopy,
        subMenu: nestedConfig,
        submenuTrigger: 'hover' // Opens on hover (default)
      },
      {
        id: 'paste',
        label: 'Paste',
        onClick: handlePaste,
        subMenu: nestedConfig,
        submenuTrigger: 'click' // Opens on click only
      }
    ],
    itemSelectionType: 'none'
  }]
};

<Menu config={config}>
  <Button>Options</Button>
</Menu>
```
