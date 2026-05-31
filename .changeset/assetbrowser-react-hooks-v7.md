---
'entangle-ui': patch
---

AssetBrowser: conform to the hardened ESLint setup (react-hooks v7,
strict-type-checked, import-x, jsx-a11y) introduced in #87.

- The selection, navigation, drag-and-drop, marquee, grid-keyboard and
  imperative-handle hooks built their stable handlers with `useEffectEvent`
  and then returned them / listed them in dependency arrays — both forbidden
  by the Compiler-aware rule set. They now read live props/state through
  `useLatest` refs and expose genuinely stable `useCallback`s, matching
  `component-patterns.md` rules #3/#11 and the Timeline migration.
- Removed the `useStableRenderFn` helper: its render-phase ref write violated
  `react-hooks/refs`. Render-props are forwarded through the item context as-is
  (memoize them, like `TreeView`, to avoid per-cell re-renders).
- The root carries `role="region"` and grid cells keep `role="gridcell"`;
  keyboard interaction stays centralized at the grid level.

No public API or behavior change.
