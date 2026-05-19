---
'entangle-ui': patch
---

Three follow-up fixes/additions for the 0.9 release based on review feedback:

- `Combobox` — the open/close trigger rotated the entire button instead of just the chevron icon. The rotation is now scoped to a span wrapping the icon, so the click target stays stable.
- `Combobox` — the clear button now uses the shared `CloseIcon` primitive instead of a hand-rolled inline SVG, which rendered with a noticeable seam at the cross point.
- `DataTable` — multi-select tables now support range selection. Hold `Shift` while clicking a row's checkbox (or pressing `Space` on a focused row) to toggle every row between the last anchor and the target. Disabled rows are skipped. Behavior is on by default for `selectionMode="multiple"`.
