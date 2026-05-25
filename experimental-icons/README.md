# Experimental icons (Recraft)

Staging area for raw SVG icons generated with **Recraft V4.1**, before they are
normalized and promoted into the library under the experimental Icons category.

## How to add icons

1. Drop the raw `.svg` exports from Recraft into this folder — one file per
   icon, named after the icon (e.g. `FolderCog.svg`, `EyeDropper.svg`).
2. Each icon is then normalized to the standard `Icon` contract:
   - `viewBox="0 0 24 24"`
   - no `fill` on the artwork (it inherits `fill: none` from `Icon`)
   - no hardcoded colors — strokes resolve to `currentColor`
   - `stroke-width="2"`, round line caps and joins
3. The normalized geometry is wrapped in an `<Icon>`-based React component under
   `src/components/Icons/experimental/` and re-exported, so the icons render on
   the branch for review.

These icons are **not** part of the stable public API yet.
