# NodeGraph

> Data-driven node editor surface — ports, Bézier edges, multi-select, drag, marquee, snap-to-grid, connection validation, keyboard nav, groups, a minimap slot, a toolbar slot, a spawn palette, and an imperative camera handle. Composes the Viewport primitive.

`NodeGraph` is the flagship editor surface — a controlled-or-uncontrolled, data-driven node editor with ports, Bézier edges, multi-selection, drag, marquee, snap-to-grid, connection validation, keyboard navigation, a context-menu event, optional groups, a minimap slot, a corner toolbar slot, and a fuzzy-search spawn palette. It composes `Viewport` for pan/zoom + canvas layers, so all of `Viewport`'s gesture, accessibility, and performance work is inherited for free.

This page documents every export: the component and its slot/part compounds, the `useNodeGraph` hook, the store-slice subscription hooks, the imperative handle, the validator factory, and the pure helpers — each with a live preview where one helps.

 (

        {node.data.pins.map(pin => (

        ))}

  )}
  edgeStyle={(edge, ctx) => ({ color: TYPE_COLOR[ctx.sourcePort?.dataType] })}
  isValidConnection={createTypeMatchValidator()}
  snapToGrid={8}
  minZoom={0.2}
  maxZoom={2.5}
  responsive
>

`}
>

## Import

```tsx
import {
  NodeGraph, // the component + all compound parts (NodeGraph.Port, etc.)
  useNodeGraph, // state container + mutations
  useNodeGraphData, // store-slice hooks for advanced consumers
  useNodeGraphSelection,
  useNodeGraphInteraction,
  useNodeGraphHover,
  useNodeGraphStore,
  createTypeMatchValidator, // ready-made isValidConnection
  // Pure helpers (exported for custom call sites):
  duplicateNodes,
  edgesConnectedToPort,
  applyCascadeDelete,
  generateNodeId,
  generateEdgeId,
} from 'entangle-ui';

import type {
  NodeGraphNode,
  NodeGraphEdge,
  NodeGraphGroup,
  NodeGraphSelection,
  NodeGraphPortRef,
  NodeGraphHandle,
  NodeGraphTarget,
  NodeGraphContextMenuInfo,
  NodeGraphConnectEndInfo,
  NodeGraphEdgeStyleFn,
  NodeGraphTemplate,
} from 'entangle-ui';
```

## Mental model

Three ideas explain the whole component:

1. **It is data, not a tree.** You hand `NodeGraph` a `nodes` array and an `edges` array. There is no imperative "add node" / "draw edge" API on the surface itself — every mutation comes back to you as the **full next array** through an `onChange` prop, and you assign it to your state. That makes the integration with `useState`, Redux, Zustand, or Jotai a one-liner.
2. **Ports are declared in the DOM, measured by the library.** You don't compute pin offsets. You render a `<NodeGraph.Port id side>` slot wherever you want a socket inside `renderNode`; the library measures that element's centre and anchors any edge referencing it there. Move/resize/relayout the node and the edges follow live.
3. **It composes `Viewport`.** Pan, zoom, the world/screen coordinate system, the multi-layer canvas, marquee selection, and the accessibility scaffold all come from [`Viewport`](/components/primitives/viewport/). Nodes are HTML in `ViewportWorld`; edges, groups, the background, and the connection preview are each drawn on their own perf-isolated `ViewportLayer` canvas.

## Quick start

A graph is a `nodes` array plus an `edges` array. Each node has a `position` (world units) and a `data` payload of your choice. Declare connection endpoints by rendering `<NodeGraph.Port>` slots **inside** `renderNode` — the library measures their DOM position and anchors edges there automatically. No `ports` array, no offsets to compute.

 (
    <div className="my-node">
      {node.data.ports.map(p =>
        p.side === 'left'
          ?
          :
      )}
    </div>
  )}
>

`}
>

Every change emits the **full** next array — no patches, no reducers. Assign it and you're done.

## Controlled, uncontrolled, or via the hook

Each of the four data dimensions — `nodes`, `edges`, `groups`, `selection` — is independently:

- **Controlled** — pass the value prop + its `onChange` (`nodes` + `onNodesChange`).
- **Uncontrolled** — pass the `default*` prop and let the component own the state (`defaultNodes`).
- **Owned by `useNodeGraph`** — the hook holds all four states and gives you a `bind` object that spreads the four controlled props in one shot, plus the mutations every editor re-implements. See [`useNodeGraph`](#usenodegraph--state--actions).

You can mix modes — e.g. control `nodes`/`edges` from your store but leave `selection` uncontrolled.

## Data model

```ts
interface NodeGraphNode {
  id: string;
  position: { x: number; y: number }; // world coordinates (top-left of the body)
  // Override the auto-measured size. When omitted, the library measures the
  // rendered node body and uses that for hit-testing / marquee / minimap / fit.
  width?: number;
  height?: number;
  data?: unknown; // arbitrary consumer payload (passed to renderNode)
  draggable?: boolean; // default true — false keeps it selectable but pinned
  selectable?: boolean; // default true — false makes clicks pass through
}

interface NodeGraphEdge {
  id: string;
  source: { node: string; port: string };
  target: { node: string; port: string };
  data?: unknown;
  label?: React.ReactNode; // HTML overlay at the edge midpoint (or use renderEdgeLabel)
  color?: string; // default stroke colour (selected/hovered still win)
}

interface NodeGraphGroup {
  id: string;
  bounds: { x: number; y: number; width: number; height: number };
  label?: string;
  color?: string; // tints both the backdrop fill and the outline
}

interface NodeGraphSelection {
  nodes: string[];
  edges: string[];
  groups: string[];
}
```

## Rendering nodes

Pass `renderNode={(node, ctx) => ...}` to control the body, and drop `<NodeGraph.Port>` slots anywhere inside the returned tree to declare connection endpoints. The slot is the **single source of truth** for both the visual handle and the geometry endpoint of the edge — the same DOM element the user clicks is the anchor the edge connects to.

The render context carries live status — `selected`, `dragging`, `hovered`, and the current `zoom` (useful for level-of-detail swaps when zoomed out):

```tsx
interface NodeGraphRenderCtx {
  selected: boolean;
  dragging: boolean;
  hovered: boolean;
  zoom: number;
}
```

You can author the body from scratch with plain elements (as in the quick start above), but the library ships a family of node-part compounds that already solve the panel chrome, the header strip, the two-column pin layout, and collapsible sections — so most nodes are pure data.

  } />

