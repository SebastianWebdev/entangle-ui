---
'entangle-ui': minor
---

LogView: add `slotProps` for the default composition. Pass per-slot props
(`toolbar`, `search`, `levelFilter`, `copy`, `clear`, `body`, `footer`) to
restyle or reconfigure a single slot of the batteries-included layout without
rebuilding it from `children` — each entry is typed as that slot's props and its
`className` / `style` merge with the slot's own styles. Ignored when you provide
your own `children`. Establishes the library-wide `slotProps` convention
documented in `docs/component-patterns.md` (§15).
