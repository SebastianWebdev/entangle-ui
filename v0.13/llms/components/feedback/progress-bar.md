# ProgressBar
> Linear and circular progress indicators with determinate, indeterminate, striped, and labeled variants.

Determinate progress for measurable operations: file uploads, exports, renders, batch jobs. Comes in two flavors — `ProgressBar` (linear) and `CircularProgress` (compact circular). Both share the same color and value semantics, plus an indeterminate fallback for "we know it's working, we don't know how far along."

**Live Preview**

## When to use

- **ProgressBar (determinate)** — the operation reports measurable progress (bytes uploaded, frames rendered).
- **Spinner** — short, indeterminate activity. No measurable progress, no layout to mirror.
- **Skeleton** — content has a known shape and you want to mirror that layout while loading.
- **ProgressBar (indeterminate)** — long indeterminate operations (server warmup, queue position) where a spinner feels too small.

## Import

```tsx
import { ProgressBar, CircularProgress } from 'entangle-ui';
```

## Usage

```tsx
<ProgressBar value={60} />
<ProgressBar value={50} showLabel="inline" />
<ProgressBar size="lg" value={75} striped animated />
<ProgressBar /> {/* indeterminate */}

<CircularProgress value={75} />
<CircularProgress size="xl" value={42} showLabel />
```

## Sizes

**Sizes**

| Size | Height | Use for                                      |
| ---- | ------ | -------------------------------------------- |
| `sm` | 2px    | Inline progress hints, packed lists          |
| `md` | 4px    | Default                                      |
| `lg` | 8px    | Page-level imports / exports, overlay labels |

```tsx
<ProgressBar value={60} size="sm" />
<ProgressBar value={60} size="md" />
<ProgressBar value={60} size="lg" />
```

## Colors

Named values map onto theme accent tokens. Any other string is used as a raw CSS color.

**Colors**

| Name      | Maps to                 |
| --------- | ----------------------- |
| `primary` | `colors.accent.primary` |
| `success` | `colors.accent.success` |
| `warning` | `colors.accent.warning` |
| `error`   | `colors.accent.error`   |

```tsx
<ProgressBar value={60} color="primary" />
<ProgressBar value={60} color="success" />
<ProgressBar value={60} color="#9b59b6" />
```

## Labels

**Labels**

The default ProgressBar renders no text. Use `showLabel="inline"` to show the percentage to the right of the bar, or `showLabel="overlay"` to center it over the fill (only practical at `size="lg"`). Pass a `label` to replace the percentage with custom content like `12 / 50 files` or `3.2 MB / 8.0 MB`.

```tsx
<ProgressBar value={60} showLabel="inline" />
<ProgressBar value={60} size="lg" showLabel="overlay" />
<ProgressBar value={24} max={50} showLabel="inline" label="12 / 50 files" />
```

## Indeterminate

Omit `value` to render the indeterminate variant — a sliding gradient that signals "working" without committing to a percentage. Under `prefers-reduced-motion: reduce`, the animation is suppressed and the bar settles into a static dimmed fill.

**Indeterminate**

```tsx
<ProgressBar />
<ProgressBar size="lg" color="success" />
```

## Striped

**Striped**

A diagonal stripe overlay adds visual texture for long-running operations. Pair with `animated` to make the stripes drift; the animation is automatically suppressed under `prefers-reduced-motion`.

```tsx
<ProgressBar value={60} size="lg" striped />
<ProgressBar value={60} size="lg" striped animated />
```

## Live progress

Width transitions between renders are handled with a CSS transition on the fill. Just update `value` — the bar smoothly tracks the change.

**Live progress**

```tsx
const [value, setValue] = useState(0);
// update value over time
<ProgressBar value={value} showLabel="inline" />;
```

## CircularProgress

A compact circular variant for tight UIs (toolbars, button affordances, dashboard tiles). Same `value`, `min`, `max`, and `color` semantics as the linear bar; sizes range from `xs` (16px) to `xl` (48px).

**Circular sizes**

| Size | Diameter | Default thickness |
| ---- | -------- | ----------------- |
| `xs` | 16px     | 1.5               |
| `sm` | 20px     | 2                 |
| `md` | 24px     | 2                 |
| `lg` | 32px     | 2.5               |
| `xl` | 48px     | 3                 |

