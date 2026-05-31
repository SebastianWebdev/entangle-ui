---
'entangle-ui': minor
---

Tighten the React peer dependency to `>=19.2.0` so the library can use the
now-stable `useEffectEvent` and `<Activity>` APIs. Internal AssetBrowser
refactor lands on top:

- Replace `useLatest + useCallback` pairs in `useAssetNavigation`,
  `useAssetSelectionController`, `useAssetDnd`, `useAssetMarqueeGesture`, and
  `useAssetBrowserHandle` with `useEffectEvent`. Handlers keep stable
  identity but always see the latest closures, with significantly less code.
- Stabilize `renderThumbnail` / `renderItem` / `renderItemContextMenu` /
  `renderEmptyContextMenu` through a new internal `useStableRenderFn`
  helper, so a consumer passing an inline render-prop no longer busts the
  item context (which would re-render every grid cell).
- Extract grid keyboard navigation into a new `useAssetGridKeyboardNav`
  hook (mirrors the gesture / virtualizer hooks).
- `AssetBrowserStatusBar` now takes `view` as a prop instead of reading the
  chrome context, and an `AssetBrowserAnnouncementLive` subcomponent reads
  the polite-live announcement directly via a new
  `useAssetBrowserAnnouncement` slice hook — the root no longer computes
  it.
- Memoize the `useAssetBrowserViewState` return so callers that capture it
  whole keep a stable identity across renders.
