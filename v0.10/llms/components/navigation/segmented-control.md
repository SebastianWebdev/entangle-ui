# SegmentedControl
> Toolbar-density mutually exclusive selector for view modes, layout toggles, and other small option groups.

SegmentedControl is a compact, mutually exclusive selector at toolbar density. Use it for view modes, layout toggles, alignment pickers, and other small option groups where each choice **does not** open its own content panel.

**Live Preview**

## When to use

- **SegmentedControl** — 2–5 mutually exclusive states **without** separate panels (viewport shading, list/grid toggle, alignment).
- **Tabs** — when each option has its own content panel underneath.
- **RadioGroup** — form-style selection, especially with > 5 options or vertical lists with descriptive labels.

## Import

```tsx
import { SegmentedControl, SegmentedControlItem } from 'entangle-ui';
```

## Usage

```tsx
<SegmentedControl defaultValue="week">
  <SegmentedControlItem value="day">Day</SegmentedControlItem>
  <SegmentedControlItem value="week">Week</SegmentedControlItem>
  <SegmentedControlItem value="month">Month</SegmentedControlItem>
</SegmentedControl>
```

`SegmentedControl` is a compound component: pair it with one or more `SegmentedControlItem` children. The selected segment is identified by its `value`, not by its child index, so reordering items at runtime does not break selection.

## Controlled vs Uncontrolled

```tsx
// Controlled
const [view, setView] = useState('week');

<SegmentedControl value={view} onChange={setView}>
  <SegmentedControlItem value="day">Day</SegmentedControlItem>
  <SegmentedControlItem value="week">Week</SegmentedControlItem>
  <SegmentedControlItem value="month">Month</SegmentedControlItem>
</SegmentedControl>

// Uncontrolled
<SegmentedControl defaultValue="week">
  ...
</SegmentedControl>
```

**Controlled**

## Variants

**Variants**

| Variant   | Container                      | Selected segment                                    |
| --------- | ------------------------------ | --------------------------------------------------- |
| `subtle`  | Secondary background           | Lifts to surface with a soft shadow                 |
| `solid`   | Surface background with border | Filled with the accent color, white text            |
| `outline` | Transparent with border        | Accent edge bar (bottom horizontal / left vertical) |

```tsx
<SegmentedControl variant="subtle" defaultValue="b">...</SegmentedControl>
<SegmentedControl variant="solid"  defaultValue="b">...</SegmentedControl>
<SegmentedControl variant="outline" defaultValue="b">...</SegmentedControl>
```

## Sizes

**Sizes**

| Size | Height | Use case                         |
| ---- | ------ | -------------------------------- |
| `sm` | 20px   | Toolbar density, dense panels    |
| `md` | 24px   | Default                          |
| `lg` | 32px   | Comfortable, primary surface use |

## Orientation

**Vertical**

```tsx
<SegmentedControl orientation="vertical" defaultValue="b">
  <SegmentedControlItem value="a">Top</SegmentedControlItem>
  <SegmentedControlItem value="b">Middle</SegmentedControlItem>
  <SegmentedControlItem value="c">Bottom</SegmentedControlItem>
</SegmentedControl>
```

In vertical orientation each item stretches to the widest one (or fills the container when `fullWidth` is set). The arrow-key direction switches to `ArrowUp` / `ArrowDown`.

## Icons

**Icons + labels**

```tsx
<SegmentedControl defaultValue="grid">
  <SegmentedControlItem value="list" icon={<ListIcon />}>
    List
  </SegmentedControlItem>
  <SegmentedControlItem value="grid" icon={<GridIcon />}>
    Grid
  </SegmentedControlItem>
  <SegmentedControlItem value="card" icon={<CodeIcon />}>
    Card
  </SegmentedControlItem>
</SegmentedControl>
```

### Icon-only with tooltips

When you omit the label, the segment becomes square (icon-only). Pair every icon-only segment with a `tooltip` (preferred) or an explicit `aria-label` so the action remains discoverable. When `tooltip` is a string and no `aria-label` is given, the tooltip text is used as the accessible name.

**Icon-only with tooltips**

```tsx
<SegmentedControl defaultValue="center" aria-label="Text alignment">
  <SegmentedControlItem
    value="left"
    icon={<AlignLeftIcon />}
    tooltip="Align left"
  />
  <SegmentedControlItem
    value="center"
    icon={<AlignCenterIcon />}
    tooltip="Align center"
  />
  <SegmentedControlItem
    value="right"
    icon={<AlignRightIcon />}
    tooltip="Align right"
  />
</SegmentedControl>
```

## Disabled

**Whole control disabled**

```tsx
<SegmentedControl defaultValue="b" disabled>
  ...
</SegmentedControl>
```

