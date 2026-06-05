---
'entangle-ui': minor
---

Add the `PathBar` flagship component — file-path breadcrumbs like the VS Code
editor bar. It specializes `Breadcrumbs`: pass a delimited string or a
structured `PathSegment[]` and it renders clickable segments, leaning on
Breadcrumbs for separators, overflow collapsing, and accessibility. Folder
crumbs navigate via `onNavigate(path, segment, index)` and the final segment is
the current location (`aria-current`). The current path is controllable
(`value` / `defaultValue`); uncontrolled, clicking an ancestor truncates the
trail. Provide `getSiblings` to add a VS-Code-style dropdown that swaps a
segment for one of its siblings, plus `rootIcon`, per-segment icons, and a
`delimiter` for non-`/` paths. Path splitting/joining lives in a pure,
unit-tested `pathUtils` module.

Extend `BreadcrumbItem` with an `endContent` slot — content rendered after the
label, outside the navigable link/button, so a trailing affordance (such as
PathBar's sibling-dropdown caret) can attach without breaking the crumb's
click target or the Breadcrumbs collapse logic.
