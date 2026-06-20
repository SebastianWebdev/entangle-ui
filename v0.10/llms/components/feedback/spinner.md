# Spinner
> Loading and activity indicator with ring, dots, and pulse variants. Honors prefers-reduced-motion.

A small loading indicator with three visual variants and four sizes. Always announces itself via `role="status"` and `aria-label`. Honors `prefers-reduced-motion` by halting animation and dimming the indicator.

**Live Preview**

## Import

```tsx
import { Spinner } from 'entangle-ui';
```

## Usage

```tsx
<Spinner />
<Spinner variant="dots" size="lg" />
<Spinner showLabel label="Fetching results..." />
```

## Variants

**Variants**

```tsx
<Spinner variant="ring" />  {/* default — circular arc */}
<Spinner variant="dots" />  {/* three pulsing dots */}
<Spinner variant="pulse" /> {/* pulsing filled circle */}
```

## Sizes

**Sizes**

| Size | Pixel size | Use case                        |
| ---- | ---------- | ------------------------------- |
| `xs` | 12px       | Inline next to short text       |
| `sm` | 14px       | Compact button replacement      |
| `md` | 16px       | Default                         |
| `lg` | 20px       | EmptyState or page-level loader |

```tsx
<Spinner size="xs" />
<Spinner size="sm" />
<Spinner size="md" />
<Spinner size="lg" />
```

## Colors

Named values map onto theme tokens. Any other string is used as a raw CSS color.

**Colors**

| Name        | Maps to                 |
| ----------- | ----------------------- |
| `accent`    | `colors.accent.primary` |
| `primary`   | `colors.text.primary`   |
| `secondary` | `colors.text.secondary` |
| `muted`     | `colors.text.muted`     |

```tsx
<Spinner color="accent" />
<Spinner color="muted" />
<Spinner color="#9b59b6" />
```

## Visible Label

By default the label is provided via `aria-label` only. Set `showLabel` to render it visually next to the spinner.

**Visible label**

```tsx
<Spinner showLabel label="Saving..." />
```

## Inside a Button

Replace the button content while an operation runs.

**Inside a button** — Click the button to simulate a 1.5s async operation.

```tsx
<Button disabled={loading}>
  {loading ? (
    <>
      <Spinner size="sm" color="primary" /> Saving...
    </>
  ) : (
    'Save'
  )}
</Button>
```

For the standard "loading button" pattern, prefer `<Button loading>`.

## Reduced Motion

When the user enables `prefers-reduced-motion: reduce` in their OS, animation is suppressed and the indicator is rendered at 60% opacity instead. No code changes required.

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `variant` | `'ring' \| 'dots' \| 'pulse'` | `'ring'` | Visual style. |
| `size` | `'xs' \| 'sm' \| 'md' \| 'lg'` | `'md'` | Size scale. |
| `color` | `'accent' \| 'primary' \| 'secondary' \| 'muted' \| string` | `'accent'` | Named theme color or any CSS color string. |
| `label` | `string` | `'Loading...'` | Visible text and aria-label content. |
| `showLabel` | `boolean` | `false` | Show the label visually next to the spinner. |
| `className` | `string` | — | Additional CSS class names. |
| `style` | `CSSProperties` | — | Inline styles. |
| `testId` | `string` | — | Test identifier for automated testing. |
| `ref` | `Ref` | — | Ref to the underlying span element. |

## Accessibility

- Root element has `role="status"` and `aria-live="polite"` so screen readers announce the loading state when the spinner appears
- `aria-label` defaults to `"Loading..."` and can be overridden via `label`
- When `showLabel` is `false`, the label is rendered in a visually-hidden span so it remains discoverable by assistive tech
- Animation is automatically halted under `prefers-reduced-motion: reduce`
