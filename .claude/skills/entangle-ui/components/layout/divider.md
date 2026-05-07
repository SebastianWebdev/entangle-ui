# Divider

> Thin horizontal or vertical rule for separating content, with optional centered label.

Thin horizontal or vertical rule for separating content. Supports `solid` / `dashed` / `dotted` line styles, an optional centered label (horizontal only), and a numeric `spacing` prop that maps onto the theme spacing scale.

**Live Preview**

## Import

```tsx
import { Divider } from 'entangle-ui';
```

## Usage

```tsx
<Stack>
  <SectionA />
  <Divider />
  <SectionB />
</Stack>
```

## Orientation

### Horizontal

The default — a full-width rule between stacked content.

**Horizontal**

```tsx
<Divider />
```

### Vertical

A vertical divider needs a parent that gives it a non-zero cross-axis size — typically a flex row with a fixed height.

**Vertical**

```tsx
<Flex align="center" gap={2} style={{ height: 32 }}>
  <span>File</span>
  <Divider orientation="vertical" />
  <span>Edit</span>
  <Divider orientation="vertical" />
  <span>View</span>
</Flex>
```

## Variants

Three line styles — switch freely without changing layout.

**Variants**

```tsx
<Divider variant="solid" /> {/* default */}
<Divider variant="dashed" />
<Divider variant="dotted" />
```

## Labeled Divider

Pass a `label` to render an inline title centered between two flanking lines (horizontal only).

**Labeled divider**

```tsx
<Divider label="Advanced" />
<Divider label="Danger zone" variant="dashed" />
```

The label is rendered with the theme's `xxs` font size, `text.muted` color, and an uppercase letter-spacing — matches editor section dividers.

## Spacing

`spacing` accepts a number index into the theme spacing scale or an arbitrary CSS string. The spacing is applied along the divider's axis.

| Number | Token  | Pixel value |
| ------ | ------ | ----------- |
| `0`    | none   | `0`         |
| `1`    | `xs`   | 2px         |
| `2`    | `sm`   | 4px         |
| `3`    | `md`   | 8px         |
| `4`    | `lg`   | 12px        |
| `5`    | `xl`   | 16px        |
| `6`    | `xxl`  | 24px        |
| `7`    | `xxxl` | 32px        |

**Spacing scale**

```tsx
<Divider spacing={3} />        {/* 8px top/bottom */}
<Divider spacing="1.5rem" />    {/* arbitrary CSS */}
```

## Props

| Prop          | Type                                             | Default        | Description                                                                                             |
| ------------- | ------------------------------------------------ | -------------- | ------------------------------------------------------------------------------------------------------- |
| `orientation` | `'horizontal' \| 'vertical'`                     | `'horizontal'` | Divider axis.                                                                                           |
| `variant`     | `'solid' \| 'dashed' \| 'dotted'`                | `'solid'`      | Line style.                                                                                             |
| `spacing`     | `0 \| 1 \| 2 \| 3 \| 4 \| 5 \| 6 \| 7 \| string` | `0`            | Margin along the axis. Numbers index into the theme spacing scale; strings are passed through verbatim. |
| `label`       | `ReactNode`                                      | —              | Optional centered label. Only honored for horizontal dividers.                                          |
| `className`   | `string`                                         | —              | Additional CSS class names.                                                                             |
| `style`       | `CSSProperties`                                  | —              | Inline styles.                                                                                          |
| `testId`      | `string`                                         | —              | Test identifier for automated testing.                                                                  |
| `ref`         | `Ref`                                            | —              | Ref to the underlying div element.                                                                      |

## Accessibility

- `role="separator"` is set on the root element
- `aria-orientation` reflects the `orientation` prop
- Labeled dividers keep `role="separator"` on the wrapper; the label text is exposed to assistive tech as a child