`}
>

### Node-part compounds

| Compound                  | Role                                                                                                                                                                                                                                                                                                                                                         |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `<NodeGraph.NodeBody>`    | Themed panel wrapper. Reads `selected` / `hovered` from the store per-node (no `ctx` threading). `accent` sets the selected border + glow; `variant` is `'panel' \| 'flat' \| 'minimal'`. Override `selected` / `hovered` to drive the visual from your own state machine.                                                                                   |
| `<NodeGraph.NodeHeader>`  | Title / subtitle / icon strip. Pass `background` to override the gradient, or `children` to take over the layout.                                                                                                                                                                                                                                            |
| `<NodeGraph.PinList>`     | Two-column grid. Children are routed left/right by each child's `side`; non-pin children fall into a centered "loose" slot below the columns (drop inline editors there). `columnGap` defaults to 16.                                                                                                                                                        |
| `<NodeGraph.PinRow>`      | A single labelled row. `side` justifies the row so the handle hugs the node edge. Layout-only — pin geometry still comes from the slot's measured DOM position.                                                                                                                                                                                              |
| `<NodeGraph.Pin>`         | The "handle + label" one-liner: a `PinRow` containing a `Port` and a label, ordered by `side`. Auto-fills from the edges. Reach for `PinRow` + `Port` only for layouts this doesn't cover.                                                                                                                                                                   |
| `<NodeGraph.NodeSection>` | Collapsible section for advanced / overflow pins. **Purely visual** — children never unmount (state preserved, no remount). Ports inside a collapsed section unregister so their edges hide and snap back on expand. Controlled (`collapsed` + `onCollapsedChange`) or uncontrolled (`defaultCollapsed`); `collapsible={false}` for a static labelled group. |

### `<NodeGraph.Port>`

The compound slot that registers a connection endpoint for the current node. The library:

- Measures the slot's DOM position on mount and on every layout shift (`ResizeObserver` + per-node layout-version subscription).
- Routes the slot's pointer events through the shared connection-drag controller — drag from one port to another to create an edge.
- Renders a **built-in typed handle** from `shape` + `color` when no `children` are supplied — no per-pin SVG to hand-roll.
- **Auto-fills while connected.** The handle fills when any edge references the port and stays hollow otherwise; the library derives this from the edges, so there's no consumer-side "which ports are wired" bookkeeping.
- Tracks per-port visual state and exposes it on `data-port-*` attributes so consumer CSS can style based on state.

| Prop                | Type                                              | Description                                                                                                 |
| ------------------- | ------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| `id`                | `string`                                          | Stable identity within the node — referenced by `NodeGraphEdge.source` / `.target`.                         |
| `side`              | `'left' \| 'right' \| 'top' \| 'bottom'`          | Which side the port anchors to. Determines the Bézier tangent direction.                                    |
| `dataType`          | `string?`                                         | Opaque type token forwarded to `isValidConnection` and exposed on `data-port-data-type`.                    |
| `shape`             | `'circle' \| 'triangle' \| 'diamond' \| 'square'` | Built-in handle shape. `'triangle'` is the UE exec/flow arrow. Default `'circle'`. Ignored with `children`. |
| `color`             | `string?`                                         | Handle colour for the built-in visual. Defaults to the theme focus colour; drag states still override it.   |
| `filled`            | `boolean?`                                        | Force the handle filled / hollow. Omit to fill automatically while connected.                               |
| `children`          | `ReactNode?`                                      | Replace the built-in visual entirely. The slot wrapper still carries pointer events + ARIA.                 |
| `label`             | `string?`                                         | Accessible label. Falls back to `${side} port ${id}`.                                                       |
| `className`/`style` | —                                                 | Forwarded to the slot wrapper.                                                                              |

The slot renders inline (`display: inline-flex`), so dropping it next to a label sits the handle right beside the text. Hover scaling uses `transform-origin: center` — the port's center (and therefore the edge endpoint) stays put.

```tsx
// Typed handles with zero custom SVG — and they fill themselves once wired.
<NodeGraph.Port id="exec" side="left" shape="triangle" color="#f8f8f8" />
<NodeGraph.Port id="value" side="right" dataType="float" color="#9ee65a" />
```

**Styling from port state.** Each port mirrors its live state onto data attributes you can target from CSS without touching React: `data-port-source`, `data-port-candidate`, `data-port-invalid`, `data-port-hovered`, `data-port-connected`, plus the static `data-port-side` and `data-port-data-type`.

### `<NodeGraph.PortVisual>`

The handle shape on its own, exported for fully custom port bodies (e.g. a coloured ring beside a typed label inside your own `children`). It paints with `currentColor` unless `color` is set.

```tsx
<NodeGraph.PortVisual shape="diamond" color="#9c7df0" filled size={14} />
```

## Connections

Connection drags start on a port pointer-down and end on pointer-up. While the drag is in flight, the source port is highlighted, a Bézier follows the cursor, and any port under the cursor is treated as a candidate. Drop on a valid port to create an edge; drop on empty space (or an invalid candidate) cancels.

### Validating connections

`isValidConnection` is called continuously during the drag and once at drop. Return `false` to mark the current candidate invalid (preview goes dashed + red) and to refuse the drop. The `info` object carries everything needed to validate without a consumer-side port index — `sourceDataType` / `targetDataType` come straight from the `<NodeGraph.Port dataType="…">` slots.

```tsx
interface NodeGraphConnectionValidationInfo {
  sameNode: boolean; // source and target are on the same node
  sideCombo: string; // e.g. 'right->left'
  sourceDataType?: string;
  targetDataType?: string;
}

