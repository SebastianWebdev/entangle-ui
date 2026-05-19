---
'entangle-ui': patch
---

Replace inline X / close icon SVGs across the library with the shared `CloseIcon` primitive.

The hand-rolled SVGs used a single `M…L…M…L…` path for the cross stroke, which rendered with a visible seam at the center on most platforms (same root cause as the earlier Combobox fix). The library `CloseIcon` uses two separate `<line>` elements through the `Icon` primitive, so the cross is clean and stays consistent across components.

Touched components:

- `MultiSelect` — chip remove button and clear-all button
- `Select` — clear-all button
- `TagInput` — chip remove button
- `Drawer` — header close button and `Drawer.CloseButton`
- `Dialog` — header close button
- `Popover` — `PopoverClose`
- `Toast` — dismiss button
- `FileUploader` — the inline `TrashIcon` now uses the shared `TrashIcon` primitive

No public-API changes — only the rendered glyph differs.
