---
'entangle-ui': minor
---

Add `useNavigationHistory<T>` — a generic back/forward stack primitive backed
by `useSyncExternalStore`. Tracks a concurrent-safe cursor over an arbitrary
entry type, exposes `canGoBack` / `canGoForward` flags, mirrors browser
semantics (push truncates the forward branch), and supports an `enabled`
toggle for opt-in history UIs. `AssetBrowser`'s `history` feature is now
composed on top of it through an internal `useAssetNavigation` hook that
encapsulates the parent-folder keyboard shortcut and the `onNavigate` /
`onItemOpen` plumbing.
