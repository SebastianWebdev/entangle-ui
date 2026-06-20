---
'entangle-ui': minor
---

Add two public hooks, move filter-heavy components to `useDeferredValue`, and
deprecate `useDebouncedValue`.

- **New hook `useEventCallback`** — a stable callback identity for the
  component lifetime that always invokes the most recently rendered version
  (the `useEffectEvent` pattern). Backed by `useInsertionEffect`, so the
  freshness guarantee holds even for consumers that read it during the same
  commit — a child's `useLayoutEffect`, a synchronous store subscription, an
  imperative handle. Now used internally by `useResizeObserver`,
  `useDebouncedCallback`, `useThrottledCallback`, and `useListboxNav`.
- **New hook `useIsMounted`** — a stable getter reporting whether the
  component is still mounted, for guarding state writes inside async
  continuations that may resolve after unmount.
- **`useDeferredValue` pass** on the filter-heavy components: `CommandPalette`,
  `Combobox`, `MultiSelect`, and `PropertyPanel` defer the query that drives
  filtering, so the inputs stay controlled and responsive while large lists
  re-filter.
- **`Combobox` fix:** the "create" row and exact-match detection now run off
  the same deferred query as the filtered list, so editing toward an exact
  match no longer briefly flashes a stray create row or skews the keyboard
  navigation / `aria-activedescendant` indices.

**Breaking:** `CommandPalette` no longer accepts the `debounceMs` prop. Query
filtering is deferred through React's `useDeferredValue` instead of a fixed
debounce window — better interactivity on large command lists, with no tuning
needed. Remove any `debounceMs={…}` from `<CommandPalette>` usages.

**Deprecated:** `useDebouncedValue` is deprecated in favour of
`useDeferredValue` for keeping an input responsive while an expensive
derivation (filtering, search) lags behind it. It remains exported; use
`useDebouncedCallback` to debounce a _side effect_ rather than a rendered value.
