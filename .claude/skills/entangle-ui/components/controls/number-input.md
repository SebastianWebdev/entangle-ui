# NumberInput

> Blender-style numeric input with drag-to-scrub, step buttons, expression evaluation, and modifier key support.

Blender-style numeric input designed for professional editor interfaces. Supports drag-to-scrub value changes, increment/decrement step buttons, mathematical expression evaluation, and modifier keys for precision and large-step adjustments.

**Live Preview**

## Import

```tsx
import { NumberInput } from 'entangle-ui';
```

## Usage

```tsx
const [value, setValue] = useState(0);

<NumberInput value={value} onChange={setValue} />;
```

## Drag to Scrub

Click and drag left/right on the input to scrub the value. This is the signature interaction from Blender-style editors. Short clicks enter edit mode for direct keyboard input.

```tsx
<NumberInput value={rotation} onChange={setRotation} unit="°" step={1} />
```

**Modifier keys during drag:**

- **Ctrl** held: large step increments (default `step * 10`)
- **Shift** held: precision step increments (default `step / 10`)

## Unit Display

The `unit` prop displays a suffix next to the value. It can be a static string or a function that formats based on the current value.

```tsx
// Static unit
<NumberInput value={width} onChange={setWidth} unit="px" />

// Dynamic unit
<NumberInput
  value={progress}
  onChange={setProgress}
  unit={(v) => `${(v * 100).toFixed(0)}%`}
/>
```

## Limits

Use `min` and `max` for hard limits (cannot be exceeded). Use `softMin` and `softMax` for drag limits that can still be overridden by typing values directly.

```tsx
<NumberInput
  value={opacity}
  onChange={setOpacity}
  min={0}
  max={1}
  step={0.01}
  precision={2}
/>
```

```tsx
// Soft limits — drag stops at 0-100, but keyboard allows wider range
<NumberInput
  value={temperature}
  onChange={setTemperature}
  softMin={0}
  softMax={100}
  min={-273}
  max={1000}
/>
```

## Expression Support

When `allowExpressions` is enabled (default), users can type mathematical expressions into the input. Supported functions include `pi`, `sqrt`, `sin`, `cos`, `tan`, `abs`, and basic arithmetic.

```tsx
<NumberInput
  value={angle}
  onChange={setAngle}
  allowExpressions
  placeholder="Enter value or expression"
/>
```

A user could type `360/7` or `pi * 2` and the expression will be evaluated.

## Sizes

Sizes are optimized for editor interface density.

```tsx
<NumberInput value={v} onChange={setV} size="sm" label="Small" />
<NumberInput value={v} onChange={setV} size="md" label="Medium" />
<NumberInput value={v} onChange={setV} size="lg" label="Large" />
```

| Size | Height | Use case         |
| ---- | ------ | ---------------- |
| `sm` | 20px   | Compact toolbars |
| `md` | 24px   | Standard panels  |
| `lg` | 32px   | Prominent inputs |

## Custom Formatting

Use `formatValue` and `parseValue` for custom display formatting such as currency or comma-separated numbers.

```tsx
<NumberInput
  value={price}
  onChange={setPrice}
  formatValue={v => `$${v.toFixed(2)}`}
  parseValue={s => {
    const n = parseFloat(s.replace(/[$,]/g, ''));
    return isNaN(n) ? null : n;
  }}
/>
```

## Validation

Provide a `validate` function that returns an error message string if the value is invalid, or `undefined` if valid.

```tsx
<NumberInput
  value={dimension}
  onChange={setDimension}
  validate={v => (v <= 0 ? 'Must be positive' : undefined)}
/>
```

## Labels and Helper Text

```tsx
<NumberInput
  value={x}
  onChange={setX}
  label="X Position"
  helperText="World-space X coordinate"
  required
/>
```

## Error State

```tsx
<NumberInput
  value={v}
  onChange={setV}
  errorMessage="Value out of range"
  label="Scale"
/>
```

## Disabled and Read-Only

```tsx
<NumberInput value={42} onChange={() => {}} disabled label="Disabled" />
<NumberInput value={42} onChange={() => {}} readOnly label="Read-only" />
```

