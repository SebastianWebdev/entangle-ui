---
'entangle-ui': minor
---

Add two public hooks and move filter-heavy components to `useDeferredValue`.

- **New hook `useEventCallback`** — wraps a callback so its identity stays
  stable for the component lifetime while always invoking the most recently
  rendered version. The function-shaped companion to `useLatest`: pass it to
  memoized children, dependency arrays, or external subscriptions without
  re-subscribing, yet it still closes over the latest props and state.
- **New hook `useIsMounted`** — returns a stable getter reporting whether the
  component is still mounted, for guarding state writes inside async
  continuations that may resolve after unmount.
- **`useDeferredValue` pass** on the filter-heavy components: `CommandPalette`,
  `Combobox`, `MultiSelect`, and `PropertyPanel` now defer the query that
  drives filtering, so the inputs stay responsive while large lists re-filter.
  The text inputs themselves remain fully controlled.

**Breaking:** `CommandPalette` no longer accepts the `debounceMs` prop. Query
filtering is now deferred through React's `useDeferredValue` instead of a fixed
debounce window — this yields better interactivity on large command lists and
needs no tuning. Remove any `debounceMs={…}` from `<CommandPalette>` usages.
