# Feedback remediation — task breakdown (2026-06-23)

> Source: `entangle-ui — feedback & issues log` produced while building a real
> editor (`apps/playground`) on top of `entangle-ui@0.10.0`. This document turns
> that log into **session-sized, independently reviewable tasks**.
>
> Each task below is scoped so that **one implementing session** can: read the
> task → gather context → write tests → implement → self-review → hand off for
> external code review. Tasks are grouped into workstreams; within a workstream
> they are still independent unless a dependency is called out.

## How an implementing session must work

Every task follows the same protocol (do **not** skip steps):

1. **Read the task + gather context.** Open the referenced files, read
   `docs/component-patterns.md` (always) and `docs/nodegraph-performance.md` (only
   if touching NodeGraph hot paths) and `docs/demo-patterns.md` (if touching a
   demo). Confirm the problem still reproduces on the current branch before
   changing anything.
2. **Write tests if it makes sense.** Use `renderWithTheme()` from
   `@/tests/testUtils`, organize into `Rendering` / `Interactions` /
   `Accessibility` describe blocks. For bugs, add a failing test that captures the
   regression first. Pure type changes get a type-level assertion or a compile
   check rather than a runtime test.
3. **Implement to the highest standard.** `@/` imports only, theme tokens only
   (no hardcoded colors/spacing), no `any`, `Prettify`/`LiteralUnion` per
   `CONVENTIONS.md`, all strings in English, i18n via `labels` where user-facing
   text is introduced (see `docs/component-patterns.md` §16).
4. **Self check / self code-review.** Run the project Definition of Done (below)
   and re-read the diff adversarially.
5. **Wait for external code review.** Open the PR as a draft and stop.

### Definition of Done (run in this order, every task)

1. `npm run lint` (fix all errors)
2. `npm run type-check` (zero errors)
3. `npm test` for the touched area, then the full suite (80% coverage threshold
   holds for branches/functions/lines/statements)
4. `npm run format`
5. New/changed public API → docs page in
   `docs-site/src/content/docs/components/<category>/` **plus** a demo in
   `docs-site/src/components/demos/<category>/` (`docs/demo-patterns.md`), with the
   mandatory `## Styling` and (if user-facing strings) `## Internationalization`
   sections.
6. `npx changeset` (patch/minor/major per the change; alpha so breaking is
   allowed pre-1.0 but must be called out)
7. Commit including the changeset. Branch name: `etui-<task-id>` (e.g.
   `etui-select-fullwidth`).

### Conventions every task inherits

- **No CJS / browser-safe only:** nothing shipped in ESM may reference Node
  globals (`process`, `require`, …). This is now a hard rule (see Task A1).
- **Back-compat within alpha:** additive props preferred; when an API must
  change, surface it in the changeset and the PR description (demos drive the
  pre-1.0 API — `docs/demo-patterns.md`).
- **Theme tokens:** new floating surfaces use `vars.zIndex.*`; new spacing uses
  `vars.spacing.*`; resolve `--etui-*` names from `themeContractData.ts`.

---

## Verification notes (built & inspected `npm install && npm run build` on current `main`)

The feedback was written against the **published 0.10.0** bundle. I re-verified the
three "is it still real?" items by actually building the package and grepping
`dist/` (not just reading the externals list — that earlier shortcut produced two
wrong calls, now corrected). **All three are confirmed real on current `main`.**

| Feedback item                             | Status on current `main` (built & inspected)                                                                                                                                                                                                                                                                                                                                                                                                                                                  | Effect on the task                                                                                           |
| ----------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| `picocolors`/`process` in browser bundle  | **CONFIRMED reproducible.** `npm run build` emits `dist/esm/node_modules/picocolors/picocolors.js` (`let p = process \|\| {}` at module-init) + the whole `@vanilla-extract/css` runtime + `lru-cache`. Root cause: `src/theme/createCustomTheme.ts` imports `createGlobalTheme` from `@vanilla-extract/css` at **runtime**, that package is **not** a rollup external, so it is inlined. `createCustomTheme` is re-exported from the public barrel, so any `entangle-ui` import pulls it in. | Task A1 is a **real 🔴 fix** (externalize `@vanilla-extract/css` / get it off the runtime path) + a CI guard |
| `Tooltip` popup has no `z-index`          | **CONFIRMED still broken.** `Tooltip.css.ts:16` sets `zIndex: vars.zIndex.tooltip`, **but on the inner `BaseTooltip.Popup`** — the portaled, positioned `BaseTooltip.Positioner` (`Tooltip.tsx:330`) has **no** z-index. A positioned `AppShell` slot at `vars.zIndex.base` (=1) therefore paints over it. The token has been there since PR #29 (so it was present in 0.10.0 and never fixed the symptom).                                                                                   | Task F2 is a **real bug fix** (move/duplicate z-index onto the Positioner), not a verify task                |
| `import 'entangle-ui/styles.css'` missing | **CONFIRMED missing, and worse:** `entangle-ui/darkTheme.css` is _also_ not exported; only `entangle-ui/theme` resolves; `darkTheme.css.ts` is **not** in the runtime import graph (only tests import it).                                                                                                                                                                                                                                                                                    | Task A2 must decide & ship the **one canonical theme-load path** before docs (Task B1) can be fixed          |

