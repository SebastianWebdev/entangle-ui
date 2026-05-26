---
'entangle-ui': minor
---

Round out `NodeGraph` interaction and node-authoring ergonomics, from a second pass over the demo's friction.

**Interactive edges** — edges are drawn on a canvas, so they used to be inert. They now hit-test against the pointer: hovering paints the hover accent (`useNodeGraphHover().hoveredEdgeId`), clicking selects the edge, and right-clicking reports a `{ kind: 'edge' }` target via `onContextMenu`. A selected edge is removed by Delete like any other selection. Adds the `findEdgeAtPoint` helper and a `removeEdges` action on `useNodeGraph`.

**Reconnect & detach** — grab an existing edge near one of its endpoints and drag it: drop on a valid port to move that endpoint, or drop on empty space to detach (delete) the edge. The fixed end stays anchored and the dragged end runs through `isValidConnection`; the edge being re-dragged is hidden from the edge layer so only the preview shows. A click on an endpoint (no drag) selects the edge instead, so a click never deletes a wire. Built in — no new props.

**Colourable minimap mini-nodes** — `<NodeGraph.Minimap>` gains a `nodeStyle` prop. Return `{ color }` to tint a node's rect, or `{ color, headerColor }` to draw a two-tone "header strip + body" mini-node that mirrors the real node at a glance. Selection tint still wins.

**Collapsible node sections** — `<NodeGraph.NodeSection>` is a collapsible section inside a node body for hiding advanced / overflow pins. The collapse is purely visual: children never unmount (state preserved, no remount cost), and `<NodeGraph.Port>` slots inside a collapsed section unregister their position so the pins' edges hide with them and snap back on expand — no dangling wires. Controlled or uncontrolled (`collapsed` / `defaultCollapsed` / `onCollapsedChange`); `collapsible={false}` gives a static labelled group.
