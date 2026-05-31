---
'entangle-ui': patch
---

Refine the `AssetBrowser` component. Live selection, roving focus, and
drop-target state now flow through per-id store slices, so selecting an item or
moving focus re-renders only the affected cells instead of the whole grid, and
search/sort/filter chrome no longer re-renders cells on every keystroke. Wire up
the previously inert `marquee` and `history` props (Back/Forward controls plus
`Backspace` / `Alt+ArrowUp` to navigate to the parent folder), keep grid cells
interactive when a custom `renderItem` is supplied, make `scrollToItem` work
under virtualization, track shift-range anchors by id so ranges survive a
re-sort, and honour `prefers-reduced-motion`.
