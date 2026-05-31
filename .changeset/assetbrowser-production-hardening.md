---
'entangle-ui': minor
---

AssetBrowser: production hardening — wire up dead APIs, add error/i18n/a11y, fix
controlled-history and store identity.

New features:

- **Context menus now work.** `renderItemContextMenu` / `renderEmptyContextMenu`
  were typed, documented, and demoed but never rendered — right-click only
  updated selection. Cells (and the empty surface) are now real `ContextMenu`
  triggers. The item callback receives the whole selection when you right-click
  a selected item, otherwise just the item under the cursor. Opt-in, so unused
  menus add zero cost.
- **Loading skeletons.** `loadingItemCount` is no longer dead: grid-view loading
  renders that many skeleton cells (sized to the current thumbnail) instead of a
  lone spinner.
- **Error state.** New `error` (`true` → built-in message, or a custom node) and
  `onErrorRetry` (adds a Retry button) props. Takes precedence over loading/empty.
- **Internationalization.** New `labels` prop overrides every built-in UI string
  (search, sort/filter menus, view tooltips, empty/loading/error, list headers,
  the live announcement). Merged onto English defaults, exported as
  `DEFAULT_ASSET_BROWSER_LABELS` / `AssetBrowserLabels`.
- **Type-aware fallback icons** for files without a thumbnail (material/audio/
  video/scene/text), and a **broken-image fallback** — a failed `thumbnailUrl`
  now shows the type icon instead of the browser's broken-image glyph.

Fixes:

- **Controlled `currentFolderId` now stays in sync with the back/forward stack.**
  An out-of-band change (deep link, "reveal in browser") is pushed onto history,
  so `canGoBack`/Back resolve correctly instead of going stale.
- **Store identity** is created with `useState(() => …)` instead of `useMemo`,
  guaranteeing stable slice subscriptions for the component's lifetime.
- **Marquee** gains an `onPointerCancel` handler so an interrupted/touch-cancelled
  drag no longer leaves the rubber-band rect stuck active.

Accessibility:

- The virtualized grid now exposes true `aria-rowcount`/`aria-colcount` and
  per-cell 1-based `aria-rowindex`/`aria-colindex`, and announces roving focus
  via `aria-activedescendant` (works under windowing without moving DOM focus).

Docs: new Context menus, History, Internationalization, Error-state, Recipes, and
Tips & gotchas sections, plus four new live demos.
