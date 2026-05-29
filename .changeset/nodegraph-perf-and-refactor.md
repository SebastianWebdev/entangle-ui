---
'entangle-ui': patch
---

`NodeGraph` internal performance + refactor pass (no public API change).

**Performance**

- Edge labels now subscribe to the interaction slice through a per-edge selector + equality (the same pattern node bodies use), so a drag only re-renders the labels whose endpoints actually move instead of every label on every gesture tick.
- Edge / group canvas layers build a `Set` of the selected ids once per frame instead of a linear `selection.includes` per item — the per-frame selected check is now O(1).
- Edge hit-testing (`findEdgeAtPoint`) rejects edges with a control-point bounding-box test before the 24-sample Bézier distance test, so hover / click / right-click stay cheap on large graphs.
- The background dots/grid pattern tile is cached across frames (keyed by size + radius + colour, bounded with FIFO eviction), so a pan no longer rebuilds an off-screen canvas every frame.

**Refactor**

- Extracted a shared `useDragGesture` primitive (pointer capture, document listener attach/detach, per-pointer guard, unmount cleanup) used by both the node-drag and group-drag controllers, removing the duplicated gesture lifecycle.
- Extracted edge hover + endpoint-grab handling out of `NodeGraph` into `useNodeGraphEdgeInteraction`.
- De-duplicated the additive-selection toggle (`toggleSelected`) across the node / group / edge click paths and the connection accept/reject check across the hover + both drop paths.
