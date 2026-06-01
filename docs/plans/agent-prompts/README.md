# Agent prompts — remaining pre-1.0 flagship components

This folder holds **ready-to-run session prompts** for the Stage 1 flagship
components still left on `docs/plans/pre-1.0-roadmap.md`. Hand any one of these
files to a fresh agent session and it can go straight to API planning and
implementation.

## Status (as of this writing)

Stage 1 flagships: **6 / 9 shipped**.

| #   | Component      | Status     | Prompt                                       |
| --- | -------------- | ---------- | -------------------------------------------- |
| 1   | Viewport       | ✅ shipped | —                                            |
| 2   | Minimap        | ✅ shipped | —                                            |
| 3   | NodeGraph      | ✅ shipped | —                                            |
| 4   | Timeline       | ✅ shipped | —                                            |
| 5   | AssetBrowser   | ✅ shipped | —                                            |
| 6   | GradientEditor | ✅ shipped | — (PR #88, reference implementation)         |
| 7   | FileTree       | ⛔ TODO    | [`filetree-prompt.md`](./filetree-prompt.md) |
| 8   | LogView        | ⛔ TODO    | [`logview-prompt.md`](./logview-prompt.md)   |
| 9   | PathBar        | ⛔ TODO    | [`pathbar-prompt.md`](./pathbar-prompt.md)   |

Suggested order: **PathBar → FileTree → LogView** (smallest to largest; PathBar
and FileTree share file-system concepts that inform LogView's filter UI).

## Shared rules every prompt assumes (do not skip)

These come from `CLAUDE.md`, `docs/component-patterns.md`, and
`docs/demo-patterns.md`. Each component prompt assumes you have read them — they
are the source of truth and override anything below if they conflict.

1. **Planning session first.** The roadmap rule is explicit: _agents don't get
   to design the API._ Before writing code, present the proposed API surface
   (props, value model, events, compound parts) and get sign-off. Use the
   `AskUserQuestion` tool for the genuine product forks (value shape, controlled
   vs uncontrolled, which sub-features ship in v1). Do **not** ask about things
   the codebase already answers.

2. **Reuse before reinvent.** Read `src/hooks/index.ts` and the existing
   component you are specializing/composing. If a demo or component needs to
   rebuild something the library already exports, that's a missing export — fix
   the library, not the consumer.

3. **Mandatory patterns** (from `docs/component-patterns.md`):
   - Explicit function signature + `displayName`; **never** `React.FC`.
   - `ref` as a prop; `useImperativeHandle` for handle APIs, `useMergedRef` for
     DOM refs.
   - `useLatest` for every callback/live-value read inside a stable handler or
     effect — consumer inline functions must not invalidate handlers.
   - `useControlledState` for controlled/uncontrolled props (`fallback` is
     required).
   - `useEffect` is the last resort. No theme colors cached in `useState`.
   - Hot-path state (pointer-move, scroll, animation) lives in a store +
     `useSyncExternalStore`, not `useState` + context.
   - Symbol slot markers for compound child detection, never `displayName`.
   - `'use client'` only on files that use hooks/browser globals — never on pure
     type modules, slot markers, or pure util files.
   - Tokens only: `vars.*` from `@/theme/contract.css`. Never hardcode colors or
     spacing. **Verify token paths exist** before using them — e.g.
     `vars.colors.border` has `default | focus | error | success` (no `subtle`),
     `vars.colors.surface.default`, `vars.typography.fontFamily.mono`,
     `vars.shadows.{sm,md,lg,focus,thumb}`.
   - `@/` imports for all cross-directory imports — never relative `../`.
   - No `any`. ESLint `strict-type-checked` is on and fails CI. Notable rules
     that bite: `no-confusing-void-expression` (wrap void calls in braces in
     arrow handlers), `no-unnecessary-condition`, `no-unnecessary-type-assertion`,
     `jsx-a11y` (mirror every `onClick` with `onKeyDown`).

4. **File structure** (`ComponentName/`):

   ```
   ComponentName.tsx
   ComponentName.css.ts        (Vanilla Extract)
   ComponentName.test.tsx
   ComponentName.types.ts      (if types are non-trivial)
   useComponentName.ts         (if a hook is warranted)
   index.ts                    (barrel)
   ```

   Wire the barrel into the category `index.ts` (e.g.
   `src/components/controls/index.ts`) **and** the root `src/index.ts` (both the
   value export block and the `export type` block).

5. **Tests.** Use `renderWithTheme` from `@/tests/testUtils` (not plain
   `render`). jsdom lacks `PointerEvent` and element pointer-capture — polyfill
   them at the top of the test (copy the pattern from
   `src/components/controls/GradientEditor/GradientEditor.test.tsx` or
   `CartesianPicker.test.tsx`). Organize into `describe` blocks: Rendering,
   Interactions, Accessibility. Pure helpers get their own deterministic
   `describe`. Coverage threshold is 80%.

6. **Docs + demo are mandatory** for every component:
   - MDX page at `docs-site/src/content/docs/components/<category>/<name>.mdx`.
   - Demo(s) at `docs-site/src/components/demos/<category>/<Name>Demo.tsx`,
     rendered with `<DemoWrapper>` and `client:only="react"`.
   - Nav entry in `docs-site/astro.config.mjs` (alphabetical within category).
   - **`PropsTable` takes `props={[{ name, type, default?, description }]}`** —
     an array of _objects_, NOT a `rows` array-of-arrays. (This exact mistake
     broke the Docs Build on PR #88 — `props` came back `undefined` →
     `reading 'map'`.) Copy the shape from any existing controls MDX.
   - Run `npm run docs:build` locally before pushing — it builds the docs **and
     regenerates the `.claude/skills/` mirror files**. Commit only the skill
     file(s) for _your_ component; revert unrelated regenerated skill drift
     (see the PR #88 thread for why).

7. **Completion checklist (in order) before committing** — from `CLAUDE.md`:
   1. `npm run lint` (fix errors)
   2. `npm run type-check`
   3. `npm run format`
   4. `npm run test` (or at least the component's file) — full suite must pass
   5. `npm run build` — confirm the component lands in `dist/esm` + `dist/types`
   6. `npm run docs:build` — confirm docs build clean
   7. Create a changeset: a `.changeset/<name>.md` file with
      `'entangle-ui': minor` (new public API). **Never `major`** on the pre-1.0
      line — that burns the 1.0 stabilization slot.
   8. Commit (include the changeset), push to your branch, open a **draft PR**.

8. **Branch + workflow.** One PR per flagship component. Branch off `main`
   (never work on `main`); prefix `etui-` (e.g. `etui-filetree`). Commit
   messages and all code/comments/tests in **English only**.

9. **The GradientEditor PR (#88) is your reference implementation.** It is the
   most recent flagship and follows every rule above:
   `src/components/controls/GradientEditor/`. When unsure how something should
   look, copy from there.

## Pre-1.0 friction reporting

These versions (< 1.0) may break APIs to keep the library honest. If your
component reveals that a primitive it composes is missing a prop, has the wrong
default, or forces a workaround — **surface it in the PR description** rather
than baking a workaround into your component. Example from #88: NumberInput has
no `onChangeComplete`; its commit boundary is `onBlur` (now documented in
`NumberInput.tsx`). That is the established convention — bridge it, don't
duplicate it.
