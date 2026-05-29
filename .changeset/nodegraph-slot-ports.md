---
'entangle-ui': minor
---

**Breaking:** redesign `NodeGraph` port API to slot-based composition.

Connection endpoints are now declared inline inside the node body via a new
`<NodeGraph.Port>` compound, not as a data field on the node. The library
measures the slot's DOM position and registers it as the anchor for any
edge that references the port id — the same DOM element the user clicks
is the exact point edges connect to, eliminating the previous "fake label
dot + outer port handle" double rendering.

**New**

- `<NodeGraph.Port id side dataType>` — slot rendered anywhere inside
  `renderNode`. Mounts an inline `<span>` (default UE-style 12 px circle
  / exec triangle), measures its center on mount + every layout shift,
  feeds the position to the store, and wires connection-drag pointer
  events. Pass `children` to replace the default chrome — `data-port-*`
  attributes carry the live state (`source` / `candidate` / `invalid` /
  `hovered`) for consumer CSS.
- Hover state is now actually wired: `<NodeGraph.Port>` emits
  `hoveredPort` on enter/leave; `NodeGraphNodeView` emits `hoveredNodeId`.
  Previously these fields existed on `NodeGraphHoverState` but no code
  dispatched them, so `ctx.hovered` / `ctx.isHovered` were always
  `false`.
- Node auto-sizing: when `node.width`/`height` are omitted, the library
  reads the rendered DOM size for hit-testing, marquee, fitToContent,
  and minimap geometry. Override per-node by setting `width`/`height`
  explicitly.
- `NodeGraphConnectionValidationInfo` now exposes `sourceDataType` and
  `targetDataType` populated from the registered slot metadata — no
  consumer-side port index needed for type-matched validation.
- `NodeGraphStore` adds two new slices with subscribe/get APIs:
  `portPositions` (`getPortPosition`, `setPortPosition`,
  `removePortPosition`, `subscribePortPositions`) and `measuredSizes`
  (`getMeasuredSize`, `setMeasuredSize`, `clearMeasuredSize`,
  `subscribeMeasuredSizes`). Both auto-GC on `setData` when the
  corresponding node is removed.

**Removed**

- `NodeGraphNode.ports` field. Declare ports as `<NodeGraph.Port>`
  children inside `renderNode` instead.
- `NodeGraphPort` type, `NodeGraphRenderPort`, `NodeGraphPortRenderCtx`,
  and the `renderPort` prop. Replaced by the slot — `children` of
  `<NodeGraph.Port>` are the consumer-supplied visual.
- `resolvePortOffsets` and the offset-based `getPortPosition` math
  helpers. Port positions are now DOM-measured.

**Migration**

```diff
- const nodes = [{
-   id: 'a', position: { x: 0, y: 0 },
-   ports: [
-     { id: 'in', side: 'left', dataType: 'exec', offset: 0.3 },
-     { id: 'out', side: 'right', dataType: 'float' },
-   ],
- }];

- <NodeGraph
-   nodes={nodes}
-   renderPort={(port, node, ctx) => <MyPin port={port} ctx={ctx} />}
- />

+ const nodes = [{ id: 'a', position: { x: 0, y: 0 } }];

+ <NodeGraph
+   nodes={nodes}
+   renderNode={(node, ctx) => (
+     <MyBody>
+       <Row>
+         <NodeGraph.Port id="in" side="left" dataType="exec" />
+         Execute
+       </Row>
+       <Row reverse>
+         Result
+         <NodeGraph.Port id="out" side="right" dataType="float" />
+       </Row>
+     </MyBody>
+   )}
+ />
```

`NodeGraphEdge` shape is unchanged (`{ id, source: { node, port }, target }`).