> Note: I could not fetch `github.com/SebastianWebdev/procedural-planet`
> (HTTP 404 — private/renamed; my GitHub access is scoped to `entangle-ui`). The
> findings above are confirmed directly from the `entangle-ui` source + a real
> build, which is the authoritative signal anyway.

---

## Summary table

| ID     | Title                                                  | Sev | Type                | Scope | Depends on |
| ------ | ------------------------------------------------------ | --- | ------------------- | ----- | ---------- |
| **A1** | Browser-safe ESM guard (`process`/`picocolors`)        | 🔴  | bug/packaging       | M     | —          |
| **A2** | Canonical theme/CSS entry point                        | 🔴  | packaging           | M     | —          |
| **A3** | Package-relative sourcemaps                            | 🟠  | packaging           | S     | —          |
| **A4** | Testing guide (Vitest `inline`, RO stubs)              | 🟡  | docs/testability    | S     | A2         |
| **B1** | Fix install / getting-started docs everywhere          | 🟠  | docs                | M     | A2         |
| **C1** | `Select` `fullWidth` + content-sized dropdown          | 🟠  | bug/feature         | M     | —          |
| **C2** | `Select` `onChange` null-contract typing               | 🟡  | typing              | S     | —          |
| **D1** | `PropertyRow` tooltip fix + `label: ReactNode`         | 🟠  | bug/typing          | S     | —          |
| **D2** | `PropertySection` first-class checkable section        | 🟡  | feature             | M     | —          |
| **D3** | `PropertyPanel` spacing + fill-height scroll + density | 🟠  | feature/polish      | M     | —          |
| **E1** | `AppShell` top-chrome + `MenuBar` fill/inset           | 🟡  | integration/theming | M     | —          |
| **E2** | `MenuBar` checkable/radio items                        | 🟠  | feature             | M     | E1 (soft)  |
| **F1** | `Slider` value tooltip → portal                        | 🟠  | bug/layout          | M     | —          |
| **F2** | `Tooltip` z-index on Positioner (renders under panels) | 🟠  | bug/layout          | S     | —          |
| **G1** | Align `Button`/`IconButton` icon API                   | 🟡  | typing/DX           | S     | —          |
| **G2** | `Spinner` `decorative` (live-region opt-out)           | 🟡  | a11y                | S     | —          |
| **G3** | `Viewport` docs — lead with "2D only"                  | 🟡  | docs                | S     | —          |
| **H1** | Add viewport/3D icon glyphs                            | 🟡  | assets              | S–M   | —          |

Severity: 🔴 blocker · 🟠 friction · 🟡 minor/polish. Scope: S ≈ short session,
M ≈ one full session, L ≈ tight full session.

---

## Workstream A — Packaging & "can a consumer install and run it?"

These gate the new-consumer experience and ship the only 🔴 blockers. Do A1/A2
first; A3/A4 can follow in parallel.

### A1 — Browser-safe ESM guard (`process` / `picocolors`) 🔴

- **Feedback:** _Browser crash: bundled Node build of `picocolors` reads
  `process`_ (Bugs).
- **Current state — CONFIRMED reproducible (built & inspected):** `npm run build`
  on current `main` inlines the Node build of `picocolors` into the shipped ESM.
  Verified artifacts:
  - `dist/esm/node_modules/picocolors/picocolors.js:8` → `let p = process || {}, argv = p.argv || [] …` (evaluates `process` at module-init).
  - `dist/esm/node_modules/@vanilla-extract/css/dist/vanilla-extract-css.esm.js` (the whole VE css runtime) + its `lru-cache` (also touches `process`) are bundled too.
  - `dist/esm/theme/createCustomTheme.js` →
    `import { createGlobalTheme } from '../node_modules/@vanilla-extract/css/dist/vanilla-extract-css.esm.js'`.
- **Root cause:** `src/theme/createCustomTheme.ts:1,42` imports + calls
  `createGlobalTheme` from `@vanilla-extract/css` at **runtime** (its own JSDoc even
  says _"MUST be called in a .css.ts file (build-time only)"_ — but the module ships
  in the runtime graph). `@vanilla-extract/css` is **not** in
  `rollup.config.js` `EXTERNAL_PACKAGES` (only `@vanilla-extract/dynamic` and
  `/recipes` are), so Rollup **inlines** it — and it depends on `picocolors`
  (`@vanilla-extract/css/package.json` → `"picocolors": "^1.0.0"`).
  `createCustomTheme` is re-exported from `src/index.ts` and `src/theme/index.ts`,
  so **any** `entangle-ui` import drags this module in; in `vite dev` (no
  tree-shaking) it evaluates at load → `process is not defined` → white screen.
