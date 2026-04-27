---
'entangle-ui': patch
---

Fix `VectorInput` axis inputs overflowing their column in narrow layouts.
The `NumberInput` inside each axis previously took its intrinsic content
width, causing values to clip and visually overlap when the row was tight
(typical inside property panels or alongside a lock toggle). The
`NumberInput` container now fills the remaining axis space with
`flex: 1; min-width: 0`, so axes share width evenly and shrink gracefully.
