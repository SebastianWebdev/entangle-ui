---
'entangle-ui': minor
---

**F1 — Slider value tooltip → portal.** The drag value tooltip was an
absolutely-positioned child of the slider wrapper, so any ancestor `overflow`
(e.g. a `PropertySection` header) clipped it. It now renders in a portal to
`document.body` with fixed viewport coordinates anchored to the thumb, so it can
never be clipped. Added `tooltipPlacement?: 'top' | 'bottom'` (default `'top'`).
The portal is only mounted while dragging, so the idle/drag hot path is
unchanged. Default visual placement (above the thumb) is unchanged.
