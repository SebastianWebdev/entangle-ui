---
'entangle-ui': minor
---

Polish `Menu` and `ContextMenu` after code review.

- Pass `onOpenChange`, `onValueChange` and `onCheckedChange` straight through to Base UI instead of wrapping them in inline arrows, so Base UI can keep its subscribers memoized (the `value as string` cast was pure overhead — Base UI already provides the value).
- Type the item components against `HTMLElement` and drop the four `ref as React.Ref<HTMLElement>` casts, restoring ref type-safety.
- Enforce `closeOnClick` defaults (`Menu.Item` `true`, `Menu.RadioItem` / `Menu.CheckboxItem` `false`) in the components so the documented defaults are authoritative rather than inherited.
- Add an `onSelect` activation alias to `Menu.Item`, `Menu.RadioItem` and `Menu.CheckboxItem` (runs alongside `onClick` via one stable handler).
- Expose an imperative `ref` handle (`MenuHandle`) on the `Menu` / `ContextMenu` root with a `close()` method.
- Add a `render` prop to `ContextMenu.Trigger` so the trigger can render as your own element instead of a `display: contents` wrapper.
- Animate the popup on open/close (opacity + scale via Base UI's `data-starting-style` / `data-ending-style`).
- Render `Menu.Group` labels with typography on the label element itself, removing the extra `Text` wrapper.
- Wrap the row components (`Item`, `RadioItem`, `CheckboxItem`, `SubTrigger`, `Separator`) in `React.memo` to avoid re-rendering every row when the parent re-renders.
- Document why `ContextMenu.Content` exposes no `side` / `align` / `sideOffset` (it anchors to the pointer), and add integration tests that exercise the real Base UI primitives.
