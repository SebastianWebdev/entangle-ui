# Session prompt — implement `FileTree`

> Paste everything below the line into a fresh agent session. It is
> self-contained. The agent should read the referenced files, hold a planning
> session, get the API signed off, then implement.

---

You are implementing **FileTree**, flagship component #7 on
`docs/plans/pre-1.0-roadmap.md`. The roadmap one-liner:

> **FileTree** — TreeView specialization with file-type icons, drag-drop import.

## Before you write any code

1. Read these, in order — they are the source of truth and override anything in
   this prompt if they conflict:
   - `docs/plans/agent-prompts/README.md` (shared rules: patterns, file
     structure, completion checklist, docs/demo requirements, friction reporting)
   - `CLAUDE.md`
   - `docs/component-patterns.md`
   - `docs/demo-patterns.md`
2. Study the component you are specializing — **`TreeView`** — end to end:
   - `src/components/controls/TreeView/` (component, types, hook, css, tests,
     index). Understand `TreeNodeData`, `TreeNodeState`, `TreeSelectionMode`,
     the controlled/uncontrolled expansion + selection model, and the
     `renderNode` / `renderActions` / `onNode*` callbacks it already exposes.
3. Study the most recent flagship as a style/structure reference:
   `src/components/controls/GradientEditor/` (PR #88).
4. Check what icons already exist for files/folders:
   `src/components/Icons/` has `FileTextIcon`, `FolderIcon`, `FolderOpenIcon`,
   `FolderCogIcon`, `ChevronRightIcon`, etc. Do not add new icon components
   unless genuinely missing.

## What FileTree is

A **file-system-flavored specialization of `TreeView`** — not a rewrite. It is
to TreeView what TransformControl is to VectorInput: a higher-level, opinionated
composition. Core jobs:

- Map a file/folder data model to TreeView's `nodes`, auto-assigning **file-type
  icons** (by extension) and folder open/closed icons.
- **Drag-and-drop import**: dropping OS files onto a folder node (or the root)
  fires an import callback with the `DataTransfer` files and the target folder.
- Optional **internal drag-to-reorder / move** between folders (decide in
  planning whether this ships in v1 or is deferred).
- Sensible file-manager affordances: folder expand/collapse, single/multi
  selection, context-menu hook, keyboard nav (inherited from TreeView).

## Decisions to settle in the planning session (use `AskUserQuestion`)

Do **not** invent answers to these — they are genuine product forks:

1. **Data model.** Does FileTree take a flat `FileTreeNode[]` (nested, like
   `TreeNodeData` with `kind: 'file' | 'folder'`, `name`, `path`, `ext?`), or a
   flat list keyed by path that it nests internally? Recommend the nested form
   for parity with TreeView, but confirm.
2. **Icon resolution.** Built-in extension→icon map only, or also a consumer
   `resolveIcon(node)` override? (Recommend: built-in map **plus** an override
   prop, mirroring how other components allow a `renderX` escape hatch.)
3. **Drag-drop scope for v1.** External OS-file import only (`onImport(files,
targetFolder)`), or also internal move/reorder (`onMove(nodeIds,
targetFolder)`)? Internal move is meaningfully more work — confirm whether it
   is in scope or deferred with a documented rationale.
4. **Controlled surface.** Which of expansion / selection / data are controlled?
   Recommend: reuse TreeView's existing controlled/uncontrolled expansion +
   selection model verbatim; data is a plain prop. Confirm.

## Implementation guardrails specific to FileTree

- **Compose, don't fork.** FileTree should render a `TreeView` (or its internals)
  and feed it derived `nodes`. If you find yourself reimplementing expansion
  state, keyboard nav, or selection, stop — that logic lives in TreeView and
  must be reused. If TreeView is missing a hook you need (e.g. it doesn't expose
  drop targets), that is a **library gap**: extend TreeView with the minimal
  prop and report it as friction in the PR, rather than copy-pasting TreeView.
- **Drag-drop**: use native HTML5 DnD (`onDragOver` / `onDrop` with
  `dataTransfer`). Guard `e.preventDefault()` on dragover so drop fires. Resolve
  the target folder from the node under the pointer. Highlight the drop target
  via a data-attribute + CSS, not inline styles. If a drag/drop hook would be
  reused in 2+ places, add it to `src/hooks/` per the patterns doc.
- **Icon-by-extension** is a pure function — put it in a `fileTreeIcons.ts` (or
  similar) pure module with a unit test. No `'use client'` on it.
- Location: `src/components/controls/FileTree/`. Export from
  `src/components/controls/index.ts` and `src/index.ts`.

## Carry-over you may fold in opportunistically

If FileTree's DnD work naturally needs a stable event-handler helper, the
roadmap has two never-landed hooks worth adding (`docs/pre-1.0-roadmap.md`,
"carry-over leftovers"): `useEventCallback` and `useIsMounted`. Only add them if
this component genuinely uses them — don't pad scope.

## Deliverables (see README checklist for the full ordered list)

- `src/components/controls/FileTree/` — component, types, css, tests, hook (if
  warranted), barrel; wired into both index files.
- Any minimal TreeView extension needed to support FileTree (with friction note).
- MDX docs page + demo(s) + nav entry. `PropsTable` uses the **object** form.
- A `minor` changeset.
- Full checklist green (lint, type-check, format, test, build, docs:build).
- Draft PR, English-only, branch `etui-filetree`.