<NodeGraph
  isValidConnection={(source, target, info) => {
    if (info.sameNode) return false; // no self-loops
    if (info.sideCombo !== 'right->left') return false; // outputs → inputs only
    const src = info.sourceDataType;
    const tgt = info.targetDataType;
    if (!src || !tgt) return true; // untyped ports accept anything
    return src === tgt || src === 'any' || tgt === 'any';
  }}
/>;
```

With no validator supplied, the library still refuses **same-node** connections by default. Pass an explicit validator (`() => true`) to opt back in.

#### `createTypeMatchValidator`

For the common "match `dataType`, in an allowed direction" rule, reach for the factory instead of re-writing the closure:

```tsx
// Defaults: both horizontal directions, 'any' connects to anything, untyped
// ports accept anything, same-node refused.
const isValidConnection = useMemo(() => createTypeMatchValidator(), []);

// Output→input only, with a custom subtype rule:
const strict = createTypeMatchValidator({
  directions: ['right->left'],
  match: (src, tgt) => src === tgt || (src === 'int' && tgt === 'float'),
});
```

| Option          | Type                      | Default                          | Description                                   |
| --------------- | ------------------------- | -------------------------------- | --------------------------------------------- |
| `directions`    | `ReadonlyArray<string>`   | `['right->left', 'left->right']` | Allowed `sideCombo` values.                   |
| `anyType`       | `string`                  | `'any'`                          | A `dataType` token that connects to anything. |
| `allowSameNode` | `boolean`                 | `false`                          | Permit connecting two ports on the same node. |
| `match`         | `(src?, tgt?) => boolean` | equality + `anyType` + untyped   | Replace the type-comparison rule entirely.    |

### `onConnectStart` / `onConnectEnd`

For undo grouping, telemetry, or custom drop animations. `onConnectEnd` also reports the **drop point** — `worldPoint` and `screenPoint` (CSS px relative to the viewport). A drop on empty space (`cancelled` + `target === null`) is the hook for "drag a wire onto the canvas → open a create-node menu → wire the new node up":

```tsx
const [dropAt, setDropAt] = useState(null);

<NodeGraph
  onConnectStart={({ source, worldPoint }) => {
    /* started */
  }}
  onConnectEnd={info => {
    if (info.cancelled && info.target === null) {
      setDropAt({
        source: info.source,
        world: info.worldPoint,
        screen: info.screenPoint,
      });
    }
  }}
/>;

// Render a menu anchored at dropAt.screen; on pick:
const id = addNode({ position: dropAt.world, data });
connect(dropAt.source, { node: id, port: 'in' }); // wire it straight up
```

### Reconnecting & detaching edges

Grab an existing edge **near one of its endpoints** and drag it: drop on another valid port to move that endpoint, or drop on empty space to detach (delete) the edge. The other end stays anchored and the dragged end runs through the same `isValidConnection` check as a fresh connection. Grabbing the edge **body** (away from the endpoints) selects it instead — so a plain click never deletes a wire. No extra props: the gesture is built in and emits the result through `onEdgesChange` (and `onConnectEnd`).

## Edges & styling

By default an edge is a theme-coloured Bézier; selected and hovered edges pick up the accent and a thicker stroke. There are three levels of control over the look, from cheapest to most flexible:

1. **`edge.color`** — a static per-edge stroke colour. Selected/hovered states still win so interaction stays visible.
2. **`edgeStyle`** — a per-edge callback run on every draw frame. Return `{ color, width, dash }`; any field left `undefined` falls back to `edge.color` / theme defaults. The second argument carries resolved port metadata (`sourcePort` / `targetPort` with `side` + `dataType`) so you can colour wires by their source pin's type without maintaining a parallel index.
3. **`renderEdgeLabel`** — an HTML overlay node at the edge midpoint (overrides `edge.label`).

```tsx
type NodeGraphEdgeStyle = {
  color?: string;
  width?: number; // screen pixels
  dash?: ReadonlyArray<number> | null; // e.g. [8, 6]; null/omit = solid
};

<NodeGraph
  edgeStyle={(edge, ctx) => ({
    color: TYPE_COLOR[ctx.sourcePort?.dataType ?? 'any'],
    width: ctx.selected ? 3 : ctx.hovered ? 2.2 : 1.5,
  })}
  renderEdgeLabel={edge => <Chip>{edge.data.kind}</Chip>}
