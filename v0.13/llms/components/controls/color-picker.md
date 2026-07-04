# ColorPicker
> Full-featured color picker with saturation/value area, hue slider, alpha channel, input modes, presets, and built-in palettes.

Full-featured color picker for editor interfaces. Includes a saturation/value color area, hue slider, optional alpha slider, multiple input modes (HEX, RGB, HSL), color presets, built-in palettes, and optional EyeDropper support. Opens as a popover by default, or can be rendered inline.

**Live Preview**

## Import

```tsx
import { ColorPicker } from 'entangle-ui';
```

## Usage

```tsx
const [color, setColor] = useState('#007acc');

<ColorPicker value={color} onChange={setColor} />;
```

## Inline Mode

By default, the ColorPicker opens as a popover from a swatch trigger. Set `inline` to render the picker panel directly.

```tsx
<ColorPicker value={color} onChange={setColor} inline pickerWidth={280} />
```

## Alpha Channel

Enable the alpha slider with `showAlpha`.

```tsx
<ColorPicker value={color} onChange={setColor} showAlpha />
```

## Output Format

The `format` prop controls the string format passed to `onChange`.

```tsx
// HEX output (default)
<ColorPicker format="hex" value={color} onChange={setColor} />

// RGB output
<ColorPicker format="rgb" value={color} onChange={setColor} />

// HSL output
<ColorPicker format="hsl" value={color} onChange={setColor} />
```

## Input Modes

Control which input fields are available in the picker with `inputModes` and set the default with `defaultInputMode`.

```tsx
<ColorPicker
  inputModes={['hex', 'rgb']}
  defaultInputMode="hex"
  value={color}
  onChange={setColor}
/>
```

## Presets

Provide a set of preset colors for quick selection.

```tsx
<ColorPicker
  presets={[
    { color: '#FF0000', label: 'Red' },
    { color: '#00FF00', label: 'Green' },
    { color: '#0000FF', label: 'Blue' },
    { color: '#FFFF00', label: 'Yellow' },
  ]}
  value={color}
  onChange={setColor}
/>
```

## Built-in Palettes

Use the `palette` prop with a built-in palette name to show a full color palette in the picker.

```tsx
// Material Design palette
<ColorPicker palette="material" value={color} onChange={setColor} />

// Tailwind CSS palette
<ColorPicker palette="tailwind" value={color} onChange={setColor} />
```

Available built-in palettes:

| Palette      | Description                                  |
| ------------ | -------------------------------------------- |
| `material`   | Material Design colors (19 hues x 10 shades) |
| `tailwind`   | Tailwind CSS colors (22 hues x 11 shades)    |
| `pastel`     | Soft pastel colors                           |
| `earth`      | Natural earth tones                          |
| `neon`       | High-saturation neon colors                  |
| `monochrome` | Neutral, warm, and cool grays                |
| `skin-tones` | Portrait/illustration skin palette           |
| `vintage`    | Desaturated retro film colors                |

You can also pass a custom `Palette` object or an array of `PaletteColor[]`.

## Swatch Trigger

When not inline, the picker opens from a color swatch. Customize its size and shape.

```tsx
<ColorPicker
  size="lg"
  swatchShape="circle"
  label="Background Color"
  value={color}
  onChange={setColor}
/>
```

## EyeDropper

Enable the native EyeDropper API (Chromium browsers only) with `showEyeDropper`. The button is automatically hidden if the browser does not support the API.

```tsx
<ColorPicker showEyeDropper value={color} onChange={setColor} />
```

## Change Complete

Use `onChangeComplete` for actions that should only run when the user finishes a drag interaction (e.g., undo history).

```tsx
<ColorPicker
  value={color}
  onChange={setColor}
  onChangeComplete={finalColor => {
    addToUndoStack(finalColor);
  }}
/>
```

## Sizes

```tsx
<ColorPicker size="sm" value={color} onChange={setColor} />
<ColorPicker size="md" value={color} onChange={setColor} />
<ColorPicker size="lg" value={color} onChange={setColor} />
```

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `value` | `string` | — | Current color value (controlled). Accepts any valid CSS color string. |
| `defaultValue` | `string` | `'#007acc'` | Default color value (uncontrolled). |
| `format` | `'hex' \| 'rgb' \| 'hsl'` | `'hex'` | Output format for the onChange callback. |
| `showAlpha` | `boolean` | `false` | Whether to show the alpha channel slider. |
| `inputModes` | `('hex' \| 'rgb' \| 'hsl')[]` | `['hex', 'rgb', 'hsl']` | Available input mode tabs in the picker. |
| `defaultInputMode` | `'hex' \| 'rgb' \| 'hsl'` | `'hex'` | Default active input mode. |
| `presets` | `ColorPreset[]` | — | Array of preset colors for quick selection. Each preset has color and optional label. |
| `palette` | `string \| Palette \| PaletteColor[]` | — | Built-in palette name, custom Palette object, or array of PaletteColor. |
| `showEyeDropper` | `boolean` | `false` | Whether to show the EyeDropper button (Chromium-only). |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Size of the swatch trigger. |
| `swatchShape` | `'square' \| 'circle'` | `'square'` | Shape of the swatch trigger. |
| `label` | `string` | — | Label displayed next to the swatch trigger. |
| `disabled` | `boolean` | `false` | Whether the picker is disabled. |
| `inline` | `boolean` | `false` | Whether to render the picker inline (no popover). |
| `pickerWidth` | `number` | `240` | Width of the picker panel in pixels. |
| `onChange` | `(color: string) => void` | — | Callback fired continuously as the color changes. |
| `onChangeComplete` | `(color: string) => void` | — | Callback fired when a color change is committed (drag end). |
| `className` | `string` | — | Additional CSS class names. |
| `style` | `CSSProperties` | — | Inline styles. |
| `testId` | `string` | — | Test identifier for automated testing. |

## Accessibility

- The swatch trigger opens the picker in a Popover with proper focus management
- Color area and sliders support mouse and touch drag interactions
- Input fields allow direct typed entry of color values
- Preset and palette colors are clickable for quick selection
- EyeDropper button uses the native browser API when available
