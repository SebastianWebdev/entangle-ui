---
'entangle-ui': patch
---

Timeline: replace `useEffectEvent` misuse with the `useLatest` + `useCallback`
pattern. Effect Events are only valid when called from inside an Effect; the
Timeline was using them as DOM/JSX event handlers and store callbacks, relying
on a stable identity that `useEffectEvent` does not guarantee (its identity
intentionally changes every render). Gesture handlers, the minimap pointer/draw
handlers, and the `Timeline` track/seek/zoom callbacks now read live state
through `useLatest` refs and expose genuinely stable `useCallback`s, matching
`component-patterns.md` rules #3/#11 and the `useViewportGestures` reference.
The playback rAF loop keeps `useEffectEvent` — the one place it is correct
(called only from inside the effect's timer). Also reuse the shared `clamp` and
`valueInset` helpers instead of duplicated inline math, and align the minimap
wrapper with the library's `cx` + `role="region"` conventions. No public API
change.
