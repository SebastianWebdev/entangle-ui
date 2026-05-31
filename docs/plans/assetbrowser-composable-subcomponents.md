# AssetBrowser — Composable Toolbar / Footer Subcomponents (RFC)

> **Status:** Planning. Not yet implemented.
> **Author handoff:** to be picked up in a separate session.
> **Scope:** AssetBrowser only (no other components affected).
> **PR base:** branch off the existing AssetBrowser PR once it lands, or open
> a follow-up against `main`.
> **Changeset:** `minor` (adds public compound subcomponents; the existing
> `<AssetBrowser.Toolbar>` / `<AssetBrowser.Sidebar>` slot semantics change
> shape — see §6 for the contract change).

---

## 1. Motivation

Today the `AssetBrowser.Toolbar` and `AssetBrowser.Sidebar` slot pattern is
**all-or-nothing**: a consumer either takes the built-in toolbar verbatim or
replaces the entire toolbar with their own children.

```tsx
// What consumers can do today:
<AssetBrowser items={...}>
  <AssetBrowser.Toolbar>
    <MyCompletelyCustomToolbar />  {/* must rebuild everything */}
  </AssetBrowser.Toolbar>
</AssetBrowser>
```

They cannot:

- Add a single custom button next to the built-in controls.
- Reorder the built-in pieces (e.g. move the sort menu before the search box).
- Hide one specific control (e.g. drop the filter menu but keep the rest).
- Swap one piece (e.g. replace the search input with their own debounced
  variant) while keeping everything else stock.

The current shape also has a **performance cost**: the toolbar consumes the
whole `AssetBrowserChromeContext`, so a keystroke in the search input
re-renders the sort menu, the filter menu, the view-toggle, and the history
controls — even though none of them use `search` / `setSearch`. The Toolbar
is a single subscriber to a single chrome context.

Composable subcomponents that subscribe to **only the slice they need** fix
both problems in one move: more flexible consumer API, finer-grained
re-renders.

This is the same shape proven by Radix UI, shadcn/ui, Reach UI — a flagship
composite exposes its parts as named subcomponents, the default render
composes them with the canonical layout, and consumers can mix-and-match.

## 2. Target consumer API

The default render stays one-liner:

```tsx
<AssetBrowser items={items} path={path} folderTree={tree} />
```

A custom toolbar with everything stock plus one extra button:

```tsx
<AssetBrowser items={items}>
  <AssetBrowser.Toolbar>
    <AssetBrowser.HistoryControls />
    <AssetBrowser.ViewToggle />
    <AssetBrowser.SearchInput />
    <AssetBrowser.Spacer />
    <AssetBrowser.SortMenu />
    <AssetBrowser.FilterMenu />
    <MyShareButton /> {/* drop-in consumer JSX */}
  </AssetBrowser.Toolbar>
</AssetBrowser>
```

Hide the filter menu, swap the search input:

```tsx
<AssetBrowser items={items}>
  <AssetBrowser.Toolbar>
    <AssetBrowser.HistoryControls />
    <AssetBrowser.ViewToggle />
    <MyDebouncedSearchInput />
    <AssetBrowser.Spacer />
    <AssetBrowser.SortMenu />
    {/* no FilterMenu */}
  </AssetBrowser.Toolbar>
</AssetBrowser>
```

Same idea for the status bar and breadcrumbs:

```tsx
<AssetBrowser items={items}>
  <AssetBrowser.StatusBar>
    <AssetBrowser.SelectionCount />
    <AssetBrowser.Spacer />
    <AssetBrowser.ThumbnailSize />
  </AssetBrowser.StatusBar>
  <AssetBrowser.Breadcrumbs />
  <AssetBrowser.Sidebar />
</AssetBrowser>
```

## 3. Subcomponents to ship

### Toolbar pieces

- `AssetBrowser.Toolbar` — wraps children in the toolbar shell (border,
  padding, flex). Layout primitive; no logic.
- `AssetBrowser.HistoryControls` — Back / Forward `IconButton`s; only renders
  when `history` is on.
- `AssetBrowser.ViewToggle` — grid / list `SegmentedControl`.
- `AssetBrowser.SearchInput` — controlled search field.
- `AssetBrowser.SortMenu` — sort field + direction menu.
- `AssetBrowser.FilterMenu` — type-filter checkbox menu; renders nothing when
  `filterableTypes` is empty.
