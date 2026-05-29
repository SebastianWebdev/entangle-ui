# NodeGraph Performance Architecture

How `<NodeGraph>` stays interactive with hundreds of nodes and thousands of
edges, and the invariants you must not regress. Every rule here exists because
the naive alternative was measured and found too slow — or shipped and caused a
visible regression.

The benchmark that drives these numbers lives at
`docs-site/src/components/demos/editor/NodeGraphBenchmarkDemo.tsx` (grid +
fully-connected "layered net" topologies, live FPS meter). Profile against it
before and after any change to the hot paths below.

---

## The cost model

Two interaction loops dominate, and they are **not** symmetric:

- **Pan / zoom** mutates only the viewport transform. A handful of subscribers
  react (the canvas layers, `ViewportWorld`), all of them rAF-throttled. Node
  React subscribers only read `transform.zoom`, which doesn't change during a
  pan — so they don't re-render at all.
- **Drag** mutates `NodeGraphStore.interaction` on every pointer move. This is
  where everything that scales with node/edge count gets exercised every frame.

The whole performance design is about keeping the **drag** loop cheap, because
that's the one that touches per-node and per-edge work each frame.

---

## 1. Throttle pointer-driven store writes to one commit per frame

Native `pointermove` fires at the display refresh rate (and far faster with
coalesced events / high-poll-rate mice). Writing to the store on every raw
event runs the full subscriber notification cycle several times per frame for
no visible benefit.

**Rule:** any handler that writes interaction state from `pointermove` buffers
the latest value in a ref and flushes it once per frame via
`requestAnimationFrame`. `pointerup` flushes synchronously before reading the
store, so the committed value is the final delta, not the previous frame's.

**Reference implementations:**

- `useNodeGraphNodeDrag.ts` — `pendingMoveRef` + `rafRef`, `flushPending()` on
  pointerup.
- `useNodeGraphGroupDrag.ts` — same pattern via `scheduleCommit`, covering both
  `drag-groups` and `resize-group`.
- `useNodeGraphConnection.ts` — closure-local `pendingPoint` + `rafId` in
  `beginDrag` (older instance of the same pattern; coalesces the
  `elementFromPoint` hit-test too).
- `useNodeGraphEdgeInteraction.ts` — rAF-coalesced hover hit-test.

Canvas layers are independently rAF-throttled in `ViewportLayer` (`scheduleDraw`
collapses N invalidations per frame into one draw), so over-invalidating a layer
is cheap — but React subscriber notifications are **not** automatically
throttled. That's why the throttle lives at the write site.

> Note: this caps writes at the refresh rate, so on a 60 Hz display it's a large
> win; on a 360 Hz display the browser already coalesces moves near the refresh
> rate, so the win is smaller. Either way it removes the redundant-write tail.

---

## 2. Drag id sets are `ReadonlySet`, not arrays

The `drag-nodes` / `drag-groups` interaction state carries `nodeIds`,
`groupIds`, and `containedNodeIds`. Every per-node and per-edge subscriber
checks "am I in the active drag set?" on every frame. With arrays that's
`includes()` — O(M) per subscriber, O(N·M) per frame. Dragging a 600-node
selection meant hundreds of thousands of comparisons per frame in the selector
phase alone.

**Rule:** membership-tested id collections in the interaction state are
`ReadonlySet<string>`. Checks are `.has()` (O(1)). Build the Set directly from
the gesture's session snapshot (already keyed by id) — never per frame.

**Reference:** `NodeGraphInteractionState` in `NodeGraphStore.ts`; selectors in
`NodeGraphNode.tsx`, `NodeGraphGroup.tsx`, `NodeGraphEdgeLabels.tsx`;
`drawEdges` / `drawGroups` in `nodeGraphDrawing.ts` consume the Set directly (no
per-draw `new Set(...)`).

---

## 3. Per-node interaction subscriptions, not one global channel

A single shared interaction channel wakes **every** node and edge-label
subscriber on every drag tick — even when only one node is moving. The unrelated
subscribers run a selector that returns "no delta for me", then a no-op equality
check, every frame.

**Rule:** per-node React subscribers use `subscribeNodeInteraction(nodeId, cb)`,
not the global `subscribeInteraction`. `setInteraction` fans notifications out
only to ids in the **previous ∪ next** drag set — the union is required so a
node that _leaves_ the drag set still wakes once to clear its local delta.

**Reference:** `NodeGraphStore.subscribeNodeInteraction` +
`getDragAffectedNodeIds` in `NodeGraphStore.ts`. `NodeGraphNodeView` subscribes
by `node.id`; `EdgeLabel` builds a composite subscription over its source +
target endpoints (deduped when both sit on the same node).

