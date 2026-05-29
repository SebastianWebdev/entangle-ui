---
'entangle-ui': patch
---

`Timeline`:

- The expand-track caret in the track-header column now shows in graph mode too. In dope-sheet mode it still expands the track into an in-place graph lane; in graph mode it just makes the lane taller (`expandedTrackHeight`), so you can spotlight one curve without leaving graph view.
- Alt + drag on the ruler creates / narrows the loop region (works even when looping was previously off — the drag turns it on). A bare Alt-click without dragging clears the loop. Existing loop-edge / body drags are unchanged.
