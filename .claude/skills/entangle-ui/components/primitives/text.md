# Text

> Versatile typography component with semantic variants, flexible sizing, and text styling for editor interfaces.

Versatile typography component for consistent text rendering in editor interfaces. Provides semantic variants, flexible sizing, truncation, and comprehensive styling options using theme typography tokens.

**Live Preview**

## Import

```tsx
import { Text } from 'entangle-ui';
```

## Usage

```tsx
<Text variant="body">Regular paragraph text</Text>
```

## Variants

The `variant` prop provides semantic presets with predefined size, weight, and styling.

```tsx
<Text variant="display">Display — Large titles</Text>
<Text variant="heading">Heading — Section headings</Text>
<Text variant="subheading">Subheading — Subsection headings</Text>
<Text variant="body">Body — Standard body text</Text>
<Text variant="caption">Caption — Small descriptive text</Text>
<Text variant="code">Code — Monospace inline code</Text>
<Text variant="inherit">Inherit — Inherits from parent</Text>
```

| Variant      | Size | Weight        | Use case                   |
| ------------ | ---- | ------------- | -------------------------- |
| `display`    | xl   | semibold      | Main page titles           |
| `heading`    | lg   | medium        | Section headings           |
| `subheading` | md   | medium        | Subsection headings        |
| `body`       | sm   | normal        | Standard body text         |
| `caption`    | xs   | normal        | Small helper text, labels  |
| `code`       | sm   | normal (mono) | Inline code snippets       |
| `inherit`    | --   | --            | Inherits parent typography |

## Sizes

Override the variant's default size with the `size` prop.

```tsx
<Text size="xs">Extra Small</Text>
<Text size="sm">Small</Text>
<Text size="md">Medium</Text>
<Text size="lg">Large</Text>
<Text size="xl">Extra Large</Text>
```

## Colors

The `color` prop maps to theme color tokens.

```tsx
<Text color="primary">Primary text</Text>
<Text color="secondary">Secondary text</Text>
<Text color="muted">Muted text</Text>
<Text color="disabled">Disabled text</Text>
<Text color="accent">Accent text</Text>
<Text color="success">Success text</Text>
<Text color="warning">Warning text</Text>
<Text color="error">Error text</Text>
```

## Weight

Override the variant's default weight with the `weight` prop.

```tsx
<Text weight="normal">Normal weight</Text>
<Text weight="medium">Medium weight</Text>
<Text weight="semibold">Semibold weight</Text>
```

## Polymorphic Rendering

Use the `as` prop to render as any semantic HTML element.

```tsx
<Text as="h1" variant="display">Page Title</Text>
<Text as="h2" variant="heading">Section</Text>
<Text as="p" variant="body">Paragraph content</Text>
<Text as="label" variant="caption">Form label</Text>
<Text as="span" variant="code">inline code</Text>
<Text as="strong" weight="semibold">Important</Text>
<Text as="small" variant="caption">Fine print</Text>
```

## Truncation

Use `truncate` to clip overflowing text with an ellipsis. Combine with `maxLines` for multi-line truncation.

```tsx
{
  /* Single line truncation */
}
<Text truncate>
  This very long text will be truncated with an ellipsis when it overflows...
</Text>;

{
  /* Multi-line truncation */
}
<Text truncate maxLines={2}>
  This text will be truncated after two lines. Any content beyond the second
  line will be clipped with an ellipsis at the end.
</Text>;
```

## No Wrap

Prevent text from wrapping to the next line.

```tsx
<Text nowrap>This text will stay on a single line no matter what.</Text>
```

## Monospace

Force monospace font rendering. Automatically enabled for the `code` variant.

```tsx
<Text mono>Monospace text</Text>
<Text variant="code">Also monospace</Text>
```

## Line Height

Override line height with the `lineHeight` prop.

```tsx
<Text lineHeight="tight">Tight line height</Text>
<Text lineHeight="normal">Normal line height</Text>
<Text lineHeight="relaxed">Relaxed line height</Text>
```

## Alignment

```tsx
<Text align="left">Left aligned</Text>
<Text align="center">Center aligned</Text>
<Text align="right">Right aligned</Text>
<Text align="justify">Justified text alignment</Text>
```

## Combining Props

```tsx
<Text
  as="h1"
  variant="display"
  color="accent"
  weight="semibold"
  align="center"
>
  Project Dashboard
</Text>

<Text
  as="p"
  variant="body"
  color="secondary"
  truncate
  maxLines={3}
>
  A long description that will be truncated after three lines...
</Text>
```

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `children` | `ReactNode` | — | Text content. |
| `as` | `'h1' \| 'h2' \| 'h3' \| 'h4' \| 'h5' \| 'h6' \| 'p' \| 'span' \| 'div' \| 'label' \| 'strong' \| 'em' \| 'small'` | `'span'` | HTML element to render as. |
| `variant` | `'display' \| 'heading' \| 'subheading' \| 'body' \| 'caption' \| 'code' \| 'inherit'` | `'body'` | Semantic variant with predefined styling. |
| `size` | `'xs' \| 'sm' \| 'md' \| 'lg' \| 'xl'` | — | Text size using theme typography tokens. Overrides variant size. |
| `weight` | `'normal' \| 'medium' \| 'semibold'` | — | Text weight using theme typography tokens. Overrides variant weight. |
| `color` | `'primary' \| 'secondary' \| 'muted' \| 'disabled' \| 'accent' \| 'success' \| 'warning' \| 'error'` | `'primary'` | Text color using theme color tokens. |
| `lineHeight` | `'tight' \| 'normal' \| 'relaxed'` | — | Line height. Overrides variant line height. |
| `align` | `'left' \| 'center' \| 'right' \| 'justify'` | — | Text alignment. |
| `truncate` | `boolean` | `false` | Whether to truncate text with ellipsis on overflow. |
| `maxLines` | `number` | — | Maximum lines before truncating. Requires truncate=true. |
| `nowrap` | `boolean` | `false` | Whether text should not wrap to the next line. |
| `mono` | `boolean` | `false` | Whether to use monospace font family. Automatically true for code variant. |
| `className` | `string` | — | Additional CSS class name. |
| `style` | `CSSProperties` | — | Inline styles. |
| `testId` | `string` | — | Test identifier for automated testing. |
| `ref` | `Ref` | — | Ref to the underlying HTML element. |

The component also accepts all standard HTML attributes for the rendered element.

## Accessibility

- Use the `as` prop to render semantically correct HTML elements (e.g., `h1` for page titles, `p` for paragraphs)
- Color contrast follows the theme token system for WCAG compliance
- Truncated text retains its full content in the DOM for screen readers
- The `color` prop maps to semantic theme tokens, not raw CSS values