## Props

| Prop               | Type                                     | Default     | Description                                                                                |
| ------------------ | ---------------------------------------- | ----------- | ------------------------------------------------------------------------------------------ |
| `value`            | `number`                                 | —           | Current numeric value.                                                                     |
| `onChange`         | `(value: number) => void`                | —           | Callback when value changes.                                                               |
| `unit`             | `string \| ((value: number) => string)`  | —           | Unit suffix to display (e.g., "px", "%", "deg"). Can be a function for dynamic formatting. |
| `showStepButtons`  | `boolean`                                | `true`      | Whether to show increment/decrement chevron buttons on hover.                              |
| `validate`         | `(value: number) => string \| undefined` | —           | Custom validation function. Return error message string if invalid.                        |
| `formatValue`      | `(value: number) => string`              | —           | Format value for display (e.g., add commas, currency symbols).                             |
| `parseValue`       | `(input: string) => number \| null`      | —           | Parse custom formatted input back to number. Used with formatValue.                        |
| `min`              | `number`                                 | —           | Minimum allowed value (hard limit).                                                        |
| `max`              | `number`                                 | —           | Maximum allowed value (hard limit).                                                        |
| `softMin`          | `number`                                 | —           | Soft minimum for drag operations. Can be overridden by keyboard input.                     |
| `softMax`          | `number`                                 | —           | Soft maximum for drag operations. Can be overridden by keyboard input.                     |
| `step`             | `number`                                 | `1`         | Step size for increment/decrement and drag operations.                                     |
| `precisionStep`    | `number`                                 | `step / 10` | Step size when Shift is held (precision mode).                                             |
| `largeStep`        | `number`                                 | `step * 10` | Step size when Ctrl is held (large steps).                                                 |
| `precision`        | `number`                                 | —           | Number of decimal places for display.                                                      |
| `allowExpressions` | `boolean`                                | `true`      | Whether to allow mathematical expression input (pi, sqrt, sin, etc.).                      |
| `dragSensitivity`  | `number`                                 | `1`         | Sensitivity multiplier for mouse drag scrubbing.                                           |
| `size`             | `'sm' \| 'md' \| 'lg'`                   | `'md'`      | Input size variant.                                                                        |
| `disabled`         | `boolean`                                | `false`     | Whether the input is disabled.                                                             |
| `readOnly`         | `boolean`                                | `false`     | Whether the input is read-only.                                                            |
| `errorMessage`     | `string`                                 | —           | Error message displayed below the input.                                                   |
| `placeholder`      | `string`                                 | —           | Placeholder text shown in edit mode.                                                       |
| `label`            | `string`                                 | —           | Input label displayed above the field.                                                     |
| `helperText`       | `string`                                 | —           | Helper text displayed below the input.                                                     |
| `required`         | `boolean`                                | `false`     | Whether the input is required.                                                             |
| `onFocus`          | `(event: FocusEvent) => void`            | —           | Focus event handler.                                                                       |
| `onBlur`           | `(event: FocusEvent) => void`            | —           | Blur event handler.                                                                        |
| `onKeyDown`        | `(event: KeyboardEvent) => void`         | —           | Key down event handler.                                                                    |
| `className`        | `string`                                 | —           | Additional CSS class names.                                                                |
| `testId`           | `string`                                 | —           | Test identifier for automated testing.                                                     |
| `ref`              | `Ref`                                    | —           | Ref to the underlying input element.                                                       |

## Accessibility

- Click-to-edit distinguishes between short clicks (enter edit mode) and drag gestures (scrub value)
- Step buttons have `aria-label` attributes ("Increment value" / "Decrement value")
- Step buttons are hidden from tab order (`tabIndex={-1}`) to keep focus on the main input
- `label` prop renders a `<label>` element associated with the input via `htmlFor`
- Required fields show a visual indicator and set `required` on the input
- Error states are communicated through helper text below the input
- Keyboard: Arrow Up/Down for step, Shift+Arrow for precision, Ctrl+Arrow for large steps, Enter to confirm, Escape to cancel
