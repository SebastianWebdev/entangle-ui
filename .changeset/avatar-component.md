---
'entangle-ui': minor
---

Add `Avatar` and `AvatarGroup` primitives for rendering people, agents, and
named entities consistently across editor UIs. `Avatar` resolves an `src`
when one is available and falls back through initials (derived from `name`,
or set explicitly) to a generic user glyph; the fallback is always rendered
underneath the image so a slow load never produces a blank flash. Six sizes
(`xs` 16px → `xxl` 56px), three shapes (`circle`, `square`, `rounded`),
deterministic auto colour hashed from `name`, optional presence indicator
(`online` / `away` / `busy` / `offline`), and an interactive mode (`onClick`
makes it a focusable, Enter/Space-activatable button). `AvatarGroup`
overlaps multiple avatars with configurable spacing and collapses overflow
beyond `max` into a `+N` indicator with a tooltip listing the hidden names.
