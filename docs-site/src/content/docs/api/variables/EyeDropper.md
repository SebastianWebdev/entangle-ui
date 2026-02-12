---
editUrl: false
next: false
prev: false
title: "EyeDropper"
---

> `const` **EyeDropper**: `React.FC`\<[`EyeDropperProps`](/api/type-aliases/eyedropperprops/)\>

Defined in: [src/components/controls/ColorPicker/EyeDropper.tsx:48](https://github.com/SebastianWebdev/entangle-ui/blob/3a4ec9f4fea9c67f55f22d9132b3047d3a5027ac/src/components/controls/ColorPicker/EyeDropper.tsx#L48)

EyeDropper button that opens the native browser EyeDropper API
to sample a color from anywhere on the screen.

Renders nothing if the EyeDropper API is not available in the browser.

## Example

```tsx
<EyeDropper onColorPick={(hex) => setColor(hex)} />
```