- `AssetBrowser.Spacer` — `flex: 1 1 auto` filler. Shared by toolbar / status
  bar (or just re-export from layout primitives).

### Status bar pieces

- `AssetBrowser.StatusBar` — wraps children in the status-bar shell.
- `AssetBrowser.SelectionCount` — the live "N items, M selected" announcement.
- `AssetBrowser.ThumbnailSize` — segmented control for thumbnail size; only
  renders in grid view.

### Body pieces (already components, just need to be re-exported as compounds)

- `AssetBrowser.Breadcrumbs` — already an internal component.
- `AssetBrowser.Sidebar` — already an internal component.
- `AssetBrowser.Content` — already an internal component (the grid/list switch).

## 4. State / context model

This is the **perf-relevant** half of the design.

The current `AssetBrowserChromeContext` is one big value containing all of:
`view`, `setView`, `search`, `setSearch`, `filters`, `setFilters`,
`filterableTypes`, `sort`, `setSort`, `history`, `canGoBack`, `canGoForward`,
`goBack`, `goForward`. **One subscriber, one context.**

To make each subcomponent re-render only on its own slice, split chrome into
focused contexts (or move into the existing store with per-slice
subscribers). Two viable options:

### Option A — Split chrome into focused contexts

Five small contexts, each consumed by one subcomponent:

- `AssetBrowserSearchContext` → `{ search, setSearch }` consumed by
  `SearchInput`.
- `AssetBrowserSortContext` → `{ sort, setSort }` consumed by `SortMenu` and
  the list view.
- `AssetBrowserFilterContext` → `{ filters, setFilters, filterableTypes }`
  consumed by `FilterMenu`.
- `AssetBrowserViewContext` → `{ view, setView }` consumed by `ViewToggle`
  and the content switch.
- `AssetBrowserHistoryContext` → `{ history, canGoBack, canGoForward, goBack,
goForward }` consumed by `HistoryControls`.

Trade-off: more providers in the tree (5 instead of 1 for chrome), but a
keystroke in `SearchInput` only re-renders `SearchInput`. Same architectural
move as item context already made for selection/focus/drag.

### Option B — Move chrome into the store

Add `search` / `filters` / `sort` / `view` / `historyCursor` slices to the
existing `AssetBrowserStore` and expose per-slice hooks
(`useAssetSearch()`, `useAssetSort()`, …). Subcomponents subscribe via
`useSyncExternalStore` with selectors. Matches how selection/focus/drag
already live.

Trade-off: more code in the store (and we'd still need a controlled / mirror
bridge for the React-level controlled API). One context for the store, one
for the still-stable config (render-props, dnd, etc.).

**Preferred:** Option A. It's strictly less invasive, keeps `useControlledState`
as the single source of truth for controlled props, and the only "cost" is
nesting a few more providers — which React optimizes well.

## 5. Default composition

When the consumer renders `<AssetBrowser items={...} />` with no children,
the root renders the canonical layout itself. The default expands to:

```tsx
<AssetBrowser.Toolbar>
  <AssetBrowser.HistoryControls />
  <AssetBrowser.ViewToggle />
  <AssetBrowser.SearchInput />
  <AssetBrowser.Spacer />
  <AssetBrowser.SortMenu />
  <AssetBrowser.FilterMenu />
</AssetBrowser.Toolbar>
<AssetBrowser.Breadcrumbs />
<AssetBrowser.Body>           {/* shell — sidebar + content + import overlay */}
  <AssetBrowser.Sidebar />
  <AssetBrowser.Content />
</AssetBrowser.Body>
{/* showStatusBar gates the default — see §6 */}
```

A consumer passing **any** child opts out of the default and is responsible
for assembling the layout themselves (we don't try to mix default + custom —
that gets ambiguous fast).

## 6. Migration / breaking changes vs. today

The PR introducing AssetBrowser hasn't been released yet, so we treat the
current slot semantics as provisional. The shape of `<AssetBrowser.Toolbar>`
and `<AssetBrowser.Sidebar>` changes:

