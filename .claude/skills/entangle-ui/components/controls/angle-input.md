# AngleInput

> Circular dial for choosing an angle, with an optional compact numeric input. Uses the CSS gradient convention (0° up, clockwise).

A circular dial for picking an angle, with an optional compact numeric input
beside it. The dial follows the **CSS gradient convention** — 0° points up and
the angle increases clockwise (90° = right) — so its value drops straight into
`linear-gradient(<angle>, …)`. Drag the dial, focus it and use the arrow keys,
or type into the numeric input.

**Live Preview**

## Import

```tsx
import { AngleInput } from 'entangle-ui';
```

## Usage

`value` is a number in degrees. Controlled and uncontrolled both work, like any
other input.

```tsx
const [angle, setAngle] = useState(45);

<AngleInput value={angle} onChange={setAngle} />;
```

**Controlled**

## Interaction

- **Drag** the dial to set the angle. Hold <kbd>Shift</kbd> while dragging to
  snap to the `snap` increment (15° by default).
- **Arrow keys** nudge by `step` (1°); hold <kbd>Shift</kbd> or use
  <kbd>PageUp</kbd>/<kbd>PageDown</kbd> for `largeStep` (15°).
- <kbd>Home</kbd> / <kbd>End</kbd> jump to `min` / `max`.
- **Type** an exact value (or a math expression) into the numeric input.

## Companion placement

The numeric input shows by default; place it (or the value readout) on any side
with `placement` (`top` · `right` · `bottom` · `left`), or hide the input with
`showInput={false}`.

**Placement**

### Read-only value readout

With `showInput={false}` the dial stands alone. Add `showValue` for a compact,
read-only readout of the current angle in the companion slot — handy as a small
caption under the dial (`placement="bottom"`).

**Dial only**

**Value readout (no input)**

## Sizes

`size` (`sm` · `md` · `lg`) scales the dial and the numeric input together.
Override the dial diameter alone with `diameter`.

**Sizes**

## Snapping & discrete mode

By default a drag is freeform and `Shift`-dragging snaps to the `snap` increment
(15° by default). Set `discrete` to make **every** interaction snap to `snap` — a
stepped dial where arrow keys move one increment and a `Shift`-drag temporarily
restores fine, unsnapped control.

```tsx
<AngleInput value={angle} onChange={setAngle} discrete snap={45} />
```

**Discrete 45° dial**

## Continuous vs committed changes

`onChange` fires continuously while editing (every drag step, arrow press, typed
value). `onChangeComplete` fires once when an edit is committed — drag end,
numeric-input blur, or focus leaving the dial after keyboard editing. Use
`onChangeComplete` for undo-system integration.

**Change complete**

## Range and wrapping

`min`/`max` default to `0`/`360`. When the range is a full turn
(`max - min === 360`) the value **wraps** around the circle (dragging past 360°
continues from 0°); any other range **clamps** to the bounds. Set, for example,
`min={-180} max={180}` for a signed range.

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `value` | `number` | — | Angle in degrees (controlled). |
| `defaultValue` | `number` | `0` | Initial angle in degrees (uncontrolled). |
| `onChange` | `(angle: number) => void` | — | Fired continuously while the angle changes. |
| `onChangeComplete` | `(angle: number) => void` | — | Fired once on commit (drag end, input blur, dial blur). For undo. |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Dial + input size. |
| `diameter` | `number` | — | Explicit dial diameter in px (overrides size). |
| `showInput` | `boolean` | `true` | Show the editable numeric input beside the dial. |
| `showValue` | `boolean` | `false` | Show a read-only value readout (only when showInput is false). |
| `placement` | `'top' \| 'right' \| 'bottom' \| 'left'` | `'right'` | Where the input / value readout sits relative to the dial. |
| `step` | `number` | `1` | Degrees per arrow key / input step. |
| `largeStep` | `number` | `15` | Degrees for PageUp/PageDown and Shift+arrow. |
| `snap` | `number` | `15` | Snap increment (deg). Shift-drag in normal mode; every interaction in discrete mode. 0 disables. |
| `discrete` | `boolean` | `false` | Stepped mode: snap every interaction to snap; Shift-drag for fine control. |
| `min` | `number` | `0` | Minimum angle in degrees. |
| `max` | `number` | `360` | Maximum angle in degrees. A full-turn range wraps. |
| `disabled` | `boolean` | `false` | Disable the control. |
| `readOnly` | `boolean` | `false` | Focusable and announced, but not editable. |
| `label` | `string` | — | Optional caption rendered above the control. |
| `labels` | `Partial` | — | Localizable strings (see Internationalization). |

