---
'entangle-ui': minor
---

Add `Link` styled-anchor primitive. Provides theme-aware color, underline,
hover, and focus behavior, plus `default` / `subtle` / `inline` variants
and `sm` / `md` / `lg` sizes. External links are auto-detected from
`http(s)://` hrefs (or set explicitly), get an external-link icon, and
ship `target="_blank" rel="noopener noreferrer"` along with an "(opens in
new tab)" screen-reader announcement. Polymorphic via `as` so it can wrap
react-router, TanStack Router, or Next.js link components for client-side
navigation. `disabled` renders as a non-anchor span without `href`.
