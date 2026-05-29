---
'entangle-ui': patch
---

ESLint hardening across the library and the correctness fixes it surfaced.

Tooling: enabled `eslint-plugin-react-hooks` v7 (full Compiler-aware
`recommended`), `typescript-eslint` `strict-type-checked`,
`eslint-plugin-import-x` (no-cycle, order, no-duplicates, type-specifier
style), `eslint-plugin-jsx-a11y`, and enforcement of the mandated `@/` import
alias. `restrict-template-expressions` is tuned with `allowNumber: true`. Rules
apply to `src` only; test files keep the prior type-checked baseline. See
`docs/component-patterns.md` §14.

Behavior-affecting fixes (no public API changes):

- Refs read during render are now reactive state, so values driven by them
  update correctly: `ScrollArea` scrollbar `aria-valuenow` and thumb dragging
  state, `CartesianPicker` / `ViewportGizmo` / `CurveEditor` `isDragging`,
  `Combobox` filtering while editing, `MenuBar` registered-menu tracking, and
  `useListboxNav` navigable indices.
- `Tooltip` no longer mutates the caller-provided `rootProps` object.
- Accessibility: interactive elements that had only pointer handlers now expose
  keyboard handlers, focusability, and valid ARIA across controls, editor,
  navigation, feedback, layout, and primitive components.
- Removed dead conditional branches and redundant optional chaining flagged by
  `no-unnecessary-condition`, and replaced deprecated APIs.
