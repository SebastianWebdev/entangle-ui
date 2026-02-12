---
editUrl: false
next: false
prev: false
title: "CheckboxGroup"
---

> `const` **CheckboxGroup**: `React.FC`\<[`CheckboxGroupProps`](/api/type-aliases/checkboxgroupprops/)\>

Defined in: [src/components/primitives/Checkbox/CheckboxGroup.tsx:41](https://github.com/SebastianWebdev/entangle-ui/blob/3a4ec9f4fea9c67f55f22d9132b3047d3a5027ac/src/components/primitives/Checkbox/CheckboxGroup.tsx#L41)

Groups multiple Checkbox components with shared state management.

Manages a `string[]` value, propagates `disabled` and `size` to children
via React Context. Supports controlled and uncontrolled modes.

## Example

```tsx
<CheckboxGroup
  label="Render passes"
  value={selected}
  onChange={setSelected}
>
  <Checkbox value="diffuse" label="Diffuse" />
  <Checkbox value="specular" label="Specular" />
  <Checkbox value="shadow" label="Shadow" />
</CheckboxGroup>
```
