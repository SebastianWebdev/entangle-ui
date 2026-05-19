# Radio

> Radio and RadioGroup for mutually exclusive selection in forms and property panels.

`Radio` and `RadioGroup` provide mutually exclusive selection for property panels, settings forms, and editor toolbars. Radios share a `name` so the browser handles single-value form submission natively.

**Live Preview**

## Import

```tsx
import { Radio, RadioGroup } from 'entangle-ui';
```

## When to use

| Component                   | Use when                                                                    |
| --------------------------- | --------------------------------------------------------------------------- |
| `Radio`                     | 2–5 mutually exclusive options that should all be visible at once.          |
| `Checkbox`                  | A boolean toggle, or independent multi-selection.                           |
| `Select`                    | 6+ options, or a dynamic / large choice space.                              |
| `SegmentedControl` _(soon)_ | Toolbar-density mutually exclusive states without surrounding form context. |

## Standalone Radio

A single `Radio` works without a surrounding `RadioGroup` and supports both controlled and uncontrolled modes.

```tsx
<Radio value="aa" label="Anti-aliasing" defaultChecked />
```

## Sizes

```tsx
<Radio size="sm" value="sm" label="Small" />
<Radio size="md" value="md" label="Medium" />
<Radio size="lg" value="lg" label="Large" />
```

| Size | Outer | Inner dot |
| ---- | ----- | --------- |
| `sm` | 12px  | 6px       |
| `md` | 14px  | 6px       |
| `lg` | 16px  | 8px       |

## States

```tsx
<Radio value="off" label="Off (unchecked)" />
<Radio value="on" defaultChecked label="On (checked)" />
<Radio value="dis-off" disabled label="Disabled — off" />
<Radio value="dis-on" disabled defaultChecked label="Disabled — on" />
<Radio value="error" error label="Error state" />
```

## RadioGroup

`RadioGroup` manages exclusive selection across child `Radio` components via React Context. The group's `name`, `size`, `disabled`, and `error` override the corresponding props on individual radios.

### Vertical

```tsx
<RadioGroup label="Coordinate space" defaultValue="local">
  <Radio value="local" label="Local" />
  <Radio value="world" label="World" />
  <Radio value="parent" label="Parent" />
  <Radio value="screen" label="Screen" />
</RadioGroup>
```

### Horizontal

```tsx
<RadioGroup
  label="Coordinate space"
  orientation="horizontal"
  defaultValue="local"
>
  <Radio value="local" label="Local" />
  <Radio value="world" label="World" />
  <Radio value="parent" label="Parent" />
</RadioGroup>
```

### Controlled

Pass `value` and `onChange` for controlled mode. The handler receives the new value as a string.

```tsx
const [space, setSpace] = useState('local');

<RadioGroup label="Coordinate space" value={space} onChange={setSpace}>
  <Radio value="local" label="Local" />
  <Radio value="world" label="World" />
  <Radio value="parent" label="Parent" />
</RadioGroup>;
```

### Required & Error

```tsx
<RadioGroup
  label="Coordinate space"
  required
  error
  errorMessage="Selection required to continue"
>
  <Radio value="local" label="Local" />
  <Radio value="world" label="World" />
  <Radio value="parent" label="Parent" />
</RadioGroup>
```

## In a property panel

```tsx
<PropertyRow label="Coordinate space">
  <RadioGroup
    orientation="horizontal"
    size="sm"
    value={space}
    onChange={setSpace}
  >
    <Radio value="local" label="Local" />
    <Radio value="world" label="World" />
    <Radio value="parent" label="Parent" />
  </RadioGroup>
</PropertyRow>
```

## Accessibility

- `Radio` renders a native `<input type="radio">` with `role="radio"` and `aria-checked`.
- `RadioGroup` renders `role="radiogroup"` with `aria-labelledby`, `aria-required`, `aria-invalid`, `aria-disabled`, and `aria-orientation`.
- Helper text and error messages are linked to the input via `aria-describedby`.
- **Tab** moves focus to the group; **Space** selects the focused radio.
- **Arrow keys** (Up / Down / Left / Right) move selection between radios that share a `name`. This is native browser behavior — `RadioGroup` propagates `name` automatically.
- The label wraps the input so clicking the label toggles the radio.
- Animations honor `prefers-reduced-motion`: the inner dot snaps instead of scaling.

## Radio props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `value` | `string` | — | Value of this radio option. Used by RadioGroup for selection and as the input value attribute. |
| `checked` | `boolean` | — | Whether this radio is selected (controlled, standalone). Ignored when inside a RadioGroup. |
| `defaultChecked` | `boolean` | `false` | Default checked state (uncontrolled, standalone). Ignored inside a RadioGroup. |
| `label` | `string` | — | Label text displayed next to the radio. |
| `labelPosition` | `'left' \| 'right'` | `'right'` | Position of the label relative to the radio. |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Radio size. Inside a RadioGroup, the group size overrides this prop. |
| `disabled` | `boolean` | `false` | Whether the radio is disabled. Inside a RadioGroup, the group value overrides this prop. |
| `error` | `boolean` | `false` | Visual error state. Inside a RadioGroup, the group value overrides this prop. |
| `helperText` | `string` | — | Helper text displayed below the radio (standalone use only). |
| `errorMessage` | `string` | — | Error message displayed when error is true (standalone use only). |
| `name` | `string` | — | Form name attribute. Inside a RadioGroup, the group name overrides this prop. |
| `onChange` | `(value: string, event: ChangeEvent) => void` | — | Change handler. Standalone Radio fires when toggled on; rarely used inside a RadioGroup. |
| `className` | `string` | — | Additional CSS class names. |
| `style` | `CSSProperties` | — | Inline styles. |
| `testId` | `string` | — | Test identifier for automated testing. |
| `ref` | `Ref` | — | Ref to the underlying input element. |

## RadioGroup props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `value` | `string` | — | Currently selected value (controlled). |
| `defaultValue` | `string` | — | Default selected value (uncontrolled). |
| `label` | `string` | — | Group label rendered above the radios. |
| `helperText` | `string` | — | Helper text displayed below the group. |
| `disabled` | `boolean` | `false` | Disables the entire group. |
| `error` | `boolean` | `false` | Whether the group has an error state. |
| `errorMessage` | `string` | — | Error message displayed when error is true. Replaces helperText. |
| `required` | `boolean` | `false` | Whether selection is required. Sets aria-required on the group. |
| `orientation` | `'horizontal' \| 'vertical'` | `'vertical'` | Layout direction for the radios. |
| `spacing` | `number \| string` | `2` | Spacing between radios. Number maps to the theme spacing scale; strings pass through unchanged. |
| `name` | `string` | — | Form name attribute applied to all child radios. |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Size applied to all child radios. |
| `onChange` | `(value: string) => void` | — | Change handler — fires when any radio in the group is selected. |
| `children` | `ReactNode` | — | Typically a list of Radio components. |
| `className` | `string` | — | Additional CSS class names. |
| `style` | `CSSProperties` | — | Inline styles. |
| `testId` | `string` | — | Test identifier for automated testing. |
| `ref` | `Ref` | — | Ref to the underlying wrapper element. |