/>;
```

`edgeStyle` is called per edge per frame and the library memoizes nothing — keep it a map lookup / ternary. Because it runs on every redraw, you can animate any time-based style by pairing it with a `requestAnimationFrame` loop that calls `ref.invalidate('edges')`:

```tsx
const ref = useRef<NodeGraphHandle>(null);

const edgeStyle = (edge: NodeGraphEdge, ctx: NodeGraphEdgeStyleCtx) => {
  const type = ctx.sourcePort?.dataType ?? 'any';
  const style: NodeGraphEdgeStyle = { color: TYPE_COLOR[type] };
  if (edge.data?.async) style.dash = [7, 6]; // a static dashed wire
  if (edge.data?.active) {
    style.color = '#ffd24a';
    style.width = 2 + (Math.sin(performance.now() / 180) + 1) * 1.1; // pulse
  }
  if (ctx.selected) style.width = Math.max(style.width ?? 0, 3.2);
  return style;
};

// Redraw the edge layer every frame so the time-based pulse advances —
// one canvas layer, no React re-render.
useEffect(() => {
  let raf = 0;
  const loop = () => {
    ref.current?.invalidate('edges');
    raf = requestAnimationFrame(loop);
  };
  raf = requestAnimationFrame(loop);
  return () => cancelAnimationFrame(raf);
}, []);
```

 ({
    color: TYPE_COLOR[ctx.sourcePort?.dataType ?? 'any'],
    width: ctx.selected ? 3.2 : ctx.hovered ? 2.2 : 1.5,
    dash: edge.data?.async ? [7, 6] : null,
  })}
  renderEdgeLabel={edge => {edge.data.label}}
>

`}
>

## Selection

Selection is a tri-list of ids: `{ nodes, edges, groups }`. It's controlled-or-uncontrolled like every other piece of data.

| Gesture                | Effect                                            |
| ---------------------- | ------------------------------------------------- |
| Click a node           | Replace selection with that node                  |
| Click an edge          | Select that edge (edges hit-test on the canvas)   |
| Shift/Cmd/Ctrl + click | Toggle that node / edge in the existing selection |
| Drag on empty space    | Marquee; selects nodes intersecting the rect      |
| Shift + marquee        | Additive marquee — union with current selection   |
| Escape                 | Clear selection (or cancel a connection drag)     |
| Cmd/Ctrl + A           | Select all nodes                                  |

The `selectionRect` prop toggles the marquee gesture; it defaults to `true`. Set it to `false` to disable the rectangle entirely.

Edges are drawn on a canvas (no DOM), so the library hit-tests them against the pointer: hovering an edge sets the hover slice (`useNodeGraphHover().hoveredEdgeId`) and paints the hover accent, clicking selects it, and right-clicking reports a `{ kind: 'edge' }` target via `onContextMenu`. A selected edge is removed by <kbd>Delete</kbd> like any other selection. Marquee commits are scheduled with React's `useTransition` so releasing a large selection doesn't hitch.

## Keyboard

| Keys                   | Action                                                       |
| ---------------------- | ------------------------------------------------------------ |
| `←` `↑` `↓` `→`        | Nudge selected nodes by one grid step (or 1 world unit)      |
| `Shift` + arrows       | Nudge by 10× the base step                                   |
| `Delete` / `Backspace` | Emit `onDelete(selection)` — the consumer applies the change |
| `Enter`                | Emit `onActivate(node)` when exactly one node is selected    |
| `Cmd/Ctrl + A`         | Select all nodes                                             |
| `Esc`                  | Cancel an in-flight connection, otherwise clear selection    |

Focus inside an editable element (e.g. an `<input>` in a custom node body) bypasses the graph's keyboard handler — typing in nodes works as expected.

