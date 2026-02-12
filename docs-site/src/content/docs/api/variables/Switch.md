---
editUrl: false
next: false
prev: false
title: "Switch"
---

> `const` **Switch**: `React.FC`\<[`SwitchProps`](/api/type-aliases/switchprops/)\>

Defined in: [src/components/primitives/Switch/Switch.tsx:131](https://github.com/SebastianWebdev/entangle-ui/blob/3a4ec9f4fea9c67f55f22d9132b3047d3a5027ac/src/components/primitives/Switch/Switch.tsx#L131)

Switch component for boolean on/off states in editor toolbars,
settings panels, and property inspectors.

More space-efficient than Checkbox for toggle options like
"Show Grid", "Snap to Grid", "Auto-Save".

## Example

```tsx
<Switch label="Show Grid" />
<Switch checked={value} onChange={setValue} label="Auto-save" />
```
