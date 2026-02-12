---
editUrl: false
next: false
prev: false
title: "vars"
---

> `const` **vars**: `MapLeafNodes`\<\{ `borderRadius`: \{ `lg`: `string`; `md`: `string`; `none`: `string`; `sm`: `string`; \}; `colors`: \{ `accent`: \{ `error`: `string`; `primary`: `string`; `secondary`: `string`; `success`: `string`; `warning`: `string`; \}; `backdrop`: `string`; `background`: \{ `elevated`: `string`; `primary`: `string`; `secondary`: `string`; `tertiary`: `string`; \}; `border`: \{ `default`: `string`; `error`: `string`; `focus`: `string`; `success`: `string`; \}; `surface`: \{ `active`: `string`; `default`: `string`; `disabled`: `string`; `hover`: `string`; `whiteOverlay`: `string`; \}; `text`: \{ `disabled`: `string`; `muted`: `string`; `primary`: `string`; `secondary`: `string`; \}; \}; `shadows`: \{ `focus`: `string`; `lg`: `string`; `md`: `string`; `separatorBottom`: `string`; `separatorLeft`: `string`; `separatorRight`: `string`; `sm`: `string`; `thumb`: `string`; `xl`: `string`; \}; `shell`: \{ `dock`: \{ `borderBarBg`: `string`; `borderBarSize`: `string`; `dropOverlay`: `string`; `splitterColor`: `string`; `splitterHoverColor`: `string`; `splitterSize`: `string`; `tabActiveBg`: `string`; `tabActiveText`: `string`; `tabBg`: `string`; `tabHeight`: `string`; `tabHoverBg`: `string`; `tabText`: `string`; \}; `menuBar`: \{ `activeBg`: `string`; `bg`: `string`; `height`: `string`; `hoverBg`: `string`; `shortcutText`: `string`; `text`: `string`; \}; `statusBar`: \{ `bg`: `string`; `height`: `string`; `heightMd`: `string`; `text`: `string`; \}; `toolbar`: \{ `bg`: `string`; `height`: \{ `md`: `string`; `sm`: `string`; \}; `separator`: `string`; \}; \}; `spacing`: \{ `lg`: `string`; `md`: `string`; `sm`: `string`; `xl`: `string`; `xs`: `string`; `xxl`: `string`; `xxxl`: `string`; \}; `storybook`: \{ `canvas`: \{ `gradientEnd`: `string`; `gradientMid`: `string`; `gradientStart`: `string`; \}; \}; `transitions`: \{ `fast`: `string`; `normal`: `string`; `slow`: `string`; \}; `typography`: \{ `fontFamily`: \{ `mono`: `string`; `sans`: `string`; \}; `fontSize`: \{ `lg`: `string`; `md`: `string`; `sm`: `string`; `xl`: `string`; `xs`: `string`; `xxs`: `string`; \}; `fontWeight`: \{ `medium`: `string`; `normal`: `string`; `semibold`: `string`; \}; `lineHeight`: \{ `normal`: `string`; `relaxed`: `string`; `tight`: `string`; \}; \}; `zIndex`: \{ `base`: `string`; `dropdown`: `string`; `modal`: `string`; `popover`: `string`; `tooltip`: `string`; \}; \}, `` `var(--${string})` ``\>

Defined in: [src/theme/contract.css.ts:20](https://github.com/SebastianWebdev/entangle-ui/blob/3a4ec9f4fea9c67f55f22d9132b3047d3a5027ac/src/theme/contract.css.ts#L20)

Theme contract with stable CSS custom property names.

Every value is the CSS custom property name (without --)
that will be used in the output CSS. This means consumers
can override any token with plain CSS:

```css
.my-brand {
  --etui-color-accent-primary: #ff6600;
}
```

All property names follow the pattern: etui-{category}-{path}
These names are part of the PUBLIC API — do not rename without
a major version bump.