If you omit `onDelete`, the library **cascade-deletes** the selection itself: it removes the selected nodes, drops every edge whose endpoint is gone (or that's selected), and drops selected groups — eliminating the classic "orphan edge dangling off a deleted node" bug. Supply `onDelete` to take over (snapshot for undo, confirm, log); reuse the same logic with the exported `applyCascadeDelete` helper.

## Snap to grid

Pass `snapToGrid={N}` (world units) to snap drag movements and keyboard nudges to the nearest `N`. Pass `snapToGrid={false}` (the default) to disable.

```tsx
<NodeGraph snapToGrid={20} />
```

## Groups

Groups are visual backdrop rectangles drawn under nodes — labelled regions for organising a graph. A group's `bounds`, `label`, and `color` are part of your `groups` state. The library ships the full interaction:

- **Drag the body** to move the group; nodes fully contained in the group ride along.
- **Drag the handles** to resize (down to a `MIN_GROUP_SIZE` floor).
- **Click the label** to rename inline, or the swatch to recolour — both commit through `onGroupsChange`.
- Right-clicking a group reports a `{ kind: 'group' }` target and pings the spawn palette (group is a natural "add a node here" spot).

Create and remove them with the `useNodeGraph` actions (`addGroup` / `removeGroups`) or by editing the `groups` array directly.

## Slots

`NodeGraph` discovers its slot children by a unique `Symbol` marker (`NODE_GRAPH_SLOT`), not by `displayName` — so they survive `React.memo`, minification, and HOC wrapping. Drop them as children of `<NodeGraph>` in any order.

### `<NodeGraph.Background />`

Optional canvas background with a `'dots'` or `'grid'` pattern that adapts to the viewport zoom. The renderer uses a level-of-detail step plus a cached pattern-fill, so the per-frame cost stays bounded no matter how far you zoom out.

```tsx
<NodeGraph.Background variant="dots" gap={24} />
```

| Prop         | Type                         | Default            | Description                           |
| ------------ | ---------------------------- | ------------------ | ------------------------------------- |
| `variant`    | `'dots' \| 'grid' \| 'none'` | `'dots'`           | Pattern style (`'none'` = fill only). |
| `gap`        | `number`                     | `24`               | Grid spacing in world units.          |
| `color`      | `string?`                    | theme border       | Dot / line colour.                    |
| `background` | `string?`                    | theme bg-secondary | Background fill colour.               |

### `<NodeGraph.Minimap />`

A pre-wired minimap overlay anchored to a corner (or a custom anchor object). Reads the live node list from the store, tints selected nodes via `selectedColor`, and supports per-node colouring through `nodeStyle` — return `{ color }` for a tinted rect, or `{ color, headerColor }` for a two-tone "header strip + body" mini-node that mirrors the real node.

```tsx
<NodeGraph.Minimap
  placement="bottom-right"
  width={220}
  title="Graph Overview"
  nodeStyle={node => ({
    color: 'rgba(38, 42, 54, 0.92)', // body
    headerColor: CATEGORY_COLOR[node.data.category], // header strip
  })}
/>
```

| Prop            | Type                                                                 | Default          | Description                                   |
| --------------- | -------------------------------------------------------------------- | ---------------- | --------------------------------------------- |
| `placement`     | corner preset \| `{ top?, right?, bottom?, left?, width?, height? }` | `'bottom-right'` | Anchored position inside the graph.           |
| `margin`        | `number`                                                             | `12`             | Edge distance (CSS px) for preset placements. |
| `width`         | `number`                                                             | `200`            | Minimap width in CSS px.                      |
| `title`         | `ReactNode?`                                                         | —                | Rendered as `<Minimap.Title>`.                |
| `selectedColor` | `string?`                                                            | —                | Highlight colour for selected nodes.          |
| `nodeStyle`     | `(node) => { color?, headerColor? }`                                 | —                | Per-node colouring.                           |

See the dedicated [`Minimap`](/components/editor/minimap/) page for the underlying primitive.

## Toolbar

`<NodeGraph.Toolbar>` mounts a button cluster in a corner of the viewport overlay — it sits above the graph but ignores pan/zoom, and swallows its own pointer events so clicks don't start a marquee. The library ships ready-made buttons that drive the camera; mix in your own `<Button>`s freely.

| Part                             | Action                                                            |
| -------------------------------- | ----------------------------------------------------------------- |
| `<NodeGraph.FitContentButton>`   | Fit all nodes (`padding?`, default 32).                           |
| `<NodeGraph.FitSelectionButton>` | Fit selected nodes; auto-disabled when nothing is selected.       |
| `<NodeGraph.ZoomInButton>`       | Zoom in by `factor` (default 1.25×), anchored at viewport centre. |
| `<NodeGraph.ZoomOutButton>`      | Zoom out by `factor`.                                             |
| `<NodeGraph.ResetZoomButton>`    | Reset to 1× centred on the world origin.                          |
| `<NodeGraph.ToolbarSeparator>`   | A 1px divider between button groups.                              |

`<NodeGraph.Toolbar>` itself takes `placement` (`'top-left'` default, plus the other three corners), `margin`, and `gap`. The action buttons share a common prop set: `label`, `icon`, `size`, `variant`, `className`, `style`, `title`.

(null);

 ref.current?.focusNode('event')}>Focus: Event
 ref.current?.centerOn({ x: 0, y: 0 }, 1)}>Center origin
 ref.current?.zoomToRect({ x: 40, y: -260, width: 720, height: 380 })}>
  Frame region
`}
>

## Spawn palette

`<NodeGraph.SpawnPalette>` mounts a portal-rendered fuzzy-search palette (built on `CommandPalette`) and subscribes to the store's spawn-request channel — so right-clicking empty space or a group opens it automatically at the pointer, no context-menu state to thread through React. You register `templates`; each template's `build(worldPoint)` returns the node body minus its `id`, the library assigns a unique id, and hands the finished node to `onSpawn`.

```ts
interface NodeGraphTemplate {
  id: string;
  title: string;
  subtitle?: string;
  group?: string; // sections the palette list
  keywords?: ReadonlyArray<string>; // extra fuzzy-match terms
  icon?: React.ReactNode;
  build: (worldPoint: Point2D) => Omit<NodeGraphNode, 'id'>;
}
```

 ({
      position: snap(world),
      data: { title: 'Branch', pins: [/* ... */] },
    }),
  },
  // ...
];

   {
      graph.setNodes(prev => [...prev, node]);
      graph.setSelection({ nodes: [node.id], edges: [], groups: [] });
    }}
  />
`}
>

| Prop          | Type                                         | Default           | Description                                  |
| ------------- | -------------------------------------------- | ----------------- | -------------------------------------------- |
| `templates`   | `ReadonlyArray<NodeGraphTemplate>`           | —                 | Spawn-able templates; filtering is internal. |
| `onSpawn`     | `(node, ctx: NodeGraphSpawnContext) => void` | —                 | Fired on pick (id already assigned).         |
| `placeholder` | `string?`                                    | `'Search nodes…'` | Search input placeholder.                    |
| `recentKey`   | `string?`                                    | —                 | `localStorage` key for the recent list.      |
| `width`       | `number \| string`                           | `400`             | Popover width.                               |
| `maxHeight`   | `number`                                     | `360`             | Popover max height.                          |

## Context menu

