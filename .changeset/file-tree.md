---
'entangle-ui': minor
---

FileTree: a file-system-flavored specialization of `TreeView` with automatic
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
