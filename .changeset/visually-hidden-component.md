---
'entangle-ui': minor
---

Add `VisuallyHidden` primitive for hiding content visually while keeping
it accessible to screen readers. Implements the canonical SR-only style
and supports a `focusable` mode for skip-to-content links (revealed via
`:focus-within`). Renders as `<span>` by default with `as` overrides for
`div`, `label`, and `p`.