`NodeGraph` doesn't ship a built-in menu component — it emits a structured event so you can drop in any popover / [`<ContextMenu>`](/components/navigation/context-menu/) / `<Menu>` / custom UI. The `target` is a discriminated union, so a right-click on a node renders different items than one on the background.

```tsx
type NodeGraphTarget =
  | { kind: 'node'; id: string }
  | { kind: 'edge'; id: string }
  | { kind: 'port'; node: string; port: string }
  | { kind: 'group'; id: string }
  | { kind: 'empty'; worldPoint: Point2D };

<NodeGraph
  onContextMenu={info => {
    // info.target, info.screenPoint (CSS px), info.worldPoint
    setMenu(info);
  }}
/>;
```

A `port` target carries `{ node, port }`, so a socket gets its own menu — e.g. _Select connected edges_ via `edgesConnectedToPort(edges, target)`, or _Detach all_ via `graph.disconnectPort(node, port)`:

```tsx
if (target.kind === 'port') {
  const ids = edgesConnectedToPort(edges, target);
  return (
    <MenuItem onClick={() => selectEdges(ids)}>Select connected edges</MenuItem>
  );
}
```

The kitchen-sink demo at the top of this page wires the whole thing: a `<ContextMenu>` branches its content on `target.kind` — node/port actions, a spawn menu on empty/group, delete on edges.

## Imperative handle

Pass a `ref` to drive the camera and read the coordinate system. All world/screen conversions and `fitToContent`/`fitToSelection` are inherited from `Viewport`.

```tsx
const ref = useRef<NodeGraphHandle>(null);

ref.current?.fitToContent(32); // pan/zoom so all nodes fit (+padding)
ref.current?.fitToSelection(64); // fit selected nodes (no-op if none)
ref.current?.focusNode('node-id'); // center on one node
ref.current?.centerOn({ x: 0, y: 0 }, 1); // center on a world point, optional zoom
ref.current?.zoomToRect({ x: 0, y: 0, width: 400, height: 200 }); // fit a world rect

const transform = ref.current?.getTransform(); // { x, y, zoom }
const size = ref.current?.getSize(); // { width, height } CSS px
const screen = ref.current?.worldToScreen({ x: 100, y: 50 });
const world = ref.current?.screenToWorld({ x: 100, y: 50 });

ref.current?.invalidate('edges'); // force redraw of one layer ('groups' | 'edges' | 'preview')
ref.current?.invalidate(); // ...or all layers
```

## `useNodeGraph()` — state + actions

`NodeGraph` is controlled, which means the host normally owns four `useState`s and a pile of array filters for add / delete / duplicate. `useNodeGraph` packages all of that: it holds the state and exposes the mutations every editor re-implements, with a `bind` object that spreads the four controlled props in one shot.

```tsx
function Editor() {
  const graph = useNodeGraph({ nodes: initialNodes, edges: initialEdges });
  return (
    <NodeGraph {...graph.bind} renderNode={renderNode}>
      <NodeGraph.Background />
    </NodeGraph>
  );
}
```

| Action                                                 | Effect                                                                             |
| ------------------------------------------------------ | ---------------------------------------------------------------------------------- |
| `addNode(node)`                                        | Append a node (generates an id when omitted). Returns the id.                      |
| `connect(source, target, data?)`                       | Add an edge, de-duped against identical endpoints. Returns the edge id.            |
| `removeNodes(ids)`                                     | Drop nodes, cascade their edges, prune them from the selection.                    |
| `removeEdges(ids)`                                     | Drop edges + prune them from the selection.                                        |
| `disconnectPort(node, port)`                           | Detach every wire on one socket.                                                   |
| `removeSelection()`                                    | Programmatic Delete — cascade + clear selection.                                   |
| `duplicateNodes(ids?, options?)`                       | Clone (defaults to the selection), offset, select the copies. Returns ids.         |
| `addGroup(bounds, { label?, color? })`                 | Append a group. Returns the id.                                                    |
| `removeGroups(ids)`                                    | Drop groups + prune them from the selection.                                       |
| `clearSelection()`                                     | Empty the selection.                                                               |
| `setNodes` / `setEdges` / `setGroups` / `setSelection` | Raw `useState` setters (accept value or updater).                                  |
| `bind`                                                 | `{ nodes, edges, groups, selection, onNodesChange, … }` — spread on `<NodeGraph>`. |

The hook is **uncontrolled by design** — it owns the state. For an external store (Redux / Zustand / Jotai), skip the hook and wire the four `onChange` props yourself; the pure helpers behind the actions are exported for that path (see below).

## Hooks for advanced consumers

Inside the `<NodeGraph>` subtree (e.g., custom node bodies) you can subscribe to specific store slices for fine-grained re-renders — each hook re-renders its component only when that slice changes.

```tsx
function NodeBadge({ nodeId }: { nodeId: string }) {
  // Subscribes ONLY to selection — re-renders only when selection changes.
  const selection = useNodeGraphSelection();
  return <span>{selection.nodes.includes(nodeId) ? 'selected' : 'idle'}</span>;
}
```

| Hook                        | What it subscribes to                                          |
| --------------------------- | -------------------------------------------------------------- |
| `useNodeGraphData()`        | Data slice — nodes / edges / groups / `defaultNodeSize`        |
| `useNodeGraphSelection()`   | Selection slice                                                |
| `useNodeGraphInteraction()` | Active gesture (drag-nodes / connect / marquee / resize-group) |
| `useNodeGraphHover()`       | Hover slice — hovered node / edge / port                       |
| `useNodeGraphStore()`       | Raw store instance — escape hatch for custom slices            |

