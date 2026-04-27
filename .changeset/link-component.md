---
'entangle-ui': minor
---

Add `Link` styled-anchor primitive. Provides theme-aware color, underline,
hover, and focus behavior, plus `default` / `subtle` / `inline` variants
and `sm` / `md` / `lg` sizes. External links are auto-detected from
`http(s)://` hrefs (or set explicitly), get an external-link icon, and
ship `target="_blank" rel="noopener noreferrer"` along with an "(opens in
new tab)" screen-reader announcement. Polymorphic via `as` with a typed
generic so consumers can pass a router's link component (react-router,
TanStack Router, Next.js) and get the router's own props (`to`, …)
type-checked. `disabled` renders as a non-anchor span regardless of `as`,
strips navigation handlers, and suppresses the external affordance —
disabled router links cannot navigate via mouse, keyboard, or
programmatic activation.
