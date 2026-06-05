# GradientEditor

> Interactive gradient editor for linear, radial, and conic gradients with draggable color stops, per-stop color picking, and CSS import/export.

Interactive gradient editor for professional tools. Edit linear, radial, and conic gradients with draggable color stops, per-stop color picking (popover or inline), an angle control, and live CSS output you can copy. The value is a structured `GradientData` object — a CSS string is available on demand via `formatGradientCSS` and round-trips through `parseGradientCSS`.

**Live Preview**

## Import

```tsx
import { GradientEditor } from 'entangle-ui';
import type { GradientData } from 'entangle-ui';
```

## Usage

The value is structured `GradientData`, not a CSS string:

```tsx
const [gradient, setGradient] = useState<GradientData | undefined>(undefined);

<GradientEditor value={gradient} onChange={setGradient} />;
```

**Controlled**

## Editing stops

- **Add a stop** — click anywhere on the gradient ramp.
- **Move a stop** — drag its handle, or focus it and use the arrow keys
  (hold <kbd>Shift</kbd> for larger steps).
- **Delete a stop** — drag a handle vertically off the ramp, press
  <kbd>Delete</kbd>/<kbd>Backspace</kbd> with it focused, or click the trash
  button on the stop's card in the grid below the ramp.
- **Recolor a stop** — edit it from its card in the stops grid (see below).

## Stops grid

Below the ramp every stop is summarized as a card: the color swatch, its value
(in `swatchFormat`, hex by default), the ramp position, and a delete button. Set
`swatchFormat` to show the value as `hex`, `hex8`, `rgb`, `rgba`, `hsl`, or
`hsla`.

```tsx
<GradientEditor value={gradient} onChange={setGradient} swatchFormat="rgba" />
```

## Color editor placement

By default (`colorEditor="popover"`) clicking a card's swatch opens its color in
a popover `ColorPicker`. Set `colorEditor="inline"` to instead select the card
and edit it in a single `ColorPicker` panel rendered below the grid.

```tsx
<GradientEditor value={gradient} onChange={setGradient} colorEditor="inline" />
```

**Inline color editor**

## Gradient types

Linear, radial, and conic gradients are all supported. Linear and conic expose
an angle control; radial uses a centered circle.

**Radial / Conic**

Restrict the offered types with the `types` prop:

```tsx
<GradientEditor types={['linear']} value={gradient} onChange={setGradient} />
```

**Linear only**

## Continuous vs committed changes

`onChange` fires continuously while editing (dragging a stop, typing an angle);
`onChangeComplete` fires once when an edit is committed (drag end, add, delete,
type change, angle field blur). Use `onChangeComplete` for undo-system
integration.

**Change complete**

## CSS import / export

The component speaks structured data, but CSS is one call away:

```tsx
import { formatGradientCSS, parseGradientCSS } from 'entangle-ui';

const css = formatGradientCSS(gradient);
// "linear-gradient(90deg, #000000 0%, #ffffff 100%)"

const parsed = parseGradientCSS('radial-gradient(circle, red 0%, blue 100%)');
// GradientData | null
```

`parseGradientCSS` understands `linear-gradient`, `radial-gradient`, and
`conic-gradient`, with an optional leading angle (`90deg`, `from 45deg`) or
direction keyword (`to right`). It returns `null` for anything it can't read as
a gradient, so it's safe to feed user input.

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `value` | `GradientData` | — | Gradient data (controlled). |
| `defaultValue` | `GradientData` | `black→white linear` | Default gradient data (uncontrolled). |
| `width` | `number` | `280` | Width of the editor in pixels. |
| `types` | `GradientType[]` | `['linear', 'radial', 'conic']` | Gradient types offered in the toggle. |
| `colorEditor` | `'popover' \| 'inline'` | `'popover'` | How a stop is edited from its card: popover per card, or a shared inline picker below the grid. |
| `swatchFormat` | `'hex' \| 'hex8' \| 'rgb' \| 'rgba' \| 'hsl' \| 'hsla'` | `'hex'` | Color format shown on each stop card's value label. |
| `showAlpha` | `boolean` | `true` | Whether the ColorPicker exposes the alpha channel. |
| `showAngle` | `boolean` | `true` | Show the angle control (linear/conic). |
| `showCssOutput` | `boolean` | `true` | Show the read-only CSS row with copy button. |
| `maxStops` | `number` | `16` | Maximum number of stops. |
| `minStops` | `number` | `2` | Minimum number of stops. |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Control density. |
| `disabled` | `boolean` | `false` | Whether the editor is disabled. |
| `onChange` | `(value: GradientData) => void` | — | Fired continuously while editing. |
| `onChangeComplete` | `(value: GradientData) => void` | — | Fired when an edit is committed (drag end, add, delete, angle blur). |
| `onSelectionChange` | `(stopId: string \| null) => void` | — | Fired when the selected stop changes. |

### GradientData

| Property | Type                              | Description                             |
| -------- | --------------------------------- | --------------------------------------- |
| `type`   | `'linear' \| 'radial' \| 'conic'` | Gradient kind.                          |
| `angle`  | `number`                          | Direction in degrees (linear / conic).  |
| `stops`  | `GradientStop[]`                  | Color stops, ordered by position (≥ 2). |

### GradientStop

| Property   | Type     | Description                              |
| ---------- | -------- | ---------------------------------------- |
| `id`       | `string` | Unique ID (auto-generated if not given). |
| `color`    | `string` | Any valid CSS color string.              |
| `position` | `number` | Position along the ramp, 0–1.            |

## Accessibility

- Each stop is a `role="slider"` with `aria-valuenow` / `aria-valuetext`.
- Arrow keys move the focused stop; <kbd>Delete</kbd>/<kbd>Backspace</kbd>
  removes it (down to `minStops`).
- The type toggle is a labelled segmented control; the copy button and color
  editor trigger carry descriptive `aria-label`s.
