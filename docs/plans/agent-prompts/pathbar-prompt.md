# Session prompt — implement `PathBar`

> Paste everything below the line into a fresh agent session. It is
> self-contained. The agent should read the referenced files, hold a planning
> session, get the API signed off, then implement.

---

You are implementing **PathBar**, flagship component #9 on
`docs/plans/pre-1.0-roadmap.md`. The roadmap one-liner:

> **PathBar** — File-path breadcrumbs like VS Code. Specialization of Breadcrumbs.

This is the **smallest** of the remaining flagships — a good warm-up. Scope it
tightly; resist turning it into a file browser.

## Before you write any code

1. Read, in order (source of truth; overrides this prompt on conflict):
   - `docs/plans/agent-prompts/README.md` (shared rules, checklist, docs/demo
     requirements, friction reporting)
   - `CLAUDE.md`
   - `docs/component-patterns.md`
   - `docs/demo-patterns.md`
2. Study the component you are specializing — **`Breadcrumbs`** — end to end:
   `src/components/navigation/Breadcrumbs/` (Breadcrumbs, BreadcrumbItem,
   BreadcrumbSeparator, BreadcrumbEllipsis, types, css, tests, index).
   Understand the existing `separator`, `maxItems`, `itemsBeforeCollapse`,
   `itemsAfterCollapse`, expandable ellipsis behavior, and the compound parts it
   already exports.
3. Reference the most recent flagship for structure/style:
   `src/components/controls/GradientEditor/` (PR #88).
4. Relevant existing icons: `src/components/Icons/` has `HomeIcon`,
   `ChevronRightIcon`, `FolderIcon`. Reuse, don't add.

## What PathBar is

A **path-flavored specialization of `Breadcrumbs`** that turns a file path into
clickable breadcrumb segments, like the VS Code editor breadcrumb bar. Core
jobs:

- Accept a **path** (string like `src/components/Button/Button.tsx`, or a
  pre-split segment array) and render each segment as a clickable crumb.
- Click a segment → fire `onNavigate(path, segment, index)` with the path up to
  that segment (so the consumer can navigate there).
- **Overflow collapsing** for long paths — reuse Breadcrumbs' existing
  `maxItems` / ellipsis machinery rather than rebuilding it.
- VS-Code-isms to consider (settle scope in planning): a leading root/home
  icon, per-segment icons (folder vs file leaf), optional separator style
  (`/` vs chevron), and optionally a dropdown on a segment to pick siblings.

## Decisions to settle in the planning session (use `AskUserQuestion`)

1. **Input shape.** Does PathBar take a raw `path: string` (+ a `separator`/
   delimiter to split on, default `/`), a `segments: PathSegment[]` array, or
   accept both? Recommend: accept a `string` for the common case **and** a
   structured `segments` array for when consumers have icons/metadata per
   segment. Confirm.
2. **Segment dropdown (sibling picker).** VS Code lets you click a crumb to open
   a dropdown of sibling entries. Is that in v1 (needs a `getSiblings`/
   `renderSegmentMenu` hook + `Menu`/`Popover` composition), or deferred?
   Recommend deferring to keep v1 tight unless you want it.
3. **Leaf vs folder rendering.** Auto-detect the last segment as a "file" (icon +
   non-navigable, or navigable?) vs folders? Or treat all segments uniformly and
   let the consumer style via a render prop? Confirm.
4. **Controlled/interactive.** PathBar is essentially stateless (path in, click
   out) — confirm there's no controlled state beyond what Breadcrumbs needs, so
   you don't add a needless `value`/`onChange`.

## Implementation guardrails specific to PathBar

- **Compose `Breadcrumbs`, don't fork it.** PathBar should build the
  `BreadcrumbItem` / `BreadcrumbSeparator` / `BreadcrumbEllipsis` children from
  the path and hand them to `Breadcrumbs`, leaning on its collapse logic. If
  Breadcrumbs can't express something you need (e.g. a per-item icon slot), add
  the minimal prop to Breadcrumbs and report it as friction — don't duplicate
  the breadcrumb rendering.
- **Path splitting/joining** is pure — put it in a small util module with unit
  tests (handle leading/trailing slashes, empty segments, Windows `\` if you
  decide to support it — likely out of scope for v1, document the decision).
- Accessibility: the bar is `nav`-flavored (Breadcrumbs already sets
  `aria-label`); each crumb is a button/link with a keyboard handler. Mirror
  `onClick` with `onKeyDown` per jsx-a11y.
- Location: `src/components/navigation/PathBar/`. Export from
  `src/components/navigation/index.ts` and `src/index.ts`.

## Deliverables (see README checklist for the full ordered list)

- `src/components/navigation/PathBar/` — component, types, css, tests, barrel;
  wired into both index files.
- Any minimal Breadcrumbs extension needed (with friction note).
- MDX docs page + demo(s) + nav entry. `PropsTable` uses the **object** form.
- A `minor` changeset.
- Full checklist green (lint, type-check, format, test, build, docs:build).
- Draft PR, English-only, branch `etui-pathbar`.
