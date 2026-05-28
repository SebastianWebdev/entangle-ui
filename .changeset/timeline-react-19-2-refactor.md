---
'entangle-ui': minor
---

Refactor `Timeline` for React 19.2 — performance, dead-code cleanup, API tweaks.

- Bump peer `react` / `react-dom` to `>=19.2.0`. Internal `useLatest`-ref swarms in `useTimelineGestures`, `useTimelinePlayback`, `useTimelineDraw` (new) and `TimelineMinimap` are replaced with `useEffectEvent`. Handler identities are stable for the component's lifetime; the rAF playback loop now only re-runs when `playing` flips.
- `TimelineMinimap` subscribes to the geometry + playhead slices instead of the full `useTimelineContext()` snapshot, so it stops re-rendering on unrelated store changes (selection / hover / drag / mode).
- Consolidate keyframe-key helpers into one `timelineSelection` module (`selectionKey` / `selectionKeySet` / `sameRef`) — removes three near-duplicate implementations across `Timeline`, `timelineEdits`, and `TimelineStore`.
- Cache each track's resolved value range on `TrackGeometry` / `TimelineTrackRow` (`row.range`) so drawing, hit-testing and graph-mode edits stop recomputing `autoValueRange` per call.
- Extract `useTimelineDraw` from `Timeline.tsx` — encapsulates canvas DPR setup, theme-token resolution and the scheduled draw, and reads consumer `renderOverlay` / `formatTime` through `useEffectEvent` so inline functions no longer invalidate the schedule.
- Drop dead exports: `framesPerPixel`, `trackTop`, `yToTrackIndex` (`timelineCoords`), `rowIndexAtY` (`timelineLayout`), and the unimplemented `minKeyframeDistance` prop on `TimelineProps`.
- Replace `Math.hypot` in the hit-test hot path with squared-distance comparisons; replace `Math.min(...spread)` in copy with a reduce loop; rewrite `zoomToSelection` to walk the selection (O(|selection|)) instead of every keyframe in every track.
- New `trackScale` prop on `<Timeline>` — pass `{ position, format, showMidpoint, gridlines, color }` directly. The `<Timeline.TrackScale />` slot still works as a deprecated alias; the new prop wins when both are provided.
