# Minimap

> Shared navigation primitive that renders a miniature of editor content alongside a draggable rectangle mirroring the main viewport's visible region. Designed for NodeGraph, Timeline, and custom 2D editor surfaces.

A compact navigation widget that renders a miniature of editor content and a draggable rectangle reflecting the main viewport's visible region. Built as a shared primitive consumed by `NodeGraph`, `Timeline`, and any custom 2D editor surface that wants overview navigation.

**Live Preview**

## Import

```tsx
import { Minimap, computeBoundsFromItems } from 'entangle-ui';
import type { MinimapItem, MinimapNavigateInfo } from 'entangle-ui';
```

## Usage

`Minimap` is a controlled primitive — pass the current `transform` and `viewportSize` from your `<Viewport>` and translate `onNavigate.worldPoint` into a `viewport.centerOn(...)` call.

```tsx
const viewportRef = useRef<ViewportHandle>(null);
const [transform, setTransform] = useState<ViewportTransform>({
  x: 0,
  y: 0,
  zoom: 1,
});
const [size, setSize] = useState<ViewportSize>({ width: 0, height: 0 });

const items: MinimapItem[] = nodes.map(n => ({
  id: n.id,
  type: 'rect',
  x: n.x,
  y: n.y,
  width: n.width,
  height: n.height,
}));

const worldBounds = computeBoundsFromItems(items, 40);

<Viewport
  ref={viewportRef}
  transform={transform}
  onTransformChange={setTransform}
  responsive
>
  ...layers / world children...
</Viewport>

<Minimap
  items={items}
  worldBounds={worldBounds}
  transform={transform}
  viewportSize={size}
  onNavigate={info => viewportRef.current?.centerOn(info.worldPoint)}
/>;
```

## Item shapes

`MinimapItem` is a discriminated union of three primitives. Mix them freely.

```tsx
type MinimapItem =
  | {
      id: string;
      type: 'rect';
      x: number;
      y: number;
      width: number;
      height: number;
      color?: string;
    }
  | {
      id: string;
      type: 'circle';
      cx: number;
      cy: number;
      r: number;
      color?: string;
    }
  | {
      id: string;
      type: 'line';
      x1: number;
      y1: number;
      x2: number;
      y2: number;
      color?: string;
      lineWidth?: number;
    };
```

- **`rect`** — node bodies in a NodeGraph, clips on tracks in a Timeline.
- **`circle`** — compact node markers, keyframes.
- **`line`** — edges between nodes, range markers. `lineWidth` is in minimap CSS px and does not scale with world content.

## Sizing

`Minimap` exposes a single `width` prop; height is derived from the `worldBounds` aspect ratio and clamped to `[minHeight, maxHeight]`. The result:

- A square-ish `worldBounds` (e.g. a node graph) produces a roughly square minimap.
- A wide-thin `worldBounds` (e.g. a timeline track) produces a wide-thin strip.
- An extreme aspect ratio lets the clamps take over — content is letterboxed in the resulting box.

```tsx
{
  /* Compact 220×variable for a NodeGraph */
}
<Minimap width={220} {...rest} />;

{
  /* Timeline-style wide strip — clamps keep it from collapsing to a hairline */
}
<Minimap
  width={600}
  minHeight={24}
  maxHeight={64}
  worldBounds={{ x: 0, y: 0, width: 12000, height: 200 }}
  {...rest}
/>;
```

## Interactions

`Minimap` supports three pointer gestures plus arrow-key navigation. Every navigation event flows through a single `onNavigate` callback that carries a `phase` field — enough to drive undo groups, smooth-follow, or analytics without forcing the consumer into multiple handlers.

| Gesture                       | Phase sequence                          |
| ----------------------------- | --------------------------------------- |
| Tap outside the viewport rect | `'click'`                               |
| Drag from outside             | `'drag-start' → 'drag'… → 'drag-end'`   |
| Drag the viewport rect itself | `'drag-start' → 'drag'… → 'drag-end'`   |
| Arrow keys (when focused)     | `'click'` per keypress (Shift × 5 step) |

Each gesture is independently toggleable:

```tsx
<Minimap
  interactions={{
    click: true,
    dragViewportRect: true,
    dragFromEmpty: false,
  }}
  {...rest}
/>;

{
  /* Or disable everything for a read-only preview */
}
<Minimap interactions={false} {...rest} />;
```

