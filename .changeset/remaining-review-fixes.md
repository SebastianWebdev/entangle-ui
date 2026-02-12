---
'entangle-ui': patch
---

### Internal

- **ChatToolCall SVG deduplication**: Moved inline `WrenchIcon` and `ChevronIcon` from `ChatToolCall.tsx` to shared `ChatIcons.tsx` as `MiniWrenchIcon` and `MiniChevronIcon`.
- **vite.config.ts cleanup**: Removed stale `build.lib` section with UMD format reference (Rollup handles the real build, Vite is only used for Storybook).
