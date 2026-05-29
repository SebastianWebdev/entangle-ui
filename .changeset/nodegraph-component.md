---
'entangle-ui': minor
---

Add `NodeGraph` component — flagship data-driven node editor surface for building visual programming, signal processing, shader, ML pipeline, and similar interactive graph UIs. Composes the `Viewport` primitive for pan/zoom plus perf-isolated canvas layers, and `Minimap` for the optional overview slot.

**Core component (`<NodeGraph>`)** — fully controlled or uncontrolled across four data dimensions:

- `nodes`, `edges`, `groups`, and `selection` each emit the full next array via dedicated `onXChange` callbacks — no patches, no reducers, plain-`useState` compatible.
- HTML node bodies positioned in world space via `renderNode(node, ctx)`. The render context exposes `selected`, `dragging`, `hovered`, and the current `zoom` for LOD swaps.
- Bézier edges drawn on a perf-isolated canvas layer with control points oriented by port side. Each port resolves its position evenly across its side when no explicit `offset` is set.
- Marquee selection on empty drag, click selects, Shift/Cmd/Ctrl + click toggles, marquee with the additive modifier unions.
- Drag-to-move (single + multi). The clicked node defines the drag set: if it's in the current selection, all selected nodes move together; otherwise just the clicked node. Optional `snapToGrid={N}` snaps drag deltas and keyboard nudges to a world-unit grid.
- Connection drag from a port: live preview Bézier follows the cursor, candidates highlight, `isValidConnection(source, target, info)` rejects invalid drops (preview goes dashed + red). Default policy refuses same-node connections when no validator is supplied.
- `onContextMenu(info)` emits a discriminated `target` (`node` / `edge` / `port` / `group` / `empty`) plus screen / world points — drop in any popover or Menu component as the consumer prefers.
- Visual `groups` rendered as backdrop rectangles with optional labels under nodes and edges.

**Keyboard** — tab-focusable surface with:

| Keys                   | Action                                               |
| ---------------------- | ---------------------------------------------------- |
| `←` `↑` `↓` `→`        | Nudge selected nodes by 1 grid step (or 1 unit)      |
| `Shift` + arrows       | Nudge by 10× step                                    |
| `Delete` / `Backspace` | Emit `onDelete(selection)`                           |
| `Enter`                | Emit `onActivate(node)` for a single selection       |
| `Cmd/Ctrl + A`         | Select all nodes                                     |
| `Esc`                  | Cancel an in-flight connection, else clear selection |

Focus inside editable descendants (`<input>`, `<textarea>`, `contentEditable`) bypasses the graph handler so typing in custom node bodies works as expected.

**Slot subcomponents** identified by a unique Symbol marker (`NODE_GRAPH_SLOT`) so they survive `React.memo`, HOCs, and minification:

- `<NodeGraph.Background variant="dots" | "grid" gap={...} />` — adaptive background canvas layer.
- `<NodeGraph.Minimap placement={...} width={...} title={...} />` — pre-wired overview, mirrors nodes into rect items, wires `centerOn` automatically.

**Imperative handle** (`NodeGraphHandle`):

- `fitToContent(padding?)`, `fitToSelection(padding?)`, `focusNode(id)`
- Viewport delegation: `centerOn`, `zoomToRect`, `getTransform`, `getSize`, `worldToScreen`, `screenToWorld`, `invalidate(layerName?)`

**Slice subscription hooks** for advanced consumers inside the `<NodeGraph>` subtree — `useNodeGraphData`, `useNodeGraphSelection`, `useNodeGraphInteraction`, `useNodeGraphHover`, and the raw `useNodeGraphStore` escape hatch. Hot-path state (drag deltas, connection preview, hover, marquee) lives in a class-based store consumed via `useSyncExternalStore` with shallow-equal no-op guards — each node body only re-renders when its own state changes, and canvas layers are invalidated independently per slice.

**Helpers exported**:

- `computeNodeGraphBounds`, `getNodeBox`, `getPortPosition`, `getBezierControlPoints`, `evaluateBezier`, `isPointNearBezier`, `resolvePortRef`, `resolveEdgeEndpoints`, `sideVector`, `snapDelta` — the same math used internally.

Ships with a comprehensive docs page including a multi-node signal-processing demo, the data model, connection validation recipes, slot integrations, keyboard shortcuts, and the full props table.