## Styling

AngleInput exposes its own `--etui-angle-input-*` custom properties for
per-instance re-skinning. Each falls back to a theme token, so you can override
the dial's look on a single instance (set the variable in `style`) or globally
(override the theme token on an ancestor).

| Custom property                   | Default token                  | Affects                       |
| --------------------------------- | ------------------------------ | ----------------------------- |
| `--etui-angle-input-track-bg`     | `--etui-color-surface-default` | Dial face background.         |
| `--etui-angle-input-track-border` | `--etui-color-border-default`  | Dial outline.                 |
| `--etui-angle-input-needle-color` | `--etui-color-accent-primary`  | Needle from center to handle. |
| `--etui-angle-input-handle-color` | `--etui-color-accent-primary`  | Rim handle fill.              |
| `--etui-angle-input-handle-ring`  | `--etui-color-surface-default` | Ring around the rim handle.   |
| `--etui-angle-input-center-color` | `--etui-color-text-muted`      | Center pivot dot.             |

```tsx
<AngleInput
  value={angle}
  onChange={setAngle}
  style={
    {
      '--etui-angle-input-needle-color': '#f59e0b',
      '--etui-angle-input-handle-color': '#f59e0b',
    } as React.CSSProperties
  }
/>
```

It also consumes these theme-contract tokens directly:

| Token                          | Affects                             |
| ------------------------------ | ----------------------------------- |
| `--etui-color-surface-default` | Dial face and handle ring.          |
| `--etui-color-border-default`  | Dial outline.                       |
| `--etui-color-accent-primary`  | Needle, handle, focus outline.      |
| `--etui-color-text-muted`      | Center pivot dot.                   |
| `--etui-color-text-secondary`  | Caption (`label`) text.             |
| `--etui-spacing-xs`            | Gap between caption and control.    |
| `--etui-spacing-sm`            | Gap between dial and numeric input. |
| `--etui-font-size-xs`          | Caption font size.                  |
| `--etui-shadow-focus`          | Dial focus ring.                    |
| `--etui-shadow-thumb`          | Rim handle shadow.                  |

## Internationalization

The only user-facing strings AngleInput produces are accessibility labels: the
dial's accessible name, the numeric input's accessible name, and the spoken
value (`aria-valuetext`). All three are overridable through `labels` (a partial
— omitted keys keep their English default). The default set is exported as
`DEFAULT_ANGLE_INPUT_LABELS`; the full key list is the `AngleInputLabels` type.
An explicit `aria-label` prop still wins over `labels.dialAriaLabel`.

**Localized labels (French)**

```tsx
<AngleInput
  value={angle}
  onChange={setAngle}
  labels={{
    dialAriaLabel: 'Angle',
    inputAriaLabel: "Valeur de l'angle",
    valueText: deg => `${Math.round(deg)} degrés`,
  }}
/>
```

| Key              | Type                          | Default                       |
| ---------------- | ----------------------------- | ----------------------------- |
| `dialAriaLabel`  | `string`                      | `'Angle'`                     |
| `inputAriaLabel` | `string`                      | `'Angle value'`               |
| `valueText`      | `(degrees: number) => string` | Rounds to whole degrees + "°" |

## Accessibility

- The dial is a `role="slider"` with `aria-valuemin` / `aria-valuemax` /
  `aria-valuenow` / `aria-valuetext`, focusable and fully keyboard-operable.
- An explicit `aria-label` is applied to the dial (and derives the numeric
  input's label); otherwise `labels.dialAriaLabel` is used.
- `disabled` removes the dial from the tab order; `readOnly` keeps it focusable
  and announced but rejects edits.
