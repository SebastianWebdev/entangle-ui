# ViewportGizmo

> 3D orientation gizmo for viewport navigation with orbit, snap-to-view, axis colors, and multiple interaction modes.

A canvas-based 3D orientation gizmo for viewport navigation in editor applications. Displays the current camera orientation with colored axis arms and supports orbit dragging, snap-to-view clicking, and axis clicking. Fully controlled -- the parent manages orientation state while the gizmo provides interaction callbacks. Supports configurable axis colors, up-axis conventions, and multiple interaction modes.

**Live Preview**

## Import

```tsx
import { ViewportGizmo } from 'entangle-ui';
```

## Usage

```tsx
const [orientation, setOrientation] = useState({ yaw: 45, pitch: -30 });

<ViewportGizmo
  orientation={orientation}
  onOrbit={delta => {
    setOrientation(prev => ({
      yaw: prev.yaw + delta.deltaYaw,
      pitch: prev.pitch + delta.deltaPitch,
    }));
  }}
  onSnapToView={view => {
    // Snap camera to preset view (front, back, left, right, top, bottom)
    snapCameraTo(view);
  }}
/>;
```

## Orientation

The gizmo always reflects the parent-provided orientation. It uses Euler angles in degrees with YXZ intrinsic rotation order (matching Three.js defaults).

**Orientation**

```tsx
interface GizmoOrientation {
  yaw: number; // Y-axis rotation (heading) in degrees
  pitch: number; // X-axis rotation in degrees
  roll?: number; // Z-axis rotation in degrees (default: 0)
}
```

## Up Axis Convention

Configure which axis points up to match your 3D engine's coordinate system.

**Up Axis Convention**

```tsx
{
  /* Y-up (Three.js, Babylon, Maya) */
}
<ViewportGizmo orientation={orientation} upAxis="y-up" />;

{
  /* Z-up (Blender, Unreal, CAD) */
}
<ViewportGizmo orientation={orientation} upAxis="z-up" />;
```

## Axis Colors

Choose from built-in color presets or provide custom axis colors.

**Axis Colors**

```tsx
{
  /* Blender preset (default): X=red, Y=green, Z=blue */
}
<ViewportGizmo orientation={orientation} axisColorPreset="blender" />;

{
  /* Unreal preset: X=red, Y=green, Z=blue */
}
<ViewportGizmo orientation={orientation} axisColorPreset="unreal" />;

{
  /* Custom colors */
}
<ViewportGizmo
  orientation={orientation}
  axisColorPreset="custom"
  axisConfig={[
    { label: 'X', color: '#FF4444', visible: true },
    { label: 'Y', color: '#44FF44', visible: true },
    { label: 'Z', color: '#4444FF', visible: true },
  ]}
/>;
```

## Interaction Modes

Control which interactions are available to the user. In the preview, drag any
gizmo to orbit and click an axis tip to snap — the "Snapped view" readout below
each one makes the difference clear: `full` and `snap-only` respond to axis
clicks, while `orbit-only` and `display-only` do not.

**Interaction Modes**

```tsx
{
  /* Full interaction: orbit + snap + click (default) */
}
<ViewportGizmo orientation={orientation} interactionMode="full" />;

{
  /* Snap-to-view only: click axes to snap, no orbit dragging */
}
<ViewportGizmo orientation={orientation} interactionMode="snap-only" />;

{
  /* Orbit only: drag to orbit, no snap clicks */
}
<ViewportGizmo orientation={orientation} interactionMode="orbit-only" />;

{
  /* Display only: no interaction, just a visual indicator */
}
<ViewportGizmo orientation={orientation} interactionMode="display-only" />;
```

| Mode           | Orbit | Snap | Description                        |
| -------------- | ----- | ---- | ---------------------------------- |
| `full`         | Yes   | Yes  | Complete interaction (default)     |
| `snap-only`    | No    | Yes  | Click axes to snap to preset views |
| `orbit-only`   | Yes   | No   | Drag to orbit the camera           |
| `display-only` | No    | No   | Read-only orientation display      |

## Visual Options

Toggle various visual elements of the gizmo.

**Visual Options**

```tsx
<ViewportGizmo
  orientation={orientation}
  showLabels={true} // Axis labels (X, Y, Z) at arm tips
  showNegativeAxes={true} // Dimmed shorter arms for negative axes
  showOrbitRing={true} // Thin ring around the gizmo
  showOriginHandle={true} // Clickable center handle
  background="subtle" // Background style
/>
```

| Background    | Description                |
| ------------- | -------------------------- |
| `transparent` | No background              |
| `subtle`      | Faint background (default) |
| `solid`       | Opaque background          |

## Orbit Configuration

Fine-tune orbit behavior with speed and pitch constraint options.

**Orbit Configuration**

