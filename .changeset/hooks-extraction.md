---
'entangle-ui': minor
---

Promote three internal patterns into public hooks: `useFocusTrap`, `useMergedRef`, and `useResizeObserver`.

- `useFocusTrap` was previously a private helper inside `Dialog`. It now lives in the public hooks API with the same `({ containerRef, enabled }) => onKeyDown` signature.
- `useMergedRef` replaces inline ref-merge boilerplate in `Dialog`, `ChatMessageList`, `FloatingPanel`, and `ScrollArea`. Pass any number of object refs, callback refs, `null`, or `undefined`, and get a single callback ref that fans the node out to all of them.
- `useResizeObserver` wraps the browser API with the conventions used elsewhere in the library: SSR-safe, stable callback identity (no re-subscription on callback change), and an `enabled` flag for toggling without unmount. `SplitPane`, `ScrollArea`, and the chat scroll hook (`useChatScroll`) now use it.

All three hooks have full documentation pages with runnable demos.

This is a pure extraction — no behavior changes in the affected components, all existing tests pass.
