---
editUrl: false
next: false
prev: false
title: "Stack"
---

> `const` **Stack**: `React.FC`\<`StackProps`\>

Defined in: [src/components/layout/Stack/Stack.tsx:214](https://github.com/SebastianWebdev/entangle-ui/blob/3a4ec9f4fea9c67f55f22d9132b3047d3a5027ac/src/components/layout/Stack/Stack.tsx#L214)

A flexible stacking component for arranging elements vertically or horizontally.

Built on flexbox with consistent spacing and alignment options. Perfect for
simple layouts where you need to stack elements with controlled spacing.
Use Grid or Flex components for more complex layout requirements.

## Example

```tsx
// Basic vertical stack
<Stack spacing={2}>
  <Card>Item 1</Card>
  <Card>Item 2</Card>
  <Card>Item 3</Card>
</Stack>

// Horizontal stack with full width
<Stack direction="row" expand spacing={3} justify="space-between">
  <Button>Cancel</Button>
  <Button variant="filled">Save</Button>
</Stack>

// Responsive stack
<Stack
  direction="column"
  md="row"
  spacing={2}
  align="center"
>
  <Logo />
  <Navigation />
  <UserMenu />
</Stack>

// Centered content
<Stack
  direction="column"
  expand
  justify="center"
  align="center"
  spacing={4}
>
  <Icon />
  <Title>Welcome</Title>
  <Button>Get Started</Button>
</Stack>

// Wrapping horizontal stack
<Stack
  direction="row"
  wrap="wrap"
  spacing={2}
  justify="center"
>
  <Tag>React</Tag>
  <Tag>TypeScript</Tag>
  <Tag>CSS</Tag>
</Stack>
```
