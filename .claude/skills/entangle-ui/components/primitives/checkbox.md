# Checkbox

> Checkbox component for boolean selection with indeterminate state, labels, and group support.

Checkbox component for boolean selection in settings panels, property inspectors, and form interfaces. Supports controlled and uncontrolled modes, indeterminate state, label positioning, sizes, variants, and error states.

**Live Preview**

## Import

```tsx
import { Checkbox } from 'entangle-ui';
```

## Usage

```tsx
<Checkbox label="Enable shadows" />
```

## Controlled

Use `checked` and `onChange` for controlled mode. The `onChange` callback receives the new boolean value.

```tsx
const [checked, setChecked] = useState(false);

<Checkbox checked={checked} onChange={setChecked} label="Auto-save" />;
```

## Sizes

```tsx
<Checkbox size="sm" label="Small (14px)" />
<Checkbox size="md" label="Medium (16px)" />
<Checkbox size="lg" label="Large (20px)" />
```

| Size | Box size | Use case           |
| ---- | -------- | ------------------ |
| `sm` | 14px     | Compact, dense UIs |
| `md` | 16px     | Standard forms     |
| `lg` | 20px     | Prominent settings |

## Variants

```tsx
<Checkbox variant="default" label="Default variant" />
<Checkbox variant="filled" label="Filled variant" />
```

| Variant   | Description                                           |
| --------- | ----------------------------------------------------- |
| `default` | Border-only when unchecked, accent fill when checked  |
| `filled`  | Subtle background when unchecked, accent when checked |

## Indeterminate State

The `indeterminate` prop shows a dash icon instead of a checkmark. Used for "select all" patterns when some items are checked. Takes visual precedence over the checked state.

```tsx
<Checkbox indeterminate label="Select all" />
```

## Label Position

The label can be placed on either side of the checkbox.

```tsx
<Checkbox label="Label on right" labelPosition="right" />
<Checkbox label="Label on left" labelPosition="left" />
```

## Helper Text and Error

Display helper text below the checkbox, or an error message when validation fails.

```tsx
<Checkbox
  label="Accept terms"
  helperText="You must accept to continue"
/>

<Checkbox
  label="Accept terms"
  error
  errorMessage="This field is required"
/>
```

## Required

```tsx
<Checkbox label="I agree to the terms" required />
```

## Disabled

```tsx
<Checkbox disabled label="Disabled unchecked" />
<Checkbox disabled checked label="Disabled checked" />
```

## Form Submission

Use the `name` and `value` props for form integration. A hidden input is rendered with the appropriate value.

```tsx
<Checkbox name="features" value="shadows" label="Enable shadows" />
<Checkbox name="features" value="reflections" label="Enable reflections" />
```

## Combining Props

```tsx
<Checkbox
  checked={enableShadows}
  onChange={setEnableShadows}
  label="Enable shadows"
  size="sm"
  variant="filled"
  helperText="Adds real-time shadow rendering"
/>
```

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `checked` | `boolean` | — | Whether the checkbox is checked (controlled mode). |
| `defaultChecked` | `boolean` | `false` | Default checked state (uncontrolled mode). |
| `indeterminate` | `boolean` | `false` | Whether the checkbox is in an indeterminate state. Shows a dash icon. |
| `label` | `string` | — | Label text displayed next to the checkbox. |
| `labelPosition` | `'left' \| 'right'` | `'right'` | Position of the label relative to the checkbox. |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Checkbox size. |
| `variant` | `'default' \| 'filled'` | `'default'` | Visual variant controlling unchecked/checked appearance. |
| `disabled` | `boolean` | `false` | Whether the checkbox is disabled. |
| `required` | `boolean` | `false` | Whether the checkbox is required. |
| `error` | `boolean` | `false` | Whether the checkbox has an error state. |
| `helperText` | `string` | — | Helper text displayed below the checkbox. |
| `errorMessage` | `string` | — | Error message displayed when error is true. Replaces helperText. |
| `value` | `string` | — | Value attribute for CheckboxGroup integration and form submission. |
| `name` | `string` | — | Name attribute for form submission. |
| `onChange` | `(checked: boolean) => void` | — | Change event handler receiving the new checked state. |
| `className` | `string` | — | Additional CSS class names. |
| `style` | `CSSProperties` | — | Inline styles. |
| `testId` | `string` | — | Test identifier for automated testing. |
| `ref` | `Ref` | — | Ref to the underlying button element. |

## Accessibility

- Uses `role="checkbox"` on a native `<button>` element
- `aria-checked` reflects the current state: `true`, `false`, or `mixed` (indeterminate)
- `aria-disabled`, `aria-required`, and `aria-invalid` are set based on props
- Helper text and error messages are linked via `aria-describedby`
- Label is rendered as a `<label>` element wrapping the checkbox for click target expansion
- Keyboard accessible: Space to toggle, Tab to navigate
