# CartesianPicker

> 2D point picker for selecting coordinates on a cartesian grid with crosshair, snap-to-grid, and custom rendering.

Interactive 2D point picker for selecting X/Y coordinates on a cartesian grid. Features a draggable marker, crosshair display, origin axes, grid lines with labels, snap-to-grid, and custom background rendering. Commonly used for panning controls, UV coordinate selection, and spatial parameter adjustment.

**Live Preview**

## Import

```tsx
import { CartesianPicker } from 'entangle-ui';
```

## Usage

```tsx
const [point, setPoint] = useState({ x: 0, y: 0 });

<CartesianPicker value={point} onChange={setPoint} />;
```

## Controlled vs Uncontrolled

```tsx
// Controlled
<CartesianPicker value={point} onChange={setPoint} />

// Uncontrolled with default
<CartesianPicker defaultValue={{ x: 0.5, y: -0.5 }} />
```

## Domain Range

Set custom domain ranges for each axis. The default is -1 to 1 for both axes.

```tsx
// Normalized 0-1 range
<CartesianPicker
  domainX={[0, 1]}
  domainY={[0, 1]}
  value={uv}
  onChange={setUv}
  labelX="U"
  labelY="V"
/>

// Wider range
<CartesianPicker
  domainX={[-180, 180]}
  domainY={[-90, 90]}
  value={coords}
  onChange={setCoords}
  labelX="Pan"
  labelY="Tilt"
/>
```

## Grid and Labels

```tsx
<CartesianPicker
  showGrid
  gridSubdivisions={8}
  showAxisLabels
  showOriginAxes
  labelX="X"
  labelY="Y"
  value={point}
  onChange={setPoint}
/>
```

## Crosshair

The crosshair shows lines from the marker to the edges. It can be solid or dashed, and can be disabled.

```tsx
<CartesianPicker
  showCrosshair
  crosshairStyle="solid"
  value={point}
  onChange={setPoint}
/>
```

## Snap to Grid

Enable grid snapping during drag. Hold Ctrl to toggle snapping behavior. You can also provide a discrete `step` for per-axis snapping.

```tsx
// Snap to grid subdivisions
<CartesianPicker
  snapToGrid
  gridSubdivisions={4}
  value={point}
  onChange={setPoint}
/>

// Discrete step snapping
<CartesianPicker
  step={0.25}
  value={point}
  onChange={setPoint}
/>

// Per-axis step
<CartesianPicker
  step={[0.1, 0.5]}
  value={point}
  onChange={setPoint}
/>
```

## Clamping

By default, the point is clamped within domain bounds. Disable this to allow values outside the visible range.

```tsx
<CartesianPicker clampToRange={false} value={point} onChange={setPoint} />
```

## Responsive Mode

When `responsive` is true, the picker fills its parent container using a ResizeObserver.

```tsx
<div style={{ width: '100%' }}>
  <CartesianPicker responsive height={200} value={point} onChange={setPoint} />
</div>
```

## Custom Background

Use `renderBackground` to draw behind the grid, such as a heatmap or gradient.

```tsx
<CartesianPicker
  value={point}
  onChange={setPoint}
  renderBackground={(ctx, info) => {
    // Draw a radial gradient
    const cx = info.area.x + info.area.width / 2;
    const cy = info.area.y + info.area.height / 2;
    const grad = ctx.createRadialGradient(
      cx,
      cy,
      0,
      cx,
      cy,
      info.area.width / 2
    );
    grad.addColorStop(0, 'rgba(0, 122, 204, 0.3)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(info.area.x, info.area.y, info.area.width, info.area.height);
  }}
/>
```

## Custom Bottom Bar

```tsx
<CartesianPicker
  value={point}
  onChange={setPoint}
  renderBottomBar={({ point, isDragging }) => (
    <div>
      X: {point.x.toFixed(2)}, Y: {point.y.toFixed(2)}
      {isDragging && ' (dragging)'}
    </div>
  )}
/>
```