For custom slices off the raw store, the library's internal `useStoreSlice(subscribe, getSnapshot, selector, isEqual?)` pattern (the same one the node bodies and ports use) avoids a re-render storm during high-frequency updates by memoizing the selection and only re-running the selector when the source reference changes.

## Exported helpers

The pure functions behind the component and the hook are exported for custom call sites (external stores, server-side graph manipulation, tests). None of them touch React.

| Helper                                                          | Purpose                                                                                      |
| --------------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| `applyCascadeDelete(graph, selection)`                          | Remove selected nodes/edges/groups + orphaned edges. Returns same refs when nothing changed. |
| `duplicateNodes(nodes, ids, options?)`                          | Clone + offset nodes (pure — returns only the copies).                                       |
| `edgesConnectedToPort(edges, portRef)`                          | Ids of every edge touching one socket.                                                       |
| `generateNodeId(prefix?)` / `generateEdgeId(src, tgt)`          | Stable id generators used by the hook.                                                       |
| `createTypeMatchValidator(options?)`                            | Build an `isValidConnection` (see above).                                                    |
| `getNodeBox` / `computeNodesBounds`                             | Resolve a node's effective box / the tight bounds of a node list.                            |
| `getBezierControlPoints` / `evaluateBezier`                     | The edge curve math (e.g. to place a label at `t = 0.5`).                                    |
| `findEdgeAtPoint` / `isPointNearBezier`                         | Edge hit-testing (broad-phase + sampled distance).                                           |
| `isPointInNode` / `isPointInRect` / `rectsIntersect`            | Geometry predicates for custom hit-testing.                                                  |
| `resolvePortRef` / `resolveEdgeEndpoints`                       | World-space endpoint resolution from a port lookup.                                          |
| `snapDelta(delta, grid)` / `applyGroupResize(...)`              | Snap + group-resize math.                                                                    |
| `DEFAULT_NODE_WIDTH` / `DEFAULT_NODE_HEIGHT` / `MIN_GROUP_SIZE` | The defaults behind the surface.                                                             |

## Performance

`NodeGraph` is built to stay smooth on large graphs. The architecture does the work:

- **Per-id slice selectors.** Each node body subscribes to a per-id slice; only the node being dragged / selected / hovered re-renders. Same for `<NodeGraph.Port>` slots — during a connection drag only the source + candidate ports re-render, not every port on the canvas.
- **Layer isolation.** Edges, groups, the background, and the connection preview each get their own `<ViewportLayer>` canvas, so per-frame work is per-layer, not global. Invalidations are routed to just the affected layer.
- **Bounded background.** The dot/grid pattern uses a level-of-detail step plus a cached off-screen pattern-fill — a single `fillRect` covers the viewport regardless of how many cells are visible.
- **Idle-free connection drag.** Document listeners attach only while a drag is in flight; move events are `requestAnimationFrame`-coalesced so `elementFromPoint` runs at most once per frame.
- **Cheap edge hit-testing.** `findEdgeAtPoint` does a convex-hull broad-phase rejection before the sampled distance test, keeping hover/click near `O(edges)`.
- **DOM-tracked ports.** Port positions come from the rendered DOM, not from offsets, so edges follow live as bodies grow / shrink / relayout.

The benchmark below stresses two different axes. **Grid** scales the _node_ count — a square grid with one edge per node, loading node rendering, hit-testing, marquee, and the minimap. **Layered net** keeps the node count low but floods the _edge_ layer: a fully-connected stack where every node in a layer wires to every node in the next, so `2·20·50·20·2` is only 94 nodes yet 2080 edges. Toggle the camera orbit to put the renderer under sustained load, watch the live FPS / frame-time meter, and drag / marquee / wheel-zoom to feel the interaction cost yourself.

```tsx
// Grid: a square grid, one edge per node — scales the NODE count.
function buildGrid(count: number) {
  const cols = Math.ceil(Math.sqrt(count));
  const nodes = [];
  const edges = [];
  for (let i = 0; i < count; i++) {
    const col = i % cols;
    const row = Math.floor(i / cols);
    // Explicit width/height → hit-test / marquee / minimap skip measurement.
    nodes.push({
      id: `n${i}`,
      position: { x: col * 210, y: row * 120 },
      width: 132,
      height: 58,
      data,
    });
    if (col > 0)
      edges.push({
        source: { node: `n${i - 1}`, port: 'out' },
        target: { node: `n${i}`, port: 'in' },
      });
  }
  return { nodes, edges };
}

// Layered net: every node in a layer wired to every node in the next — few
// nodes, a flood of EDGES. [2, 20, 50, 20, 2] → 94 nodes, 2080 edges.
function buildLayered(layers: number[]) {
  // place each layer in a column, then for every adjacent pair (a, b):
  //   for (i of a) for (j of b) edges.push({ source: a[i].out, target: b[j].in })
}

// rAF meter: sample the frame delta; optionally orbit the camera so every
// canvas layer redraws each frame (the realistic per-frame cost).
useEffect(() => {
  let raf = 0;
  let last = performance.now();
  let acc = 0;
  let frames = 0;
  const loop = (now: number) => {
    acc += now - last;
    last = now;
    frames += 1;
    if (animate) ref.current?.centerOn(orbitPoint(now));
    if (acc >= 300) {
      setStats({ fps: Math.round((frames * 1000) / acc), ms: acc / frames });
      acc = 0;
      frames = 0;
    }
    raf = requestAnimationFrame(loop);
  };
  raf = requestAnimationFrame(loop);
  return () => cancelAnimationFrame(raf);
}, [animate]);
```

