---
editUrl: false
next: false
prev: false
title: "Input"
---

> `const` **Input**: `React.FC`\<[`InputProps`](/api/type-aliases/inputprops/)\>

Defined in: [src/components/primitives/Input/Input.tsx:182](https://github.com/SebastianWebdev/entangle-ui/blob/3a4ec9f4fea9c67f55f22d9132b3047d3a5027ac/src/components/primitives/Input/Input.tsx#L182)

A versatile input component for text entry in editor interfaces.

Provides a clean, consistent text input with support for labels, helper text,
icons, and various states. Optimized for editor UIs with compact sizing.

## Example

```tsx
// Basic text input
<Input
  placeholder="Enter text..."
  value={text}
  onChange={(e) => setText(e.target.value)}
/>

// With label and helper text
<Input
  label="Project Name"
  placeholder="My Project"
  helperText="Choose a unique name for your project"
  value={name}
  onChange={(e) => setName(e.target.value)}
/>

// With icons and error state
<Input
  label="Email"
  type="email"
  startIcon={<SearchIcon />}
  error={!!emailError}
  errorMessage={emailError}
  value={email}
  onChange={(e) => setEmail(e.target.value)}
/>
```
