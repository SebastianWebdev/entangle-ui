---
editUrl: false
next: false
prev: false
title: "Flex"
---

> `const` **Flex**: `React.FC`\<[`FlexProps`](/api/type-aliases/flexprops/)\>

Defined in: [src/components/layout/Flex/Flex.tsx:271](https://github.com/SebastianWebdev/entangle-ui/blob/3a4ec9f4fea9c67f55f22d9132b3047d3a5027ac/src/components/layout/Flex/Flex.tsx#L271)

A comprehensive flexbox component providing full control over flex properties.

More powerful than Stack for complex layouts requiring precise flexbox control.
Supports all flexbox properties, responsive direction changes, and flexible sizing.
Perfect for complex layouts, navigation bars, form layouts, and sophisticated arrangements.

## Example

```tsx
// Basic horizontal flex
<Flex justify="space-between" align="center">
  <div>Left content</div>
  <div>Right content</div>
</Flex>

// Vertical stack with gap
<Flex direction="column" gap={3}>
  <Card>Item 1</Card>
  <Card>Item 2</Card>
  <Card>Item 3</Card>
</Flex>

// Responsive navigation
<Flex
  direction="column"
  md="row"
  justify="space-between"
  align="center"
  gap={2}
>
  <Logo />
  <Navigation />
  <UserMenu />
</Flex>

// Flexible form layout
<Flex direction="column" gap={2} maxWidth="400px">
  <Input label="Email" />
  <Input label="Password" />
  <Flex justify="space-between" gap={2}>
    <Button fullWidth variant="ghost">Cancel</Button>
    <Button fullWidth variant="filled">Login</Button>
  </Flex>
</Flex>

// Card grid with wrapping
<Flex wrap="wrap" gap={3} justify="center">
  <Card basis="300px">Card 1</Card>
  <Card basis="300px">Card 2</Card>
  <Card basis="300px">Card 3</Card>
</Flex>

// Complex layout with nesting
<Flex direction="column" fullHeight>
  <Header />
  <Flex grow={1}>
    <Sidebar basis="200px" />
    <MainContent grow={1} />
  </Flex>
  <Footer />
</Flex>
```