| Today                                                                                                     | After                                                                                                              |
| --------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| `<AssetBrowser.Toolbar>` is a Symbol-marked slot that returns `null`; its `children` replace the toolbar. | `<AssetBrowser.Toolbar>` is a real component that **renders** the toolbar shell, with `children` placed inside it. |
| `<AssetBrowser.Sidebar>` ditto.                                                                           | `<AssetBrowser.Sidebar>` becomes the sidebar component itself.                                                     |
| `getSlotKind` / Symbol markers (`slots.ts`).                                                              | Slot markers are removed; the compound pattern is just normal React composition.                                   |

`showStatusBar` becomes a default-layout gate: when true, the default
composition includes `<AssetBrowser.StatusBar>`. Consumers using the
composable API render their own status bar (or omit it). No `showStatusBar`
needed inside their tree.

Outside callers don't see any new prop additions — only the children
contract changes.

## 7. Implementation order

1. **Split chrome contexts (§4 Option A).** Introduce the five contexts in
   addition to the existing one. Keep the existing `AssetBrowserChromeContext`
   exported for a transition period if needed; the new subcomponents read
   from the focused contexts.
2. **Add compound subcomponents** (§3) — wire each to its own context. Each
   subcomponent ships a tiny test that verifies it renders + reacts only to
   its slice.
3. **Rebuild the default `<AssetBrowser.Toolbar>` body** from the compounds
   (so the default render composes them). The internal `AssetBrowserToolbar`
   is removed (or kept as `DefaultToolbar` internally).
4. **Drop the slot marker pattern** (`slots.ts`, `getSlotKind`,
   Symbol-attached `null`-returning components). Default render is decided by
   `children == null`.
5. **Re-export from the AssetBrowser barrel** so `<AssetBrowser.Toolbar>`
   etc. resolve.
6. **Docs site update**: add a "Composing the toolbar" / "Composing the
   status bar" recipe to `docs-site/.../asset-browser.mdx`.

## 8. Tests to add

- `AssetBrowser` default render still renders all the original UI (existing
  tests pass without changes).
- Custom toolbar: render `<AssetBrowser.Toolbar><AssetBrowser.SearchInput />
<MyButton /></AssetBrowser.Toolbar>` — both render, the spacer / sort menu
  / filter menu do not.
- Hide / reorder: dropping a subcomponent removes it from DOM.
- Slice isolation (where jsdom permits): assert that typing in
  `SearchInput` doesn't trigger a re-render of `SortMenu` (use a render
  spy / `React.memo` boundary on the test wrapper).

## 9. Risks

- **API surface expansion.** ~10 new public subcomponents. Documentation
  cost. Type-export list grows. Acceptable for a flagship component.
- **Multiple providers in the tree.** Five extra `<Context.Provider>` nodes.
  Negligible perf cost; the only consideration is reading these contexts
  from outside the tree (already throws — clear error).
- **Symbol-slot pattern removal.** Other AssetBrowser-internal uses of
  `slots.ts` are gone — but `slots.ts` is currently only used by
  AssetBrowser, so the file can be deleted in this RFC's PR.
- **Consumers that already use the today's `<AssetBrowser.Toolbar>` slot
  override.** They'd see a behavior change because the toolbar shell now
  renders too. Since the component is alpha and unreleased, this is
  acceptable — note it in the changeset.

## 10. Out of scope

- Drag handle / reordering of toolbar items at runtime.
- Persisting consumer toolbar layouts.
- Theming hooks for individual subcomponents (covered by the standard
  Vanilla Extract recipes already).
- Server-component flavours (this is a client-only library; N/A).

---

## Checklist (for the implementing session)

- [ ] Split `AssetBrowserChromeContext` into 5 focused contexts (§4).
- [ ] Implement `<AssetBrowser.Toolbar>`, `HistoryControls`, `ViewToggle`,
      `SearchInput`, `SortMenu`, `FilterMenu`, `Spacer` (§3 toolbar).
- [ ] Implement `<AssetBrowser.StatusBar>`, `SelectionCount`,
      `ThumbnailSize` (§3 status bar).
- [ ] Re-export `Breadcrumbs`, `Sidebar`, `Content`, `Body` as compounds.
- [ ] Default-render path in the root composes the compounds (§5).
- [ ] Remove `slots.ts`, `getSlotKind`, `markSlot`, slot marker components.
- [ ] Update existing AssetBrowser tests; add the new tests in §8.
- [ ] Update `docs-site/.../asset-browser.mdx` with a "Composing the
      toolbar" section.
- [ ] Add a `minor` changeset describing the new compound API and the
      `showStatusBar` semantics change.
