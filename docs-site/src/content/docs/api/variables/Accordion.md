---
editUrl: false
next: false
prev: false
title: "Accordion"
---

> `const` **Accordion**: `React.FC`\<[`AccordionProps`](/api/type-aliases/accordionprops/)\>

Defined in: [src/components/layout/Accordion/Accordion.tsx:75](https://github.com/SebastianWebdev/entangle-ui/blob/3a4ec9f4fea9c67f55f22d9132b3047d3a5027ac/src/components/layout/Accordion/Accordion.tsx#L75)

Accordion component for collapsible sections in property inspectors
and settings panels.

Compound component pattern: use with AccordionItem, AccordionTrigger,
and AccordionContent.

## Example

```tsx
<Accordion defaultValue="transform">
  <AccordionItem value="transform">
    <AccordionTrigger>Transform</AccordionTrigger>
    <AccordionContent>Position, rotation, scale fields...</AccordionContent>
  </AccordionItem>
</Accordion>
```
