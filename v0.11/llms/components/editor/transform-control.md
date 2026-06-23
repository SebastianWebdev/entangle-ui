# TransformControl
> The canonical position / rotation / scale property control for 3D editor interfaces. Composes VectorInput, Select and PropertyRow into one high-level component.

The canonical 3D-editor property control. `TransformControl` bundles
position, rotation and scale rows -- plus a coordinate-space switcher and
a linked-scale toggle -- into a single high-level component. It is a pure
composition over `VectorInput`, `Select` and `PropertyRow`, so the visual
language matches the rest of the property inspector.

**Live Preview**

## Import

```tsx
import { TransformControl } from 'entangle-ui';
import type { TransformValue, CoordinateSpace } from 'entangle-ui';
```

## Usage

```tsx
const [transform, setTransform] = useState<TransformValue>({
  position: { x: 0, y: 0, z: 0 },
  rotation: { x: 0, y: 0, z: 0 },
  scale: { x: 1, y: 1, z: 1 },
});

<PropertySection title="Transform">
  <TransformControl value={transform} onChange={setTransform} showReset />
</PropertySection>;
```

`TransformControl` does not render its own `PropertySection` wrapper --
slot it inside one of your own sections so it inherits the panel's size
and layout.

## Basic

The defaults render all three rows plus the coordinate-space dropdown,
size `sm` to match typical property-panel density.

**Basic**

## With reset

Set `showReset` to render a per-row reset button. Position and rotation
reset to `(0, 0, 0)`, scale resets to `(1, 1, 1)`.

**With reset**

## Linked scale

When the lock toggle is engaged, editing any scale axis sets all three
to that value (uniform scale). Toggling the lock does **not** snap the
existing values -- it only changes how subsequent edits propagate.

**Linked scale**

## Position only

Hide rows you do not need with the `show` prop. When both `position` and
`rotation` are hidden, the coordinate-space row is hidden too.

**Position only**

## Custom coordinate spaces

Replace the default `local | world | parent` triple with your own list
via `coordinateSpaceOptions`.

**Custom spaces**

  Changing the coordinate-space dropdown does **not** transform the numeric
  values. The component is purely a UI control -- your editor logic is
  responsible for re-projecting positions and rotations when the active space
  changes.

## Inside a PropertyPanel

`TransformControl` is designed to sit inside a `PropertySection`, with
peer sections beside it for material, physics, etc.

**In a property panel**

## Accessibility

All keyboard, focus and ARIA semantics come from the underlying
controls. The component itself adds no new interactions:

- Each axis input is a `NumberInput`, with the standard math-expression,
  drag-edit and step-button keybindings.
- The coordinate-space dropdown is a `Select` (`role="combobox"`).
- The linked-scale toggle is a button with `aria-pressed` reflecting the
  current state.

## When to use

- **`TransformControl`** -- 3D position / rotation / scale UI in a
  property inspector. Use the defaults; pass `show` and `coordinateSpaceOptions`
  to tailor the rows to your editor.
- **Plain `VectorInput`** -- any single-vector input that is not part of
  a transform triple (UV coordinates, color channels, bounding-box extents).
- **Custom composition** -- when you need transform UI with a non-standard
  structure (only position plus a single rotation angle, mixed scalar /
  vector controls, etc.). Compose `VectorInput` + `PropertyRow` directly.

## API Reference

### TransformControl

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `value` | `TransformValue` | — | Controlled transform value. Pair with onChange. |
| `defaultValue` | `TransformValue` | — | Initial transform value when the component is uncontrolled. |
| `onChange` | `(next: TransformValue) => void` | — | Called with the full TransformValue whenever any axis of any subgroup changes. |
| `coordinateSpace` | `'local' \| 'world' \| 'parent' \| (string & {})` | — | Controlled coordinate space for position/rotation rows. |
| `defaultCoordinateSpace` | `CoordinateSpace` | `'local'` | Initial coordinate space when uncontrolled. |
| `onCoordinateSpaceChange` | `(next: CoordinateSpace) => void` | — | Called when the coordinate-space dropdown changes. |
| `coordinateSpaceOptions` | `{ value: string; label: string }[]` | `[{value:'local',label:'Local'},{value:'world',label:'World'},{value:'parent',label:'Parent'}]` | Custom coordinate-space options. Replaces the default triple when provided. |
| `linkedScale` | `boolean` | — | Whether scale axes are linked (controlled). When linked, editing one axis sets all three to the same value. |
| `defaultLinkedScale` | `boolean` | `true` | Initial linked-scale state when uncontrolled. |
| `onLinkedScaleChange` | `(linked: boolean) => void` | — | Called when the lock toggle is clicked. |
| `show` | `{ position?: boolean; rotation?: boolean; scale?: boolean }` | `all true` | Which subgroups to render. Hiding both position and rotation also hides the coordinate-space row. |
| `labels` | `{ position?: string; rotation?: string; scale?: string; coordinateSpace?: string }` | `{ position: 'Position', rotation: 'Rotation', scale: 'Scale', coordinateSpace: 'Space' }` | Display labels for each row and the coordinate-space dropdown. |
| `precision` | `{ position?: number; rotation?: number; scale?: number }` | `{ position: 3, rotation: 1, scale: 3 }` | Decimal places per row. Forwarded to each VectorInput. |
| `step` | `{ position?: number; rotation?: number; scale?: number }` | `{ position: 0.1, rotation: 1, scale: 0.01 }` | Step values per row. Forwarded to each VectorInput. |
| `units` | `{ position?: string; rotation?: string; scale?: string }` | `{ position: 'm', rotation: '°', scale: '' }` | Unit suffix appended to each axis input. |
| `size` | `'sm' \| 'md' \| 'lg'` | `'sm'` | Size for the underlying VectorInput and Select controls. Defaults to sm to match property-panel density. |
| `disabled` | `boolean` | `false` | Disable all interactions. |
| `showReset` | `boolean` | `false` | Render a reset button next to each row. Position/rotation reset to (0,0,0); scale resets to (1,1,1). |
