---
'entangle-ui': patch
---

`Timeline` — loop / playhead / track-scale UX fixes:

- The **playhead line is now grabbable along its whole height**. Previously a
  grab landed as `group` over a group-header row and was swallowed by the
  `loop-body` region on the ruler; the hit-test now returns `playhead` on its
  thin pick band over group rows and on the ruler (it beats the wide loop body,
  while loop edges still win). The head also glows + shows an `ew-resize`
  cursor on hover there.
- **Loop region edges and body highlight on hover** — the hovered edge thickens
  with a glow (cursor `ew-resize`), the body brightens (cursor `grab`), so the
  draggable affordances are discoverable. Backed by a new `hoverLoop` store
  slice. Alt+drag on the ruler keeps creating / re-drawing the loop (now also
  when the drag starts on the playhead line).
- `trackScale` gains **`minLaneHeight`** (default `48`): lanes shorter than this
  skip the scale entirely, so a collapsed graph-mode track no longer renders
  overlapping min/mid/max labels.