## Change Complete

Use `onChangeComplete` for undo integration. It fires on pointer up after a drag.

```tsx
<CartesianPicker
  value={point}
  onChange={setPoint}
  onChangeComplete={finalPoint => {
    undoStack.push(finalPoint);
  }}
/>
```

## Props

| Prop               | Type                                                                  | Default          | Description                                                       |
| ------------------ | --------------------------------------------------------------------- | ---------------- | ----------------------------------------------------------------- |
| `value`            | `Point2D`                                                             | —                | Current point value (controlled). Object with x and y properties. |
| `defaultValue`     | `Point2D`                                                             | `{ x: 0, y: 0 }` | Default point value (uncontrolled).                               |
| `domainX`          | `[number, number]`                                                    | `[-1, 1]`        | Domain range for the X axis.                                      |
| `domainY`          | `[number, number]`                                                    | `[-1, 1]`        | Domain range for the Y axis.                                      |
| `showGrid`         | `boolean`                                                             | `true`           | Whether to show grid lines.                                       |
| `gridSubdivisions` | `number`                                                              | `4`              | Number of grid subdivision lines.                                 |
| `showAxisLabels`   | `boolean`                                                             | `true`           | Whether to show X/Y axis value labels.                            |
| `showOriginAxes`   | `boolean`                                                             | `true`           | Whether to draw emphasized origin axes (X=0, Y=0).                |
| `showCrosshair`    | `boolean`                                                             | `true`           | Whether to draw crosshair lines from the point to edges.          |
| `crosshairStyle`   | `'solid' \| 'dashed'`                                                 | `'dashed'`       | Crosshair line style.                                             |
| `labelX`           | `string`                                                              | —                | X axis name label.                                                |
| `labelY`           | `string`                                                              | —                | Y axis name label.                                                |
| `markerRadius`     | `number`                                                              | `6`              | Point marker radius in pixels.                                    |
| `snapToGrid`       | `boolean`                                                             | `false`          | Snap to grid subdivisions while dragging (Ctrl toggles).          |
| `step`             | `number \| [number, number]`                                          | —                | Discrete step for value snapping. Single value or [stepX, stepY]. |
| `clampToRange`     | `boolean`                                                             | `true`           | Whether to clamp the point within domain bounds.                  |
| `precision`        | `number`                                                              | `2`              | Number format precision for displayed values.                     |
| `width`            | `number`                                                              | `200`            | Width of the picker in pixels.                                    |
| `height`           | `number`                                                              | `200`            | Height of the picker in pixels.                                   |
| `responsive`       | `boolean`                                                             | `false`          | Whether the picker fills its parent container via ResizeObserver. |
| `disabled`         | `boolean`                                                             | `false`          | Whether the picker is disabled.                                   |
| `readOnly`         | `boolean`                                                             | `false`          | Whether the picker is read-only.                                  |
| `onChange`         | `(point: Point2D) => void`                                            | —                | Callback fired continuously during drag.                          |
| `onChangeComplete` | `(point: Point2D) => void`                                            | —                | Callback fired when editing is committed (pointer up).            |
| `renderBackground` | `(ctx: CanvasRenderingContext2D, info: CanvasBackgroundInfo) => void` | —                | Custom background renderer for the canvas.                        |
| `renderBottomBar`  | `(info: CartesianPickerInfo) => ReactNode`                            | —                | Render prop for custom content below the canvas.                  |
| `className`        | `string`                                                              | —                | Additional CSS class names.                                       |
| `testId`           | `string`                                                              | —                | Test identifier for automated testing.                            |

## Accessibility

- Canvas has `aria-label="Cartesian point picker"` and `aria-roledescription` with the current coordinates
- Live region announces coordinate changes during interaction
- Keyboard: Arrow keys move the point by step increments
- The picker is focusable and supports pointer and touch interactions
- `disabled` state prevents all interaction
