---
'entangle-ui': minor
---

LogView: add a `labels` prop for internationalization. Every built-in UI string
— the search placeholder and label, the level-filter group label, the clear /
copy / per-line copy labels, the jump-to-bottom button, the new-line counter,
the empty state, and the region label — is now overridable via `labels`, a
`Partial<LogViewLabels>`, so omitted keys keep their English default. The
new-line counter is a function (`(count) => string`) for per-locale
pluralization and word order. Explicit per-slot props (a slot's `aria-label`,
the search `placeholder`, `emptyState`, the root `aria-label`) still take
precedence. The English defaults are exported as `DEFAULT_LOG_VIEW_LABELS`.