`}
>

:::note
Numbers depend entirely on your machine, browser, and the size given to the surface. Treat the meter as a relative dial for comparing layouts, counts, and toggles on _your_ hardware, not an absolute score. Giving each benchmark node an explicit `width`/`height` lets hit-testing, marquee, and the minimap skip DOM measurement — a meaningful win at scale.
:::

## Accessibility

- The underlying viewport carries `role` + `ariaLabel` (default `'Node graph'`, configurable via `ariaLabel`) and `aria-roledescription="node graph"`.
- Each `<NodeGraph.Port>` is a labelled `role="button"` (`label` prop, falling back to `${side} port ${id}`).
- The keyboard handler is scoped to the graph and yields to focused editable elements, so inputs inside custom node bodies type normally.
- `disabled` removes all interaction and dims the surface.

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `nodes` | `NodeGraphNode[]` | — | Controlled list of nodes. Pair with onNodesChange. Use defaultNodes for uncontrolled mode. |
| `defaultNodes` | `NodeGraphNode[]` | — | Initial nodes when uncontrolled. Ignored if `nodes` is set. |
| `onNodesChange` | `(nodes: NodeGraphNode[]) => void` | — | Fires with the full next nodes array on every mutation (drag, delete, nudge). |
| `edges` | `NodeGraphEdge[]` | — | Controlled list of edges. Pair with onEdgesChange. |
| `defaultEdges` | `NodeGraphEdge[]` | — | Initial edges when uncontrolled. |
| `onEdgesChange` | `(edges: NodeGraphEdge[]) => void` | — | Fires with the full next edges array on connection drop, delete, reconnect. |
| `groups` | `NodeGraphGroup[]` | — | Controlled list of visual group backdrops drawn under nodes. |
| `defaultGroups` | `NodeGraphGroup[]` | — | Initial groups when uncontrolled. |
| `onGroupsChange` | `(groups: NodeGraphGroup[]) => void` | — | Fires with the full next groups array (move, resize, rename, recolour). |
| `selection` | `NodeGraphSelection` | — | Controlled selection { nodes, edges, groups } (arrays of ids). Pair with onSelectionChange. |
| `defaultSelection` | `NodeGraphSelection` | — | Initial selection when uncontrolled. |
| `onSelectionChange` | `(selection: NodeGraphSelection) => void` | — | Fires on click, Shift-click, marquee, Cmd+A, Escape. |
| `renderNode` | `(node, ctx) => React.ReactNode` | — | Render the body of each node. ctx carries selected / dragging / hovered / zoom. Default renders a labelled panel. |
| `renderEdgeLabel` | `(edge: NodeGraphEdge) => React.ReactNode` | — | Render an HTML overlay at each edge midpoint. Overrides edge.label. |
| `edgeStyle` | `NodeGraphEdgeStyleFn` | — | Per-edge style hook run every draw frame. Return { color, width, dash }; ctx carries resolved source/target port side + dataType. Keep it cheap. |
| `isValidConnection` | `(source, target, info) => boolean` | — | Validate a connection drag. Return false to mark the candidate invalid and refuse the drop. With no validator, same-node drops are refused by default. |
| `snapToGrid` | `number \| false` | `false` | Snap drag deltas and keyboard nudges to this world-unit grid step. Pass false to disable. |
| `onConnectStart` | `(info: NodeGraphConnectStartInfo) => void` | — | Fires on port pointer-down (drag start). |
| `onConnectEnd` | `(info: NodeGraphConnectEndInfo) => void` | — | Fires on pointer-up after a connection drag (success or cancel). Carries world + screen drop point. |
| `onContextMenu` | `(info: NodeGraphContextMenuInfo) => void` | — | Fires on right-click. info.target is a discriminated union: node / edge / port / group / empty. |
| `onDelete` | `(selection: NodeGraphSelection) => void` | — | Fires on Delete/Backspace when the selection is non-empty. Omit to let the library cascade-delete. |
| `onActivate` | `(node: NodeGraphNode) => void` | — | Fires on Enter when exactly one node is selected. |
| `pan` | `ViewportPanConfig \| false` | `{ button: 'middle', spaceKey: true }` | Pan gesture configuration, forwarded to the underlying Viewport. |
| `zoom` | `ViewportZoomConfig \| false` | `{ wheel: true, pinch: true, speed: 0.0015 }` | Zoom gesture configuration, forwarded to the underlying Viewport. |
| `minZoom` | `number` | `0.1` | Minimum zoom level. |
| `maxZoom` | `number` | `4` | Maximum zoom level. |
| `selectionRect` | `boolean` | `true` | Enable marquee selection on drag from empty background. |
| `responsive` | `boolean` | `false` | Track parent size via ResizeObserver. When false, uses `height`. |
| `height` | `number` | `480` | Fixed height in CSS pixels when not responsive. |
| `defaultNodeSize` | `{ width: number; height: number }` | `{ width: 180, height: 80 }` | Fallback size used between mount and the first ResizeObserver tick, and when neither node.width/height nor a measured size is available. |
| `disabled` | `boolean` | `false` | Disable all interaction and dim the surface. |
| `ariaLabel` | `string` | `'Node graph'` | Accessible label applied to the underlying viewport. |
| `children` | `React.ReactNode` | — | Slot subcomponents: Background, Minimap, Toolbar, SpawnPalette. |
| `ref` | `React.Ref` | — | Imperative handle (fitToContent, fitToSelection, focusNode, centerOn, zoomToRect, world/screen conversions, invalidate). |
