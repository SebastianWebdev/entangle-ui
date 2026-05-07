---
'entangle-ui': minor
---

Add `CommandPalette` component (`@/components/feedback/CommandPalette`). Search-driven command list shown as a centred floating dialog. Type to fuzzy-filter (subsequence + word-boundary scoring), ArrowUp/Down to navigate, Enter to run, Escape to close. Hover mirrors keyboard selection. Groups, descriptions, leading icons, and `<Kbd>`-rendered shortcuts; supports a custom `renderItem` for full layout overrides. Recent selections are tracked in localStorage when `recentKey` is provided (graceful fallback when unavailable). Component does not bind a global hotkey — wire `useHotkey('Mod+K', open)` in the consumer. Also exports the underlying `fuzzyScore` and `fuzzyFilter` helpers.