The control-level `disabled` cascades to every segment. Individual segments can also opt out:

**Single segment disabled**

```tsx
<SegmentedControl defaultValue="a">
  <SegmentedControlItem value="a">Day</SegmentedControlItem>
  <SegmentedControlItem value="b" disabled>
    Week
  </SegmentedControlItem>
  <SegmentedControlItem value="c">Month</SegmentedControlItem>
</SegmentedControl>
```

Disabled segments are skipped during keyboard navigation.

## Full width

**Full width**

```tsx
<SegmentedControl fullWidth defaultValue="b">
  ...
</SegmentedControl>
```

When `fullWidth` is set the control stretches to the parent container and every segment grows equally.

## Editor example — viewport shading

A common toolbar pattern: icon-only segments with tooltips for picking the viewport shading mode.

**Viewport shading**

```tsx
<SegmentedControl defaultValue="solid" size="sm" aria-label="Viewport shading">
  <SegmentedControlItem
    value="wireframe"
    icon={<WireframeIcon />}
    tooltip="Wireframe"
  />
  <SegmentedControlItem value="solid" icon={<SolidIcon />} tooltip="Solid" />
  <SegmentedControlItem
    value="material"
    icon={<MaterialIcon />}
    tooltip="Material preview"
  />
  <SegmentedControlItem
    value="rendered"
    icon={<RenderedIcon />}
    tooltip="Rendered"
  />
</SegmentedControl>
```

## Keyboard interaction

| Key                        | Action                                               |
| -------------------------- | ---------------------------------------------------- |
| `ArrowRight` / `ArrowDown` | Move to the next segment (wraps; skips disabled)     |
| `ArrowLeft` / `ArrowUp`    | Move to the previous segment (wraps; skips disabled) |
| `Home`                     | Jump to the first segment                            |
| `End`                      | Jump to the last segment                             |
| `Tab`                      | Leave the control                                    |

Arrow direction follows the control's orientation: horizontal uses Left/Right, vertical uses Up/Down.

## Accessibility

- The container has `role="group"` with an `aria-label` (defaults to `"Segmented control"`; override with the `aria-label` prop).
- Each segment renders as a `role="button"` with `aria-pressed` reflecting its selected state — the same pattern macOS and iOS expose for native segmented controls.
- Roving tabindex: only the selected segment is in the tab order. Arrow keys move focus and update selection.
- When no segment is selected (no `value` / `defaultValue`), the first non-disabled segment becomes tabbable so the control is still keyboard-reachable.
- Icon-only segments fall back to the `tooltip` string for `aria-label` when no explicit `aria-label` is provided. In development, a missing label warns in the console.
- The control honors `prefers-reduced-motion`: the sliding indicator snaps instead of animating.

## API Reference

### SegmentedControl

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `value` | `string` | — | Currently selected value (controlled). |
| `defaultValue` | `string` | — | Default selected value (uncontrolled). |
| `variant` | `'subtle' \| 'solid' \| 'outline'` | `'subtle'` | Visual style of the control. |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Segment size — sm 20px, md 24px, lg 32px. |
| `orientation` | `'horizontal' \| 'vertical'` | `'horizontal'` | Layout direction. |
| `fullWidth` | `boolean` | `false` | Stretch the control to fill the parent and grow each segment equally. |
| `disabled` | `boolean` | `false` | Disable the entire control. |
| `onChange` | `(value: string) => void` | — | Fires when a different segment is selected. |
| `aria-label` | `string` | `'Segmented control'` | Accessible name for the control as a whole. |
| `children` | `ReactNode` | — | SegmentedControlItem components. |
| `className` | `string` | — | Additional CSS class names. |
| `style` | `CSSProperties` | — | Inline styles. |
| `testId` | `string` | — | Test identifier for automated testing. |
| `ref` | `Ref` | — | Ref to the root element. |

### SegmentedControlItem

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `value` | `string` | — | Unique value identifying this segment. |
| `children` | `ReactNode` | — | Visible label. Optional when icon is provided (icon-only segment). |
| `icon` | `ReactNode` | — | Icon rendered before the label, or alone for icon-only segments. |
| `tooltip` | `ReactNode` | — | Tooltip shown on hover. Strongly recommended for icon-only segments — also used as a fallback aria-label when it is a string. |
| `disabled` | `boolean` | `false` | Disable just this segment. |
| `aria-label` | `string` | — | Override the accessible name. Required for icon-only segments without a string tooltip. |
| `className` | `string` | — | Additional CSS class names. |
| `testId` | `string` | — | Test identifier for automated testing. |
| `ref` | `Ref` | — | Ref to the underlying button element. |
