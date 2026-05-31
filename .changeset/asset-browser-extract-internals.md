---
'entangle-ui': patch
---

Refactor `AssetBrowser` internals into focused hooks and subcomponents. The
root file goes from ~470 → ~370 lines and the grid from ~300 → ~225, with no
public API changes:

- `useAssetMarqueeGesture` — pointer-down/move/up + RAF throttling + hit-test
  for rubber-band selection (lifted out of `AssetBrowserGrid`).
- `useAssetBrowserViewState` — owns the five `useControlledState` pairs plus
  derived `displayed` / `filterableTypes` / `thumbnailSizePx` / `marqueeEnabled`.
- `useAssetBrowserHandle` — wires `useImperativeHandle` and folds in the
  `scrollToItem` fallback logic.
- `AssetBrowserContent` — loading / empty / grid / list switch.
- `AssetBrowserStatusBar` — the optional bottom bar with the thumbnail-size
  control.
- `DEFAULT_LIST_COLUMNS` is now a module-level constant in `AssetBrowserList`
  instead of a function rebuilt inside `useMemo`.
