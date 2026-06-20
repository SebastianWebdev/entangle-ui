# entangle-ui

## 0.10.0

### Minor Changes

- [#85](https://github.com/SebastianWebdev/entangle-ui/pull/85) [`9eabab7`](https://github.com/SebastianWebdev/entangle-ui/commit/9eabab77e2a1dc95a6c4a66cbf556a68b1365ff1) Thanks [@SebastianWebdev](https://github.com/SebastianWebdev)! - Add the `AssetBrowser` flagship component — a controlled content browser for
  files and folders. Toggle between a virtualized thumbnail grid and a
  `DataTable`-backed list, navigate folders via a breadcrumb bar and a `TreeView`
  sidebar, and search, filter, sort, and select assets. Supports single/multiple
  selection with marquee and keyboard navigation, drag-to-folder move, external
  file import, and drag-out payloads, plus `renderThumbnail` / `renderItem` /
  context-menu render props.

- [#85](https://github.com/SebastianWebdev/entangle-ui/pull/85) [`9eabab7`](https://github.com/SebastianWebdev/entangle-ui/commit/9eabab77e2a1dc95a6c4a66cbf556a68b1365ff1) Thanks [@SebastianWebdev](https://github.com/SebastianWebdev)! - Tighten the React peer dependency to `>=19.2.0` so the library can use the
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

- [#85](https://github.com/SebastianWebdev/entangle-ui/pull/85) [`9eabab7`](https://github.com/SebastianWebdev/entangle-ui/commit/9eabab77e2a1dc95a6c4a66cbf556a68b1365ff1) Thanks [@SebastianWebdev](https://github.com/SebastianWebdev)! - AssetBrowser: add mutation operations — inline rename, delete, create-folder,
  and duplicate.

  AssetBrowser stays controlled and presentational: each operation provides the
  affordance (inline editor, keyboard shortcut, menu action) and reports **intent**
  through a callback — you apply the change and pass back fresh `items`. Presence
  of a callback enables its affordance.

  New props:
  - `onItemRename(item, newName)` — inline rename. Enables an inline label editor
    (swap the cell label for a text field), the `F2` shortcut, the `Rename`
    default action, and `handle.beginRename(id)`. Commits on Enter / blur with a
    changed, non-empty value; cancels on Escape. Return / resolve `false` to
    reject the name and keep the editor open (e.g. failed validation).
  - `onItemsDelete(items)` — delete the acted-on items. Enables the `Delete` key
    (and `⌘⌫` on macOS; plain `Backspace` stays reserved for parent-nav) and the
    `Delete` action. Roving focus moves to a survivor before deletion.
  - `onCreateFolder(parentFolderId)` — enables the empty-area `New folder` action.
    Pair with `handle.beginRename(newId)` for the create-then-rename flow.
  - `onItemsDuplicate(items)` — enables `Ctrl/⌘ + D` and the `Duplicate` action.
  - `defaultItemActions` — auto-populate the item / empty-area context menus with
    Rename / Duplicate / Delete / New-folder entries for whichever callbacks are
    present (labels come from the `labels` prop, so they localize).

  API additions:
  - `renderItemContextMenu(items, actions)` now receives an `actions` object
    (`rename` / `delete` / `duplicate`, bound to the acted-on items) so a custom
    menu can wire the built-in flows without a ref.
  - `AssetBrowserHandle.beginRename(id)` enters inline-rename imperatively
    (scrolls the item into view first).
  - New exported types `AssetItemActions` and `AssetRenameResult`; new `labels`
    keys `rename` / `delete` / `duplicate` / `newFolder`.

  Notes:
  - All mutation affordances work in **both** the grid and list views: inline
    rename, the `F2` / `Delete` / `Ctrl+D` shortcuts, and the right-click menus.
    A single view-agnostic context-menu layer detects the target item from
    `data-asset-id` (grid cells) / `data-row-key` (list rows), and the mutation
    keyboard handler is shared by both scrollers — DataTable itself is unchanged.
  - The "is editing" flag lives in the store as a per-id slice
    (`useAssetEditing`), so a rename re-renders only the affected cell/row and can
    be started from the keyboard, a menu, or the imperative handle. In the list,
    `F2` targets the sole selected row (the list has no roving focus).

  Docs: new Mutations section + a live demo (rename / duplicate / delete / new
  folder); the Context menus, Keyboard reference, and API tables are updated.

- [#85](https://github.com/SebastianWebdev/entangle-ui/pull/85) [`9eabab7`](https://github.com/SebastianWebdev/entangle-ui/commit/9eabab77e2a1dc95a6c4a66cbf556a68b1365ff1) Thanks [@SebastianWebdev](https://github.com/SebastianWebdev)! - AssetBrowser: production hardening — wire up dead APIs, add error/i18n/a11y, fix
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

- [#100](https://github.com/SebastianWebdev/entangle-ui/pull/100) [`3ff903f`](https://github.com/SebastianWebdev/entangle-ui/commit/3ff903f5e8603e6bc763daac73c789945afa383a) Thanks [@SebastianWebdev](https://github.com/SebastianWebdev)! - Add two public hooks, move filter-heavy components to `useDeferredValue`, and
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

- [#90](https://github.com/SebastianWebdev/entangle-ui/pull/90) [`1cdce9c`](https://github.com/SebastianWebdev/entangle-ui/commit/1cdce9c92cb3bf6aa3705d814178045bf14951d4) Thanks [@SebastianWebdev](https://github.com/SebastianWebdev)! - FileTree: a file-system-flavored specialization of `TreeView` with automatic
  file-type icons and drag-and-drop import of OS files.

  `FileTree` renders a `TreeView` internally and feeds it derived nodes — it does
  **not** reimplement expansion, selection, or keyboard navigation. It takes a
  nested `FileTreeNode[]` (`{ id, name, kind: 'file' | 'folder', ext?, path?,
children?, … }`), auto-assigns file-type icons by extension (image / media /
  code / archive / text) plus open/closed folder glyphs, and exposes the same
  controlled/uncontrolled expansion + selection model as `TreeView`.

  New component + API:
  - `<FileTree nodes={…} />` — `expandedIds` / `defaultExpandedIds` /
    `onExpandedChange`, `selectedIds` / `defaultSelectedIds` / `selectionMode` /
    `onSelectionChange`, `size`, `indent`, `showChevrons`, `showGuideLines`,
    `maxHeight`, `emptyContent`, and `onNodeClick` / `onNodeDoubleClick` /
    `onNodeContextMenu` (all mapped to `FileTreeNode`).
  - `onImport({ files, targetFolder })` — fired when OS files are dropped onto a
    folder (or the root, `targetFolder: null`). Presence enables the import drop
    zone; the active target folder is highlighted while dragging. `FileTree`
    reports intent only — apply the change and pass back fresh `nodes`.
  - `resolveIcon(node, { expanded })` — per-node icon override; return `undefined`
    to fall back to the built-in extension map. `renderNode` / `renderActions`
    give full content control. Built-in icons follow the theme, and any icon takes
    a `color` prop, so icons are fully colorable.
  - `expandOnClick` (default `true`) — clicking anywhere on a folder row toggles
    it open/closed, not just the chevron. Set `false` to require the chevron.
  - `labels` (`Partial<FileTreeLabels>`) + exported `DEFAULT_FILE_TREE_LABELS` —
    full i18n for the two built-in strings (`treeLabel` → the `role="tree"`
    accessible name; `emptyLabel` → empty-state text). An explicit `aria-label` /
    `emptyContent` still wins. `aria-label` / `aria-labelledby` are forwarded to
    the tree element.
  - Exported helpers `getFileIconKind` / `classifyExtension` / `getFileExtension`
    and types `FileTreeNode`, `FileTreeNodeKind`, `FileTreeNodeState`,
    `FileTreeImportPayload`, `FileTreeLabels`, `FileIconKind`.

  Internal move / reorder is intentionally deferred for v1 (external import only);
  the heavyweight internal-move case is covered by `AssetBrowser`.

  TreeView (additive, backwards-compatible): new generic drop-target props
  `dropTargetId` and `onNodeDragOver` / `onNodeDragLeave` / `onNodeDrop` (these
  finally wire up the long-declared-but-unused `droppable` field on
  `TreeNodeData`), plus `expandOnClick` (toggle a parent node on row click). All
  usable on a plain `TreeView`, not just `FileTree`.

  Icons: add `ImageIcon` (no image glyph existed; `AssetBrowser` relied on
  thumbnails, but a tree has none). Fix `FolderOpenIcon` geometry — it occupied a
  smaller area of the 24×24 viewBox than `FolderIcon`, so the open folder rendered
  visibly smaller than the closed one; it now shares the closed folder's footprint.

  Docs: new FileTree page with live demos (project tree, drag-and-drop import,
  icon resolution, colored icons, selection, sizes, token re-skin, localized
  labels) plus `## Styling` (theme-token + targeting-hook tables) and
  `## Internationalization` sections.

- [#92](https://github.com/SebastianWebdev/entangle-ui/pull/92) [`98cbbfd`](https://github.com/SebastianWebdev/entangle-ui/commit/98cbbfdb9fa2658568822ef8a49a0f409ccb40f4) Thanks [@SebastianWebdev](https://github.com/SebastianWebdev)! - Add the `LogView` flagship component — a virtualized console / log output panel
  for editor and IDE-style apps. Renders a large, append-only entry stream
  efficiently via `@tanstack/react-virtual`, with per-level coloring (built-in
  `debug | info | warn | error` plus an extensible `levelConfig`), level filter
  chips with live counts, text search with `useDeferredValue` and match
  highlighting, follow-tail auto-scroll with a jump-to-bottom affordance,
  optional timestamps and source tags, and per-line / copy-all support. Optional
  row selection (`selectionMode="multiple"`) with click / Cmd-click / Shift-click,
  keyboard shortcuts (Cmd/Ctrl+A, Cmd/Ctrl+C, Escape), and selection-aware copy.

  Supports two data-flow models: a controlled `entries` prop, or an uncontrolled
  imperative handle (`ref.append` / `appendMany` / `clear`) whose writes are
  rAF-batched so high-frequency streaming collapses to one render per frame.
  Use it batteries-included with the default toolbar, or compose the slots
  (`LogView.Toolbar`, `LogView.Search`, `LogView.LevelFilter`, `LogView.Copy`,
  `LogView.Clear`, `LogView.Body`). Single-line rows by default with an opt-in
  `wrap` mode for measured variable-height lines.

- [#92](https://github.com/SebastianWebdev/entangle-ui/pull/92) [`98cbbfd`](https://github.com/SebastianWebdev/entangle-ui/commit/98cbbfdb9fa2658568822ef8a49a0f409ccb40f4) Thanks [@SebastianWebdev](https://github.com/SebastianWebdev)! - LogView: add a `labels` prop for internationalization. Every built-in UI string
  — the search placeholder and label, the level-filter group label, the clear /
  copy / per-line copy labels, the jump-to-bottom button, the new-line counter,
  the empty state, and the region label — is now overridable via `labels`, a
  `Partial<LogViewLabels>`, so omitted keys keep their English default. The
  new-line counter is a function (`(count) => string`) for per-locale
  pluralization and word order. Explicit per-slot props (a slot's `aria-label`,
  the search `placeholder`, `emptyState`, the root `aria-label`) still take
  precedence. The English defaults are exported as `DEFAULT_LOG_VIEW_LABELS`.

- [#92](https://github.com/SebastianWebdev/entangle-ui/pull/92) [`98cbbfd`](https://github.com/SebastianWebdev/entangle-ui/commit/98cbbfdb9fa2658568822ef8a49a0f409ccb40f4) Thanks [@SebastianWebdev](https://github.com/SebastianWebdev)! - LogView: add `slotProps` for the default composition. Pass per-slot props
  (`toolbar`, `search`, `levelFilter`, `copy`, `clear`, `body`, `footer`) to
  restyle or reconfigure a single slot of the batteries-included layout without
  rebuilding it from `children` — each entry is typed as that slot's props and its
  `className` / `style` merge with the slot's own styles. Ignored when you provide
  your own `children`. Establishes the library-wide `slotProps` convention
  documented in `docs/component-patterns.md` (§15).

- [#81](https://github.com/SebastianWebdev/entangle-ui/pull/81) [`36b7f72`](https://github.com/SebastianWebdev/entangle-ui/commit/36b7f72968049aff57189f093bd7d892368fa7f1) Thanks [@SebastianWebdev](https://github.com/SebastianWebdev)! - Migrate `Menu` and `ContextMenu` from a configuration object to a composition API.

  **Breaking change.** The `config`, `selectedItems`, `onChange`, `checkboxIcon`, `radioIcon` props (and the `useMenu` / `useContextMenuTarget` hooks, plus the `MenuConfig` / `MenuItem` / `MenuSelection` / `ContextMenuConfig` / `ContextMenuTargetDetails` types) are removed. Menus are now built by composing child components.
  - **Menu** — `Menu.Trigger`, `Menu.Content`, `Menu.Item`, `Menu.Group`, `Menu.Separator`, `Menu.RadioGroup`, `Menu.RadioItem`, `Menu.CheckboxItem`, `Menu.Sub`, `Menu.SubTrigger`, `Menu.SubContent`.
  - **Menu.Item** lays out as icon (left) · label (center) · `shortcut` / `endContent` (right), like MUI's `MenuItem`.
  - **ContextMenu** — `ContextMenu`, `ContextMenu.Trigger`, `ContextMenu.Content`. The dynamic `config(context)` resolver and `payload` are gone: scope menus by giving each area its own `ContextMenu`, and pass any custom node (tabs, search, custom panels) into `ContextMenu.Content`. Items reuse the shared `Menu.*` primitives.

  ```tsx
  <Menu>
    <Menu.Trigger>Options</Menu.Trigger>
    <Menu.Content>
      <Menu.Item icon={<CopyIcon />} shortcut="⌘C" onClick={copy}>
        Copy
      </Menu.Item>
    </Menu.Content>
  </Menu>

  <ContextMenu>
    <ContextMenu.Trigger>
      <Canvas />
    </ContextMenu.Trigger>
    <ContextMenu.Content>
      <Menu.Item onClick={addNode}>Add Node</Menu.Item>
    </ContextMenu.Content>
  </ContextMenu>
  ```

- [#82](https://github.com/SebastianWebdev/entangle-ui/pull/82) [`d5c1c65`](https://github.com/SebastianWebdev/entangle-ui/commit/d5c1c651c159e07fe2d0d90f536c702743478404) Thanks [@SebastianWebdev](https://github.com/SebastianWebdev)! - Polish `Menu` and `ContextMenu` after code review.
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

- [#76](https://github.com/SebastianWebdev/entangle-ui/pull/76) [`676658b`](https://github.com/SebastianWebdev/entangle-ui/commit/676658b4e9b06a754ac24aff9ffdc446dc6b5b90) Thanks [@SebastianWebdev](https://github.com/SebastianWebdev)! - Add `Minimap` component — shared navigation widget for editor viewports (NodeGraph, Timeline, custom 2D editor surfaces).

  **Core primitive (`<Minimap>`)** — fully controlled:
  - Controlled API: pass `items`, `worldBounds`, current `transform`, and `viewportSize` from your `<Viewport>`; translate `onNavigate.worldPoint` into a `viewport.centerOn(...)` call.
  - Item shapes: `rect`, `circle`, `line`, plus `custom` for caller-drawn shapes (each with per-item color and hover hit-testing).
  - Aspect-driven sizing: explicit `width`, height auto-derived from `worldBounds` aspect ratio and clamped — wide-thin bounds give a Timeline strip, square bounds give a NodeGraph box.
  - Three pointer gestures (click, drag from empty, drag the rect) + tab-focusable keyboard navigation with arrow keys (Shift × 5 step). Each gesture independently toggleable.
  - Single `onNavigate` callback with phase metadata (`'click' | 'drag-start' | 'drag' | 'drag-end'`) — enough to drive undo groups, smooth-follow, or analytics without multiple handlers.
  - `renderOverlay(ctx, info)` escape hatch for global canvas annotations (playheads, selection regions, debug markers) drawn after items and before the viewport-rect shroud.

  **Slot subcomponents** for chrome around the canvas body:
  - `<Minimap.Title>` — `'top-outside'` or `'top-inside'` placement.
  - `<Minimap.Footer>` — `'bottom-outside'` or `'bottom-inside'` placement.
  - `<Minimap.Corner side="…">` — anchored in any of the four corners.

  Non-marker children render as a free-form absolute overlay above the canvas. All children have access to live state via `useMinimapContext()` — exposes hover world point, hovered item id, transform, drag state — enabling coordinate readouts, zoom chips, tooltips with built-in hit-testing.

  **Compound `<ViewportMinimap>`** — drop-in inside a `<Viewport>`:
  - Reads live `transform` / `size` from `useViewportContext()`.
  - Default `onNavigate` wires to the viewport handle's `centerOn`.
  - `placement` accepts four corner presets or a custom anchor object.
  - `responsive` prop tracks wrapper width via `ResizeObserver`.
  - Recognized by `<Viewport>` as an overlay slot — no explicit `<ViewportOverlay>` wrapper needed.

  **Helpers exported**:
  - `computeBoundsFromItems(items, padding?)` — tight bbox of an items array.
  - `useMinimapContext()` — children of `<Minimap>` read live state without re-implementing hit-testing.

  Plus a comprehensive docs page with interactive demo composing all of the above.

- [#79](https://github.com/SebastianWebdev/entangle-ui/pull/79) [`64cc7a0`](https://github.com/SebastianWebdev/entangle-ui/commit/64cc7a06ddbb57b12d0ae9bc28677ada627c4f85) Thanks [@SebastianWebdev](https://github.com/SebastianWebdev)! - Add `NodeGraph` component — flagship data-driven node editor surface for building visual programming, signal processing, shader, ML pipeline, and similar interactive graph UIs. Composes the `Viewport` primitive for pan/zoom plus perf-isolated canvas layers, and `Minimap` for the optional overview slot.

  **Core component (`<NodeGraph>`)** — fully controlled or uncontrolled across four data dimensions:
  - `nodes`, `edges`, `groups`, and `selection` each emit the full next array via dedicated `onXChange` callbacks — no patches, no reducers, plain-`useState` compatible.
  - HTML node bodies positioned in world space via `renderNode(node, ctx)`. The render context exposes `selected`, `dragging`, `hovered`, and the current `zoom` for LOD swaps.
  - Bézier edges drawn on a perf-isolated canvas layer with control points oriented by port side. Each port resolves its position evenly across its side when no explicit `offset` is set.
  - Marquee selection on empty drag, click selects, Shift/Cmd/Ctrl + click toggles, marquee with the additive modifier unions.
  - Drag-to-move (single + multi). The clicked node defines the drag set: if it's in the current selection, all selected nodes move together; otherwise just the clicked node. Optional `snapToGrid={N}` snaps drag deltas and keyboard nudges to a world-unit grid.
  - Connection drag from a port: live preview Bézier follows the cursor, candidates highlight, `isValidConnection(source, target, info)` rejects invalid drops (preview goes dashed + red). Default policy refuses same-node connections when no validator is supplied.
  - `onContextMenu(info)` emits a discriminated `target` (`node` / `edge` / `port` / `group` / `empty`) plus screen / world points — drop in any popover or Menu component as the consumer prefers.
  - Visual `groups` rendered as backdrop rectangles with optional labels under nodes and edges.

  **Keyboard** — tab-focusable surface with:

  | Keys                   | Action                                               |
  | ---------------------- | ---------------------------------------------------- |
  | `←` `↑` `↓` `→`        | Nudge selected nodes by 1 grid step (or 1 unit)      |
  | `Shift` + arrows       | Nudge by 10× step                                    |
  | `Delete` / `Backspace` | Emit `onDelete(selection)`                           |
  | `Enter`                | Emit `onActivate(node)` for a single selection       |
  | `Cmd/Ctrl + A`         | Select all nodes                                     |
  | `Esc`                  | Cancel an in-flight connection, else clear selection |

  Focus inside editable descendants (`<input>`, `<textarea>`, `contentEditable`) bypasses the graph handler so typing in custom node bodies works as expected.

  **Slot subcomponents** identified by a unique Symbol marker (`NODE_GRAPH_SLOT`) so they survive `React.memo`, HOCs, and minification:
  - `<NodeGraph.Background variant="dots" | "grid" gap={...} />` — adaptive background canvas layer.
  - `<NodeGraph.Minimap placement={...} width={...} title={...} />` — pre-wired overview, mirrors nodes into rect items, wires `centerOn` automatically.

  **Imperative handle** (`NodeGraphHandle`):
  - `fitToContent(padding?)`, `fitToSelection(padding?)`, `focusNode(id)`
  - Viewport delegation: `centerOn`, `zoomToRect`, `getTransform`, `getSize`, `worldToScreen`, `screenToWorld`, `invalidate(layerName?)`

  **Slice subscription hooks** for advanced consumers inside the `<NodeGraph>` subtree — `useNodeGraphData`, `useNodeGraphSelection`, `useNodeGraphInteraction`, `useNodeGraphHover`, and the raw `useNodeGraphStore` escape hatch. Hot-path state (drag deltas, connection preview, hover, marquee) lives in a class-based store consumed via `useSyncExternalStore` with shallow-equal no-op guards — each node body only re-renders when its own state changes, and canvas layers are invalidated independently per slice.

  **Helpers exported**:
  - `computeNodeGraphBounds`, `getNodeBox`, `getPortPosition`, `getBezierControlPoints`, `evaluateBezier`, `isPointNearBezier`, `resolvePortRef`, `resolveEdgeEndpoints`, `sideVector`, `snapDelta` — the same math used internally.

  Ships with a comprehensive docs page including a multi-node signal-processing demo, the data model, connection validation recipes, slot integrations, keyboard shortcuts, and the full props table.

- [#79](https://github.com/SebastianWebdev/entangle-ui/pull/79) [`64cc7a0`](https://github.com/SebastianWebdev/entangle-ui/commit/64cc7a06ddbb57b12d0ae9bc28677ada627c4f85) Thanks [@SebastianWebdev](https://github.com/SebastianWebdev)! - Add out-of-the-box defaults and ergonomics helpers for `NodeGraph`, so consumers stop re-implementing the same boilerplate the demo used to carry.

  **Typed port handles + auto-connected state** — `<NodeGraph.Port>` now renders a built-in handle from `shape` (`'circle' | 'triangle' | 'diamond' | 'square'`) and `color` props when no `children` are supplied, so the common "coloured ring for data pins, exec arrow for flow pins" no longer needs a hand-rolled SVG. The handle fills automatically while the port is referenced by an edge (the library derives the connected set in the store and exposes it via `data-port-connected`), removing the consumer-side "which ports are wired" index. The shape is also exported standalone as `<NodeGraph.PortVisual>`.

  **`<NodeGraph.Pin>`** — a one-liner for the ubiquitous "handle + label" row. Renders a `<NodeGraph.PinRow>` containing a `<NodeGraph.Port>` and a label, ordered so the handle hugs the node edge (port → label on the left, label → port on the right). `<NodeGraph.PinRow>` + `<NodeGraph.Port>` remain available for custom layouts.

  **`useNodeGraph()`** — owns nodes / edges / groups / selection plus the mutations every editor re-implements: `addNode`, `connect` (de-duped), `removeNodes` / `removeSelection` (with edge cascade + selection pruning), `duplicateNodes`, `addGroup`, `removeGroups`, `clearSelection`. Spread the returned `bind` onto `<NodeGraph>` to wire all four controlled props at once. Uncontrolled by design; for external stores keep wiring the `onChange` props yourself. The pure helpers `duplicateNodes(nodes, ids)`, `generateNodeId`, and `generateEdgeId` are now exported too.

  **`createTypeMatchValidator()`** — a factory for the common `isValidConnection` rule (match `dataType`, in an allowed direction, with a configurable `anyType` wildcard and `allowSameNode`). Override `match` for richer subtype rules.

  The Blueprint demo now uses all four, dropping its hand-rolled pin visual, connected-ports `useMemo`, manual delete/duplicate handlers, and four `useState` calls.

- [#79](https://github.com/SebastianWebdev/entangle-ui/pull/79) [`64cc7a0`](https://github.com/SebastianWebdev/entangle-ui/commit/64cc7a06ddbb57b12d0ae9bc28677ada627c4f85) Thanks [@SebastianWebdev](https://github.com/SebastianWebdev)! - Round out `NodeGraph` interaction and node-authoring ergonomics, from a second pass over the demo's friction.

  **Interactive edges** — edges are drawn on a canvas, so they used to be inert. They now hit-test against the pointer: hovering paints the hover accent (`useNodeGraphHover().hoveredEdgeId`), clicking selects the edge, and right-clicking reports a `{ kind: 'edge' }` target via `onContextMenu`. A selected edge is removed by Delete like any other selection. Adds the `findEdgeAtPoint` helper and a `removeEdges` action on `useNodeGraph`.

  **Reconnect & detach** — grab an existing edge near one of its endpoints and drag it: drop on a valid port to move that endpoint, or drop on empty space to detach (delete) the edge. The fixed end stays anchored and the dragged end runs through `isValidConnection`; the edge being re-dragged is hidden from the edge layer so only the preview shows. A click on an endpoint (no drag) selects the edge instead, so a click never deletes a wire. Built in — no new props.

  **Colourable minimap mini-nodes** — `<NodeGraph.Minimap>` gains a `nodeStyle` prop. Return `{ color }` to tint a node's rect, or `{ color, headerColor }` to draw a two-tone "header strip + body" mini-node that mirrors the real node at a glance. Selection tint still wins.

  **Collapsible node sections** — `<NodeGraph.NodeSection>` is a collapsible section inside a node body for hiding advanced / overflow pins. The collapse is purely visual: children never unmount (state preserved, no remount cost), and `<NodeGraph.Port>` slots inside a collapsed section unregister their position so the pins' edges hide with them and snap back on expand — no dangling wires. Controlled or uncontrolled (`collapsed` / `defaultCollapsed` / `onCollapsedChange`); `collapsible={false}` gives a static labelled group.

- [#79](https://github.com/SebastianWebdev/entangle-ui/pull/79) [`64cc7a0`](https://github.com/SebastianWebdev/entangle-ui/commit/64cc7a06ddbb57b12d0ae9bc28677ada627c4f85) Thanks [@SebastianWebdev](https://github.com/SebastianWebdev)! - **Breaking:** redesign `NodeGraph` port API to slot-based composition.

  Connection endpoints are now declared inline inside the node body via a new
  `<NodeGraph.Port>` compound, not as a data field on the node. The library
  measures the slot's DOM position and registers it as the anchor for any
  edge that references the port id — the same DOM element the user clicks
  is the exact point edges connect to, eliminating the previous "fake label
  dot + outer port handle" double rendering.

  **New**
  - `<NodeGraph.Port id side dataType>` — slot rendered anywhere inside
    `renderNode`. Mounts an inline `<span>` (default UE-style 12 px circle
    / exec triangle), measures its center on mount + every layout shift,
    feeds the position to the store, and wires connection-drag pointer
    events. Pass `children` to replace the default chrome — `data-port-*`
    attributes carry the live state (`source` / `candidate` / `invalid` /
    `hovered`) for consumer CSS.
  - Hover state is now actually wired: `<NodeGraph.Port>` emits
    `hoveredPort` on enter/leave; `NodeGraphNodeView` emits `hoveredNodeId`.
    Previously these fields existed on `NodeGraphHoverState` but no code
    dispatched them, so `ctx.hovered` / `ctx.isHovered` were always
    `false`.
  - Node auto-sizing: when `node.width`/`height` are omitted, the library
    reads the rendered DOM size for hit-testing, marquee, fitToContent,
    and minimap geometry. Override per-node by setting `width`/`height`
    explicitly.
  - `NodeGraphConnectionValidationInfo` now exposes `sourceDataType` and
    `targetDataType` populated from the registered slot metadata — no
    consumer-side port index needed for type-matched validation.
  - `NodeGraphStore` adds two new slices with subscribe/get APIs:
    `portPositions` (`getPortPosition`, `setPortPosition`,
    `removePortPosition`, `subscribePortPositions`) and `measuredSizes`
    (`getMeasuredSize`, `setMeasuredSize`, `clearMeasuredSize`,
    `subscribeMeasuredSizes`). Both auto-GC on `setData` when the
    corresponding node is removed.

  **Removed**
  - `NodeGraphNode.ports` field. Declare ports as `<NodeGraph.Port>`
    children inside `renderNode` instead.
  - `NodeGraphPort` type, `NodeGraphRenderPort`, `NodeGraphPortRenderCtx`,
    and the `renderPort` prop. Replaced by the slot — `children` of
    `<NodeGraph.Port>` are the consumer-supplied visual.
  - `resolvePortOffsets` and the offset-based `getPortPosition` math
    helpers. Port positions are now DOM-measured.

  **Migration**

  ```diff
  - const nodes = [{
  -   id: 'a', position: { x: 0, y: 0 },
  -   ports: [
  -     { id: 'in', side: 'left', dataType: 'exec', offset: 0.3 },
  -     { id: 'out', side: 'right', dataType: 'float' },
  -   ],
  - }];

  - <NodeGraph
  -   nodes={nodes}
  -   renderPort={(port, node, ctx) => <MyPin port={port} ctx={ctx} />}
  - />

  + const nodes = [{ id: 'a', position: { x: 0, y: 0 } }];

  + <NodeGraph
  +   nodes={nodes}
  +   renderNode={(node, ctx) => (
  +     <MyBody>
  +       <Row>
  +         <NodeGraph.Port id="in" side="left" dataType="exec" />
  +         Execute
  +       </Row>
  +       <Row reverse>
  +         Result
  +         <NodeGraph.Port id="out" side="right" dataType="float" />
  +       </Row>
  +     </MyBody>
  +   )}
  + />
  ```

  `NodeGraphEdge` shape is unchanged (`{ id, source: { node, port }, target }`).

- [#79](https://github.com/SebastianWebdev/entangle-ui/pull/79) [`64cc7a0`](https://github.com/SebastianWebdev/entangle-ui/commit/64cc7a06ddbb57b12d0ae9bc28677ada627c4f85) Thanks [@SebastianWebdev](https://github.com/SebastianWebdev)! - `NodeGraph` socket-level edge actions and a drop point on the connection event.

  **Socket actions** — right-clicking a port already reported a `{ kind: 'port' }` context target; now there are batch helpers to act on a socket's wires: a pure `edgesConnectedToPort(edges, ref)` (ids of every edge on a socket) and a `disconnectPort(node, port)` action on `useNodeGraph` (detach them all, pruning the selection). The demo gives sockets a "Select connected edges" context menu.

  **Drop point on `onConnectEnd`** — the event now carries `worldPoint` and `screenPoint` (the release position). A drop on empty space (`cancelled` + `target === null`) is the hook for the classic "drag a wire onto the canvas → open a create-node menu there → wire the new node straight up" flow; the consumer positions the menu at `screenPoint`, spawns at `worldPoint`, and `connect`s to `source`. The demo wires this end to end.

- [#94](https://github.com/SebastianWebdev/entangle-ui/pull/94) [`eb35203`](https://github.com/SebastianWebdev/entangle-ui/commit/eb35203d7bb00a85ca0fb7d32b35339411250320) Thanks [@SebastianWebdev](https://github.com/SebastianWebdev)! - Add the `PathBar` flagship component — file-path breadcrumbs like the VS Code
  editor bar. It specializes `Breadcrumbs`: pass a delimited string or a
  structured `PathSegment[]` and it renders clickable segments, leaning on
  Breadcrumbs for separators, overflow collapsing, and accessibility. Folder
  crumbs navigate via `onNavigate(path, segment, index)` and the final segment is
  the current location (`aria-current`). The current path is controllable
  (`value` / `defaultValue`); uncontrolled, clicking an ancestor truncates the
  trail. Provide `getSiblings` to add a VS-Code-style dropdown that swaps a
  segment for one of its siblings, plus `rootIcon`, per-segment icons, and a
  `delimiter` for non-`/` paths. Path splitting/joining lives in a pure,
  unit-tested `pathUtils` module.

  Extend `BreadcrumbItem` with an `endContent` slot — content rendered after the
  label, outside the navigable link/button, so a trailing affordance (such as
  PathBar's sibling-dropdown caret) can attach without breaking the crumb's
  click target or the Breadcrumbs collapse logic.

- [#84](https://github.com/SebastianWebdev/entangle-ui/pull/84) [`6683aa6`](https://github.com/SebastianWebdev/entangle-ui/commit/6683aa69850d269fad2af638a813f5c9049fc1a7) Thanks [@SebastianWebdev](https://github.com/SebastianWebdev)! - Add the `Timeline` flagship component — a horizontal, multi-track animation timeline / dope sheet for editor UIs.
  - Frame-based time axis with an `fps`-driven `HH:MM:SS:FF` ruler and snap-to-frame. `frame` (playhead), `view` (zoom/pan window), `selection`, `mode`, and `playing` are each controlled or uncontrolled.
  - Tracks hold keyframes using the shared `CurveKeyframe` model — promoted to `@/types/keyframe` and re-exported from `CurveEditor` unchanged — so Timeline and CurveEditor speak the same language.
  - Canvas-rendered keyframes with DOM chrome, drawn from a per-slice `useSyncExternalStore` store with the theme resolved per frame.
  - Interactions: scrub (ruler/playhead drag + click), wheel zoom-at-cursor, shift-wheel / middle-drag pan, click / shift-click / box-select, drag-move (snapped + clamped), double-click add, Delete remove, copy/paste (Ctrl/Cmd + C / V at the playhead), and arrow / Home / End keyboard scrubbing.
  - Dope-sheet and graph (value-curve) modes; graph mode reuses CurveEditor's curve evaluation and edits keyframes in both time and value, with draggable bezier tangent handles. Individual tracks can expand to an in-place graph lane (`track.expanded`) without leaving the dope sheet.
  - Collapsible track groups (a flat `groupId` on tracks + a controlled/uncontrolled `groups` prop), header-drag track reorder, vertical scrolling for overflowing tracks, and a draggable loop region (edges + body).
  - Optional built-in playback loop (rAF advancing `frame` at `fps`, with `loop`), driven via the imperative handle (`seek` / `play` / `pause` / `toggle` / `zoomToFit` / `zoomToSelection` / `frameToX` / `xToFrame`).
  - Data-driven track-header column with a `renderTrackHeader` override, `Timeline.Toolbar` / `Timeline.Footer` slots, a `renderOverlay` canvas pass, and an accessibility baseline (focusable `role="group"`, keyboard equivalents, polite live region).
  - Also exports `framesToTimecode`, the `TimelineGroup` type, and the `useTimelineContext` / `useTimelineGeometry` / `useTimelinePlayhead` / `useTimelineSelection` hooks.

- [#84](https://github.com/SebastianWebdev/entangle-ui/pull/84) [`6683aa6`](https://github.com/SebastianWebdev/entangle-ui/commit/6683aa69850d269fad2af638a813f5c9049fc1a7) Thanks [@SebastianWebdev](https://github.com/SebastianWebdev)! - Refactor `Timeline` for React 19.2 — performance, dead-code cleanup, API tweaks.
  - Bump peer `react` / `react-dom` to `>=19.2.0`. Internal `useLatest`-ref swarms in `useTimelineGestures`, `useTimelinePlayback`, `useTimelineDraw` (new) and `TimelineMinimap` are replaced with `useEffectEvent`. Handler identities are stable for the component's lifetime; the rAF playback loop now only re-runs when `playing` flips.
  - `TimelineMinimap` subscribes to the geometry + playhead slices instead of the full `useTimelineContext()` snapshot, so it stops re-rendering on unrelated store changes (selection / hover / drag / mode).
  - Consolidate keyframe-key helpers into one `timelineSelection` module (`selectionKey` / `selectionKeySet` / `sameRef`) — removes three near-duplicate implementations across `Timeline`, `timelineEdits`, and `TimelineStore`.
  - Cache each track's resolved value range on `TrackGeometry` / `TimelineTrackRow` (`row.range`) so drawing, hit-testing and graph-mode edits stop recomputing `autoValueRange` per call.
  - Extract `useTimelineDraw` from `Timeline.tsx` — encapsulates canvas DPR setup, theme-token resolution and the scheduled draw, and reads consumer `renderOverlay` / `formatTime` through `useEffectEvent` so inline functions no longer invalidate the schedule.
  - Drop dead exports: `framesPerPixel`, `trackTop`, `yToTrackIndex` (`timelineCoords`), `rowIndexAtY` (`timelineLayout`), and the unimplemented `minKeyframeDistance` prop on `TimelineProps`.
  - Replace `Math.hypot` in the hit-test hot path with squared-distance comparisons; replace `Math.min(...spread)` in copy with a reduce loop; rewrite `zoomToSelection` to walk the selection (O(|selection|)) instead of every keyframe in every track.
  - New `trackScale` prop on `<Timeline>` — pass `{ position, format, showMidpoint, gridlines, color }` directly. The `<Timeline.TrackScale />` slot still works as a deprecated alias; the new prop wins when both are provided.

- [#85](https://github.com/SebastianWebdev/entangle-ui/pull/85) [`9eabab7`](https://github.com/SebastianWebdev/entangle-ui/commit/9eabab77e2a1dc95a6c4a66cbf556a68b1365ff1) Thanks [@SebastianWebdev](https://github.com/SebastianWebdev)! - Add `useNavigationHistory<T>` — a generic back/forward stack primitive backed
  by `useSyncExternalStore`. Tracks a concurrent-safe cursor over an arbitrary
  entry type, exposes `canGoBack` / `canGoForward` flags, mirrors browser
  semantics (push truncates the forward branch), and supports an `enabled`
  toggle for opt-in history UIs. `AssetBrowser`'s `history` feature is now
  composed on top of it through an internal `useAssetNavigation` hook that
  encapsulates the parent-folder keyboard shortcut and the `onNavigate` /
  `onItemOpen` plumbing.

- [#73](https://github.com/SebastianWebdev/entangle-ui/pull/73) [`9dd25ae`](https://github.com/SebastianWebdev/entangle-ui/commit/9dd25ae9821cd943025f90a9c1b9bc751cd7329c) Thanks [@SebastianWebdev](https://github.com/SebastianWebdev)! - Add `Viewport` primitive — pan/zoom canvas + HTML container for editor-style surfaces (node graphs, timelines, 2D world editors).
  - `Viewport` with controlled/uncontrolled transform (`{ x, y, zoom }`), configurable pan (button + space-key), wheel/pinch zoom-toward-cursor, and optional marquee selection.
  - `ViewportLayer` — perf-isolated canvas layers with per-layer `invalidateOn` deps and `handle.invalidate(name)`.
  - `ViewportWorld` — HTML children positioned in world coordinates (follow pan/zoom).
  - `ViewportOverlay` — HTML children pinned to the viewport (toolbars, minimap slot).
  - `useViewportContext()` for live `transform` / `size` / `handle` access from any child.
  - Imperative `ViewportHandle` — `fitToContent`, `zoomToRect`, `centerOn`, `getTransform`, `getSize`, `invalidate`.
  - Pure helpers: `worldToScreen`, `screenToWorld`, `getViewportPointerPosition`, `computeFitTransform`, `computeCenterTransform`, `computeZoomTowardPivot`, `normalizeRect`.
  - Pan lifecycle events (`onPanStart`, `onPanEnd` with end velocity) and zoom lifecycle events for inertia/idle recipes.
  - Docs include recipes for snap-to-zoom, minimap, and inertia on top of the v1 surface.

### Patch Changes

- [#85](https://github.com/SebastianWebdev/entangle-ui/pull/85) [`9eabab7`](https://github.com/SebastianWebdev/entangle-ui/commit/9eabab77e2a1dc95a6c4a66cbf556a68b1365ff1) Thanks [@SebastianWebdev](https://github.com/SebastianWebdev)! - Refactor `AssetBrowser` internals into focused hooks and subcomponents. The
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

- [#85](https://github.com/SebastianWebdev/entangle-ui/pull/85) [`9eabab7`](https://github.com/SebastianWebdev/entangle-ui/commit/9eabab77e2a1dc95a6c4a66cbf556a68b1365ff1) Thanks [@SebastianWebdev](https://github.com/SebastianWebdev)! - Refine the `AssetBrowser` component. Live selection, roving focus, and
  drop-target state now flow through per-id store slices, so selecting an item or
  moving focus re-renders only the affected cells instead of the whole grid, and
  search/sort/filter chrome no longer re-renders cells on every keystroke. Wire up
  the previously inert `marquee` and `history` props (Back/Forward controls plus
  `Backspace` / `Alt+ArrowUp` to navigate to the parent folder), keep grid cells
  interactive when a custom `renderItem` is supplied, make `scrollToItem` work
  under virtualization, track shift-range anchors by id so ranges survive a
  re-sort, and honour `prefers-reduced-motion`.

- [#85](https://github.com/SebastianWebdev/entangle-ui/pull/85) [`9eabab7`](https://github.com/SebastianWebdev/entangle-ui/commit/9eabab77e2a1dc95a6c4a66cbf556a68b1365ff1) Thanks [@SebastianWebdev](https://github.com/SebastianWebdev)! - AssetBrowser: conform to the hardened ESLint setup (react-hooks v7,
  strict-type-checked, import-x, jsx-a11y) introduced in #87.
  - The selection, navigation, drag-and-drop, marquee, grid-keyboard and
    imperative-handle hooks built their stable handlers with `useEffectEvent`
    and then returned them / listed them in dependency arrays — both forbidden
    by the Compiler-aware rule set. They now read live props/state through
    `useLatest` refs and expose genuinely stable `useCallback`s, matching
    `component-patterns.md` rules #3/#11 and the Timeline migration.
  - Removed the `useStableRenderFn` helper: its render-phase ref write violated
    `react-hooks/refs`. Render-props are forwarded through the item context as-is
    (memoize them, like `TreeView`, to avoid per-cell re-renders).
  - The root carries `role="region"` and grid cells keep `role="gridcell"`;
    keyboard interaction stays centralized at the grid level.

  No public API or behavior change.

- [#87](https://github.com/SebastianWebdev/entangle-ui/pull/87) [`9445dfc`](https://github.com/SebastianWebdev/entangle-ui/commit/9445dfc6689baceed1c552579cd0eebed0427619) Thanks [@SebastianWebdev](https://github.com/SebastianWebdev)! - ESLint hardening across the library and the correctness fixes it surfaced.

  Tooling: enabled `eslint-plugin-react-hooks` v7 (full Compiler-aware
  `recommended`), `typescript-eslint` `strict-type-checked`,
  `eslint-plugin-import-x` (no-cycle, order, no-duplicates, type-specifier
  style), `eslint-plugin-jsx-a11y`, and enforcement of the mandated `@/` import
  alias. `restrict-template-expressions` is tuned with `allowNumber: true`. Rules
  apply to `src` only; test files keep the prior type-checked baseline. See
  `docs/component-patterns.md` §14.

  Behavior-affecting fixes (no public API changes):
  - Refs read during render are now reactive state, so values driven by them
    update correctly: `ScrollArea` scrollbar `aria-valuenow` and thumb dragging
    state, `CartesianPicker` / `ViewportGizmo` / `CurveEditor` `isDragging`,
    `Combobox` filtering while editing, `MenuBar` registered-menu tracking, and
    `useListboxNav` navigable indices.
  - `Tooltip` no longer mutates the caller-provided `rootProps` object.
  - Accessibility: interactive elements that had only pointer handlers now expose
    keyboard handlers, focusability, and valid ARIA across controls, editor,
    navigation, feedback, layout, and primitive components.
  - Removed dead conditional branches and redundant optional chaining flagged by
    `no-unnecessary-condition`, and replaced deprecated APIs.

- [#87](https://github.com/SebastianWebdev/entangle-ui/pull/87) [`9445dfc`](https://github.com/SebastianWebdev/entangle-ui/commit/9445dfc6689baceed1c552579cd0eebed0427619) Thanks [@SebastianWebdev](https://github.com/SebastianWebdev)! - Fix ViewportGizmo z-up rendering and FloatingPanel positioning.
  - **ViewportGizmo `upAxis="z-up"`** now actually renders the z-up convention
    (Blender/Unreal/CAD): the Z arm points up and Y points into the scene.
    Previously `upAxis` only affected which preset view an axis click snapped to,
    so `y-up` and `z-up` looked identical.
  - **FloatingPanel** is now positioned `absolute` within its `FloatingManager`
    region instead of `fixed` to the viewport. `FloatingManager` renders a
    relative, full-size, pointer-events-pass-through container, and dragging is
    delta-based and clamped to that container. This fixes panels from multiple
    managers stacking at the same viewport coordinates and escaping their
    container.

- [#92](https://github.com/SebastianWebdev/entangle-ui/pull/92) [`98cbbfd`](https://github.com/SebastianWebdev/entangle-ui/commit/98cbbfdb9fa2658568822ef8a49a0f409ccb40f4) Thanks [@SebastianWebdev](https://github.com/SebastianWebdev)! - LogView: align the message text into a fixed gutter. The timestamp, level
  icon, and source tag render as fixed-width columns so the message starts at the
  same x on every row instead of shifting with the source-tag width — it reads
  like a table / terminal log.

  A column is only reserved when its field is actually present in the data: if
  nothing has a timestamp or source there is no column at all (the message sits
  right after the icon, as before), but once at least one entry uses the field
  every row reserves it — including rows that omit it — so they stay aligned. The
  timestamp and source column widths default to `88px` and `52px` and are
  overridable via the `--etui-logview-timestamp-col-width` /
  `--etui-logview-source-col-width` CSS custom properties on the root.

- [#92](https://github.com/SebastianWebdev/entangle-ui/pull/92) [`98cbbfd`](https://github.com/SebastianWebdev/entangle-ui/commit/98cbbfdb9fa2658568822ef8a49a0f409ccb40f4) Thanks [@SebastianWebdev](https://github.com/SebastianWebdev)! - LogView code-review fixes:
  - **Stable auto-assigned ids.** Id-less entries now keep their key across a
    controlled `entries` re-mirror — the store caches an id per entry object
    instead of minting a fresh monotonic id on every `setEntries`. Rows no longer
    remount and id-based selection survives updates. Removed the unused `seq`
    field from `ResolvedLogEntry`.
  - **Levels added at runtime are visible by default.** Visibility is tracked as
    the set of _hidden_ levels, so a level introduced later via `levelConfig`
    shows up active, while an explicit toggle-off persists across `levelOrder`
    changes.
  - **Cheaper rows.** Per-level definitions are resolved through a memoized cache
    so the memoized `LogRow` is no longer invalidated by a fresh definition object
    each render.
  - **Scoped text-selection guard.** A row click / copy shortcut is only
    suppressed by a text selection inside the log body, not one elsewhere on the
    page.
  - **Internal cleanup.** Row selection + keyboard handling moved into a
    `useLogSelection` hook; the shared recipe `level` variant is derived via a
    single `levelVariant` helper.

- [#79](https://github.com/SebastianWebdev/entangle-ui/pull/79) [`64cc7a0`](https://github.com/SebastianWebdev/entangle-ui/commit/64cc7a06ddbb57b12d0ae9bc28677ada627c4f85) Thanks [@SebastianWebdev](https://github.com/SebastianWebdev)! - Fix `<NodeGraph.Minimap>` rendering off-screen. The slot applied `position: absolute` to the inner `<Minimap>`, but `ViewportMinimap` already pins it via its own absolutely-positioned wrapper. The duplicate positioning pulled the minimap out of the wrapper's flow, collapsing the wrapper to a zero-size box at the viewport's bottom-right corner and pushing the minimap off-screen. The slot class now only re-enables pointer events.

- [#79](https://github.com/SebastianWebdev/entangle-ui/pull/79) [`64cc7a0`](https://github.com/SebastianWebdev/entangle-ui/commit/64cc7a06ddbb57b12d0ae9bc28677ada627c4f85) Thanks [@SebastianWebdev](https://github.com/SebastianWebdev)! - `NodeGraph` internal performance + refactor pass (no public API change).

  **Performance**
  - Edge labels now subscribe to the interaction slice through a per-edge selector + equality (the same pattern node bodies use), so a drag only re-renders the labels whose endpoints actually move instead of every label on every gesture tick.
  - Edge / group canvas layers build a `Set` of the selected ids once per frame instead of a linear `selection.includes` per item — the per-frame selected check is now O(1).
  - Edge hit-testing (`findEdgeAtPoint`) rejects edges with a control-point bounding-box test before the 24-sample Bézier distance test, so hover / click / right-click stay cheap on large graphs.
  - The background dots/grid pattern tile is cached across frames (keyed by size + radius + colour, bounded with FIFO eviction), so a pan no longer rebuilds an off-screen canvas every frame.

  **Refactor**
  - Extracted a shared `useDragGesture` primitive (pointer capture, document listener attach/detach, per-pointer guard, unmount cleanup) used by both the node-drag and group-drag controllers, removing the duplicated gesture lifecycle.
  - Extracted edge hover + endpoint-grab handling out of `NodeGraph` into `useNodeGraphEdgeInteraction`.
  - De-duplicated the additive-selection toggle (`toggleSelected`) across the node / group / edge click paths and the connection accept/reject check across the hover + both drop paths.

- [#84](https://github.com/SebastianWebdev/entangle-ui/pull/84) [`6683aa6`](https://github.com/SebastianWebdev/entangle-ui/commit/6683aa69850d269fad2af638a813f5c9049fc1a7) Thanks [@SebastianWebdev](https://github.com/SebastianWebdev)! - Timeline: replace `useEffectEvent` misuse with the `useLatest` + `useCallback`
  pattern. Effect Events are only valid when called from inside an Effect; the
  Timeline was using them as DOM/JSX event handlers and store callbacks, relying
  on a stable identity that `useEffectEvent` does not guarantee (its identity
  intentionally changes every render). Gesture handlers, the minimap pointer/draw
  handlers, and the `Timeline` track/seek/zoom callbacks now read live state
  through `useLatest` refs and expose genuinely stable `useCallback`s, matching
  `component-patterns.md` rules #3/#11 and the `useViewportGestures` reference.
  The playback rAF loop keeps `useEffectEvent` — the one place it is correct
  (called only from inside the effect's timer). Also reuse the shared `clamp` and
  `valueInset` helpers instead of duplicated inline math, and align the minimap
  wrapper with the library's `cx` + `role="region"` conventions. No public API
  change.

- [#84](https://github.com/SebastianWebdev/entangle-ui/pull/84) [`6683aa6`](https://github.com/SebastianWebdev/entangle-ui/commit/6683aa69850d269fad2af638a813f5c9049fc1a7) Thanks [@SebastianWebdev](https://github.com/SebastianWebdev)! - `Timeline`:
  - The expand-track caret in the track-header column now shows in graph mode too. In dope-sheet mode it still expands the track into an in-place graph lane; in graph mode it just makes the lane taller (`expandedTrackHeight`), so you can spotlight one curve without leaving graph view.
  - Alt + drag on the ruler creates / narrows the loop region (works even when looping was previously off — the drag turns it on). A bare Alt-click without dragging clears the loop. Existing loop-edge / body drags are unchanged.

- [#84](https://github.com/SebastianWebdev/entangle-ui/pull/84) [`6683aa6`](https://github.com/SebastianWebdev/entangle-ui/commit/6683aa69850d269fad2af638a813f5c9049fc1a7) Thanks [@SebastianWebdev](https://github.com/SebastianWebdev)! - `Timeline` — loop / playhead / track-scale UX fixes:
  - The **playhead line is now grabbable along its whole height**. Previously a
    grab landed as `group` over a group-header row and was swallowed by the
    `loop-body` region on the ruler; the hit-test now returns `playhead` on its
    thin pick band over group rows and on the ruler (it beats the wide loop body,
    while loop edges still win). The head also glows + shows an `ew-resize`
    cursor on hover there.
  - **Loop region edges and body highlight on hover** — the hovered edge thickens
    with a glow (cursor `ew-resize`), the body brightens (cursor `grab`), so the
    draggable affordances are discoverable. Backed by a new `hoverLoop` store
    slice. Alt+drag on the ruler keeps creating / re-drawing the loop (now also
    when the drag starts on the playhead line).
  - `trackScale` gains **`minLaneHeight`** (default `48`): lanes shorter than this
    skip the scale entirely, so a collapsed graph-mode track no longer renders
    overlapping min/mid/max labels.

- [#84](https://github.com/SebastianWebdev/entangle-ui/pull/84) [`6683aa6`](https://github.com/SebastianWebdev/entangle-ui/commit/6683aa69850d269fad2af638a813f5c9049fc1a7) Thanks [@SebastianWebdev](https://github.com/SebastianWebdev)! - `Timeline` — two new opt-in props that tune the loop region's chrome:
  - **`loopStrip`** (default `false`) — adds a thin dedicated band directly
    under the time ruler. A plain drag on the strip creates / re-draws the
    loop region, no Alt needed. The main ruler keeps its scrub behaviour, so
    scrub vs loop-create stop fighting on a single zone.
  - **`loopHandles`** (default `'edges'`) — `'edges'` keeps the existing
    full-height vertical bars on each loop edge; `'brackets'` draws compact
    `[ ]` markers with serifs in the chrome (ruler + strip) area instead. No
    full-height bars across the track area, and the edge pick zone widens so
    the markers are easier to grab.

  Both compose: the Animation Editor showcase enables them together. Drawing
  and hit-test now resolve a unified `chromeHeight = rulerHeight +
loopStripHeight` so screen↔content Y conversions stay correct for marquee
  selection, double-click add, tangent drags and scrolling.

## 0.9.0

### Minor Changes

- [#70](https://github.com/SebastianWebdev/entangle-ui/pull/70) [`729f863`](https://github.com/SebastianWebdev/entangle-ui/commit/729f8638f9f53ed268489d564302c6c6743f6103) Thanks [@SebastianWebdev](https://github.com/SebastianWebdev)! - Add `Combobox` component (`@/components/controls/Combobox`). Single-value select with an editable input — filters the option list as the user types using the built-in fuzzy matcher (`fuzzyScore` from CommandPalette), configurable via `filterFn`. Supports controlled and uncontrolled modes, optional `freeSolo` for accepting arbitrary input, optional `creatable` mode that surfaces a `Create "<query>"` row and invokes `onCreate`, an async-friendly `loading` state, optional `openOnFocus`, optional `clearable` button, and shares keyboard navigation with MultiSelect through `useListboxNav`.

- [#70](https://github.com/SebastianWebdev/entangle-ui/pull/70) [`729f863`](https://github.com/SebastianWebdev/entangle-ui/commit/729f8638f9f53ed268489d564302c6c6743f6103) Thanks [@SebastianWebdev](https://github.com/SebastianWebdev)! - Add `CommandPalette` component (`@/components/feedback/CommandPalette`). Search-driven command list shown as a centred floating dialog. Type to fuzzy-filter (subsequence + word-boundary scoring), ArrowUp/Down to navigate, Enter to run, Escape to close. Hover mirrors keyboard selection. Groups, descriptions, leading icons, and `<Kbd>`-rendered shortcuts; supports a custom `renderItem` for full layout overrides. Recent selections are tracked in localStorage when `recentKey` is provided (graceful fallback when unavailable). Component does not bind a global hotkey — wire `useHotkey('Mod+K', open)` in the consumer. Also exports the underlying `fuzzyScore` and `fuzzyFilter` helpers.

- [#70](https://github.com/SebastianWebdev/entangle-ui/pull/70) [`729f863`](https://github.com/SebastianWebdev/entangle-ui/commit/729f8638f9f53ed268489d564302c6c6743f6103) Thanks [@SebastianWebdev](https://github.com/SebastianWebdev)! - Add `DataTable` component (`@/components/data/DataTable`) — a new `data` category. Sortable columns (three-state cycle asc → desc → none, controllable via `sort` / `onSortChange` / `manualSort`), single or multiple row selection with controlled and uncontrolled modes, custom `rowKey`, three densities (`comfortable` / `compact` / `dense`), sticky header, optional sticky-left columns via per-column `sticky`, optional column resizing via `resizableColumns`, custom row renderer, empty state slot, loading state with skeleton rows, and row virtualization auto-enabled above 100 rows (opt-in / opt-out via `virtualized`). Built on `@tanstack/react-virtual` (added as a peer dependency) and uses CSS grid under `role="grid"` so columns line up across the sticky header and individual virtualized rows. Keyboard navigation supports ArrowUp/Down, Home/End, PageUp/PageDown, Space (toggle in multi mode) and Enter (activate, toggle in single mode).

- [#70](https://github.com/SebastianWebdev/entangle-ui/pull/70) [`729f863`](https://github.com/SebastianWebdev/entangle-ui/commit/729f8638f9f53ed268489d564302c6c6743f6103) Thanks [@SebastianWebdev](https://github.com/SebastianWebdev)! - Add `Drawer` component (`@/components/feedback/Drawer`). Anchored sliding panel for filters, navigation, or detail views. Compound API (`Drawer.Header`, `Drawer.Body`, `Drawer.Footer`, `Drawer.CloseButton`), four anchors (left/right/top/bottom), modal and non-modal modes, focus trap when modal, optional close on overlay click and Escape, slide-in/out animations honoring `prefers-reduced-motion`, portal by default, size presets plus arbitrary CSS values.

- [#70](https://github.com/SebastianWebdev/entangle-ui/pull/70) [`729f863`](https://github.com/SebastianWebdev/entangle-ui/commit/729f8638f9f53ed268489d564302c6c6743f6103) Thanks [@SebastianWebdev](https://github.com/SebastianWebdev)! - Add `FileUploader` component (`@/components/controls/FileUploader`). Drag-and-drop file uploader with click-to-browse fallback, MIME type and extension matching via `accept`, `maxSize`/`minSize`/`maxFiles` enforcement with reasoned rejections through `onReject`, custom synchronous `validate`, controlled and uncontrolled item lists, optional single-file mode, and a per-row UI showing file name, size, status badge (`pending` / `uploading` / `done` / `error`), and an animated progress bar. The component is presentational around the file list — the consumer drives the actual upload via `onFilesAdd` and reflects progress back through `value`.

- [#70](https://github.com/SebastianWebdev/entangle-ui/pull/70) [`729f863`](https://github.com/SebastianWebdev/entangle-ui/commit/729f8638f9f53ed268489d564302c6c6743f6103) Thanks [@SebastianWebdev](https://github.com/SebastianWebdev)! - Add `HoverCard` component (`@/components/primitives/HoverCard`). Hover- and focus-driven floating panel for previews. `HoverCard.Trigger` + `HoverCard.Content` compound, configurable `openDelay` (400ms) and `closeDelay` (150ms), safe-polygon based cursor handover from trigger to content (toggle with `disableSafePolygon`), portal by default, controlled and uncontrolled modes, `disabled` flag.

- [#70](https://github.com/SebastianWebdev/entangle-ui/pull/70) [`729f863`](https://github.com/SebastianWebdev/entangle-ui/commit/729f8638f9f53ed268489d564302c6c6743f6103) Thanks [@SebastianWebdev](https://github.com/SebastianWebdev)! - Add `MultiSelect` component (`@/components/controls/MultiSelect`). Multi-value select that renders chosen options as inline chips inside the trigger, with a `+N more` overflow badge once `maxInlineChips` is exceeded. Supports flat or grouped options, optional searchable mode with custom `filterFn`, controlled and uncontrolled modes, keyboard navigation through `useListboxNav`, configurable `max` cap, optional `clearable` button, and `closeOnSelect` to dismiss the dropdown after each pick. Three sizes, three variants, full label/helper/error wiring, and form-friendly hidden input via `name`.

- [#70](https://github.com/SebastianWebdev/entangle-ui/pull/70) [`729f863`](https://github.com/SebastianWebdev/entangle-ui/commit/729f8638f9f53ed268489d564302c6c6743f6103) Thanks [@SebastianWebdev](https://github.com/SebastianWebdev)! - Add `Pagination` component (`@/components/navigation/Pagination`). Page navigator with sibling/boundary ellipsis logic (MUI-style), 1-based pages, controlled and uncontrolled modes, optional first/last jump buttons, optional prev/next, three sizes, customisable aria labels.

- [#70](https://github.com/SebastianWebdev/entangle-ui/pull/70) [`729f863`](https://github.com/SebastianWebdev/entangle-ui/commit/729f8638f9f53ed268489d564302c6c6743f6103) Thanks [@SebastianWebdev](https://github.com/SebastianWebdev)! - Add `TagInput` component (`@/components/controls/TagInput`). Multi-value text input that captures a list of strings as removable chips. Controlled and uncontrolled modes via `value`/`defaultValue`/`onChange`, configurable commit keys (`Enter`, `Comma`, `Space`, `Tab`), optional `addOnBlur`, duplicate handling, `max` cap, custom `validate`/`normalize` callbacks with reason reporting through `onValidate`, custom chip rendering via `renderTag`, `Backspace` removes the trailing tag when the draft is empty, paste with separators is split into multiple tags, three sizes, three variants, and full label/helper/error wiring.

- [#70](https://github.com/SebastianWebdev/entangle-ui/pull/70) [`729f863`](https://github.com/SebastianWebdev/entangle-ui/commit/729f8638f9f53ed268489d564302c6c6743f6103) Thanks [@SebastianWebdev](https://github.com/SebastianWebdev)! - Add `useListboxNav` hook (`@/hooks/useListboxNav`). Generic keyboard navigation primitive for listbox-like surfaces (Select, MultiSelect, Combobox, CommandPalette). Tracks an `activeIndex`, skips disabled items, and exposes a single `handleKeyDown` covering ArrowUp/ArrowDown/Home/End/Enter/Escape with optional looping. The hook is purely logical — consumers render the list and bind the handler to an input or the listbox container. Resets the active index when the items array changes by reference.

- [#70](https://github.com/SebastianWebdev/entangle-ui/pull/70) [`729f863`](https://github.com/SebastianWebdev/entangle-ui/commit/729f8638f9f53ed268489d564302c6c6743f6103) Thanks [@SebastianWebdev](https://github.com/SebastianWebdev)! - Fixes and additions for the 0.9 release:
  - `Radio` — inner dot at `size="md"` is now 6 px instead of 7 px so the dot stays pixel-centered inside the 14 px outer ring.
  - `Accordion` — new `width` prop (defaults to `"100%"`); the accordion now keeps a stable width regardless of which item is expanded.
  - `Alert` — new `width` prop (defaults to `"100%"`); long unbreakable content now wraps via `overflow-wrap: anywhere` instead of stretching the alert.
  - `SkeletonLayout` — new component (`@/components/feedback/Skeleton`) with pre-built loading patterns: `card`, `list`, `table`, `grid`, `chat`. Each variant composes the existing `Skeleton` primitive with sensible defaults; configurable `count`, `columns`, `animation`, and `width`. Grid defaults to `animation="none"` for dense surfaces.

- [#70](https://github.com/SebastianWebdev/entangle-ui/pull/70) [`729f863`](https://github.com/SebastianWebdev/entangle-ui/commit/729f8638f9f53ed268489d564302c6c6743f6103) Thanks [@SebastianWebdev](https://github.com/SebastianWebdev)! - Centralise every icon through the shared `Icon` primitive — no component defines SVGs inline anymore.

  **`Icon` primitive — custom size support**

  `size` now accepts any number (interpreted as pixels) or any CSS length string (`'1.5em'`, `'24px'`, …) in addition to the `'sm' | 'md' | 'lg'` tokens. Custom color via any CSS string was already supported. This unlocks reuse of library icons in chip-sized and inline-text contexts that previously needed bespoke SVGs.

  **New icons**
  - `FirstIcon`, `LastIcon` — skip-to-edge chevrons for paginators
  - `CloudUploadIcon` — cloud with up-arrow for upload drop zones
  - `ExternalLinkIcon` — box with arrow leaving the top-right corner
  - `UnlinkIcon` — broken chain (pair with `LinkIcon` for coupled-value toggles)

  **Inline SVG removal**

  Every component that drew its own X / chevron / check / upload / unlink icon now imports the matching `*Icon` from `@/components/Icons` and forwards the appropriate `size` and `decorative` props:
  - Form controls — `Combobox`, `Select`, `MultiSelect` (chevron + check)
  - Primitives — `Checkbox` (check + minus), `Collapsible` (chevron), `Link` (external link)
  - Layout — `Accordion` trigger (chevron)
  - Controls — `VectorInput` (link + unlink), `FileUploader` (cloud upload), `Pagination` (first / last / prev / next)
  - Feedback — `Toast` (info / success / warning / error)
  - Editor — `PropertyInspector` (chevron + undo)

  Left intact: `Stat` delta arrows (no library match for the bar + chunky-arrow set), `Tooltip` arrow tail (not a typical icon shape), `CircularProgress` ring, and the `Mini*Icon` family in `ChatPanel/ChatIcons.tsx` whose usage sites live in unowned files — all flagged for a separate follow-up.

### Patch Changes

- [#70](https://github.com/SebastianWebdev/entangle-ui/pull/70) [`729f863`](https://github.com/SebastianWebdev/entangle-ui/commit/729f8638f9f53ed268489d564302c6c6743f6103) Thanks [@SebastianWebdev](https://github.com/SebastianWebdev)! - Three follow-up fixes/additions for the 0.9 release based on review feedback:
  - `Combobox` — the open/close trigger rotated the entire button instead of just the chevron icon. The rotation is now scoped to a span wrapping the icon, so the click target stays stable.
  - `Combobox` — the clear button now uses the shared `CloseIcon` primitive instead of a hand-rolled inline SVG, which rendered with a noticeable seam at the cross point.
  - `DataTable` — multi-select tables now support range selection. Hold `Shift` while clicking a row's checkbox (or pressing `Space` on a focused row) to toggle every row between the last anchor and the target. Disabled rows are skipped. Behavior is on by default for `selectionMode="multiple"`.

- [#70](https://github.com/SebastianWebdev/entangle-ui/pull/70) [`729f863`](https://github.com/SebastianWebdev/entangle-ui/commit/729f8638f9f53ed268489d564302c6c6743f6103) Thanks [@SebastianWebdev](https://github.com/SebastianWebdev)! - Replace inline X / close icon SVGs across the library with the shared `CloseIcon` primitive.

  The hand-rolled SVGs used a single `M…L…M…L…` path for the cross stroke, which rendered with a visible seam at the center on most platforms (same root cause as the earlier Combobox fix). The library `CloseIcon` uses two separate `<line>` elements through the `Icon` primitive, so the cross is clean and stays consistent across components.

  Touched components:
  - `MultiSelect` — chip remove button and clear-all button
  - `Select` — clear-all button
  - `TagInput` — chip remove button
  - `Drawer` — header close button and `Drawer.CloseButton`
  - `Dialog` — header close button
  - `Popover` — `PopoverClose`
  - `Toast` — dismiss button
  - `FileUploader` — the inline `TrashIcon` now uses the shared `TrashIcon` primitive

  No public-API changes — only the rendered glyph differs.

## 0.8.2

### Patch Changes

- [#68](https://github.com/SebastianWebdev/entangle-ui/pull/68) [`d79e066`](https://github.com/SebastianWebdev/entangle-ui/commit/d79e0667ce9d0cdb6e00832f86b6b2acdf4a42ec) Thanks [@SebastianWebdev](https://github.com/SebastianWebdev)! - Add 18 new icons: `ArchiveIcon`, `DotsVerticalIcon`, `DotsHorizontalIcon`, `ChevronLeftIcon`, `ChevronRightIcon`, `FolderOpenIcon`, `FolderCogIcon`, `UsersIcon`, `BuildingIcon`, `FileTextIcon`, `PauseIcon`, `StopIcon`, `SendIcon`, `TerminalIcon`, `GitBranchIcon`, `BugIcon`, `MinusIcon`, `PinIcon`. The new icons cover IDE essentials (terminal, git branch, bug), playback transport (pause, stop), chat affordances (send, archive, pin), context menu triggers (dots vertical/horizontal), additional chevron directions, and folder variants (open, cog) plus new persona-style icons (users, building, file text). All icons are documented in the gallery, Storybook, the icons reference page, and the Claude Code skill.

## 0.8.1

### Patch Changes

- [#66](https://github.com/SebastianWebdev/entangle-ui/pull/66) [`ca1fc51`](https://github.com/SebastianWebdev/entangle-ui/commit/ca1fc51fa0db1aac0a090f940886bab8aba02962) Thanks [@SebastianWebdev](https://github.com/SebastianWebdev)! - Fix runtime crash in `Slider`, `NumberInput`, and `VectorInput` when used without a manual `KeyboardContextProvider` wrapper, and expose the icon set and provider from the package barrel.
  - `useKeyboardContext` now returns a neutral keyboard state (no pressed keys, all modifiers `false`) when no provider is mounted, instead of throwing. This unblocks every minimal setup that renders a `Slider` / `NumberInput` directly under `ThemeProvider`.
  - `ThemeProvider` now auto-mounts `KeyboardContextProvider` so apps get full Shift/Ctrl modifier awareness in `Slider` / `NumberInput` for free.
  - `KeyboardContextProvider`, `useKeyboardContext`, `useEffectsOnKeyboard`, and the `KeyboardContextProviderProps` type are now exported from the package entry for explicit use in apps that don't render a `ThemeProvider`.
  - The 63 built-in icon components (`SaveIcon`, `PlayIcon`, `AddIcon`, …) are now re-exported from the package entry, matching the documentation.

## 0.8.0

### Minor Changes

- [#49](https://github.com/SebastianWebdev/entangle-ui/pull/49) [`0cd0997`](https://github.com/SebastianWebdev/entangle-ui/commit/0cd0997e236b822e9cd6b7d140e4285a1cbe365f) Thanks [@SebastianWebdev](https://github.com/SebastianWebdev)! - Add `Alert` component for persistent inline status banners — read-only
  notices, expired-credentials warnings, unsaved-changes banners, and similar
  in-layout messages. Five semantic variants (`info`, `success`, `warning`,
  `error`, `neutral`) drive the color and the default icon, with three visual
  treatments: `subtle` (default), `solid`, and `outline`. Provide `onClose`
  to render a dismiss button. Ships a compound API — `Alert.Title`,
  `Alert.Description`, `Alert.Actions` — also exported as standalone
  `AlertTitle`, `AlertDescription`, `AlertActions`. ARIA roles are derived
  from the variant (`alert` for error/warning, `status` for info/success,
  `region` for neutral). For transient confirmations like "File saved", reach
  for `useToast` instead.

- [#50](https://github.com/SebastianWebdev/entangle-ui/pull/50) [`cad70ba`](https://github.com/SebastianWebdev/entangle-ui/commit/cad70ba1c6cbf4137345fe473448fd80697ae744) Thanks [@SebastianWebdev](https://github.com/SebastianWebdev)! - Add `Avatar` and `AvatarGroup` primitives for rendering people, agents, and
  named entities consistently across editor UIs. `Avatar` resolves an `src`
  when one is available and falls back through initials (derived from `name`,
  or set explicitly) to a generic user glyph; the fallback is always rendered
  underneath the image so a slow load never produces a blank flash. Six sizes
  (`xs` 16px → `xxl` 56px), three shapes (`circle`, `square`, `rounded`),
  deterministic auto colour hashed from `name`, optional presence indicator
  (`online` / `away` / `busy` / `offline`), and an interactive mode (`onClick`
  makes it a focusable, Enter/Space-activatable button). `AvatarGroup`
  overlaps multiple avatars with configurable spacing and collapses overflow
  beyond `max` into a `+N` indicator with a tooltip listing the hidden names.

- [#51](https://github.com/SebastianWebdev/entangle-ui/pull/51) [`31469af`](https://github.com/SebastianWebdev/entangle-ui/commit/31469afb423b6eeb60791ab8762a0e06c7111159) Thanks [@SebastianWebdev](https://github.com/SebastianWebdev)! - Add Breadcrumbs navigation for hierarchical paths, including link/current/disabled item states, automatic or custom separators, collapsed trails with expandable ellipsis, truncation tooltips, Storybook coverage, and Starlight documentation.

- [#57](https://github.com/SebastianWebdev/entangle-ui/pull/57) [`434e750`](https://github.com/SebastianWebdev/entangle-ui/commit/434e7507c0df6c2a6f250340d0cdbd66ee0b2d3f) Thanks [@SebastianWebdev](https://github.com/SebastianWebdev)! - Promote three internal patterns into public hooks: `useFocusTrap`, `useMergedRef`, and `useResizeObserver`.
  - `useFocusTrap` was previously a private helper inside `Dialog`. It now lives in the public hooks API with the same `({ containerRef, enabled }) => onKeyDown` signature.
  - `useMergedRef` replaces inline ref-merge boilerplate in `Dialog`, `ChatMessageList`, `FloatingPanel`, and `ScrollArea`. Pass any number of object refs, callback refs, `null`, or `undefined`, and get a single callback ref that fans the node out to all of them.
  - `useResizeObserver` wraps the browser API with the conventions used elsewhere in the library: SSR-safe, stable callback identity (no re-subscription on callback change), and an `enabled` flag for toggling without unmount. `SplitPane`, `ScrollArea`, and the chat scroll hook (`useChatScroll`) now use it.

  All three hooks have full documentation pages with runnable demos.

  This is a pure extraction — no behavior changes in the affected components, all existing tests pass.

- [#57](https://github.com/SebastianWebdev/entangle-ui/pull/57) [`434e750`](https://github.com/SebastianWebdev/entangle-ui/commit/434e7507c0df6c2a6f250340d0cdbd66ee0b2d3f) Thanks [@SebastianWebdev](https://github.com/SebastianWebdev)! - Establish the public hooks library and ship the first reference hook, `useControlledState`. The hook codifies the controlled / uncontrolled state pattern that every input-like component in the library reimplements: it accepts an optional `value`, `defaultValue`, `onChange`, and a required `fallback`, and returns a `[value, setValue]` tuple just like `useState`. Switching between controlled and uncontrolled modes during a component's lifetime emits a development-only warning that mirrors React's own `<input value/defaultValue>` warning.

  Also adds a small `devWarn` / `devError` helper used internally by the library to gate developer-facing warnings to development builds. Several internal warnings that previously logged in production (Skeleton circle aspect, SegmentedControl a11y warning, NumberInput parse errors, useKeyboard fallback) are now silent in production.

  The hooks documentation site gets a new top-level "Hooks" section with a landing page and a dedicated page for `useControlledState`.

- [#59](https://github.com/SebastianWebdev/entangle-ui/pull/59) [`583f19f`](https://github.com/SebastianWebdev/entangle-ui/commit/583f19fa12aef2c861c622e008a8ceafee03e7c5) Thanks [@SebastianWebdev](https://github.com/SebastianWebdev)! - Add four net-new hooks to the public API: `useDisclosure`, `useClipboard`, `useClickOutside`, and `useHotkey`.
  - **`useDisclosure`** — manages a boolean `isOpen` state with stable `open`, `close`, `toggle`, and `setOpen` callbacks. Supports both controlled (`open` / `onOpenChange`) and uncontrolled (`defaultOpen`) modes, built on top of `useControlledState`.
  - **`useClipboard`** — copies text to the clipboard with a built-in timeout-driven `copied` feedback flag, an `error` field, and a `reset` callback. Uses `navigator.clipboard.writeText` with a `document.execCommand` fallback; never throws.
  - **`useClickOutside`** — fires a callback when a click lands outside one or more refs. Supports both single-ref and array-of-refs forms (useful for popover + trigger pairs) and is configurable to listen on `mousedown`, `click`, or `pointerdown`.
  - **`useHotkey`** — binds a single keyboard combo (e.g. `'Ctrl+S'`, `'Cmd+K'`, `'Escape'`) to a callback. `Cmd` automatically maps to `Ctrl` on non-Mac platforms. Skips firing inside editable elements by default; `enableInInputs` opts back in for global shortcuts.

  All four hooks are SSR-safe, clean up subscriptions on unmount, and use a stable handler-ref pattern so consumers do not need to memoize callbacks. Each hook ships with a dedicated page on the docs site under the Hooks section.

- [#58](https://github.com/SebastianWebdev/entangle-ui/pull/58) [`ac62afb`](https://github.com/SebastianWebdev/entangle-ui/commit/ac62afb6329ca533e0987973e0802c50229bb9c0) Thanks [@SebastianWebdev](https://github.com/SebastianWebdev)! - Add a maintained light theme preset. Ships `lightThemeValues` and a
  `createLightTheme()` helper that generates a build-time CSS class via
  Vanilla Extract. Unlike the dark theme, the light preset is not applied
  on `:root` — consumers opt in by wrapping a subtree with
  `VanillaThemeProvider` and the generated class, so the same theming
  machinery powers both whole-app light mode and scoped light surfaces
  inside a dark app (and vice versa). Structural tokens (spacing,
  typography, border-radius, transitions, z-index) are identical between
  themes so layout and rhythm don't drift when users switch modes.
  Storybook gains a global theme toggle for inspecting any story under
  either theme.

- [#55](https://github.com/SebastianWebdev/entangle-ui/pull/55) [`d01fe9e`](https://github.com/SebastianWebdev/entangle-ui/commit/d01fe9ea1b8d9d59e99ee4e639559872b2f83abe) Thanks [@SebastianWebdev](https://github.com/SebastianWebdev)! - Add `Link` styled-anchor primitive. Provides theme-aware color, underline,
  hover, and focus behavior, plus `default` / `subtle` / `inline` variants
  and `sm` / `md` / `lg` sizes. External links are auto-detected from
  `http(s)://` hrefs (or set explicitly), get an external-link icon, and
  ship `target="_blank" rel="noopener noreferrer"` along with an "(opens in
  new tab)" screen-reader announcement. Polymorphic via `as` with a typed
  generic so consumers can pass a router's link component (react-router,
  TanStack Router, Next.js) and get the router's own props (`to`, …)
  type-checked. `disabled` renders as a non-anchor span regardless of `as`,
  strips navigation handlers, and suppresses the external affordance —
  disabled router links cannot navigate via mouse, keyboard, or
  programmatic activation.

- [#52](https://github.com/SebastianWebdev/entangle-ui/pull/52) [`ce4240e`](https://github.com/SebastianWebdev/entangle-ui/commit/ce4240ede8cbabe7c4da09ad919d1e7d46408567) Thanks [@SebastianWebdev](https://github.com/SebastianWebdev)! - Add `ProgressBar` and `CircularProgress` feedback components for measurable
  operations like uploads, exports, renders, and batch jobs. Both share `value`
  / `min` / `max` semantics and four named colors (`primary`, `success`,
  `warning`, `error`) plus arbitrary CSS color pass-through. Omitting `value`
  renders an indeterminate variant — a sliding gradient on the linear bar, a
  rotating arc on the circular one — with a `prefers-reduced-motion` fallback.
  `ProgressBar` ships in three heights (`sm` 2px → `lg` 8px), supports inline /
  overlay / custom labels, and an optional striped (optionally animated)
  texture overlay; `CircularProgress` ranges from `xs` (16px) to `xl` (48px),
  auto-derives stroke thickness from size (overridable via `thickness`), and
  can render a center label for `lg`+ sizes. Both expose
  `role="progressbar"` with the appropriate `aria-value*` attributes.

- [#47](https://github.com/SebastianWebdev/entangle-ui/pull/47) [`0300928`](https://github.com/SebastianWebdev/entangle-ui/commit/0300928f4e1cce6e48dbcb15b657cbe77d6fa650) Thanks [@SebastianWebdev](https://github.com/SebastianWebdev)! - Add `Radio` and `RadioGroup` primitives. Closes the last gap in Phase 1 by providing a styled, accessible alternative to native radio inputs for mutually exclusive selection.
  - `Radio`: standalone (controlled or uncontrolled) or context-driven, with sizes (sm/md/lg), label position, helper text, and error state.
  - `RadioGroup`: manages exclusive selection, propagates `name`, `size`, `disabled`, and `error` via context, supports vertical/horizontal orientation, custom spacing, required/error states, and helper text.
  - Native `<input type="radio">` under the hood so browser arrow-key navigation and form submission work out of the box.
  - Honors `prefers-reduced-motion`.

- [#54](https://github.com/SebastianWebdev/entangle-ui/pull/54) [`7e88083`](https://github.com/SebastianWebdev/entangle-ui/commit/7e8808322ec022ba7a7290f4686c315c09103123) Thanks [@SebastianWebdev](https://github.com/SebastianWebdev)! - Add SegmentedControl, a toolbar-density mutually exclusive selector for view modes, layout toggles, and small option groups. Compound API (`SegmentedControl` + `SegmentedControlItem`) with controlled and uncontrolled modes, three visual variants (subtle / solid / outline), three sizes, horizontal and vertical orientations, optional fullWidth, icon and icon-only segments with tooltip support, an animated sliding indicator that respects `prefers-reduced-motion`, full roving-tabindex keyboard navigation (Arrow keys / Home / End), `role="group"` + `aria-pressed` accessibility, Storybook coverage, and Starlight documentation.

- [#46](https://github.com/SebastianWebdev/entangle-ui/pull/46) [`014eecc`](https://github.com/SebastianWebdev/entangle-ui/commit/014eeccc4f4d96f2d6ea39f6dcfe427acb51d62d) Thanks [@SebastianWebdev](https://github.com/SebastianWebdev)! - Add `Skeleton` and `SkeletonGroup` components for loading-placeholder
  states. Supports `rect`, `circle`, and `line` shapes with `pulse`, `wave`,
  or no animation. Animations honor `prefers-reduced-motion`. `SkeletonGroup`
  auto-generates a configurable number of skeletons with consistent spacing
  and direction, or lays out custom children.

- [#63](https://github.com/SebastianWebdev/entangle-ui/pull/63) [`f86981d`](https://github.com/SebastianWebdev/entangle-ui/commit/f86981dea383ea91027437998285001e3e535f98) Thanks [@SebastianWebdev](https://github.com/SebastianWebdev)! - Ship machine-readable token artifacts alongside the JS bundle. Each release
  now publishes `entangle-ui/tokens.json` (a loosely DTCG-aligned export of
  both themes), `entangle-ui/tokens.dark.css` (the dark `--etui-*` custom
  properties scoped to `:root`), and `entangle-ui/tokens.light.css` (the light
  preset scoped to the documented `etui-theme-light` class). Figma plugins,
  Style Dictionary pipelines, and projects that don't use Vanilla Extract can
  now consume the same values the components compile against. The tree-shaking
  guarantees of the main entry point are unchanged — these files are only
  loaded by consumers that explicitly import them.

- [#61](https://github.com/SebastianWebdev/entangle-ui/pull/61) [`fb25779`](https://github.com/SebastianWebdev/entangle-ui/commit/fb25779de140def961c0ace8fad70399e676c7b5) Thanks [@SebastianWebdev](https://github.com/SebastianWebdev)! - Add `TransformControl` — the canonical position / rotation / scale property
  control for 3D editor interfaces. Composes `VectorInput`, `Select` and
  `PropertyRow` into a single high-level component, mirroring the transform
  widget found in Blender, Unity and Unreal. Renders three rows (position,
  rotation, scale) plus a coordinate-space dropdown and a linked-scale lock
  toggle, with sensible defaults for precision (`3 / 1 / 3`), step
  (`0.1 / 1 / 0.01`) and units (`m / ° / ''`). Three independent atoms —
  `value`, `coordinateSpace`, `linkedScale` — each support controlled and
  uncontrolled usage. `linkedScale` performs uniform (not proportional)
  scaling and does not snap values when toggled. Hide rows via `show`,
  swap the coordinate-space options via `coordinateSpaceOptions`, and turn
  on per-row reset buttons with `showReset`. The component intentionally
  renders no `PropertySection` wrapper — slot it inside one of your own.
  Note: changing the coordinate-space dropdown does not transform the
  numeric values; the consumer's editor logic is responsible for re-projecting
  them.

- [#53](https://github.com/SebastianWebdev/entangle-ui/pull/53) [`f6a6580`](https://github.com/SebastianWebdev/entangle-ui/commit/f6a6580344a2b591ca6549bdc46f7320793d6704) Thanks [@SebastianWebdev](https://github.com/SebastianWebdev)! - Add the Kbd primitive for consistent keyboard shortcut rendering across menus, tooltips, command palettes, and help panels. Includes platform-aware glyph utilities for macOS, Windows, and Linux shortcut labels.

- [#60](https://github.com/SebastianWebdev/entangle-ui/pull/60) [`27b61f0`](https://github.com/SebastianWebdev/entangle-ui/commit/27b61f02a69b37672cc279e67dd0481dfd717698) Thanks [@SebastianWebdev](https://github.com/SebastianWebdev)! - Add `useTheme` hook for runtime theme reads. Returns the resolved CSS
  variable snapshot from `:root`, the detected variant (`'dark'` / `'light'` /
  `'custom'`), and `getToken(path)` / `getVar(path)` helpers for paths like
  `'colors.accent.primary'`. Use it for canvas drawing, third-party libraries
  that take colours as plain strings, and conditional logic — keep using
  Vanilla Extract `vars.*` for ordinary styling. SSR-safe: returns dark-theme
  defaults when no DOM is available.

- [#56](https://github.com/SebastianWebdev/entangle-ui/pull/56) [`af3f44a`](https://github.com/SebastianWebdev/entangle-ui/commit/af3f44a17d173f192f2e376a73760c82fe6a86f5) Thanks [@SebastianWebdev](https://github.com/SebastianWebdev)! - Add `VisuallyHidden` primitive for hiding content visually while keeping
  it accessible to screen readers. Implements the canonical SR-only style
  and supports a `focusable` mode for skip-to-content links (revealed via
  `:focus-within`). Renders as `<span>` by default with `as` overrides for
  `div`, `label`, and `p`.

### Patch Changes

- [#50](https://github.com/SebastianWebdev/entangle-ui/pull/50) [`5763f0e`](https://github.com/SebastianWebdev/entangle-ui/commit/5763f0ea29a7820bee11a0c6860a3015849c83c6) Thanks [@SebastianWebdev](https://github.com/SebastianWebdev)! - Internal refactor: `ChatMessage` now renders the new `Avatar` primitive
  instead of inline JSX. The visual output (24px circle, initials fallback,
  image when available) is unchanged from a consumer's perspective, but the
  chat avatar now picks up Avatar's deterministic auto color, image-error
  fallback chain, and standard accessible-name handling for free.

- [#62](https://github.com/SebastianWebdev/entangle-ui/pull/62) [`91f2c7b`](https://github.com/SebastianWebdev/entangle-ui/commit/91f2c7b18463d684f19a4e9a25f56b8fe70fcc69) Thanks [@SebastianWebdev](https://github.com/SebastianWebdev)! - Honor `prefers-reduced-motion: reduce` across every existing component that
  animates anything. Loading spinners (Button, IconButton), Dialog overlay
  and panel fade-in/out, Toast slide-in and auto-dismiss progress bar,
  Select dropdown scale-in, Popover entry, Tooltip popup transition, Switch
  thumb travel, Checkbox check-mark draw, expand/collapse chevrons (Accordion,
  Collapsible, Select, TreeView, PropertySection, ChatPanel tool-call),
  Accordion and Collapsible content height transitions, Avatar / Slider /
  ColorPicker hover scale effects, and every `transition: all` block on
  interactive primitives now collapse to a static state under reduced
  motion. Direct-manipulation interactions (drag, scrub, gizmo rotation,
  focus rings, hover color changes) are preserved. A new
  [Accessibility](https://entangle-ui.dev/guides/accessibility) guide page
  documents the library's reduced-motion stance and shows how to follow the
  same pattern in consumer code.

- [#48](https://github.com/SebastianWebdev/entangle-ui/pull/48) [`249a2aa`](https://github.com/SebastianWebdev/entangle-ui/commit/249a2aa11801a45871dffd11286a2535e895d7f4) Thanks [@SebastianWebdev](https://github.com/SebastianWebdev)! - Add a CSS-free `entangle-ui/theme-values` export for Node, SSR, and tooling consumers that need raw theme data without importing Vanilla Extract CSS runtime files.

- [#61](https://github.com/SebastianWebdev/entangle-ui/pull/61) [`7bce1c9`](https://github.com/SebastianWebdev/entangle-ui/commit/7bce1c93a4432ddac252be65f6334211c68674b9) Thanks [@SebastianWebdev](https://github.com/SebastianWebdev)! - Fix `VectorInput` axis inputs overflowing their column in narrow layouts.
  The `NumberInput` inside each axis previously took its intrinsic content
  width, causing values to clip and visually overlap when the row was tight
  (typical inside property panels or alongside a lock toggle). The
  `NumberInput` container now fills the remaining axis space with
  `flex: 1; min-width: 0`, so axes share width evenly and shrink gracefully.

## 0.7.0

### Minor Changes

- [#44](https://github.com/SebastianWebdev/entangle-ui/pull/44) [`5529de0`](https://github.com/SebastianWebdev/entangle-ui/commit/5529de0c0eebb780e117f361997c52733ff8b66a) Thanks [@SebastianWebdev](https://github.com/SebastianWebdev)! - **v0.7.0 release — addresses the agent-ui audit findings.**

  ### New components
  - **Badge** (primitives): inline status indicator with `subtle`, `solid`, `outline`, and `dot` variants; named or raw colors; optional icon and remove button.
  - **TextArea** (primitives): multi-line input with label / helper text / auto-resize (`minRows`/`maxRows`), char counter, and monospace mode. Visual parity with `Input`.
  - **Divider** (layout): horizontal/vertical rule with `solid` / `dashed` / `dotted` variants and an optional centered label.
  - **Spinner** (feedback): `ring` / `dots` / `pulse` variants; `xs`–`lg` sizes; honors `prefers-reduced-motion`.
  - **EmptyState** (feedback): title + description + icon + action slots, `default`/`compact` variants, and a `loading` swap that renders a `Spinner`.
  - **PageHeader** (layout): semantic `<header>` with icon, title, subtitle, breadcrumbs, and right-aligned actions.
  - **Code** (primitives): small inline `<code>` primitive backed by the new `background.inset` token.
  - **ListItem** (layout): list row with leading/trailing slots, selected/active/disabled states, keyboard-activatable when `onClick` is provided.
  - **ChatMarkdownRenderer**: opt-in markdown renderer for `ChatMessage.renderContent` (bold/italic/code, lists, blockquotes, fenced code, GFM tables, safe links).

  ### Bug fixes
  - `ChatInput` now allows attachments-only submit — both controlled and uncontrolled paths check `attachments.length` in addition to the trimmed value; the send button stays enabled when attachments are queued.
  - `ChatMessageList` auto-scroll is now streaming-aware: `useChatScroll` observes the content element's height via `ResizeObserver`, so the list stays pinned to the bottom when the last message grows token-by-token.
  - `SplitPanePanel` now fills its wrapper (`width: 100%; height: 100%; minWidth: 0; minHeight: 0; box-sizing: border-box`) so nested `PanelSurface` / `ScrollArea` children with `height: 100%` lay out correctly.

  ### New props & APIs
  - `ChatMessage.maxWidth` and `ChatPanel.messageMaxWidth` — per-message and panel-level bubble width control via the new public `--etui-chat-message-max-width` CSS variable.
  - `ChatMessageList.scrollApiRef` — imperative handle exposing `scrollToBottom`, `scrollTo`, `scrollToElement`, and `isAtBottom` for driving scroll from outside (search results, "jump to top" actions, etc.).
  - `useChatScroll` now returns `scrollContentRef`, `scrollTo`, and `scrollToElement` alongside the existing API.
  - `useChatInput` accepts `attachmentsCount` for attachments-only submit support.
  - `Tabs.keepMounted` — parent-level cascade so every `TabPanel` stays mounted unless a child explicitly sets `keepMounted={false}`.

  ### New theme tokens
  - `colors.background.inset` — sunken surface for inline code, textarea backgrounds, and recessed preview areas.
  - `colors.surface.row` / `colors.surface.rowHover` — list-row backgrounds that are lighter than `surface.hover` (which is reserved for interactive controls like buttons).

  ### Developer experience
  - `ThemeProvider` now accepts `globalScrollbars` (opt-in) which toggles consistent dark-theme scrollbar styling on `document.body`.
  - Shared animation utilities (`animSpin`, `animPulse`, `animBlink`, `animFadeIn`) and keyframes (`spinKeyframe`, `pulseKeyframe`, `blinkKeyframe`, `fadeInKeyframe`) exported from the root. Each utility honors `prefers-reduced-motion`.

  No breaking changes.

## 0.6.3

### Patch Changes

- [#42](https://github.com/SebastianWebdev/entangle-ui/pull/42) [`e728388`](https://github.com/SebastianWebdev/entangle-ui/commit/e7283883d5323ff9eba8764991dd6b6af393b09a) Thanks [@SebastianWebdev](https://github.com/SebastianWebdev)! - Update README: remove alpha tag, add missing peer dependencies, export createCustomTheme from main entry point

## 0.6.2

### Patch Changes

- [#40](https://github.com/SebastianWebdev/entangle-ui/pull/40) [`e741f82`](https://github.com/SebastianWebdev/entangle-ui/commit/e741f828607ed018073d8b597b6f7695bba94ec7) Thanks [@SebastianWebdev](https://github.com/SebastianWebdev)! - Reword mathExpression JSDoc to avoid socket.dev false positive alerts

## 0.6.1

### Patch Changes

- [#38](https://github.com/SebastianWebdev/entangle-ui/pull/38) [`3a3222f`](https://github.com/SebastianWebdev/entangle-ui/commit/3a3222f6e007f8fe2d0969df17c0d7e21b67cfc4) Thanks [@SebastianWebdev](https://github.com/SebastianWebdev)! - Default NumberInput precision to 2 decimal places. Fixes floating-point artifacts (e.g. `1.0000000000000002`) when dragging to change values.

- [#38](https://github.com/SebastianWebdev/entangle-ui/pull/38) [`1b9540f`](https://github.com/SebastianWebdev/entangle-ui/commit/1b9540f5008a71c53549d6882b3e52e8c4f6bf5e) Thanks [@SebastianWebdev](https://github.com/SebastianWebdev)! - Replace eval-based math expression parser with recursive descent parser. Removes `new Function()` to eliminate Socket.dev "Uses eval" flag. Adds modulo operator, implicit multiplication, multi-arg functions (min, max, pow, clamp, lerp, smoothstep), hyperbolic trig, unit conversion (deg/rad), and context-aware comma handling.

- [#38](https://github.com/SebastianWebdev/entangle-ui/pull/38) [`536e037`](https://github.com/SebastianWebdev/entangle-ui/commit/536e037280821dc4c9e9d4833514fbd04b579675) Thanks [@SebastianWebdev](https://github.com/SebastianWebdev)! - Move @vanilla-extract/dynamic and @vanilla-extract/recipes from dependencies to peerDependencies. Mark them as external in Rollup to avoid bundling duplicate runtime code.

## 0.6.0

### Minor Changes

- [#37](https://github.com/SebastianWebdev/entangle-ui/pull/37) [`4ef7ec8`](https://github.com/SebastianWebdev/entangle-ui/commit/4ef7ec868c6887a6e23ca7ef38dcdb28a3f15d5b) Thanks [@SebastianWebdev](https://github.com/SebastianWebdev)! - Changed Input onChange from (event) to (value: string) for API consistency with all other components

### Patch Changes

- [#37](https://github.com/SebastianWebdev/entangle-ui/pull/37) [`4ef7ec8`](https://github.com/SebastianWebdev/entangle-ui/commit/4ef7ec868c6887a6e23ca7ef38dcdb28a3f15d5b) Thanks [@SebastianWebdev](https://github.com/SebastianWebdev)! - Fixed CurveEditor handle values resetting when moving keyframes. Manually adjusting a handle on an auto-tangent keyframe now promotes the tangent mode from auto to free, preventing recalculation from overwriting user changes.

- [#37](https://github.com/SebastianWebdev/entangle-ui/pull/37) [`4ef7ec8`](https://github.com/SebastianWebdev/entangle-ui/commit/4ef7ec868c6887a6e23ca7ef38dcdb28a3f15d5b) Thanks [@SebastianWebdev](https://github.com/SebastianWebdev)! - Fixed CurveEditor bezier curves producing vertical spikes and loops when control handles exceeded segment bounds. Auto-tangent handles now scale proportionally to segment length, and all handles are clamped at evaluation time as a safety net.

- [#35](https://github.com/SebastianWebdev/entangle-ui/pull/35) [`a0d9e87`](https://github.com/SebastianWebdev/entangle-ui/commit/a0d9e87729b86d6f0a495c4be6abcaaa80d8a495) Thanks [@SebastianWebdev](https://github.com/SebastianWebdev)! - Fix tree-shaking by replacing barrel imports with direct file imports and adding \*.css.js to sideEffects config.

- [#37](https://github.com/SebastianWebdev/entangle-ui/pull/37) [`4ef7ec8`](https://github.com/SebastianWebdev/entangle-ui/commit/4ef7ec868c6887a6e23ca7ef38dcdb28a3f15d5b) Thanks [@SebastianWebdev](https://github.com/SebastianWebdev)! - Hardened math expression evaluator security: expanded blocked identifiers with JS keywords, added expression length limit (200 chars), and made isExpression case-sensitive to match evaluator behavior.

## 0.5.1

### Patch Changes

- [#33](https://github.com/SebastianWebdev/entangle-ui/pull/33) [`35efe46`](https://github.com/SebastianWebdev/entangle-ui/commit/35efe463b0f1b8e4b92ccabbb792c80160eec593) Thanks [@SebastianWebdev](https://github.com/SebastianWebdev)! - Add documentation site at entangle-ui.dev, update package homepage, and update README with complete component list.

## 0.5.0

### Minor Changes

- [#30](https://github.com/SebastianWebdev/entangle-ui/pull/30) [`a471804`](https://github.com/SebastianWebdev/entangle-ui/commit/a4718046f68e41953c3efcf1987c82daf1a124ad) Thanks [@SebastianWebdev](https://github.com/SebastianWebdev)! - ### Breaking Changes
  - **Shell component props**: Removed `$` prefix from all shell component props. `$size` → `size`, `$variant` → `variant`, `$side` → `side`, `$orientation` → `orientation` across StatusBar, Toolbar, and MenuBar.
  - **BaseButton removed**: Deleted dead `BaseButton` primitive (was not exported from public API).

  ### Fixes
  - **sideEffects**: Changed `sideEffects: false` to `["*.css", "*.css.ts"]` so bundlers preserve Vanilla Extract CSS.
  - **Theme export**: Added `entangle-ui/theme` export path for `darkThemeValues` and `DarkThemeValues` type.
  - **Hardcoded 26px**: Replaced hardcoded StatusBar medium height with `vars.shell.statusBar.heightMd` theme token.
  - **Lockfile**: Regenerated `package-lock.json` to remove stale Emotion peerDeps.

  ### Performance
  - **Icons memoized**: All 63 icon components wrapped with `React.memo` and `/*#__PURE__*/` annotations for better tree-shaking and fewer re-renders.

  ### Internal
  - **Chat SVG deduplication**: Extracted shared mini-icons into `ChatIcons.tsx`, removed duplicated inline SVGs from `ChatAttachment` and `ChatContextChip`.
  - **`cn` deprecated**: `cn` utility is now a re-export alias of `cx`. Use `cx` directly.
  - **`'use client'` directives**: Added to all icon files for Next.js App Router compatibility.

### Patch Changes

- [#32](https://github.com/SebastianWebdev/entangle-ui/pull/32) [`c080cd7`](https://github.com/SebastianWebdev/entangle-ui/commit/c080cd7def25fca19061ff366ea98144fcd4b6ba) Thanks [@SebastianWebdev](https://github.com/SebastianWebdev)! - ### Internal
  - **ChatToolCall SVG deduplication**: Moved inline `WrenchIcon` and `ChevronIcon` from `ChatToolCall.tsx` to shared `ChatIcons.tsx` as `MiniWrenchIcon` and `MiniChevronIcon`.
  - **vite.config.ts cleanup**: Removed stale `build.lib` section with UMD format reference (Rollup handles the real build, Vite is only used for Storybook).

## 0.4.0

### Minor Changes

- [#27](https://github.com/SebastianWebdev/entangle-ui/pull/27) [`2233f75`](https://github.com/SebastianWebdev/entangle-ui/commit/2233f75f7adbf07023bd5c897acc7426a7f1b041) Thanks [@SebastianWebdev](https://github.com/SebastianWebdev)! - Add ChatPanel component set for AI assistant chat interfaces.

  **New components:**
  - `ChatPanel` — top-level container with density variants (`compact` | `default` | `comfortable`)
  - `ChatMessageList` — scrollable message list with auto-scroll and sticky date headers
  - `ChatMessage` — single message row with role-based alignment, error state with red tint
  - `ChatBubble` — styled message bubble (user / assistant / system)
  - `ChatInput` — multiline input with bottom toolbar, themed scrollbar, and submit handling
  - `ChatInputToolbar` — action bar below the input (attach, context, model picker)
  - `ChatTypingIndicator` — animated dot indicator for assistant responses
  - `ChatToolCall` — expandable tool/function call display with status badge
  - `ChatCodeBlock` — syntax-highlighted code block with copy button
  - `ChatAttachmentChip` — file attachment chip with icon, name, and remove action
  - `ChatContextChip` — context reference chip (file, selection, symbol)
  - `ChatEmptyState` — placeholder shown when conversation is empty
  - `ChatActionBar` — per-message action bar (copy, retry, edit)

  **New hooks:**
  - `useChatMessages` — message list state management (add, update, remove, clear)
  - `useChatInput` — input state with submit, history navigation, and composition handling
  - `useChatScroll` — auto-scroll with scroll-to-bottom detection and manual override

  **New icons:**
  - `AiChatIcon` — chat bubble with sparkle accent
  - `AiSparklesIcon` — three 4-pointed sparkle stars (enlarged for better visibility)
  - `RobotIcon` — robot face icon

- [#25](https://github.com/SebastianWebdev/entangle-ui/pull/25) [`3b9eff2`](https://github.com/SebastianWebdev/entangle-ui/commit/3b9eff278fba77b2a945acaed2ad67855ba084bc) Thanks [@SebastianWebdev](https://github.com/SebastianWebdev)! - Migrate all components from Emotion CSS-in-JS to Vanilla Extract (zero-runtime, build-time CSS).

  **Breaking changes:**
  - The `css` prop is no longer supported on migrated components. Use `className` and `style` instead.
  - Peer dependency: `@vanilla-extract/css`, `@vanilla-extract/recipes`, and `@vanilla-extract/dynamic` are now required.
  - Peer dependency renamed: `@base-ui-components/react` → `@base-ui/react` (^1.1.0). The upstream package was renamed.

  **New exports:**
  - `vars` — Theme contract object (`vars.colors.*`, `vars.spacing.*`, etc.) mapping to stable `--etui-*` CSS custom properties.
  - `darkThemeValues` — Default dark theme token values.
  - `createCustomTheme(selector, overrides)` — Helper to create custom themes in `.css.ts` files.
  - `VanillaThemeProvider` — Optional scoped theme wrapper component.
  - `cx(...classes)` — Utility for composing class names.

  **Migration details:**
  - ~60 styled components across all categories (primitives, layout, controls, form, navigation, feedback, editor, shell) now use Vanilla Extract recipes and styles.
  - Theme tokens are exposed as CSS custom properties (`--etui-color-*`, `--etui-spacing-*`, etc.) that can be overridden with plain CSS.
  - Legacy `Dialog.styled.ts` and `Menu.styled.ts` files removed.
  - Emotion dependencies remain for the transition period but are no longer used by any library component.

  **Build fixes:**
  - Add `@rollup/plugin-commonjs` to fix Rollup build failure caused by `@vanilla-extract/css` importing the CJS-only `cssesc` module with ESM default import syntax.
  - Fix dependency classification — move build-only packages to devDependencies for cleaner library output.

  **Dependency updates:**
  - Migrate `@base-ui-components/react` → `@base-ui/react` ^1.1.0 (upstream rename).
  - Bump all dependencies to latest safe versions.
  - Narrow `MenuBaseProps` from `HTMLElement` to `HTMLDivElement` to match new `@base-ui/react` API.

  **Other fixes:**
  - Replace unicode characters with proper Icon components in FloatingPanel.
  - Restore custom gradient backgrounds in FullEditor story.
  - Fix optional chaining to satisfy stricter `@typescript-eslint/prefer-optional-chain`.

  **Documentation:**
  - Add `docs/quickstart.md` — installation, setup, full component catalog, common patterns.
  - Add `docs/theming.md` — complete token reference, customization methods, CSS property names.
  - Add `docs/styling.md` — Vanilla Extract recipes, dynamic vars, Emotion patterns, conventions.

- [#29](https://github.com/SebastianWebdev/entangle-ui/pull/29) [`94eb3d0`](https://github.com/SebastianWebdev/entangle-ui/commit/94eb3d015f396151d9344fea378e0ce6dd957e23) Thanks [@SebastianWebdev](https://github.com/SebastianWebdev)! - Remove Emotion CSS-in-JS dependency entirely — all styling now uses Vanilla Extract (zero-runtime, compile-time CSS)

  ### Breaking Changes
  - `@emotion/react` and `@emotion/styled` are no longer peer dependencies
  - Removed exports: `createTheme`, `tokens`, `Theme`, `Tokens` types
  - Removed `css` prop from `BaseComponent` interface
  - `ThemeProvider` is now a no-op pass-through (kept for compatibility)

  ### Migration
  - Replace `import { createTheme, tokens } from 'entangle-ui'` with `import { vars, darkThemeValues } from 'entangle-ui'`
  - Replace `import type { Theme } from 'entangle-ui'` with `import type { ThemeVars } from 'entangle-ui'`
  - Use `className` + `style` props instead of `css` prop
  - Theme tokens: use `vars.colors.*`, `vars.spacing.*` from Vanilla Extract contract

- [#28](https://github.com/SebastianWebdev/entangle-ui/pull/28) [`c0cb878`](https://github.com/SebastianWebdev/entangle-ui/commit/c0cb878f6e443e0b42e272f6ec40b23d047cbf01) Thanks [@SebastianWebdev](https://github.com/SebastianWebdev)! - Add shared canvas primitives layer, CartesianPicker, and ViewportGizmo components.

  **New components:**
  - `CartesianPicker` — A 2D point selector with canvas-based rendering, drag interaction, keyboard navigation, and full accessibility support. Supports controlled/uncontrolled modes, custom domains, grid snapping, and extensible bottom bar and background renderers.
  - `ViewportGizmo` — A 3D orientation widget (like Blender/Maya viewport cubes) with orbiting, axis snapping, preset views, keyboard navigation, and depth-sorted rendering. Supports Y-up and Z-up conventions, configurable axis colors, and multiple interaction modes.

  **New shared canvas primitives (`primitives/canvas/`):**
  - `CanvasContainer` — Responsive canvas wrapper with DPR handling, ResizeObserver support, ARIA live region, and pointer event forwarding.
  - `useCanvasSetup` — Hook for canvas DPR setup, resize tracking, and context management.
  - `useCanvasRenderer` — Hook for requestAnimationFrame-based render loops with automatic cleanup.
  - `canvasDrawing` — Pure utility functions for grid, axis labels, crosshair, point marker, origin axes, and domain bounds rendering.
  - `canvasCoords` — Coordinate conversion utilities (domain-to-canvas, canvas-to-domain).
  - `canvasTheme` — Theme resolution from CSS custom properties for canvas 2D contexts.

  **CurveEditor refactor:**
  - CurveEditor now consumes the shared canvas primitives layer with zero test regressions.

  **Next.js compatibility:**
  - Added `'use client'` directives to all components and hooks that require client-side rendering.

  **New exports:**
  - `CartesianPicker`, `CartesianPickerProps`, `CartesianBottomBarInfo`
  - `ViewportGizmo`, `ViewportGizmoProps`, `GizmoOrientation`, `GizmoPresetView`, `GizmoUpAxis`, `GizmoAxisColorPreset`, `GizmoAxisConfig`
  - `eulerToRotationMatrix`, `projectToCanvas`, `projectAxes`, `gizmoHitTest`, `presetViewToOrientation`, `quaternionToEuler`, `axisToPresetView`
  - `CanvasContainer`, `CanvasContainerProps`, `CanvasViewport`, `DomainBounds`, `Point2D`, `CanvasThemeColors`, `CanvasBackgroundInfo`
  - `domainToCanvas`, `canvasToDomain`, `resolveCanvasTheme`
  - `drawGrid`, `drawDomainBounds`, `drawAxisLabels`, `drawCrosshair`, `drawPointMarker`, `drawOriginAxes`, `formatLabel`
  - `useCanvasSetup`, `useCanvasRenderer`

### Patch Changes

- [#29](https://github.com/SebastianWebdev/entangle-ui/pull/29) [`d1ae3c8`](https://github.com/SebastianWebdev/entangle-ui/commit/d1ae3c84fce0b6e5138d57c97614d33d5f5c410d) Thanks [@SebastianWebdev](https://github.com/SebastianWebdev)! - Add 'use client' directives to all component files for Next.js App Router compatibility, upgrade Storybook from 9.0.6 to 10.2.8, use ScrollArea in ChatMessageList, and add ResizeObserver polyfill to test setup

## 0.3.0

### Minor Changes

- [#24](https://github.com/SebastianWebdev/entangle-ui/pull/24) [`7c350bb`](https://github.com/SebastianWebdev/entangle-ui/commit/7c350bb1ec812a4c4e3ab44c36bc280920aa61c0) Thanks [@SebastianWebdev](https://github.com/SebastianWebdev)! - Switch to fully tree-shakeable ESM build with preserveModules
  - Replace monolithic bundle with per-module ESM output (`dist/esm/`)
  - Drop CJS output — ESM-only package
  - Add `sideEffects: false` and `exports` field to package.json
  - Fix externals: add @emotion/react, @emotion/styled, @floating-ui/react, react/jsx-runtime
  - Fix wrong external name: @base-ui/react → @base-ui-components/react
  - Remove @emotion/react and @emotion/styled from dependencies (keep in peerDependencies only)
  - Add `/*#__PURE__*/` annotations for tree-shaking (Object.assign, createContext, React.memo, forwardRef)
  - Add `entangle-ui/palettes` deep import entry point
  - Add size-limit bundle size guards
  - Create tsconfig.build.json (excludes tests/stories from build)

### Patch Changes

- [#23](https://github.com/SebastianWebdev/entangle-ui/pull/23) [`1e67018`](https://github.com/SebastianWebdev/entangle-ui/commit/1e6701877b283cdd954d61e726d323f98d59c56a) Thanks [@SebastianWebdev](https://github.com/SebastianWebdev)! - Replace hardcoded rgba values with theme tokens (whiteOverlay, separator shadows, thumb) and deduplicate AppShell toolbar slots. Fix SplitPane panel collapse regression where collapsed panels were clamped back to minSize.

- [#21](https://github.com/SebastianWebdev/entangle-ui/pull/21) [`df53065`](https://github.com/SebastianWebdev/entangle-ui/commit/df53065ac21a89a257ca5a66d7943c19399940a9) Thanks [@SebastianWebdev](https://github.com/SebastianWebdev)! - Optimize new components: memoize context values, wrap leaf components with React.memo, replace hardcoded z-index/spacing with theme tokens, extract constants

## 0.2.0

### Minor Changes

- [#19](https://github.com/SebastianWebdev/entangle-ui/pull/19) [`497d0f5`](https://github.com/SebastianWebdev/entangle-ui/commit/497d0f540f8abdf853cdf88aff8e944fee59d378) Thanks [@SebastianWebdev](https://github.com/SebastianWebdev)! - ### App Shell and Navigation
  - Added `topChromeSeparator` and `sideChromeSeparator` props in `AppShell` to control border/shadow separation between top and side chrome areas.
  - Refined `Tabs` visual behavior for compact editor layouts and added `pillsFrame` prop to optionally disable the pills container frame.
  - Updated closable tabs to use the library `CloseIcon` by default.

  ### Menu and Inspector Improvements
  - Added configurable menu dropdown gap via `menuOffset` in `MenuBar`.
  - Extended `PropertyPanel` with configurable `contentTopSpacing` and new `contentBottomSpacing` for better control of inspector spacing.
  - Adjusted property row padding and full-width control layout to better support dense controls (including sliders and curve editor rows).

  ### Typography
  - Bumped default UI text from 10px (`fontSize.xs`) to 12px (`fontSize.md`) across interactive components: `Menu`, `MenuBar`, `Select`, `Button`, `Input`, `NumberInput`, `TreeView`, `StatusBar`, `FloatingPanel`, and `PropertyInspector` (rows, sections, search, panel).
  - Kept 10px for true secondary text: helper text, tooltips, group labels, toast messages, axis labels.
  - `TreeView`: fixed `line-height: 1` cutting off descenders (p/q/g/y), now uses theme `lineHeight.normal`.
  - `TreeView`: simplified selected item indicator to background-only (removed left border and box-shadow on selected).
  - `FloatingPanel`: replaced hardcoded `12px` font-size with theme token.
  - Added `ContextMenu` component with submenu support, icon slots, and keyboard navigation.

  ### Layout and Rendering Fixes
  - Fixed `SplitPane` size reconciliation to avoid 1-2px layout drift caused by rounding.
  - Improved overflow behavior in shell regions (`Toolbar`, `StatusBar`, tabs panels, and side slots) to prevent content from bleeding outside container bounds.
  - Improved `CurveEditor` axis label layout and spacing when `labelX` / `labelY` are provided.

## 0.1.0

### Minor Changes

- [#17](https://github.com/SebastianWebdev/entangle-ui/pull/17) [`0854066`](https://github.com/SebastianWebdev/entangle-ui/commit/0854066dbf38c5d45bca24dc861c9eb03a1e98b3) Thanks [@SebastianWebdev](https://github.com/SebastianWebdev)! - ### New Components
  - **Checkbox & CheckboxGroup** — Controlled/uncontrolled boolean input with indeterminate state, label positioning, sizes (sm/md/lg), variants (default/filled), and array value management via CheckboxGroup
  - **Switch** — Toggle control with controlled/uncontrolled modes, label positioning, sizes, error state, and animated track/thumb
  - **Select** — Dropdown single-value selection with search/filter, grouped options, keyboard navigation, clearable option, portal-based dropdown, sizes and variants (default/ghost/filled)
  - **Tabs** — Compound component (Tabs, TabList, Tab, TabPanel) with variants (underline/pills/enclosed), vertical orientation, closable tabs, fullWidth mode, and keepMounted option
  - **Accordion** — Compound component (Accordion, AccordionItem, AccordionTrigger, AccordionContent) with single/multiple expansion, collapsible option, variants, CSS grid animation
  - **Popover** — Floating content container with focus trap, click outside/Escape handling, 12 placements, matchTriggerWidth, portal rendering, and scale+opacity animation
  - **ScrollArea** — Custom scrollbar styling with keyboard scrolling support
  - **SplitPane** — Draggable panel divider with configurable min/max sizes and collapse/expand
  - **TreeView** — Hierarchical tree with keyboard navigation, selection management, and useTreeState hook
  - **VectorInput** — Multi-value input (x/y/z/w) with linked/unlinked mode and per-component NumberInput editing
  - **ColorPicker** — Full-featured color input with ColorArea, HueSlider, AlphaSlider, ColorInputs (Hex/RGB/HSL), ColorPalette, ColorPresets (700+ colors), ColorSwatch, and EyeDropper
  - **Dialog** — Modal overlay with DialogHeader, DialogBody, DialogFooter, DialogClose, focus trap, and animations
  - **Toast** — Notification system with ToastProvider, ToastContainer, ToastItem, useToast hook, auto-dismiss, progress bar, and severity variants
  - **Collapsible** — Headless collapsible primitive for expandable content

  ### Refactoring & Improvements
  - Translated all Polish comments and JSDoc to English across the entire codebase
  - Added `forwardRef` and `displayName` to all primitive and layout components
  - Added `React.memo` to stateless presentational components (Icon, Paper, Text, Spacer, FormLabel, FormHelperText, InputWrapper)
  - Split monolithic Menu.tsx (693 lines) into modular files (types, hook, helpers, styled, component)
  - Migrated Stack, Flex, Grid, Spacer to BaseComponent pattern with `css` prop support
  - Hardened `mathExpression.ts` with blocked identifiers whitelist and 20 adversarial security tests
  - Added comprehensive keyboard navigation tests for Button, Input, NumberInput, Slider, and Menu

  ### CI/CD
  - Added GitHub Actions CI workflow (lint, build, type-check, test on PRs and main)
  - Added GitHub Actions release workflow with Changesets and npm OIDC Trusted Publishing
  - Configured Changesets for automated version management and changelog generation

## 0.1.0-alpha.0

Initial alpha release.