The global `subscribeInteraction` stays for consumers that genuinely need every
change — the canvas layers and the main component's layer-invalidation effect.

Result: a single-node drag in a 600-node graph notifies ~1 subscriber per frame
instead of ~1200.

---

## 4. Don't mount subscribers that can't render anything

`EdgeLabelsLayer` used to mount one interaction-subscribing `<EdgeLabel>` per
edge unconditionally. When the consumer supplies no `renderEdgeLabel` and the
edge has no `label`, that component renders `null` — but still subscribes and
re-evaluates every drag tick. In a graph with thousands of unlabelled edges
that's pure waste.

**Rule:** skip the mount when there's no possible content — no `renderEdgeLabel`
callback **and** `edge.label == null`. When `renderEdgeLabel` is provided the
consumer owns per-edge visibility (may return `null`), so mounting is still
required there.

**Reference:** `EdgeLabelsLayer` in `NodeGraphEdgeLabels.tsx` (`hasRenderEdgeLabel`
prop, passed from `NodeGraph.tsx`).

---

## 5. Frustum-cull the edge canvas

`drawEdges` runs the full pipeline per edge — endpoint resolve, Bézier control
points, screen projection, style callback, stroke. At high zoom-in most edges
are off-screen but still paid for. This is the dominant cost in a
high-edge-count graph when zoomed in.

**Rule:** a cubic Bézier is contained in the convex hull of its four control
points, so the screen-space bbox of those points is a conservative visibility
bound. Skip the edge when that bbox is entirely past a viewport edge (plus a
small margin for stroke width / round caps).

**Reference:** `bezierOutsideViewport` in `nodeGraphDrawing.ts`, called at the
top of the `drawEdges` loop. Covered by `nodeGraphDrawing.test.ts` — the cull
geometry is unit-tested because a bug here silently hides visible edges and
jsdom can't catch that at the canvas level.

---

## 6. Demos isolate their polling state

This is a **consumer** rule, but it bit our own docs and is worth stating: a
demo (or app) that polls something on a rAF loop and calls `setState` in the
top-level component re-renders the entire subtree — including `<NodeGraph>` — at
the polling cadence, even when idle. It also pollutes the React profiler with
constant repaints that mask the real interaction cost.

**Rule:** put polled state (FPS meters, transform readouts, live coordinates) in
a dedicated leaf component with its own `useState` + rAF loop. The parent
re-renders only on real interaction. Imperative-only loops (e.g. an orbit camera
calling `ref.centerOn`) don't touch React state and can stay in the parent.

**Reference:** `FpsStatsBadges` and `TransformReadout` in the NodeGraph demos
under `docs-site/src/components/demos/editor/`.

---

## Anti-patterns — measured and rejected

These look like optimizations and aren't. They passed the unit suite and type
check, then caused visible regressions, because jsdom can't render canvas or
evaluate GPU compositing — **green tests are not sufficient evidence for a
rendering change; verify it in a real browser.**

- **`will-change: transform` on the scaled world wrapper.** `ViewportWorld`
  carries the viewport `scale()`. Promoting it to a persistent GPU layer makes
  the browser rasterize its contents once at base scale and upscale the texture
  on zoom-in → blurry nodes and text until something forces a repaint. The same
  hazard applies to a per-drag `will-change` on a node, since its scale comes
  from the parent. Let the browser re-rasterize per paint; crispness at every
  zoom matters more than pan-layer stability.

- **`content-visibility: auto` on node wrappers.** It implies paint containment,
  which crops anything overflowing the wrapper box — node body content,
  selection glow. It also stops `ResizeObserver` from firing while a node is
  skipped, which corrupts the measured size that `fitToContent` / marquee /
  minimap read for off-screen nodes. Not a usable substitute for real
  virtualization.

---

## Open candidate — node virtualization (post-1.0)

The remaining lever for very large graphs is rendering only the nodes whose
world bounds intersect the visible viewport, instead of mounting all of them.
This is the correct version of what the rejected CSS hacks were reaching for.

Deferred until after the 1.0 release because it's non-trivial:

- Subscribe to viewport `transform` + `size`; compute the visible world rect;
  filter nodes by intersection with a margin so nodes don't pop at the edge.
- Handle the measured-size edge case: an auto-size node unmounted while
  off-screen loses its `measuredSizes` entry, which bounds computations
  (`fitToContent`, marquee, minimap) read for **all** nodes. Either retain
  last-measured sizes across unmount, or fall back to `defaultNodeSize` — don't
  let off-screen nodes silently shrink the computed bounds.

The edge layer is already culled per frame (rule 5); this is only about the HTML
node layer.
