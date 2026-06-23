# Minimap
> Shared navigation primitive that renders a miniature of editor content alongside a draggable rectangle mirroring the main viewport's visible region. Designed for NodeGraph, Timeline, and custom 2D editor surfaces.

A compact navigation widget that renders a miniature of editor content and a draggable rectangle reflecting the main viewport's visible region. Built as a shared primitive consumed by `NodeGraph`, `Timeline`, and any custom 2D editor surface that wants overview navigation.

**Live Preview**

## Import

```tsx
import {
  Minimap,
  ViewportMinimap,
  computeBoundsFromItems,
  useMinimapContext,
} from 'entangle-ui';
import type { MinimapItem, MinimapNavigateInfo } from 'entangle-ui';
```

## Two ways to wire it up

`Minimap` is a controlled primitive — pass `transform`, `viewportSize`, and translate `onNavigate.worldPoint` into a `viewport.centerOn(...)` call. `ViewportMinimap` is a compound subcomponent that does this wiring automatically when used inside a `<Viewport>` tree.

### `ViewportMinimap` — for use inside `<Viewport>`

Reads live `transform`/`size` from `useViewportContext()`, positions itself in a corner (or custom anchor), and wires `onNavigate` to the viewport handle's `centerOn`. The 12-line "drop-in overlay" recipe baked into the library.

```tsx
<Viewport ref={viewportRef} responsive>
  <ViewportLayer name="grid" draw={drawGrid} />
  <ViewportWorld>{nodes}</ViewportWorld>

  <ViewportMinimap
    items={items}
    worldBounds={computeBoundsFromItems(items, 40)}
    placement="bottom-right"
    width={240}
  />
</Viewport>
```

`placement` accepts the four corner presets or a custom object — `{ top, right, bottom, left, width, height }`. `responsive` makes the minimap track its wrapper width via `ResizeObserver` so the consumer can drive size from CSS.

### `Minimap` — for use outside `<Viewport>` (sidebars, custom surfaces)

The plain primitive — fully controlled. Useful when the minimap lives in a sidebar, when you're driving a non-Viewport surface, or when you want manual control over the wiring.

```tsx
const viewportRef = useRef<ViewportHandle>(null);
const [transform, setTransform] = useState<ViewportTransform>({ x: 0, y: 0, zoom: 1 });
const [size, setSize] = useState<ViewportSize>({ width: 0, height: 0 });

<Viewport
  ref={viewportRef}
  transform={transform}
  onTransformChange={setTransform}
  responsive
>
  ...
</Viewport>

<Minimap
  items={items}
  worldBounds={computeBoundsFromItems(items, 40)}
  transform={transform}
  viewportSize={size}
  onNavigate={info => viewportRef.current?.centerOn(info.worldPoint)}
/>;
```

## Item shapes

`MinimapItem` is a discriminated union of four primitives. Mix them freely.

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
    }
  | {
      id: string;
      type: 'custom';
      bounds: WorldRect;
      draw: (ctx, info: MinimapDrawInfo) => void;
    };
```

- **`rect`** — node bodies in a NodeGraph, clips on tracks in a Timeline.
- **`circle`** — compact node markers, keyframes.
- **`line`** — edges between nodes, range markers. `lineWidth` is in minimap CSS px and does not scale with world content.
- **`custom`** — caller-drawn shapes. `bounds` (world coords) is used for hover hit-testing; `draw` receives the canvas context and `MinimapDrawInfo` with `worldToMinimap`/`minimapToWorld`/`scale`/`offset` helpers.

 {
      const center = info.worldToMinimap({ x: 350, y: 250 });
      ctx.fillStyle = 'gold';
      drawStar(ctx, center.x, center.y, 5, 10, 4);
    },
  },
];

`}
>

## Slots — title, footer, corners

Pass `<Minimap.Title>`, `<Minimap.Footer>`, and `<Minimap.Corner>` as children to add chrome around (or inside) the minimap body. Any other child becomes a free-form overlay positioned absolutely above the canvas.

  Pipeline overview
  v1.2
  4 nodes
  Drag to navigate · Arrow keys to pan
`}
>

| Subcomponent       | Props                                                                          |
| ------------------ | ------------------------------------------------------------------------------ |
| `<Minimap.Title>`  | `placement?: 'top-outside' \| 'top-inside'` (default `'top-outside'`)          |
| `<Minimap.Footer>` | `placement?: 'bottom-outside' \| 'bottom-inside'` (default `'bottom-outside'`) |
| `<Minimap.Corner>` | `side: 'top-left' \| 'top-right' \| 'bottom-left' \| 'bottom-right'`           |

## Live state — `useMinimapContext`

Children rendered inside a `<Minimap>` (or `<ViewportMinimap>`) can read live hover state, transform, and bounds via `useMinimapContext()`. Use it to build coordinate readouts, "show selected" badges, or zoom-level chips without re-implementing hit-testing.

Hover the minimap…</span>;
  return (
    <span>
      x: {Math.round(hoverWorldPoint.x)} · y: {Math.round(hoverWorldPoint.y)}
      {hoveredItemId && \` · \${hoveredItemId}\`}
    </span>
  );
}

  Hover an item

`}
>

