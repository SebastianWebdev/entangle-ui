---
'entangle-ui': minor
---

**G1 — Align `Button` / `IconButton` icon API.** `IconButton` now accepts an
optional `icon` prop mirroring `Button`'s `icon`, so `<IconButton icon={…} />`
type-checks and the two components share one API. `children` still works for
back-compat (now optional); when both are set, `icon` wins. Additive.
