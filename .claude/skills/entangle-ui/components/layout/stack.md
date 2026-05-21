# Stack

> Simple stacking component for arranging elements vertically or horizontally with consistent spacing.

A flexible stacking component for arranging elements vertically or horizontally with consistent spacing. Built on flexbox, Stack is the simplest layout primitive for common stacking patterns. For more complex layouts requiring precise flexbox control, see Flex or Grid.

**Live Preview**

## Import

```tsx
import { Stack } from 'entangle-ui';
```

## Usage

```tsx
<Stack spacing={2}>
  <Card>Item 1</Card>
  <Card>Item 2</Card>
  <Card>Item 3</Card>
</Stack>
```

## Direction

Stack defaults to `column` (vertical stacking). Use `direction="row"` for horizontal layouts.

```tsx
<Stack direction="column" spacing={2}>
  <div>Top</div>
  <div>Middle</div>
  <div>Bottom</div>
</Stack>

<Stack direction="row" spacing={3}>
  <Button>Cancel</Button>
  <Button variant="filled">Save</Button>
</Stack>
```

| Direction | Behavior                |
| --------- | ----------------------- |
| `column`  | Top to bottom (default) |
| `row`     | Left to right           |

## Responsive Direction

Override the stack direction at different breakpoints. This is useful for layouts that should be vertical on mobile and horizontal on larger screens.

```tsx
<Stack direction="column" md="row" spacing={2} align="center">
  <Logo />
  <Navigation />
  <UserMenu />
</Stack>
```

| Breakpoint  | Prop | Min Width |
| ----------- | ---- | --------- |
| Small       | `sm` | 576px     |
| Medium      | `md` | 768px     |
| Large       | `lg` | 992px     |
| Extra Large | `xl` | 1200px    |

## Spacing

The `spacing` prop controls the gap between stacked items. Values are multipliers of a 4px base unit. Use `customGap` for arbitrary CSS values.

```tsx
<Stack spacing={1}>
  <div>4px gap</div>
  <div>between items</div>
</Stack>

<Stack spacing={4}>
  <div>16px gap</div>
  <div>between items</div>
</Stack>

<Stack customGap="2rem">
  <div>Custom gap</div>
  <div>between items</div>
</Stack>
```

| Spacing Value | Computed Size |
| ------------- | ------------- |
| `0`           | 0px           |
| `1`           | 4px           |
| `2`           | 8px           |
| `3`           | 12px          |
| `4`           | 16px          |
| `5`           | 20px          |
| `6`           | 24px          |
| `7`           | 28px          |
| `8`           | 32px          |

## Expand

The `expand` prop makes the stack fill available space in the direction of its layout. For `row` direction it takes 100% width; for `column` direction it takes 100% height.

```tsx
<Stack direction="row" expand spacing={3} justify="space-between">
  <Button>Cancel</Button>
  <Button variant="filled">Save</Button>
</Stack>
```

## Justify and Align

Use `justify` for main-axis distribution and `align` for cross-axis alignment.

```tsx
<Stack direction="column" expand justify="center" align="center" spacing={4}>
  <Icon />
  <Text>Welcome</Text>
  <Button>Get Started</Button>
</Stack>
```

```tsx
<Stack direction="row" justify="space-between" align="center">
  <Text>Label</Text>
  <Button size="sm">Edit</Button>
</Stack>
```

## Wrapping

Allow items to wrap to new lines when they overflow the container.

```tsx
<Stack direction="row" wrap="wrap" spacing={2} justify="center">
  <Tag>React</Tag>
  <Tag>TypeScript</Tag>
  <Tag>CSS</Tag>
  <Tag>Vanilla Extract</Tag>
</Stack>
```

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `children` | `ReactNode` | — | Stack content -- any React elements. Required. |
| `direction` | `'row' \| 'column'` | `'column'` | Stack direction controlling main axis orientation. |
| `sm` | `'row' \| 'column'` | — | Direction override at the small breakpoint (576px). |
| `md` | `'row' \| 'column'` | — | Direction override at the medium breakpoint (768px). |
| `lg` | `'row' \| 'column'` | — | Direction override at the large breakpoint (992px). |
| `xl` | `'row' \| 'column'` | — | Direction override at the extra-large breakpoint (1200px). |
| `wrap` | `'nowrap' \| 'wrap' \| 'wrap-reverse'` | `'nowrap'` | Flex wrap behavior when items overflow. |
| `expand` | `boolean` | `false` | Whether the stack fills available space (100% width for row, 100% height for column). |
| `spacing` | `0 \| 1 \| 2 \| 3 \| 4 \| 5 \| 6 \| 7 \| 8` | `0` | Gap between stack items as a multiplier of the 4px base spacing unit. |
| `customGap` | `string \| number` | — | Custom gap override as a CSS value. Overrides the spacing prop when provided. |
| `justify` | `'flex-start' \| 'flex-end' \| 'center' \| 'space-between' \| 'space-around' \| 'space-evenly'` | `'flex-start'` | Distributes space along the main axis. |
| `align` | `'flex-start' \| 'flex-end' \| 'center' \| 'stretch' \| 'baseline'` | `'flex-start'` | Aligns items along the cross axis. |
| `className` | `string` | — | Additional CSS class names. |
| `style` | `CSSProperties` | — | Inline styles. |
| `testId` | `string` | — | Test identifier for automated testing. |
| `ref` | `Ref` | — | Ref to the underlying div element. |

The component also accepts all standard HTML `<div>` attributes.

## Accessibility

- Renders a semantic `<div>` element with `display: flex`
- No special ARIA attributes are needed for layout containers
- Content maintains its natural DOM order for assistive technologies
