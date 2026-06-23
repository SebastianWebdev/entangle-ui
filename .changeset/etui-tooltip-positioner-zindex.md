---
'entangle-ui': patch
---

**F2 — Tooltip z-index on the Positioner (renders under panels).** The tooltip
z-index (`--etui-z-tooltip`) was set on the inner `Popup`, trapped inside the
portaled `Positioner`'s own `position: fixed` stacking context, so a positioned
sibling at a lower z-index (e.g. an `AppShell` slot at `--etui-z-base`) painted
over the tooltip. The token now lives on the `Positioner`. Audited the other Base
UI `Positioner`/`Popup` pairs and applied the same fix to the navigation `Menu`
and `ContextMenu` (dropdown z-index now on their positioners). `HoverCard`,
`Select` and `Popover` were already correct (z-index on the positioned element).
