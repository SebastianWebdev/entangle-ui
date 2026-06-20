# Entangle UI — Pre-1.0 Roadmap

> Everything between the current `0.9.0` and the `1.0.0` stabilization
> release. The full plan is absorbed into the `0.x` line — version stays
> below `1.0.0` until practical testing on real apps is done. `1.0.0` is
> reserved for the post-testing stabilization release (see
> `v1.0-roadmap.md`).

## Version discipline

The only hard rule: **never write a `major` changeset on this line.** At
any `0.x` version, a `major` bump goes to `1.0.0` and burns the
stabilization slot. Everything else is fair game:

- **`minor`** for new flagship components, new public hooks, new theme
  primitives, anything that meaningfully extends the public API. This
  is the default for Stage 1 work. Bumps `0.9.0 → 0.10.0 → 0.11.0 → …`
  as we ship.
- **`patch`** for bug fixes, polish passes, internal refactors,
  performance tweaks, accessibility fixes, and the token-audit work in
  Stage 2 (as long as no public token names change). Bumps the trailing
  number only.

Reviewer checklist for every PR merged on this line: open the changeset
file and confirm the bump is `patch` or `minor`. **Never `major`.**

Expected final version of this line is somewhere in the `0.x` range
(`0.15.x`, `0.20.x` — exact number doesn't matter). What matters is
that we control the jump to `1.0.0` deliberately, in the stabilization
PR, not by accident.

## Workflow

- **One PR per flagship component.** These are large, interconnected
  components — keeping them isolated lets us throw the full agent budget at
  each one and review them on their own merits.
- **Planning session before implementation.** For every flagship component
  (and every audit pass), we first hold a planning session in chat to nail
  down the API surface, prop contract, edge cases, and visual behavior.
  The implementation PR only starts once the plan is signed off — agents
  don't get to design the API.
- **Auto-release pipeline stays as-is.** PRs land on `main` directly; the
  changesets workflow builds a release PR that aggregates merged changesets.
  We never push directly to a release branch.
- **Polish / audit passes also ship as small focused PRs** (one audit area
  per PR — e.g., "token-usage audit: primitives", "a11y pass: overlays").

## Stage 1 — Flagship components

These are the components that justify the library's existence. Each gets its
own planning session, then its own implementation PR.

Suggested order, based on dependencies and shared primitives:

| #   | Component      | Status     | Notes                                                                                                                                                                                                                                                                                                      |
| --- | -------------- | ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Viewport       | Foundation | Generalize the existing `primitives/canvas/CanvasContainer` + `useCanvasRenderer` / `useCanvasSetup` / `canvasCoords` / `canvasDrawing` into a public Viewport surface. Selection rectangles, overlay UI slot, perf-isolated rendering layer. Pre-work for NodeGraph + Timeline + AssetBrowser thumbnails. |
| 2   | Minimap        | Shared     | Shared primitive consumed by NodeGraph + Timeline. Build first so both consumers can land against a stable surface.                                                                                                                                                                                        |
| 3   | NodeGraph      | Flagship   | Ports, bezier edges, zoom/pan, multi-selection, minimap slot, context menu, grouping, keyboard navigation. Composes ScrollArea + Popover + primitives + hooks + canvas/viewport.                                                                                                                           |
| 4   | Timeline       | Flagship   | Horizontal, multi-track, keyframes, zoom/scrub, snap-to-frame, playhead. Composes Slider + ResizeObserver + CurveEditor patterns + canvas/viewport.                                                                                                                                                        |
| 5   | AssetBrowser   | Flagship   | Grid + list toggle, thumbnails, drag-drop, search, filter, folder nav. Composes DataTable patterns + Card grid + TreeView for folders.                                                                                                                                                                     |
| 6   | GradientEditor | Deferred   | Linear + radial, draggable stops, CSS import/export. Composes ColorPicker + canvas.                                                                                                                                                                                                                        |
| 7   | FileTree       | Spec       | TreeView specialization with file-type icons, drag-drop import.                                                                                                                                                                                                                                            |
| 8   | LogView        | Spec       | Console output with level coloring, filter, auto-scroll, search. Virtualized.                                                                                                                                                                                                                              |
| 9   | PathBar        | Spec       | File-path breadcrumbs like VS Code. Specialization of Breadcrumbs.                                                                                                                                                                                                                                         |

**One planning session per row, then one PR per row.** The order is a
recommendation, not a contract — if a real-world need flips priorities, we
re-sequence.

> **GradientEditor deferred (2026-06).** The implementation (PR #97) is
> parked as a draft: its visual design could not be reconciled with the rest
> of the library's language. This is allowed under the v1.0 roadmap's
> "Coverage" clause — a flagship may ship **or be explicitly deferred with a
> documented rationale**. Revisit after the practical-validation phase. Until
> then every other Stage 1 flagship is shipped, so Stage 1 is functionally
> closed.

### Carry-over leftovers to fold in opportunistically

Small items from v0.8 / v0.9 that were left on the floor and don't deserve
their own PR — pick them up whenever a flagship PR naturally touches the
same area:

- ~~`useEventCallback` hook (v0.8 plan, never landed)~~ — **shipped**; public
  hook built on `useLatest` (stable identity, always invokes the latest fn).
- ~~`useIsMounted` hook (v0.8 plan, never landed)~~ — **shipped**; public hook
  returning a stable mounted-state getter for guarding async state writes.

## Stage 2 — Style polish & token audit

Manual visual pass. Driven by the user, not the agent — the agent's job is
to apply the requested changes, not to make taste decisions.

Goals:

- **Default theme tuning.** Spacing scale, font sizes, line heights, border
  radii, color ramps reviewed against the full component set in the docs
  site. Adjust tokens, not individual components.
- **Token-usage audit.** Every `.css.ts` file uses `vars.*` from
  `@/theme/contract.css` and never hardcodes colors / spacings. Verifies
  the "change the theme, the whole UI changes" guarantee.
- **Light theme parity.** Light theme shipped in v0.8 — walk every
  component on the docs site with the light theme active and fix anything
  that breaks (contrast, borders disappearing, etc.).
- **Token surface cleanup.** Drop unused tokens. Add tokens where
  components currently inline values. Document the public `--etui-*`
  surface as a stable API.

Workflow:

- One PR per audit area (e.g., `polish: primitives`, `polish: controls`,
  `polish: overlays`, `polish: editor surfaces`) so reviews stay focused.
- Each PR's changeset describes which tokens / components moved and why.
- Visual diffs (docs-site screenshots) attached to each PR.

## Stage 3 — Performance & accessibility audits

### Performance

- **Bundle size budgets** in CI (`size-limit`) — per-component budgets,
  not just the aggregate. Already wired in `npm run size`, needs the
  per-component breakdown.
- **Re-render audit** on dense components (DataTable, NodeGraph, Timeline,
  PropertyInspector). React DevTools profiling, `React.memo` + selector
  patterns where they earn their keep.
- **`useDeferredValue` pass on filter-heavy components.** ✅ **Done.** From the
  Viewport refactor code review (point 13): `CommandPalette` (replaced the
  existing `useDebouncedValue` — and dropped its now-redundant `debounceMs`
  prop — for better interactivity on large item lists), `Combobox`,
  `MultiSelect`, `PropertyPanel`. Each was a one-line change
  (`useDeferredValue(query)`) plus a reference swap inside the filtering
  `useMemo`, shipped as one small PR.
- **Tree-shake verification.** Confirm `preserveModules` + `sideEffects: false`
  still hold after the flagship additions — a single accidental side-effect
  import can defeat the whole strategy.
- **Lazy-load patterns** documented for heavy components (NodeGraph,
  Timeline, AssetBrowser). Code-split entry points if needed.

### Accessibility

- **Keyboard nav matrix** — one row per component, documented in the
  docs site. Anything below the baseline gets fixed in this pass.
- **ARIA roles audit** — verify roles, labels, and live-region usage
  across all interactive components.
- **Focus management** — Dialog/Drawer/CommandPalette focus traps
  validated; focus restore on close validated.
- **Reduced-motion audit** — extend the v0.7 baseline to every animated
  component shipped since (Drawer slide, Skeleton shimmer, etc.).

**Out of scope:** high-contrast theme. User decision — drop it. Other
non-default themes are pushed past 1.0.

Workflow:

- Performance work and a11y work split into separate PRs (different
  reviewer mindset).
- Each PR carries before/after numbers in the description for the metric
  it claims to improve.

## Stage 4 — Theme Builder (Astro docs subpage)

New deliverable not in earlier roadmaps. Lives in `docs-site/` alongside
the existing docs.

Goals:

- Interactive page where a user can edit theme tokens live and preview
  the result against representative components (button, input, panel,
  table, etc.).
- Export the result as a ready-to-paste call to `createCustomTheme(...)`
  - optional download as JSON for tooling sync.
- Anchored on the existing `createCustomTheme` API and the stable
  `--etui-*` CSS variable surface — no new public theming API required.

This stage doesn't gate `1.0.0` strictly, but the user wants it before
practical testing so apps built in the testing phase can use it.

Workflow:

- One planning session for the page layout + interaction model.
- Implementation can be a single PR (page lives in `docs-site/`, doesn't
  touch the library source).

## Out of scope on this line

Items deliberately not done before 1.0 — revisit after the testing phase:

- High-contrast theme (user decision: dropped, possibly forever).
- WCAG 2.1 AA formal certification — we do the audit, but the cert pass
  is a 1.0-line milestone if we pursue it at all.
- Tokens JSON export for Figma sync — nice-to-have, defer unless a real
  consumer asks.
- Visual regression CI (Playwright screenshot diffs against the docs
  site, or an equivalent) — was deferred out of v0.9; reconsider during
  the audit stage if the manual style passes turn out to be unsustainable.
- DatePicker / KanbanBoard / RTL / mobile patterns / i18n / form library
  / state management / data fetching / routing — all explicit non-goals
  per the original roadmap.

## Exit criteria

This line is "done" when:

1. All Stage 1 flagship components shipped and exported from
   `entangle-ui`.
2. Stage 2 token / theme audit closed out — visual consistency pass
   accepted by the user.
3. Stage 3 perf + a11y baselines documented and met.
4. Stage 4 Theme Builder live in the docs site.
5. Carry-over leftovers (`useEventCallback`, `useIsMounted`) shipped.

Then we move to `v1.0-roadmap.md`.
