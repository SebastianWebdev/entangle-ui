---
editUrl: false
next: false
prev: false
title: "SplitPanePanel"
---

> `const` **SplitPanePanel**: `React.FC`\<[`SplitPanePanelProps`](/api/type-aliases/splitpanepanelprops/)\>

Defined in: [src/components/layout/SplitPane/SplitPanePanel.tsx:22](https://github.com/SebastianWebdev/entangle-ui/blob/3a4ec9f4fea9c67f55f22d9132b3047d3a5027ac/src/components/layout/SplitPane/SplitPanePanel.tsx#L22)

A panel within a SplitPane layout.

Simple wrapper that renders its children with `overflow: auto`.
The parent SplitPane manages its sizing.

## Example

```tsx
<SplitPane>
  <SplitPanePanel>Left content</SplitPanePanel>
  <SplitPanePanel>Right content</SplitPanePanel>
</SplitPane>
```
