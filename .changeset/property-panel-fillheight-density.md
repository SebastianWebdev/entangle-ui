---
'entangle-ui': minor
---

`PropertyPanel`: add fill-height scrolling, row density, and a small control-padding fix.

- **`fillHeight` (new prop).** Fills the parent's height and scrolls the content on overflow without needing a fixed `maxHeight`, reserving a scrollbar gutter so controls don't sit under the overlay scrollbar. Ignored when `maxHeight` is set.
- **`density` (new prop).** `compact` / `normal` / `spacious` tunes the vertical rhythm (min-height + vertical padding) of all nested `PropertyRow`s via panel context. Default `normal` is unchanged from before.
- **Control right padding.** `PropertyRow`'s control column right padding was bumped from `xs` (2px) to `sm` (4px) so controls no longer sit flush against the row's right edge. This is a small default visual change.
