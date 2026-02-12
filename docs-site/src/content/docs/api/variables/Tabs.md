---
editUrl: false
next: false
prev: false
title: "Tabs"
---

> `const` **Tabs**: `React.FC`\<[`TabsProps`](/api/type-aliases/tabsprops/)\>

Defined in: [src/components/navigation/Tabs/Tabs.tsx:46](https://github.com/SebastianWebdev/entangle-ui/blob/3a4ec9f4fea9c67f55f22d9132b3047d3a5027ac/src/components/navigation/Tabs/Tabs.tsx#L46)

Tabs component for switching between views within a panel.

Compound component pattern: use with TabList, Tab, and TabPanel.

## Example

```tsx
<Tabs defaultValue="properties">
  <TabList>
    <Tab value="properties">Properties</Tab>
    <Tab value="materials">Materials</Tab>
  </TabList>
  <TabPanel value="properties">Properties content</TabPanel>
  <TabPanel value="materials">Materials content</TabPanel>
</Tabs>
```
