# Slider

> A professional slider component with drag interaction, keyboard navigation, and modifier key support.

A professional slider component with smooth drag interaction, keyboard navigation, and modifier key support. Designed for precise value control in editor workflows.

**Live Preview**

## Import

```tsx
import { Slider } from 'entangle-ui';
```

## Usage

```tsx
const [opacity, setOpacity] = useState(100);

<Slider value={opacity} onChange={setOpacity} min={0} max={100} />;
```

## With Label and Unit

```tsx
<Slider
  value={rotation}
  onChange={setRotation}
  min={0}
  max={360}
  step={1}
  unit="°"
  label="Rotation"
/>
```

## Sizes

```tsx
<Slider size="sm" value={50} onChange={setValue} label="Small" />
<Slider size="md" value={50} onChange={setValue} label="Medium" />
<Slider size="lg" value={50} onChange={setValue} label="Large" />
```

## Precision Control with Modifier Keys

Hold modifier keys while dragging or using arrow keys for different step sizes:

| Modifier | Behavior | Default Step |
| -------- | -------- | ------------ |
| None     | Normal   | `step` (1)   |
| Shift    | Fine     | `step / 10`  |
| Ctrl/Cmd | Coarse   | `step * 10`  |

```tsx
<Slider
  value={scale}
  onChange={setScale}
  min={0.1}
  max={5}
  step={0.1}
  precisionStep={0.01}
  largeStep={1}
  precision={2}
  label="Scale"
/>
```

## Tick Marks

```tsx
<Slider
  value={angle}
  onChange={setAngle}
  min={0}
  max={360}
  step={15}
  showTicks
  tickCount={8}
  unit="°"
  label="Angle"
/>
```

## Custom Value Formatting

```tsx
<Slider
  value={volume}
  onChange={setVolume}
  min={0}
  max={100}
  formatValue={v => `${v}%`}
  label="Volume"
/>
```

## Form Integration

```tsx
<Slider
  value={brightness}
  onChange={setBrightness}
  min={0}
  max={100}
  label="Brightness"
  helperText="Adjust display brightness"
  required
/>

<Slider
  value={contrast}
  onChange={setContrast}
  min={0}
  max={200}
  label="Contrast"
  error={contrast > 150}
  errorMessage="High contrast may cause clipping"
/>
```

## Keyboard Navigation

| Key             | Action                  |
| --------------- | ----------------------- |
| Arrow Right/Up  | Increment by step       |
| Arrow Left/Down | Decrement by step       |
| Home            | Jump to minimum         |
| End             | Jump to maximum         |
| Page Up         | Increment by large step |
| Page Down       | Decrement by large step |

## Props

| Prop                    | Type                        | Default     | Description                                       |
| ----------------------- | --------------------------- | ----------- | ------------------------------------------------- |
| `value` _(required)_    | `number`                    | —           | Current numeric value.                            |
| `onChange` _(required)_ | `(value: number) => void`   | —           | Callback when value changes.                      |
| `min`                   | `number`                    | `0`         | Minimum allowed value.                            |
| `max`                   | `number`                    | `100`       | Maximum allowed value.                            |
| `step`                  | `number`                    | `1`         | Step size for value increments.                   |
| `precisionStep`         | `number`                    | `step / 10` | Step size when Shift is held (fine control).      |
| `largeStep`             | `number`                    | `step * 10` | Step size when Ctrl/Cmd is held (coarse control). |
| `precision`             | `number`                    | `2`         | Number of decimal places to round to.             |
| `size`                  | `'sm' \| 'md' \| 'lg'`      | `'md'`      | Slider size variant.                              |
| `disabled`              | `boolean`                   | `false`     | Whether the slider is disabled.                   |
| `readOnly`              | `boolean`                   | `false`     | Whether the slider is read-only.                  |
| `label`                 | `string`                    | —           | Label text displayed above the slider.            |
| `helperText`            | `string`                    | —           | Helper text displayed below the slider.           |
| `error`                 | `boolean`                   | `false`     | Whether the slider has an error state.            |
| `errorMessage`          | `string`                    | —           | Error message displayed when error is true.       |
| `required`              | `boolean`                   | `false`     | Whether the slider is required.                   |
| `unit`                  | `string`                    | —           | Unit suffix to display (e.g., "px", "%", "°").    |
| `formatValue`           | `(value: number) => string` | —           | Custom value formatter for display.               |
| `showTooltip`           | `boolean`                   | `true`      | Show value tooltip while dragging.                |
| `showTicks`             | `boolean`                   | `false`     | Show tick marks along the track.                  |
| `tickCount`             | `number`                    | `5`         | Number of tick marks to show.                     |
| `className`             | `string`                    | —           | Additional CSS class names.                       |
| `testId`                | `string`                    | —           | Test identifier for automated testing.            |

## Accessibility

- Uses `role="slider"` with proper ARIA attributes
- `aria-valuemin`, `aria-valuemax`, `aria-valuenow`, `aria-valuetext`
- Full keyboard navigation with arrow keys, Home, End, Page Up/Down
- Disabled and read-only states reflected via `aria-disabled` and `aria-readonly`
