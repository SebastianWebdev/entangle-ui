---
'entangle-ui': minor
---

Centralise every icon through the shared `Icon` primitive — no component defines SVGs inline anymore.

**`Icon` primitive — custom size support**

`size` now accepts any number (interpreted as pixels) or any CSS length string (`'1.5em'`, `'24px'`, …) in addition to the `'sm' | 'md' | 'lg'` tokens. Custom color via any CSS string was already supported. This unlocks reuse of library icons in chip-sized and inline-text contexts that previously needed bespoke SVGs.

**New icons**

- `FirstIcon`, `LastIcon` — skip-to-edge chevrons for paginators
- `CloudUploadIcon` — cloud with up-arrow for upload drop zones
- `ExternalLinkIcon` — box with arrow leaving the top-right corner
- `UnlinkIcon` — broken chain (pair with `LinkIcon` for coupled-value toggles)

**Inline SVG removal**

Every component that drew its own X / chevron / check / upload / unlink icon now imports the matching `*Icon` from `@/components/Icons` and forwards the appropriate `size` and `decorative` props:

- Form controls — `Combobox`, `Select`, `MultiSelect` (chevron + check)
- Primitives — `Checkbox` (check + minus), `Collapsible` (chevron), `Link` (external link)
- Layout — `Accordion` trigger (chevron)
- Controls — `VectorInput` (link + unlink), `FileUploader` (cloud upload), `Pagination` (first / last / prev / next)
- Feedback — `Toast` (info / success / warning / error)
- Editor — `PropertyInspector` (chevron + undo)

Left intact: `Stat` delta arrows (no library match for the bar + chunky-arrow set), `Tooltip` arrow tail (not a typical icon shape), `CircularProgress` ring, and the `Mini*Icon` family in `ChatPanel/ChatIcons.tsx` whose usage sites live in unowned files — all flagged for a separate follow-up.