`MinimapContextValue` includes `worldBounds`, `minimapSize`, `transform`, `viewportSize`, `hoverWorldPoint`, `hoverMinimapPoint`, `hoveredItemId`, and `isDragging`.

## `renderOverlay` — global canvas annotations

Pass a `renderOverlay` callback to draw on the canvas after items and before the viewport-rect shroud. Useful for playheads, selection regions, grid overlays, debug markers.

 {
    const p = info.worldToMinimap({ x: playhead, y: 0 });
    ctx.strokeStyle = '#ff3860';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(p.x + 0.5, 0);
    ctx.lineTo(p.x + 0.5, info.minimapSize.height);
    ctx.stroke();
    ctx.fillStyle = '#ff3860';
    ctx.beginPath();
    ctx.arc(p.x + 0.5, 3, 3, 0, Math.PI * 2);
    ctx.fill();
  }}
>
  Playhead via renderOverlay
`}
>

## Sizing

`Minimap` exposes a single `width` prop; height is derived from the `worldBounds` aspect ratio and clamped to `[minHeight, maxHeight]`. `ViewportMinimap` additionally supports a `responsive` prop that tracks the wrapper width via `ResizeObserver` — combine with a custom `placement` object to drive width from CSS.

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

{
  /* Responsive via wrapper width */
}
<ViewportMinimap
  responsive
  placement={{ bottom: 12, left: 12, width: '30%' }}
  {...rest}
/>;
```

  Master timeline
  8000 frames · 4 tracks · 9 clips
`}
>

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
  interactions={{ click: true, dragViewportRect: true, dragFromEmpty: false }}
  {...rest}
/>;

{
  /* Or disable everything for a read-only preview */
}
<Minimap interactions={false} {...rest} />;
```

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

### `Minimap`

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `items` *(required)* | `ReadonlyArray` | — | Items rendered as the content miniature. Discriminated union of rect / circle / line / custom shapes. |
| `worldBounds` *(required)* | `WorldRect` | — | World-space rectangle the minimap maps to. Use computeBoundsFromItems(items, padding?) for an ergonomic default. |
| `transform` *(required)* | `ViewportTransform` | — | Current main-viewport transform ({ x, y, zoom }) — drives the viewport rect overlay. |
| `viewportSize` *(required)* | `ViewportSize` | — | Current main-viewport size in CSS pixels — drives the viewport rect overlay. |
| `onNavigate` | `(info: MinimapNavigateInfo) => void` | — | Called for click, drag, or arrow-key navigation. info.worldPoint is the world point that should sit at the main viewport center; info.phase is one of "click" \| "drag-start" \| "drag" \| "drag-end". |
| `width` | `number` | `200` | Minimap width in CSS pixels. Height is derived from worldBounds aspect ratio and clamped to [minHeight, maxHeight]. |
| `minHeight` | `number` | `60` | Lower bound for the derived height. |
| `maxHeight` | `number` | `200` | Upper bound for the derived height. |
| `interactions` | `MinimapInteractionConfig \| false` | `{ click: true, dragViewportRect: true, dragFromEmpty: true }` | Gesture configuration. Pass false to disable all interactions, or an object to fine-tune individual gestures. |
| `keyboardPanStep` | `number` | `0.1` | Keyboard pan step, as a fraction of the current viewport world extent per arrow-key press. Shift × 5. |
| `renderOverlay` | `(ctx, info: MinimapDrawInfo) => void` | — | Custom canvas drawing pass executed after items and before the viewport-rect shroud + outline. |
| `backgroundColor` | `string` | — | Override background color. Defaults to the theme --etui-color-bg-secondary. |
| `defaultItemColor` | `string` | — | Default color for items without an explicit color. Defaults to the theme accent. |
| `viewportRectStroke` | `string` | — | Viewport-rect outline color. Defaults to the theme accent. |
| `outsideOverlay` | `string` | `'rgba(0, 0, 0, 0.4)'` | Dimmed shroud color covering the area outside the viewport rect. |
| `disabled` | `boolean` | `false` | Disable interactions and dim the minimap. |
| `ariaLabel` | `string` | `'Minimap'` | Accessible label for the minimap region. |
| `children` | `ReactNode` | — | Slot subcomponents (Minimap.Title / Footer / Corner) and/or free-form overlay nodes. |

### `ViewportMinimap`

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `placement` | `'top-left' \| 'top-right' \| 'bottom-left' \| 'bottom-right' \| { top?, right?, bottom?, left?, width?, height? }` | `'bottom-right'` | Anchored position inside the parent . Use a preset or pass an object for custom anchoring. |
| `margin` | `number` | `12` | Distance (CSS px) from the viewport edge when using a preset placement. |
| `responsive` | `boolean` | `false` | When true, the minimap width tracks the wrapper width via ResizeObserver. Wrapper size must be set externally (custom placement / parent CSS). |
| `...rest` | `MinimapProps (except transform / viewportSize)` | — | All other Minimap props pass through. transform and viewportSize are read from useViewportContext(). |
