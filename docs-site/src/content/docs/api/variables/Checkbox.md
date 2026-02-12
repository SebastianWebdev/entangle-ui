---
editUrl: false
next: false
prev: false
title: "Checkbox"
---

> `const` **Checkbox**: `React.FC`\<[`CheckboxProps`](/api/type-aliases/checkboxprops/)\>

Defined in: [src/components/primitives/Checkbox/Checkbox.tsx:44](https://github.com/SebastianWebdev/entangle-ui/blob/3a4ec9f4fea9c67f55f22d9132b3047d3a5027ac/src/components/primitives/Checkbox/Checkbox.tsx#L44)

Checkbox component for boolean selection in settings panels,
property inspectors, and form interfaces.

Supports controlled/uncontrolled modes, indeterminate state,
label positioning, sizes, variants, and error states.

## Example

```tsx
<Checkbox label="Enable shadows" />
<Checkbox checked={value} onChange={setValue} label="Auto-save" />
<Checkbox indeterminate label="Select all" />
```