- **Deliverable (fix, not verify):**
  1. Get `@vanilla-extract/css` off the inlined runtime path. Primary fix: add
     `@vanilla-extract/css` to `EXTERNAL_PACKAGES` and declare it as a
     `peerDependency` (consumers already pull it transitively via the VE peers; once
     external, their bundler resolves `picocolors` itself and honours its `browser`
     field → no `process`). Reconsider whether `createCustomTheme` (build-time-only
     per its docs) belongs in the runtime barrel at all — consider moving it to a
     build-time-only entry so the VE css runtime never reaches consumer browser code.
  2. Rebuild and confirm `dist/esm` contains **no** `node_modules/picocolors`,
     `node_modules/@vanilla-extract/css`, or `node_modules/lru-cache`, and no
     `let p = process || {}` init.
  3. **Add a regression guard:** a build post-check (`scripts/check-browser-safe.mjs`,
     wired into `prepublishOnly` and a test) that fails if any `dist/esm/**/*.js`
     contains a bare `process`/`require(` outside an allow-listed, bundler-replaceable
     `process.env.NODE_ENV` guard, or inlines a `node_modules/` runtime that should be
     external. (Note the one legitimate in-source guard:
     `src/components/editor/Minimap/Minimap.tsx:99` — `process.env['NODE_ENV']`;
     ensure it stays statically replaceable / allow-listed.)
- **Files:** `rollup.config.js` (externals), `package.json` (`peerDependencies`,
  `scripts`), possibly `src/theme/index.ts` + `src/index.ts` (move `createCustomTheme`
  off the runtime barrel), new `scripts/check-browser-safe.mjs`.
- **Tests:** the guard script (asserts a clean `dist`); a smoke test that importing
  the package entry does not reference `process` at module-init.
- **Risk:** medium — touches externals/peers (consumer install contract). Adding
  `@vanilla-extract/css` as a peer is reasonable since `createCustomTheme` needs it;
  call it out in the changeset. **This is the highest-priority task** — it
  white-screens every browser consumer.

### A2 — Canonical theme / CSS entry point 🔴

- **Feedback:** _`entangle-ui/styles.css` does not exist_ (Documentation) +
  _side-effect CSS imports force `server.deps.inline`_ (Bugs).
- **Current state (verified):** `package.json` `exports` (lines 14–34) expose only
  `.`, `./palettes`, `./theme`, `./theme-values`, `./tokens.{json,dark,light}.css`,
  `./package.json`. So **both** documented CSS imports fail with
  `ERR_PACKAGE_PATH_NOT_EXPORTED`:
  - `entangle-ui/styles.css` (skill docs)
  - `entangle-ui/darkTheme.css` (README, `docs/quickstart.md`)
    Only `entangle-ui/theme` resolves. **Open question to resolve in this task:**
    `src/theme/darkTheme.css.ts` (the `createGlobalTheme(':root', …)` that registers
    `--etui-*` values) is imported only by tests (`src/tests/testUtils.tsx:8`) and
    itself — **not** by `src/index.ts` or `src/theme/index.ts`. Confirm how the dark
    theme `:root` vars actually reach a consumer today (via `ThemeProvider` runtime
    injection? via a component side-effect? not at all?).
- **Deliverable:** pick **one** canonical, working pattern and make it true
  end-to-end:
  - **Option (a):** add a real `./styles.css` export (a tiny side-effect entry that
    imports the dark theme + `globalScrollbars` registration), so the documented
    line works; **or**
  - **Option (b):** make `entangle-ui/theme` (and/or the root import) the
    documented path and ensure it side-effect-registers the dark theme `:root`
    vars; remove the separate-stylesheet guidance entirely.
    Whichever is chosen, a fresh app that imports it must render styled with the
    dark theme **without** a `ThemeProvider** wrapper (the README quick-start has no
provider — that contract must hold or the docs must change to require the
provider). Update the `exports`map and`files`/build accordingly.
- **Files:** `package.json` (`exports`), `rollup.config.js` (new entry if Option
  a), `src/theme/index.ts`, possibly a new `src/styles.css.ts`.
- **Tests:** a packaging test that imports the canonical path and asserts a known
  `--etui-*` custom property is present on `:root` (jsdom).
- **Risk:** medium — touches the public exports surface. Coordinate the decision
  here because **B1 (docs) depends on it.**

### A3 — Package-relative sourcemaps 🟠

- **Feedback:** _Published sourcemaps point outside the package_ (Bugs).
- **Current state:** `rollup.config.js:53–60` sets `sourcemap: true` +
  `preserveModulesRoot: 'src'` with no `sourcesContent`/`sourceRoot` control, so
  consumers see `…/node_modules/src/<file>` `sources` and hundreds of
  "source file outside its package" warnings.
- **Deliverable:** emit sourcemaps with inlined `sourcesContent` and
  package-relative `sources` (or omit unshipped source paths). Verify by building
  and inspecting a couple of `dist/esm/**/*.js.map`, and by confirming Vite/Vitest
  in a scratch consumer no longer warns.
- **Files:** `rollup.config.js`. Possibly `tsconfig.build.json`.
- **Tests:** a build post-check assertion (can live alongside A1's guard) that
  `.js.map` `sources` are package-relative and `sourcesContent` is present.
- **Risk:** low; config-only.

### A4 — Testing guide (Vitest `inline`, RO/observer stubs) 🟡

- **Feedback:** _Side-effect CSS imports force `server.deps.inline`_ (Bugs) +
  _SplitPane needs a `ResizeObserver` stub_ (What worked well).
- **Deliverable:** a "Testing" guide under `docs-site/src/content/docs/guides/`
  (and mirror into the skill) documenting: the `test.server.deps.inline:
