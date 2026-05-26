---
'entangle-ui': minor
---

Add out-of-the-box defaults and ergonomics helpers for `NodeGraph`, so consumers stop re-implementing the same boilerplate the demo used to carry.

**Typed port handles + auto-connected state** — `<NodeGraph.Port>` now renders a built-in handle from `shape` (`'circle' | 'triangle' | 'diamond' | 'square'`) and `color` props when no `children` are supplied, so the common "coloured ring for data pins, exec arrow for flow pins" no longer needs a hand-rolled SVG. The handle fills automatically while the port is referenced by an edge (the library derives the connected set in the store and exposes it via `data-port-connected`), removing the consumer-side "which ports are wired" index. The shape is also exported standalone as `<NodeGraph.PortVisual>`.

**`<NodeGraph.Pin>`** — a one-liner for the ubiquitous "handle + label" row. Renders a `<NodeGraph.PinRow>` containing a `<NodeGraph.Port>` and a label, ordered so the handle hugs the node edge (port → label on the left, label → port on the right). `<NodeGraph.PinRow>` + `<NodeGraph.Port>` remain available for custom layouts.

**`useNodeGraph()`** — owns nodes / edges / groups / selection plus the mutations every editor re-implements: `addNode`, `connect` (de-duped), `removeNodes` / `removeSelection` (with edge cascade + selection pruning), `duplicateNodes`, `addGroup`, `removeGroups`, `clearSelection`. Spread the returned `bind` onto `<NodeGraph>` to wire all four controlled props at once. Uncontrolled by design; for external stores keep wiring the `onChange` props yourself. The pure helpers `duplicateNodes(nodes, ids)`, `generateNodeId`, and `generateEdgeId` are now exported too.

**`createTypeMatchValidator()`** — a factory for the common `isValidConnection` rule (match `dataType`, in an allowed direction, with a configurable `anyType` wildcard and `allowSameNode`). Override `match` for richer subtype rules.

The Blueprint demo now uses all four, dropping its hand-rolled pin visual, connected-ports `useMemo`, manual delete/duplicate handlers, and four `useState` calls.