Set `showLabel` to render the percentage in the center; only practical at `lg` or larger. Override the centered text with the `label` prop. Omit `value` for an indeterminate spinning arc.

**Circular with label**

```tsx
<CircularProgress value={42} size="xl" showLabel />
<CircularProgress value={75} size="xl" color="success" showLabel />
<CircularProgress size="xl" /> {/* indeterminate */}
```

## Common patterns

### Editor export flow

Long-running operations benefit from a custom label that names the unit of work — frames, bytes, items — instead of a bare percentage.

**Editor export flow**

```tsx
<ProgressBar
  value={frame}
  max={120}
  size="lg"
  color="success"
  showLabel="inline"
  label={`Exporting frame ${frame} / 120`}
/>
```

## Reduced motion

`prefers-reduced-motion: reduce` automatically suppresses indeterminate sliding, animated stripes, and circular rotation — those animations stop entirely. Determinate width transitions remain (they reflect real progress, not decoration).

## Accessibility

- Root element has `role="progressbar"` with `aria-valuemin`, `aria-valuemax`, and `aria-valuenow` for determinate progress; `aria-valuenow` reflects the value clamped to `[min, max]`, so out-of-range inputs never escape into assistive tech
- Indeterminate progress omits `aria-valuenow` and falls back to `aria-label="Loading"`; override via the `ariaLabel` prop
- Pair the bar with a contextual description through `ariaValueText` when the percentage alone does not convey what is happening — assistive tech users should hear "Exporting frame 45 of 120," not "37 percent." If you pass a string `label`, it is used as `aria-valuetext` automatically

```tsx
<ProgressBar
  value={frame}
  max={120}
  ariaValueText={`Exporting frame ${frame} of 120`}
/>
```

## ProgressBar Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `value` | `number` | — | Current progress value. Omit to render the indeterminate variant. |
| `min` | `number` | `0` | Minimum value. |
| `max` | `number` | `100` | Maximum value. |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Bar height. |
| `color` | `'primary' \| 'success' \| 'warning' \| 'error' \| string` | `'primary'` | Named theme color or any CSS color string. |
| `showLabel` | `false \| 'inline' \| 'overlay'` | `false` | How (or whether) to render the percentage. |
| `label` | `ReactNode` | — | Custom label override; replaces the percentage text. |
| `striped` | `boolean` | `false` | Add a diagonal stripe overlay to the fill. |
| `animated` | `boolean` | `false` | Animate the stripes; honored only when striped is true. |
| `ariaLabel` | `string` | — | Accessible label. Defaults to "Loading" for indeterminate bars. |
| `ariaValueText` | `string` | — | Human-readable description exposed via aria-valuetext. Falls back to the string/number label when omitted. |
| `className` | `string` | — | Additional CSS class names. |
| `style` | `CSSProperties` | — | Inline styles. |
| `testId` | `string` | — | Test identifier for automated testing. |
| `ref` | `Ref` | — | Ref to the underlying div element. |

## CircularProgress Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `value` | `number` | — | Current progress value. Omit to render the indeterminate variant. |
| `min` | `number` | `0` | Minimum value. |
| `max` | `number` | `100` | Maximum value. |
| `size` | `'xs' \| 'sm' \| 'md' \| 'lg' \| 'xl'` | `'md'` | Diameter. |
| `thickness` | `number` | — | Stroke thickness in px. Derived from size when omitted. |
| `color` | `'primary' \| 'success' \| 'warning' \| 'error' \| string` | `'primary'` | Named theme color or any CSS color string. |
| `showLabel` | `boolean` | `false` | Render the percentage in the center of the circle. |
| `label` | `ReactNode` | — | Custom center label; replaces the percentage text. |
| `ariaLabel` | `string` | — | Accessible label. Defaults to "Loading" for indeterminate progress. |
| `ariaValueText` | `string` | — | Human-readable description exposed via aria-valuetext. Falls back to the string/number label when omitted. |
| `className` | `string` | — | Additional CSS class names. |
| `style` | `CSSProperties` | — | Inline styles. |
| `testId` | `string` | — | Test identifier for automated testing. |
| `ref` | `Ref` | — | Ref to the underlying div element. |
