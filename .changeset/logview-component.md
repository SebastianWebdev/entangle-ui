---
'entangle-ui': minor
---

Add the `LogView` flagship component — a virtualized console / log output panel
for editor and IDE-style apps. Renders a large, append-only entry stream
efficiently via `@tanstack/react-virtual`, with per-level coloring (built-in
`debug | info | warn | error` plus an extensible `levelConfig`), level filter
chips with live counts, text search with `useDeferredValue` and match
highlighting, follow-tail auto-scroll with a jump-to-bottom affordance,
optional timestamps and source tags, and per-line / copy-all support.

Supports two data-flow models: a controlled `entries` prop, or an uncontrolled
imperative handle (`ref.append` / `appendMany` / `clear`) whose writes are
rAF-batched so high-frequency streaming collapses to one render per frame.
Use it batteries-included with the default toolbar, or compose the slots
(`LogView.Toolbar`, `LogView.Search`, `LogView.LevelFilter`, `LogView.Copy`,
`LogView.Clear`, `LogView.Body`). Single-line rows by default with an opt-in
`wrap` mode for measured variable-height lines.
