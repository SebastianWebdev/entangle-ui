---
editUrl: false
next: false
prev: false
title: "Grid"
---

> `const` **Grid**: `React.FC`\<[`GridProps`](/api/type-aliases/gridprops/)\>

Defined in: [src/components/layout/Grid/Grid.tsx:158](https://github.com/SebastianWebdev/entangle-ui/blob/3a4ec9f4fea9c67f55f22d9132b3047d3a5027ac/src/components/layout/Grid/Grid.tsx#L158)

A flexible 12-column grid system component for creating responsive layouts.

Supports both container and item modes. Container grids create the grid layout,
while item grids define how much space each child should occupy.
Built on CSS Grid for modern, flexible layouts.

## Example

```tsx
// Basic two-column layout
<Grid container spacing="md">
  <Grid size={6}>Left content</Grid>
  <Grid size={6}>Right content</Grid>
</Grid>

// Responsive three-column layout
<Grid container spacing="lg">
  <Grid xs={12} sm={6} md={4}>Card 1</Grid>
  <Grid xs={12} sm={6} md={4}>Card 2</Grid>
  <Grid xs={12} sm={12} md={4}>Card 3</Grid>
</Grid>

// Nested grids
<Grid container spacing="md">
  <Grid size={8}>
    <Grid container spacing="sm">
      <Grid size={6}>Nested left</Grid>
      <Grid size={6}>Nested right</Grid>
    </Grid>
  </Grid>
  <Grid size={4}>Sidebar</Grid>
</Grid>

// Custom gap
<Grid container gap="2rem">
  <Grid size={4}>Item 1</Grid>
  <Grid size={4}>Item 2</Grid>
  <Grid size={4}>Item 3</Grid>
</Grid>
```
