---
'entangle-ui': minor
---

**E1 — AppShell top-chrome + MenuBar fill/inset.** `AppShell.MenuBar` now paints
the menu-bar chrome background (`--etui-shell-menubar-bg`) on the slot, and
`MenuBar` stretches to fill its host slot so the top chrome reads as one
continuous strip instead of a lighter content-width block. MenuBar triggers now
inset their hover/active fill (rounded, vertically centered) from the chrome
edges. Docs clarify that side toolbar slots (`AppShell.Toolbar position="left|right"`)
are the intended home for docked panels. Visual default change — no API change.
