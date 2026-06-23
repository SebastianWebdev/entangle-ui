# Code
> Inline code primitive backed by the theme inset background and monospace font.

A small inline `<code>` primitive that picks up the theme monospace font and the `colors.background.inset` token so inline snippets read as recessed surfaces inside body text. For multi-line or syntax-highlighted blocks use `ChatCodeBlock` (under the editor namespace).

**Live Preview**

## Import

```tsx
import { Code } from 'entangle-ui';
```

## Usage

```tsx
<Text>
  Run <Code>npm install entangle-ui</Code> to add the package.
</Text>
```

## Sizes

The font size is relative to the surrounding text — use `size` to fine-tune the scale.

**Sizes**

```tsx
<Code size="xs">xs</Code> {/* 0.8em */}
<Code size="sm">sm</Code> {/* 0.9em — default */}
<Code size="md">md</Code> {/* 1em */}
```

## Inside a Sentence

`Code` is inline — it sits on the same baseline as surrounding text and wraps naturally.

**Inside a sentence**

```tsx
<Text>
  Install with <Code>npm install entangle-ui</Code> and import from the root
  barrel: <Code>{"import { Button } from 'entangle-ui'"}</Code>.
</Text>
```

## Inside a Link

Inherits text color from its parent, so it plays nicely with colored anchors.

**Inside a link**

```tsx
<a href="/components/primitives/button">
  See the <Code>Button</Code> docs
</a>
```

## Mixed with String Literals

**With string literals**

```tsx
<Text>
  The environment variable <Code>NODE_ENV</Code> defaults to{' '}
  <Code>"development"</Code> when running <Code>npm run dev</Code>.
</Text>
```

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `children` | `ReactNode` | — | Inline code content. |
| `size` | `'xs' \| 'sm' \| 'md'` | `'sm'` | Font size scale, relative to surrounding text. |
| `className` | `string` | — | Additional CSS class names. |
| `style` | `CSSProperties` | — | Inline styles. |
| `testId` | `string` | — | Test identifier for automated testing. |
| `ref` | `Ref` | — | Ref to the underlying code element. |

## Theme Tokens

| Token                        | Used for               |
| ---------------------------- | ---------------------- |
| `colors.background.inset`    | Sunken background fill |
| `colors.text.primary`        | Foreground text        |
| `typography.fontFamily.mono` | Monospace family       |
| `borderRadius.sm`            | Corner radius (2px)    |

## Accessibility

- Renders a semantic `<code>` element so assistive tech announces it as inline code
- No interactive behavior — wrap with a link or button if needed
