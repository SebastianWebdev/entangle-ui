# VectorInput
> Grouped numeric input for Vec2, Vec3, and Vec4 vectors with per-axis labels, color coding, and linked proportional editing.

Grouped numeric input for Vec2, Vec3, and Vec4 vectors. Composes NumberInput with per-axis labels, color-coded axis indicators, and optional linked proportional editing. Used for position, rotation, scale, color channels, UV coordinates, and bounding box extents.

**Live Preview**

## Import

```tsx
import { VectorInput } from 'entangle-ui';
```

## Usage

```tsx
const [position, setPosition] = useState([0, 0, 0]);

<VectorInput label="Position" value={position} onChange={setPosition} />;
```

## Dimensions

The `dimension` prop controls how many axis inputs are shown: 2 (Vec2), 3 (Vec3), or 4 (Vec4).

```tsx
// Vec2
<VectorInput dimension={2} value={[0, 0]} onChange={setUV} label="UV" />

// Vec3 (default)
<VectorInput dimension={3} value={[0, 0, 0]} onChange={setPos} label="Position" />

// Vec4
<VectorInput dimension={4} value={[1, 0, 0, 1]} onChange={setColor} label="Color" />
```

## Label Presets

Axis labels are configured via presets that match common use cases.

```tsx
// XYZ (default) — Position, rotation, scale
<VectorInput labelPreset="xyz" value={pos} onChange={setPos} />

// RGBA — Color channels
<VectorInput labelPreset="rgba" dimension={4} value={color} onChange={setColor} />

// UVW — Texture coordinates
<VectorInput labelPreset="uvw" value={uv} onChange={setUv} />

// Custom labels
<VectorInput
  labelPreset="custom"
  axisLabels={['Width', 'Height', 'Depth']}
  value={size}
  onChange={setSize}
/>
```

## Color Presets

Axis labels can be color-coded to follow standard conventions.

```tsx
// Spatial (default): X=red, Y=green, Z=blue, W=purple
<VectorInput colorPreset="spatial" value={pos} onChange={setPos} />

// Color: R=red, G=green, B=blue, A=white
<VectorInput colorPreset="color" dimension={4} value={rgba} onChange={setRgba} />

// No colors
<VectorInput colorPreset="none" value={v} onChange={setV} />

// Custom colors
<VectorInput
  colorPreset="custom"
  axisColors={['#FF6B6B', '#4ECDC4', '#45B7D1']}
  value={v}
  onChange={setV}
/>
```

## Linked Proportional Editing

Enable the link toggle to scale all axes proportionally when one changes. When linked, changing one axis value adjusts the others by the same ratio (or delta when the original value is zero).

```tsx
<VectorInput
  label="Scale"
  value={scale}
  onChange={setScale}
  showLink
  defaultLinked
  step={0.1}
/>
```

The linked state can also be controlled externally.

```tsx
<VectorInput
  label="Scale"
  value={scale}
  onChange={setScale}
  showLink
  linked={isLinked}
  onLinkedChange={setIsLinked}
/>
```

## Units and Steps

All NumberInput options for units, steps, and precision apply to every axis.

```tsx
<VectorInput
  label="Position"
  value={pos}
  onChange={setPos}
  unit="px"
  step={1}
  precisionStep={0.1}
  largeStep={10}
  precision={1}
/>
```

## Min / Max

```tsx
<VectorInput
  label="RGB Color"
  value={color}
  onChange={setColor}
  min={0}
  max={255}
  step={1}
  precision={0}
  labelPreset="rgba"
  colorPreset="color"
  dimension={3}
/>
```

## Layout Direction

Arrange axis inputs horizontally (row) or vertically (column).

```tsx
// Row layout (default)
<VectorInput direction="row" value={v} onChange={setV} />

// Column layout
<VectorInput direction="column" value={v} onChange={setV} />
```

## Gap

Control the spacing between axis inputs.

```tsx
<VectorInput gap={4} value={v} onChange={setV} />
```

## Labels and Helper Text

```tsx
<VectorInput
  label="Rotation"
  helperText="Euler angles in degrees"
  value={rotation}
  onChange={setRotation}
  unit="deg"
/>
```

## Error State

```tsx
<VectorInput
  label="Scale"
  error
  errorMessage="Scale cannot be zero"
  value={scale}
  onChange={setScale}
/>
```

## Sizes

```tsx
<VectorInput size="sm" value={v} onChange={setV} label="Small" />
<VectorInput size="md" value={v} onChange={setV} label="Medium" />
<VectorInput size="lg" value={v} onChange={setV} label="Large" />
```

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `value` | `number[]` | — | Current vector value (controlled). Array length must match dimension. |
| `defaultValue` | `number[]` | — | Default vector value (uncontrolled). |
| `dimension` | `2 \| 3 \| 4` | `3` | Number of vector components. |
| `labelPreset` | `'xyz' \| 'rgba' \| 'uvw' \| 'custom'` | `'xyz'` | Axis label preset configuration. |
| `axisLabels` | `string[]` | — | Custom axis labels (when labelPreset is "custom"). |
| `colorPreset` | `'spatial' \| 'color' \| 'none' \| 'custom'` | `'spatial'` | Color coding preset for axis labels. |
| `axisColors` | `string[]` | — | Custom axis colors (when colorPreset is "custom"). CSS color strings. |
| `min` | `number` | — | Minimum allowed value (applies to all axes). |
| `max` | `number` | — | Maximum allowed value (applies to all axes). |
| `step` | `number` | `1` | Step size for value increments. |
| `precisionStep` | `number` | — | Step size when Shift is held (precision mode). |
| `largeStep` | `number` | — | Step size when Ctrl is held (large steps). |
| `precision` | `number` | `2` | Number of decimal places. |
| `unit` | `string` | — | Unit suffix displayed in each input (e.g., "px", "deg"). |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Component size. |
| `label` | `string` | — | Label displayed above the vector input. |
| `helperText` | `string` | — | Helper text displayed below. |
| `error` | `boolean` | `false` | Error state. |
| `errorMessage` | `string` | — | Error message. |
| `disabled` | `boolean` | `false` | Whether the vector input is disabled. |
| `showLink` | `boolean` | `false` | Whether to show the link/unlink proportions toggle. |
| `defaultLinked` | `boolean` | `false` | Whether axes are linked by default (uncontrolled). |
| `linked` | `boolean` | — | Whether axes are linked (controlled). |
| `onLinkedChange` | `(linked: boolean) => void` | — | Callback when the linked state changes. |
| `direction` | `'row' \| 'column'` | `'row'` | Layout direction of axis inputs. |
| `gap` | `number` | `2` | Gap between axis inputs in pixels. |
| `onChange` | `(value: number[], axisIndex: number) => void` | — | Callback when any axis value changes. |
| `onChangeComplete` | `(value: number[]) => void` | — | Callback when editing is committed (blur, Enter). |
| `className` | `string` | — | Additional CSS class names. |
| `testId` | `string` | — | Test identifier for automated testing. |

## Accessibility

- The container uses `role="group"` with `aria-label` set to the label or "Vector input"
- Each axis input has `aria-label` indicating the axis (e.g., "X axis")
- The link toggle button uses `aria-pressed` to indicate linked state and `aria-label` for screen readers
- All NumberInput accessibility features (keyboard navigation, expression support) apply to each axis
- Disabled state propagates to all child inputs and the link toggle
