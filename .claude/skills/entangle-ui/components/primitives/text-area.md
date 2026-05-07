# TextArea

> Multi-line text input with optional auto-resize, character count, monospace mode, and Input-parity styling.

Multi-line text input with the same border, focus ring, and error treatment as `Input`. Supports optional auto-resize between `minRows` and `maxRows`, character counters with `maxLength`, and monospace mode for code-style content.

**Live Preview**

## Import

```tsx
import { TextArea } from 'entangle-ui';
```

## Usage

```tsx
const [value, setValue] = useState('');

<TextArea
  label="Description"
  placeholder="Brief description..."
  value={value}
  onChange={setValue}
/>;
```

## Controlled vs Uncontrolled

`onChange` receives the string value directly, not a synthetic event — it works well with plain setter functions.

**Controlled** — Typing updates parent state, which drives both the field and the character counter below it.

```tsx
// Controlled
<TextArea value={value} onChange={setValue} />

// Uncontrolled
<TextArea defaultValue="initial text" onChange={value => console.log(value)} />
```

## Sizes

Sizes match `Input` for visual parity in mixed forms.

**Sizes**

```tsx
<TextArea size="sm" />
<TextArea size="md" />
<TextArea size="lg" />
```

| Size | Min Height |
| ---- | ---------- |
| `sm` | 48px       |
| `md` | 64px       |
| `lg` | 88px       |

## Auto-resize

Set `minRows`, `maxRows`, or both to enable auto-resize. The textarea grows with content and scrolls past `maxRows`. The native resize handle is automatically disabled in this mode.

**Auto-resize** — Press Enter a few times — the textarea grows until it hits 6 rows, then scrolls.

```tsx
<TextArea minRows={2} maxRows={6} value={value} onChange={setValue} />
```

## Character Count

Pair `showCount` with `maxLength` to render a `123/500` counter aligned to the right.

**Character count**

```tsx
<TextArea label="Bio" maxLength={140} showCount />
```

## Monospace

Switch to the theme monospace family for code-style content.

**Monospace**

```tsx
<TextArea monospace rows={6} defaultValue="const x = 1;" />
```

## Error State

`errorMessage` overrides `helperText` when `error` is true; the textarea gets `aria-invalid`.

**Error state**

```tsx
<TextArea label="Description" error errorMessage="This field is required" />
```

## Disabled and Read-only

**Disabled and read-only**

```tsx
<TextArea disabled defaultValue="Cannot edit this field." />
<TextArea readOnly defaultValue="Select me, but don't type." />
```

## Resize Direction

```tsx
<TextArea resize="none" />
<TextArea resize="vertical" /> {/* default */}
<TextArea resize="horizontal" />
<TextArea resize="both" />
```

When auto-resize is active (`minRows` or `maxRows` set), `resize` is forced to `'none'`.

## With Label and Helper Text

`TextArea` integrates with `FormLabel` and `FormHelperText` automatically when you pass `label`, `helperText`, or `errorMessage`.

```tsx
<TextArea label="Description" helperText="Markdown is supported" required />
```

## Props

| Prop           | Type                                             | Default      | Description                                                         |
| -------------- | ------------------------------------------------ | ------------ | ------------------------------------------------------------------- |
| `value`        | `string`                                         | —            | Controlled value.                                                   |
| `defaultValue` | `string`                                         | —            | Uncontrolled initial value.                                         |
| `placeholder`  | `string`                                         | —            | Placeholder text.                                                   |
| `size`         | `'sm' \| 'md' \| 'lg'`                           | `'md'`       | Size scale.                                                         |
| `disabled`     | `boolean`                                        | `false`      | Whether the textarea is disabled.                                   |
| `error`        | `boolean`                                        | `false`      | Whether to render in error state.                                   |
| `required`     | `boolean`                                        | `false`      | Whether the textarea is required.                                   |
| `readOnly`     | `boolean`                                        | `false`      | Whether the textarea is read-only.                                  |
| `label`        | `string`                                         | —            | Label rendered above the textarea (uses FormLabel).                 |
| `helperText`   | `string`                                         | —            | Helper text below the textarea.                                     |
| `errorMessage` | `string`                                         | —            | Error message when error is true; overrides helperText.             |
| `resize`       | `'none' \| 'vertical' \| 'horizontal' \| 'both'` | `'vertical'` | User resize direction. Forced to "none" when auto-resize is active. |
| `rows`         | `number`                                         | `3`          | Initial number of rows when not auto-sizing.                        |
| `minRows`      | `number`                                         | —            | Minimum rows when auto-sizing. Setting this enables auto-resize.    |
| `maxRows`      | `number`                                         | —            | Maximum rows when auto-sizing. Overflow scrolls above this.         |
| `monospace`    | `boolean`                                        | `false`      | Render in monospace font.                                           |
| `maxLength`    | `number`                                         | —            | Maximum allowed character count (HTML attribute).                   |
| `showCount`    | `boolean`                                        | `false`      | Show a character counter below the textarea.                        |
| `onChange`     | `(value: string) => void`                        | —            | Called with the string value on each change.                        |
| `onFocus`      | `(event: FocusEvent) => void`                    | —            | Focus event handler.                                                |
| `onBlur`       | `(event: FocusEvent) => void`                    | —            | Blur event handler.                                                 |
| `onKeyDown`    | `(event: KeyboardEvent) => void`                 | —            | Keydown event handler.                                              |
| `className`    | `string`                                         | —            | Additional CSS class names.                                         |
| `style`        | `CSSProperties`                                  | —            | Inline styles.                                                      |
| `testId`       | `string`                                         | —            | Test identifier for automated testing.                              |
| `ref`          | `Ref`                                            | —            | Ref to the underlying textarea element.                             |

## Accessibility

- Renders a native `<textarea>` element
- `label` is rendered through `FormLabel` with a matching `htmlFor`/`id` pair (auto-generated when `id` is not provided)
- `error` sets `aria-invalid` on the textarea
- `errorMessage` is rendered with `FormHelperText error` so screen readers announce it
- `required` shows a `*` next to the label and sets the native `required` attribute
