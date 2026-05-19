---
'entangle-ui': minor
---

Fixes and additions for the 0.9 release:

- `Radio` — inner dot at `size="md"` is now 6 px instead of 7 px so the dot stays pixel-centered inside the 14 px outer ring.
- `Accordion` — new `width` prop (defaults to `"100%"`); the accordion now keeps a stable width regardless of which item is expanded.
- `Alert` — new `width` prop (defaults to `"100%"`); long unbreakable content now wraps via `overflow-wrap: anywhere` instead of stretching the alert.
- `SkeletonLayout` — new component (`@/components/feedback/Skeleton`) with pre-built loading patterns: `card`, `list`, `table`, `grid`, `chat`. Each variant composes the existing `Skeleton` primitive with sensible defaults; configurable `count`, `columns`, `animation`, and `width`. Grid defaults to `animation="none"` for dense surfaces.
