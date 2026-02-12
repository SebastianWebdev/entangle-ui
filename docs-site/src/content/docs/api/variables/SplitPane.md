---
editUrl: false
next: false
prev: false
title: "SplitPane"
---

> `const` **SplitPane**: `React.FC`\<[`SplitPaneProps`](/api/type-aliases/splitpaneprops/)\>

Defined in: [src/components/layout/SplitPane/SplitPane.tsx:228](https://github.com/SebastianWebdev/entangle-ui/blob/3a4ec9f4fea9c67f55f22d9132b3047d3a5027ac/src/components/layout/SplitPane/SplitPane.tsx#L228)

A resizable split-pane layout component.

Divides space between two or more child panels with draggable dividers.
Supports horizontal and vertical directions, controlled and uncontrolled
modes, collapsible panels, and keyboard-accessible dividers.

## Example

```tsx
<SplitPane direction="horizontal">
  <SplitPanePanel>Left</SplitPanePanel>
  <SplitPanePanel>Right</SplitPanePanel>
</SplitPane>
```
