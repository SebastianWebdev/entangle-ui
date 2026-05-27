---
'entangle-ui': minor
---

Add the `Timeline` flagship component — a horizontal, multi-track animation timeline / dope sheet for editor UIs.

- Frame-based time axis with an `fps`-driven `HH:MM:SS:FF` ruler and snap-to-frame. `frame` (playhead), `view` (zoom/pan window), `selection`, `mode`, and `playing` are each controlled or uncontrolled.
- Tracks hold keyframes using the shared `CurveKeyframe` model — promoted to `@/types/keyframe` and re-exported from `CurveEditor` unchanged — so Timeline and CurveEditor speak the same language.
- Canvas-rendered keyframes with DOM chrome, drawn from a per-slice `useSyncExternalStore` store with the theme resolved per frame.
- Interactions: scrub (ruler/playhead drag + click), wheel zoom-at-cursor, shift-wheel / middle-drag pan, click / shift-click / box-select, drag-move (snapped + clamped), double-click add, Delete remove, and arrow / Home / End keyboard scrubbing.
- Dope-sheet and graph (value-curve) modes; graph mode reuses CurveEditor's curve evaluation and edits keyframes in both time and value.
- Optional built-in playback loop (rAF advancing `frame` at `fps`, with `loop`), driven via the imperative handle (`seek` / `play` / `pause` / `toggle` / `zoomToFit` / `zoomToSelection` / `frameToX` / `xToFrame`).
- Data-driven track-header column with a `renderTrackHeader` override, `Timeline.Toolbar` / `Timeline.Footer` slots, a `renderOverlay` canvas pass, and an accessibility baseline (focusable `role="group"`, keyboard equivalents, polite live region).
- Also exports `framesToTimecode` and the `useTimelineContext` / `useTimelineGeometry` / `useTimelinePlayhead` / `useTimelineSelection` hooks.