['entangle-ui']` requirement (or note it's unnecessary if A2 ships a single
  stylesheet), the `ResizeObserver` stub for `SplitPane`/observer-based
  components, and `renderWithTheme` guidance for consumers.
- **Files:** new `docs-site/src/content/docs/guides/testing.mdx`, skill mirror.
- **Depends on A2** (its recommendation changes if a single stylesheet exists).
- **Risk:** none; docs-only.

---

## Workstream B — Documentation & onboarding accuracy

### B1 — Fix install / getting-started docs everywhere 🟠

- **Feedback:** _Installation guide — stale `@alpha` + understated peer deps_ +
  _`styles.css` import_ (Documentation).
- **Current state (verified):**
  - **Wrong React floor (says ≥19.1, peer is ≥19.2):** `README.md:27`,
    `docs/quickstart.md:21`, `docs-site/.../getting-started/installation.mdx:22`,
    `.claude/skills/entangle-ui/reference/getting-started/installation.md:21`.
  - **Missing peers:** docs omit `@tanstack/react-virtual ^3.13` (and should list
    all five runtime peers: `@base-ui/react`, `@floating-ui/react`,
    `@tanstack/react-virtual`, `@vanilla-extract/dynamic`,
    `@vanilla-extract/recipes`). README also omits `@tanstack/react-virtual`.
  - **`@alpha` install tag** resolves to ancient `0.1.0-alpha.0`:
    `docs-site/.../installation.mdx:9`, `docs/quickstart.md:8`, skill
    `installation.md:8`. (README:22 already uses no tag.)
  - **Broken CSS imports:** `entangle-ui/styles.css` (`SKILL.md:26,184`),
    `entangle-ui/darkTheme.css` (`README.md:37,85`, `docs/quickstart.md:33,57`).
- **Deliverable:** one consistent install story across **all** surfaces: correct
  install command (drop/retire `@alpha` or re-point the tag), React floor `≥19.2`,
  all five peers, and the **single canonical theme import decided in A2**. Verify
  there are no remaining `styles.css`/`darkTheme.css` references except where they
  legitimately resolve.
- **Files:** `README.md`, `docs/quickstart.md`, `docs/theming.md`,
  `docs-site/src/content/docs/getting-started/{installation,quick-start}.mdx`,
  `.claude/skills/entangle-ui/SKILL.md`,
  `.claude/skills/entangle-ui/reference/getting-started/*`. (Note the docs-site
  generator `docs-site/scripts/generate-llms-txt.mjs:252` and the skill are partly
  generated — fix at source.)
- **Depends on A2.**
- **Risk:** low; docs-only, but high consumer impact.

---

## Workstream C — Select

### C1 — `Select` `fullWidth` + content-sized dropdown 🟠

- **Feedback:** _`Select` dropdown only as wide as the trigger → longer options
  clip_ (Bugs).
- **Current state (verified):** container
  (`Select.css.ts:7–11`) is `display:flex; flex-direction:column` with no width →
  shrinks to the selected label in a flex row; trigger is `inline-flex` with no
  width/minWidth; dropdown width is measured from the trigger rect
  (`Select.tsx:171–196`, `dropdownW = minDropdownWidth ? max(rect.width,
minDropdownWidth) : rect.width`); `style`/`className` land on the container, not
  the trigger (`Select.tsx:479–480`). Only lever today is `minDropdownWidth` (a
  magic pixel value that widens only the dropdown).
- **Deliverable:** add `fullWidth?: boolean` (container → `width:100%`; trigger
  already 100% once container stretches) **and** size the open dropdown to its
  content (`max-content` of options, clamped to viewport) so options never clip
  regardless of trigger width. Consider a trigger `minWidth` token. Keep
  `minDropdownWidth` working.
- **Files:** `Select.types.ts:26–155`, `Select.css.ts:7–11` & `16–156`,
  `Select.tsx:171–196`; docs page + `SelectDemo.tsx`.
- **Tests:** dropdown renders wider than a narrow trigger when an option label is
  long; `fullWidth` stretches the container; `minDropdownWidth` still respected.
- **Risk:** low; `fullWidth` is additive (default `false` = current behavior).

### C2 — `Select` `onChange` null-contract typing 🟡

- **Feedback:** _Prop types ARE exported — with one ask_ (Typing).
- **Current state (verified):** `onChange?: (value: T | null) => void` is
  unconditional (`Select.types.ts:149`) even though a non-`clearable`
  (`Select.types.ts:126`) Select can only emit a real `T`. Runtime is already
  correct (`null` only flows from the clear button, which is gated by `clearable`).
- **Deliverable:** narrow `onChange` to `(v: T) => void` when `clearable` is not
  set (discriminated-union or conditional-typed `SelectProps`), keep `(v: T |
null) => void` when `clearable` is `true`. **Alternatively**, if the conditional
  type proves brittle, document the null contract explicitly — pick the simpler of
  the two that still removes the spurious null-check.
- **Files:** `Select.types.ts` only (no runtime change). Add a type-level test.
- **Risk:** medium — stricter types may flag consumer `onChange` chains that
  null-coalesce; this is alpha, so call it out in the changeset. **Type-only,
  isolate from C1** for a clean review.

---

## Workstream D — Property\* inspector family

All three are independent (different files / concerns) and can run in any order.
Folder: `src/components/editor/PropertyInspector/`.

### D1 — `PropertyRow` tooltip fix + `label: ReactNode` 🟠 + 🟡

- **Feedback:** _`PropertyRow` `tooltip` never shows — trigger is
  `display: contents`_ (Bugs) + _`PropertyRow.label` typed `string` but renders any
  ReactNode_ (Typing).
- **Current state (verified):** `PropertyRow.tsx:99–105` wraps the label in
  `<Tooltip><span style={{display:'contents'}}>…</span></Tooltip>`; `display:
contents` generates no box → no hover target → tooltip is dead. Label renders via
  `<span>{label}</span>` (`PropertyRow.tsx:97`) but is typed `label: string`
  (`PropertyInspector.types.ts:166`).
- **Deliverable:** replace the `display:contents` wrapper with an
  `inline-flex`/`inline-block` element (preserve modified-dot + label alignment) so
  the tooltip has a hit area; widen `label` to `React.ReactNode`. These ship
  together — same component, one PR.
- **Files:** `PropertyRow.tsx:97,99–105`, `PropertyInspector.types.ts:166`; docs.
- **Tests:** hovering the label opens the tooltip (interaction test); a
  `ReactNode` label renders without a cast.
- **Risk:** low; verify the inline wrapper doesn't shift row layout.

### D2 — `PropertySection` first-class checkable section 🟡

- **Feedback:** _no first-class "checkable" section_ (Missing functionality).
- **Current state (verified):** `actions` slot exists (header-right, doesn't toggle
  collapse) and `disabled` dims + blocks collapse, but there is no managed
  enable-toggle that also dims the body. Header is composed in
  `PropertySection.tsx:121–148`; body in `:151–161`; props in
  `PropertyInspector.types.ts:82–158`.
- **Deliverable:** optional `checkable`/`checked`/`defaultChecked`/`onCheckedChange`
  that renders a managed toggle in the header (reuse the `Switch`/`Checkbox`
  primitive; align it to the `actions` position) and **dims but does not unmount**
  the body when off (greyed, `pointer-events:none`). Controlled + uncontrolled,
  mirroring the existing collapse state pattern. Pairs conceptually with E2.
- **Files:** `PropertyInspector.types.ts:82–158`, `PropertySection.tsx`,
  `PropertySection.css.ts`; docs page (+ `## Styling`) and demo.
- **Tests:** toggling fires `onCheckedChange`; body dims (not removed) when off;
  controlled value respected; collapse still independent of checked.
- **Risk:** low; all additive.

### D3 — `PropertyPanel` spacing + fill-height scroll + density 🟠

- **Feedback:** _tight default spacing + no fill-height scroll → controls touch the
  edge_ (Missing functionality).
- **Current state (verified):** `rowControl` has only `padding-right: xs` (2px)
  (`PropertyRow.css.ts:56–63`); `panelContent` h-padding is `md` (8px)
  (`PropertyPanel.css.ts:46–54`); `PropertyPanel` only wraps content in
  `ScrollArea` when a fixed `maxHeight` is set (`PropertyPanel.tsx:175–186`), so a
  dock-filling scrolling panel must be hand-rolled and the native scrollbar overlaps
  the right padding.
- **Deliverable:** (1) bump `rowControl` right padding (`xs`→`sm`/`md`) so controls
  don't sit on the edge; (2) a "fill height + scroll" mode (`fillHeight?: boolean`
  or `scrollMode`) that uses `ScrollArea` with reserved scrollbar gutter without a
  fixed `maxHeight`; (3) optional `density?: 'compact'|'normal'|'spacious'` mapping
  row/control/panel spacing.
- **Files:** `PropertyRow.css.ts:56–63`, `PropertyPanel.css.ts:46–54`,
  `PropertyPanel.tsx:175–186`, `PropertyInspector.types.ts`; docs + demo.
- **Tests:** `fillHeight` wraps content in a scroll container without `maxHeight`;
  density variants apply expected padding; default spacing unchanged unless opted
  in (decide whether the right-padding bump is a default change → changeset note).
- **Risk:** low–medium; the padding bump is a visual default change — call it out.

---

## Workstream E — Shell (AppShell + MenuBar)

### E1 — `AppShell` top-chrome + `MenuBar` fill/inset 🟡

- **Feedback:** _`MenuBar` in `AppShell.MenuBar` reads as a lighter block_
  (Integration) + the open question on `AppShell.Toolbar position="right"` as a
  panel dock (What worked well).
- **Current state (verified):** `AppShell` shell bg is `background.primary`
  (#1a1a1a, `AppShell.css.ts:42`); the menubar slot sets only `gridArea` with no bg
  (`AppShell.css.ts:49–51`); `MenuBar` paints `vars.shell.menuBar.bg` (#2d2d2d,
  `MenuBar.css.ts:10`) and is `flexShrink:0` with horizontal padding
  (`MenuBar.css.ts:14,16`) → a lighter, content-width block on a darker bar. Tokens
  in `themeContractData.ts:113–121` / `darkThemeValues.ts:110–118`.
- **Deliverable:** give the AppShell top chrome (menubar slot, and consider the
  toolbar/status chrome) the menubar background by default so it reads as one chrome
  strip without per-consumer styling; have `MenuBar` stretch to fill its slot
  (`width:100%`/`flex:1`) and give triggers a small vertical inset so the hover fill
  doesn't bleed to the chrome edges. Ship a documented `AppShell` + `MenuBar`
  example, and answer the docs open question (is `AppShell.Toolbar
position="right"` the intended home for a full `PropertyPanel`, or is there a
  dedicated dock slot?).
- **Files:** `AppShell.css.ts:42,49–51`, `MenuBar.css.ts:6–31`; AppShell docs page +
  `AppShellDemo.tsx`.
- **Tests:** mostly visual; assert the slot/menubar resolve to the same bg token
  and MenuBar fills width. Keep snapshots updated.
- **Risk:** low–medium; default visual change — document and update demos/snapshots.

### E2 — `MenuBar` checkable / radio items 🟠

- **Feedback:** _`MenuBar` has no checkable item (checkbox / radio) type_ (Missing
  functionality).
- **Current state (verified):** `MenuBar` compound API is only `Menu`/`Item`/`Sub`/
  `Separator` (`MenuBar.tsx:480–485`); `Item` renders a flat icon·label·shortcut
  with no indicator gutter (`MenuBar.tsx:70–112`, icon at `:105`). The
  **navigation `Menu`** already implements `RadioGroup`/`RadioItem`/`CheckboxItem`
  over Base UI primitives (`Menu.tsx:266–379`, `Menu.types.ts:115–196`) — mirror it.
- **Deliverable:** add `MenuBar.CheckboxItem` (`checked`/`onCheckedChange`),
  `MenuBar.RadioGroup` + `MenuBar.RadioItem` with a reserved leading check-mark
  gutter so checked/unchecked items align. Match the navigation `Menu` API shape so
  the two are consistent.
- **Files:** `MenuBar.types.ts`, `MenuBar.tsx` (new components + `Object.assign`),
  `MenuBar.css.ts` (indicator gutter); docs + demo.
- **Tests:** checkbox toggles `aria-checked` + fires `onCheckedChange`; radio group
  single-selects; check gutter reserves space (alignment).
- **Soft-depends on E1** only to avoid two churns of MenuBar CSS/snapshots; can be
  done independently if sequenced after E1.
- **Risk:** medium; new public compound surface — design-review the API against
  navigation `Menu` for consistency.

---

## Workstream F — Overlays / floating

### F1 — `Slider` value tooltip → portal 🟠

- **Feedback:** _`Slider` value tooltip is inline → clips under the panel/section
  header_ (Bugs).
- **Current state (verified):** the value tooltip is an absolutely-positioned
  `<div>` inside the slider wrapper (`Slider.tsx:555–564`,
  `Slider.css.ts:217–268`), default-on (`showTooltip`, `Slider.tsx:260`); it is
  clipped by any ancestor `overflow` (e.g. a section header). Slider is a hot path
  (rAF-throttled drag) — keep that intact.
- **Deliverable:** render the value tooltip in a portal (reuse the `Tooltip`
  primitive, or a `createPortal` to `document.body` like `Select`), and/or add a
  `tooltipPlacement` so it can flip below. Default visual position unchanged; only
  the clipping behavior fixed. Confirm drag perf is unaffected (portal render is
  gated by tooltip visibility).
- **Files:** `Slider.tsx:555–564`, `Slider.css.ts:217–268`; docs note.
- **Tests:** tooltip escapes an `overflow:hidden` ancestor (assert portal target);
  value still tracks the thumb; perf path (rAF) unchanged.
- **Risk:** medium; verify no regression in keyboard/drag interaction or the
  existing Slider tests.

### F2 — `Tooltip` z-index on the Positioner (renders under panels) 🟠

- **Feedback:** _`Tooltip` popup has no `z-index` → renders under other panels_
  (Bugs). **Confirmed still broken on `main`** (user observed it; structural cause
  below).
- **Current state (verified):** `Tooltip.css.ts:16` sets `zIndex:
vars.zIndex.tooltip` (=1000) **on the inner `BaseTooltip.Popup`** — but the
  element Floating UI actually positions/portals is `BaseTooltip.Positioner`
  (`Tooltip.tsx:329–360`), which gets **no** z-index. A `position: fixed` Positioner
  with `z-index: auto` creates its own root-level stacking context at level 0; an
  `AppShell` slot positioned at `vars.zIndex.base` (=1, `AppShell.css.ts:56,88`)
  therefore paints **over** the tooltip. The 1000 on the Popup is trapped inside the
  Positioner's context and can't compete. (This is why `Select`/`Popover` work — they
  put z-index on the actually-portaled positioned element via their own
  `createPortal`.)
- **Deliverable:** apply `zIndex: vars.zIndex.tooltip` to the **Positioner**
  (give `BaseTooltip.Positioner` a class / pass it through `finalPositionerProps`),
  not only the Popup. Then **audit the other Base UI `Positioner`/`Popup` pairs for
  the same mistake** — `HoverCard` (`HoverCard.css.ts:7`, popover token), navigation
  `Menu` (`Menu.css.ts:16`, dropdown token) — and fix consistently. Confirm
  `Select`/`Popover` (manual `createPortal`) are already correct.
- **Files:** `Tooltip.tsx:329–360`, `Tooltip.css.ts` (new `tooltipPositionerStyle`
  or move zIndex), and the audited siblings; regression tests.
- **Tests:** render a tooltip inside a positioned (`z-index:1`) container and assert
  the portaled positioner carries the tooltip z-index token; jsdom can assert the
  computed class/inline z-index on the positioner element.
- **Risk:** low–medium; verify the arrow/positioning still renders and the audited
  siblings don't regress their own snapshots.

---

## Workstream G — Small polish / a11y / typing

### G1 — Align `Button` / `IconButton` icon API 🟡

- **Feedback:** _`Button` takes `icon` as a prop but `IconButton` takes it as
  `children`_ (Typing).
- **Current state (verified):** `Button` has `icon` prop (`Button.tsx:72–77`,
  render `:162–163`); `IconButton` takes the glyph as required `children`
  (`IconButton.tsx:28–40`, render `:162–207`) and has no `icon` prop, so
  `<IconButton icon={…}/>` type-errors.
- **Deliverable:** accept an optional `icon` prop on `IconButton` (mapped to the
  same slot), keeping `children` working for back-compat; document both. (If a
  rename/deprecation is preferred over duplication, raise it in the PR — but the
  low-risk path is additive.)
- **Files:** `IconButton.tsx` (types + render); docs for both components.
- **Tests:** `icon` prop renders; `children` still renders; precedence defined.
- **Risk:** low; additive.

### G2 — `Spinner` `decorative` (live-region opt-out) 🟡

- **Feedback:** _`Spinner` inside `StatusBar` nests two `role="status"` live
  regions_ (Other).
- **Current state (verified):** `Spinner` is `role="status"` + `aria-live="polite"`
  (`Spinner.tsx:89–98`); `StatusBar` root is too (`StatusBar.tsx:138–147`). Nesting
  double-announces.
- **Deliverable:** add `decorative?: boolean` to `Spinner` → `role="presentation"`
  - `aria-hidden` (drop `aria-live`) for use inside an existing live region;
    document the StatusBar composition.
- **Files:** `Spinner.types.ts:16–42`, `Spinner.tsx:89–98`; Spinner/StatusBar docs.
- **Tests:** `decorative` removes the live-region role/aria; default unchanged.
- **Risk:** low; additive.

### G3 — `Viewport` docs — lead with "2D only" 🟡

- **Feedback:** _`Viewport` name reads as "3D viewport" but it is a 2D pan/zoom
  surface_ (API ambiguities).
- **Current state (verified):** JSDoc (`viewport/Viewport.tsx:71–98`) and docs
  (`.../primitives/viewport.mdx:3`) already say "2D world editors / pan/zoom" but
  don't **lead** with the 2D boundary.
- **Deliverable:** lead the docs (and the component index one-liner) with
  "**2D only**", add a short "for 3D, host your own WebGL canvas in the dock" note.
  No rename in this task (rename would be a separate, larger API task if ever
  desired).
- **Files:** `docs-site/.../primitives/viewport.mdx`, skill `SKILL.md:61`, JSDoc.
- **Risk:** none; docs-only.

---

## Workstream H — Icons

### H1 — Add viewport / 3D icon glyphs 🟡

- **Feedback:** _Icon set lacks rotation/orbit and camera glyphs_ (Other).
- **Current state (verified):** ~89 icons in `src/components/Icons/`; no
  rotate/orbit/spin, camera, cube/axis, or zoom-to-fit glyph (`RefreshIcon`/
  `HomeIcon` are being reused, muddying meaning). Each icon is a tiny
  `React.memo` wrapping `<Icon>` SVG children (see `Icons/ZoomInIcon.tsx`) +
  one barrel export in `Icons/index.ts`.
- **Deliverable:** add `OrbitIcon`/`RotateIcon` (+ optional `SpinIcon`),
  `CameraIcon`, `CubeIcon` (axis/3D), `ZoomFitIcon` (zoom-to-fit), matching the
  existing 24×24 stroke style; export each from the barrel; add to the icons docs
  page if one exists.
- **Files:** new `Icons/<Name>Icon.tsx` per glyph, `Icons/index.ts`; icons docs.
- **Tests:** each new icon renders an `<svg>` and forwards `IconProps` (follow the
  existing icon test pattern, if any).
- **Risk:** none; purely additive assets. ~20 LOC/icon.

---

## Suggested execution order (batching across sessions)

The user's model is **one task per session**. Suggested sequencing:

- **Batch 1 — unblock the consumer (do first):** A1, A2, A3. Then B1 (after A2),
  A4 (after A2). These remove the only 🔴s and make "install + run + test" honest.
- **Batch 2 — high-friction component fixes (parallelizable):** C1, D1, F1, F2,
  E1. Independent files; safe to run in separate concurrent sessions.
- **Batch 3 — features & polish:** E2 (after E1), D2, D3, C2, G1, G2, G3, H1.

Cross-task notes:

- **B1 must wait on A2** (the canonical theme import is decided there).
- **E2 should follow E1** to avoid two rounds of MenuBar CSS/snapshot churn.
- **C1 and C2 are separate PRs** (runtime/CSS vs type-only) for clean review.
- **D1/D2/D3 are independent** despite sharing the folder.

---

## Do-not-regress list (validated as working in the feedback)

Keep these behaviors intact; any task touching them must preserve them:

- `ColorPicker` + `Switch` + `IconButton` composing freely inside
  `PropertySection` (panels are not locked to `PropertyRow`s).
- `ToastProvider` + `useToast` (`success`/`error(msg,{title})`) ergonomics and
  jsdom-assertable toasts.
- `Toolbar.Toggle` (`pressed`/`onPressedChange`) `aria-pressed` + shared store.
- `AppShell` + `PropertyPanel`/`Section`/`Row` + `Select` + `Slider`/`NumberInput`
  - `StatusBar` composing into a real editor with a11y roles
    (`application`/`status`/`combobox`/`option`/`alert`) intact and
    interaction-testable under jsdom + user-event.
- Single-wrap dark `ThemeProvider`.
- `SplitPane`/`SplitPanePanel` resizable split with keyboard-accessible divider.

## Coverage check — every feedback entry is mapped

| Feedback entry                                          | Task      |
| ------------------------------------------------------- | --------- |
| Installation guide stale `@alpha` + peer deps           | B1        |
| `entangle-ui/styles.css` does not exist                 | A2 + B1   |
| `Viewport` 2D-vs-3D naming                              | G3        |
| `MenuBar` in `AppShell.MenuBar` lighter block           | E1        |
| `PropertySection` no checkable section                  | D2        |
| `MenuBar` no checkable item                             | E2        |
| PropertyInspector tight spacing + no fill-height scroll | D3        |
| `Select` dropdown width / no `fullWidth`                | C1        |
| `PropertyRow` tooltip never shows                       | D1        |
| `picocolors` browser crash                              | A1        |
| Sourcemaps point outside package                        | A3        |
| `Tooltip` popup no z-index                              | F2        |
| `Slider` value tooltip clips                            | F1        |
| CSS side-effects force Vitest `inline`                  | A4 (+ A2) |
| `Button` icon prop vs `IconButton` children             | G1        |
| `PropertyRow.label` typed `string`                      | D1        |
| `Select` `onChange` null contract                       | C2        |
| `Spinner` nested `role="status"`                        | G2        |
| Icon set lacks rotation/camera glyphs                   | H1        |
