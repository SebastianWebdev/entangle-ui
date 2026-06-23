---
'entangle-ui': minor
---

**G2 — `Spinner` `decorative` (live-region opt-out).** Add `decorative?: boolean`
to `Spinner`. When set, the spinner renders `role="presentation"` + `aria-hidden`
with no `aria-live`, for use inside an existing live region (e.g. `StatusBar`,
which is itself `role="status"`) so activity isn't announced twice. Default
behavior (`role="status"` + `aria-live="polite"`) is unchanged. Additive.
