# Switch
> Toggle switch component for boolean on/off states in editor toolbars and settings panels.

Toggle switch component for boolean on/off states in editor toolbars, settings panels, and property inspectors. More space-efficient than a Checkbox for toggle options like "Show Grid", "Snap to Grid", or "Auto-Save".

**Live Preview**

## Import

```tsx
import { Switch } from 'entangle-ui';
```

## Usage

```tsx
<Switch label="Show Grid" />
```

## Controlled

Use `checked` and `onChange` for controlled mode. The `onChange` callback receives the new boolean value directly.

```tsx
const [enabled, setEnabled] = useState(false);

<Switch checked={enabled} onChange={setEnabled} label="Auto-save" />;
```

## Sizes

```tsx
<Switch size="sm" label="Small (28x14px track)" />
<Switch size="md" label="Medium (34x18px track)" />
<Switch size="lg" label="Large (42x22px track)" />
```

| Size | Track   | Thumb | Use case           |
| ---- | ------- | ----- | ------------------ |
| `sm` | 28x14px | 10px  | Compact toolbars   |
| `md` | 34x18px | 14px  | Standard panels    |
| `lg` | 42x22px | 18px  | Prominent settings |

## Label Position

The label can be placed on either side of the switch.

```tsx
<Switch label="Label on right" labelPosition="right" />
<Switch label="Label on left" labelPosition="left" />
```

## Helper Text and Error

Display helper text below the switch, or an error message when validation fails.

```tsx
<Switch
  label="Auto-save"
  helperText="Saves your work every 30 seconds"
/>

<Switch
  label="Enable feature"
  error
  errorMessage="This feature requires a premium plan"
/>
```

## Disabled

```tsx
<Switch disabled label="Disabled off" />
<Switch disabled checked label="Disabled on" />
```

## Form Submission

Use the `name` prop for form integration. A hidden input is rendered with the value `"on"` when checked.

```tsx
<Switch name="autoSave" label="Auto-save" />
```

## Combining Props

```tsx
<Switch
  checked={showGrid}
  onChange={setShowGrid}
  label="Show Grid"
  size="sm"
  labelPosition="left"
  helperText="Display grid overlay in viewport"
/>
```

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `checked` | `boolean` | — | Whether the switch is on (controlled mode). |
| `defaultChecked` | `boolean` | `false` | Default on/off state (uncontrolled mode). |
| `label` | `string` | — | Switch label text. |
| `labelPosition` | `'left' \| 'right'` | `'right'` | Position of the label relative to the switch. |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Switch size controlling track and thumb dimensions. |
| `disabled` | `boolean` | `false` | Whether the switch is disabled. |
| `helperText` | `string` | — | Helper text displayed below the switch. |
| `error` | `boolean` | `false` | Whether the switch has an error state. |
| `errorMessage` | `string` | — | Error message displayed when error is true. Replaces helperText. |
| `name` | `string` | — | Name attribute for form submission. |
| `onChange` | `(checked: boolean) => void` | — | Change event handler receiving the new on/off state. |
| `className` | `string` | — | Additional CSS class names. |
| `style` | `CSSProperties` | — | Inline styles. |
| `testId` | `string` | — | Test identifier for automated testing. |
| `ref` | `Ref` | — | Ref to the underlying button element. |

The component also accepts all standard HTML `<button>` attributes (except `onChange`).

## Accessibility

- Uses `role="switch"` on a native `<button>` element
- `aria-checked` reflects the current on/off state
- `aria-disabled` is set when the switch is disabled
- Helper text and error messages are linked via `aria-describedby`
- Label is rendered as a `<label>` element wrapping the switch for click target expansion
- Keyboard accessible: Space/Enter to toggle, Tab to navigate