## Recipe — drop-in overlay inside `<Viewport>`

When the minimap lives inside a `<ViewportOverlay>`, you can read live transform and size from `useViewportContext()` instead of threading them through your own state:

```tsx
import { useViewportContext } from 'entangle-ui';

function MinimapOverlay({ items, worldBounds, viewportRef }) {
  const { transform, size } = useViewportContext();
  return (
    <Minimap
      items={items}
      worldBounds={worldBounds}
      transform={transform}
      viewportSize={size}
      onNavigate={info => viewportRef.current?.centerOn(info.worldPoint)}
    />
  );
}

<Viewport ref={viewportRef} responsive>
  ...
  <ViewportOverlay>
    <div style={{ position: 'absolute', right: 12, bottom: 12 }}>
      <MinimapOverlay
        items={items}
        worldBounds={worldBounds}
        viewportRef={viewportRef}
      />
    </div>
  </ViewportOverlay>
</Viewport>;
```

`Minimap` itself stays decoupled from `ViewportContext` so it can power standalone editor surfaces too — the overlay wrapper is a 12-line recipe, not a coupling cost on the primitive.

## Theming

The default look uses theme tokens: `--etui-color-bg-secondary` for the background, `--etui-color-accent-primary` for items and the viewport-rect outline, and `--etui-color-border-default` for the wrapper border. Each can be overridden per-instance:

```tsx
<Minimap
  backgroundColor="#0c0c10"
  defaultItemColor="#7da4ff"
  viewportRectStroke="#7da4ff"
  outsideOverlay="rgba(0, 0, 0, 0.55)"
  {...rest}
/>
```

Individual items can carry their own `color` (overrides `defaultItemColor`).

## Accessibility

- The minimap is focusable (`tabindex=0`); arrow keys pan the main viewport by `keyboardPanStep` of the current viewport's world extent per press. Shift × 5.
- `role="region"` with `aria-label` (default `"Minimap"`, configurable).
- A visually-hidden `aria-live="polite"` region announces panning state for screen readers.
- Disabling the minimap (`disabled`) sets `tabindex=-1` and suppresses all interactions.

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `items` *(required)* | `ReadonlyArray` | — | Items rendered as the content miniature. Discriminated union of rect / circle / line shapes. |
| `worldBounds` *(required)* | `WorldRect` | — | World-space rectangle the minimap maps to. Use computeBoundsFromItems(items, padding?) for an ergonomic default. |
| `transform` *(required)* | `ViewportTransform` | — | Current main-viewport transform ({ x, y, zoom }) — drives the viewport rect overlay. |
| `viewportSize` *(required)* | `ViewportSize` | — | Current main-viewport size in CSS pixels — drives the viewport rect overlay. |
| `onNavigate` | `(info: MinimapNavigateInfo) => void` | — | Called for click, drag, or arrow-key navigation. info.worldPoint is the world point that should sit at the main viewport center; info.phase is one of "click" \| "drag-start" \| "drag" \| "drag-end". |
| `width` | `number` | `200` | Minimap width in CSS pixels. Height is derived from worldBounds aspect ratio and clamped to [minHeight, maxHeight]. |
| `minHeight` | `number` | `60` | Lower bound for the derived height. |
| `maxHeight` | `number` | `200` | Upper bound for the derived height. |
| `interactions` | `MinimapInteractionConfig \| false` | `{ click: true, dragViewportRect: true, dragFromEmpty: true }` | Gesture configuration. Pass false to disable all interactions, or an object to fine-tune individual gestures. |
| `keyboardPanStep` | `number` | `0.1` | Keyboard pan step, as a fraction of the current viewport world extent per arrow-key press. Shift × 5. |
| `backgroundColor` | `string` | — | Override background color. Defaults to the theme --etui-color-bg-secondary. |
| `defaultItemColor` | `string` | — | Default color for items without an explicit color. Defaults to the theme accent. |
| `viewportRectStroke` | `string` | — | Viewport-rect outline color. Defaults to the theme accent. |
| `outsideOverlay` | `string` | `'rgba(0, 0, 0, 0.4)'` | Dimmed shroud color covering the area outside the viewport rect. |
| `disabled` | `boolean` | `false` | Disable interactions and dim the minimap. |
| `ariaLabel` | `string` | `'Minimap'` | Accessible label for the minimap region. |