```tsx
<ViewportGizmo
  orientation={orientation}
  orbitSpeed={1.5} // 1.5x orbit speed
  constrainPitch={true} // Clamp pitch to [-90, 90] degrees
  onOrbit={delta => {
    /* ... */
  }}
  onOrbitEnd={finalOrientation => {
    /* ... */
  }}
/>
```

## Event Callbacks

**Event Callbacks**

```tsx
<ViewportGizmo
  orientation={orientation}
  onOrbit={delta => {
    // Called continuously during drag
    // delta: { deltaYaw: number, deltaPitch: number }
  }}
  onOrbitEnd={finalOrientation => {
    // Called when drag ends
    // finalOrientation: { yaw, pitch, roll }
  }}
  onSnapToView={view => {
    // Called when user clicks an axis arm
    // view: 'front' | 'back' | 'left' | 'right' | 'top' | 'bottom'
  }}
  onAxisClick={(axis, positive) => {
    // Called when a specific axis arm is clicked
    // axis: 'x' | 'y' | 'z', positive: boolean
  }}
  onOriginClick={() => {
    // Called when the center origin handle is clicked
  }}
/>
```

## Size and Diameter

The `diameter` prop controls the pixel size of the canvas. The `size` prop affects label font size.

**Size and Diameter**

```tsx
<ViewportGizmo orientation={orientation} diameter={80} size="sm" />
<ViewportGizmo orientation={orientation} diameter={120} size="md" />
<ViewportGizmo orientation={orientation} diameter={160} size="lg" />
```

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `orientation` *(required)* | `{ yaw: number; pitch: number; roll?: number }` | — | Current viewport orientation in degrees. The gizmo always reflects this value (fully controlled). |
| `upAxis` | `'y-up' \| 'z-up'` | `'y-up'` | Which axis points up. Y-up for Three.js/Babylon/Maya, Z-up for Blender/Unreal/CAD. |
| `axisColorPreset` | `'blender' \| 'unreal' \| 'custom'` | `'blender'` | Axis color convention. Use "custom" with axisConfig for custom colors. |
| `axisConfig` | `[GizmoAxisConfig, GizmoAxisConfig, GizmoAxisConfig]` | — | Per-axis configuration [X, Y, Z] with custom label, color, and visibility. Used when axisColorPreset is "custom". |
| `showLabels` | `boolean` | `true` | Whether to show axis labels (X, Y, Z) at arm tips. |
| `showNegativeAxes` | `boolean` | `true` | Whether to show negative axis arms (dimmed, shorter). |
| `showOrbitRing` | `boolean` | `true` | Whether to show a thin orbit ring around the gizmo. |
| `showOriginHandle` | `boolean` | `true` | Whether to show a clickable origin handle at the center. |
| `background` | `'transparent' \| 'subtle' \| 'solid'` | `'subtle'` | Background style of the gizmo container. |
| `interactionMode` | `'full' \| 'snap-only' \| 'orbit-only' \| 'display-only'` | `'full'` | Which interactions are enabled. |
| `orbitSpeed` | `number` | `1` | Orbit speed multiplier for drag interactions. |
| `constrainPitch` | `boolean` | `true` | Whether to constrain pitch rotation to [-90, 90] degrees. |
| `onOrbit` | `(delta: { deltaYaw: number; deltaPitch: number }) => void` | — | Called continuously while the user drags to orbit. |
| `onOrbitEnd` | `(finalOrientation: GizmoOrientation) => void` | — | Called when the user finishes an orbit drag. |
| `onSnapToView` | `(view: 'front' \| 'back' \| 'left' \| 'right' \| 'top' \| 'bottom') => void` | — | Called when the user clicks an axis to snap to a preset view. |
| `onAxisClick` | `(axis: 'x' \| 'y' \| 'z', positive: boolean) => void` | — | Called when the user clicks a specific axis arm. |
| `onOriginClick` | `() => void` | — | Called when the user clicks the origin handle. |
| `diameter` | `number` | `120` | Gizmo diameter in pixels. |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Component size, affecting label font size. |
| `disabled` | `boolean` | `false` | Whether the gizmo is disabled. |
| `className` | `string` | — | Additional CSS class names on the wrapper element. |
| `style` | `CSSProperties` | — | Inline styles on the wrapper element. |
| `testId` | `string` | — | Test identifier for automated testing. |
| `id` | `string` | — | HTML id attribute on the wrapper element. |

## Accessibility

- The canvas element has `role="application"` with `aria-label="Viewport orientation gizmo"`
- `aria-roledescription` provides a live description of the current yaw and pitch values
- A hidden `aria-live="polite"` region announces orientation changes to screen readers
- The canvas is keyboard-focusable (`tabIndex={0}`) when not disabled, supporting keyboard-driven orbit via the `onKeyDown` handler
- When `disabled` is `true`, the canvas is removed from the tab order (`tabIndex={-1}`)
