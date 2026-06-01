# Session prompt — implement `LogView`

> Paste everything below the line into a fresh agent session. It is
> self-contained. The agent should read the referenced files, hold a planning
> session, get the API signed off, then implement.

---

You are implementing **LogView**, flagship component #8 on
`docs/plans/pre-1.0-roadmap.md`. The roadmap one-liner:

> **LogView** — Console output with level coloring, filter, auto-scroll, search.
> Virtualized.

This is the **largest** of the remaining flagships and, unlike FileTree and
PathBar, it does **not** specialize an existing component — it's a new surface.
Budget accordingly and lean hard on existing hooks/primitives.

## Before you write any code

1. Read, in order (source of truth; overrides this prompt on conflict):
   - `docs/plans/agent-prompts/README.md` (shared rules, checklist, docs/demo
     requirements, friction reporting)
   - `CLAUDE.md`
   - `docs/component-patterns.md` — especially rule #4 (store +
     `useSyncExternalStore` for hot-path state) and #12 (perf traps). LogView is
     a high-frequency append surface; this matters.
   - `docs/demo-patterns.md`
2. Study the existing **virtualization** approach — copy it, don't invent one:
   - `src/components/data/DataTable/DataTable.tsx` uses
     `useVirtualizer` from `@tanstack/react-virtual` (already a dependency).
     Note its `estimateSize`, `overscan`, virtualization threshold, and how it
     reconciles virtual mode vs plain scroll. Reuse this pattern.
   - `src/components/layout/ScrollArea/` for the scroll container.
3. Reference the most recent flagship for structure/style + the canvas/store
   patterns: `src/components/controls/GradientEditor/` (PR #88) and the
   `ViewportStore` (`src/components/primitives/viewport/ViewportStore.ts`) for
   the store + slice-subscribe pattern if you go that route.
4. Relevant existing icons: `ErrorIcon`, `WarningIcon`, `InfoIcon`,
   `SearchIcon`, `FilterIcon`. Reuse.

## What LogView is

A **virtualized console/log output panel** for editor and IDE-style apps. Core
jobs:

- Render a large, append-only list of **log entries** efficiently
  (virtualized — must stay smooth at 10k+ lines).
- **Level coloring**: `debug | info | warn | error` (confirm the exact set) with
  themed colors and optional per-level icon/badge.
- **Filtering** by level (multi-toggle) and **text search** with match
  highlighting.
- **Auto-scroll / follow tail**: stick to the bottom as new entries arrive;
  detach when the user scrolls up; a "jump to bottom" affordance to re-attach.
- Optional: timestamps, source/category tags, copy-line, clear, line wrapping
  toggle. Decide which ship in v1.

## Decisions to settle in the planning session (use `AskUserQuestion`)

1. **Entry model + identity.** Shape of a `LogEntry` (`id`, `level`, `message`,
   `timestamp?`, `source?`, `meta?`). How are entries keyed for virtualization
   stability — caller-supplied `id`, or index? (Virtualization + append needs a
   stable key; recommend requiring `id` or a `getRowId`.)
2. **Data flow: controlled list vs imperative append.** Two viable models:
   (a) fully controlled `entries={[]}` prop (simple, but re-renders on every
   append), or (b) an imperative handle (`ref.current.append(entry)`) backed by
   an internal store so high-frequency appends don't thrash React. Per
   patterns rule #4, high-frequency append is exactly the store case — but
   confirm which API the consumer wants as primary. Recommend: controlled
   `entries` as the public contract, with the store used **internally** for the
   virtualized render, and document a perf note. Settle this explicitly — it's
   the central architectural fork.
3. **Filtering/search ownership.** Does LogView filter internally (props:
   `levels`, `query`) or expose hooks and let the consumer filter? For a v1
   batteries-included console, recommend internal filtering with controlled
   `query`/`levels` props + `onQueryChange`. Confirm. (Per the roadmap's Stage 3
   note, filter-heavy components should use **`useDeferredValue`** on the query
   so typing stays responsive over large lists — apply it here.)
4. **Auto-scroll semantics.** Confirm the "follow tail / detach on manual
   scroll-up / jump-to-bottom" behavior and whether `follow` is controllable.
5. **Compound vs monolithic.** Is there a toolbar slot (filter chips + search +
   clear) the consumer can customize, or is it a fixed built-in toolbar with
   props? Recommend a built-in toolbar with `show*`/`render*` escape hatches;
   confirm.

## Implementation guardrails specific to LogView

- **Virtualize via `@tanstack/react-virtual`**, mirroring DataTable. Do not
  hand-roll windowing. Variable-height rows (wrapped lines) need
  `measureElement`; fixed-height rows are simpler — pick based on the wrapping
  decision and document it.
- **Auto-scroll** is a genuine external-system sync (scroll position) → a
  `useEffect`/`useLayoutEffect` is legitimate here, but read latest props via
  `useLatest` and guard against fighting the user's manual scroll. Detect
  "at bottom" from scroll metrics, not from state you mirror.
- **Search highlight** is pure string→segments; put it in a util with tests.
  Use `useDeferredValue(query)` before the filtering `useMemo` (Stage 3 pattern).
- **No theme colors in `useState`.** Level colors come from `vars.colors.*`
  resolved at render/draw time. Verify token paths exist (`accent.error`,
  `accent.warning`, `accent.success`, `text.*`).
- If a reusable "stick to bottom on append" or "is scrolled to bottom" behavior
  emerges and is used in 2+ places, lift it into `src/hooks/`.
- Location: there is no `console`/`log` category yet. **Settle the category in
  planning** — likely `src/components/feedback/LogView/` (console output is
  feedback-adjacent) or a new `data`/`editor` placement. Whatever you pick,
  export from that category's `index.ts` and from `src/index.ts`, and add the
  nav entry under the matching docs section.

## Deliverables (see README checklist for the full ordered list)

- `LogView/` in the agreed category — component, types, css, tests, store/hook
  (as warranted), barrel; wired into both index files.
- MDX docs page + demo(s) (include a "streaming append" demo) + nav entry.
  `PropsTable` uses the **object** form.
- A `minor` changeset.
- Full checklist green (lint, type-check, format, test, build, docs:build).
  Pay attention to virtualization in jsdom tests — assert on the data/filter
  layer and toolbar behavior; you may need to disable virtualization in tests
  (DataTable's tests pass `virtualized={false}` — provide the same escape hatch).
- Draft PR, English-only, branch `etui-logview`.
