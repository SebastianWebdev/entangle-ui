---
'entangle-ui': minor
---

### Breaking Changes

- **Shell component props**: Removed `$` prefix from all shell component props. `$size` → `size`, `$variant` → `variant`, `$side` → `side`, `$orientation` → `orientation` across StatusBar, Toolbar, and MenuBar.
- **BaseButton removed**: Deleted dead `BaseButton` primitive (was not exported from public API).

### Fixes

- **sideEffects**: Changed `sideEffects: false` to `["*.css", "*.css.ts"]` so bundlers preserve Vanilla Extract CSS.
- **Theme export**: Added `entangle-ui/theme` export path for `darkThemeValues` and `DarkThemeValues` type.
- **Hardcoded 26px**: Replaced hardcoded StatusBar medium height with `vars.shell.statusBar.heightMd` theme token.
- **Lockfile**: Regenerated `package-lock.json` to remove stale Emotion peerDeps.

### Performance

- **Icons memoized**: All 63 icon components wrapped with `React.memo` and `/*#__PURE__*/` annotations for better tree-shaking and fewer re-renders.

### Internal

- **Chat SVG deduplication**: Extracted shared mini-icons into `ChatIcons.tsx`, removed duplicated inline SVGs from `ChatAttachment` and `ChatContextChip`.
- **`cn` deprecated**: `cn` utility is now a re-export alias of `cx`. Use `cx` directly.
- **`'use client'` directives**: Added to all icon files for Next.js App Router compatibility.
