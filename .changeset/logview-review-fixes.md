---
'entangle-ui': patch
---

LogView code-review fixes:

- **Stable auto-assigned ids.** Id-less entries now keep their key across a
  controlled `entries` re-mirror — the store caches an id per entry object
  instead of minting a fresh monotonic id on every `setEntries`. Rows no longer
  remount and id-based selection survives updates. Removed the unused `seq`
  field from `ResolvedLogEntry`.
- **Levels added at runtime are visible by default.** Visibility is tracked as
  the set of _hidden_ levels, so a level introduced later via `levelConfig`
  shows up active, while an explicit toggle-off persists across `levelOrder`
  changes.
- **Cheaper rows.** Per-level definitions are resolved through a memoized cache
  so the memoized `LogRow` is no longer invalidated by a fresh definition object
  each render.
- **Scoped text-selection guard.** A row click / copy shortcut is only
  suppressed by a text selection inside the log body, not one elsewhere on the
  page.
- **Internal cleanup.** Row selection + keyboard handling moved into a
  `useLogSelection` hook; the shared recipe `level` variant is derived via a
  single `levelVariant` helper.
