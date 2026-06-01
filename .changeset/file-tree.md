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
  give full content control.
- Exported helpers `getFileIconKind` / `classifyExtension` / `getFileExtension`
  and types `FileTreeNode`, `FileTreeNodeKind`, `FileTreeNodeState`,
  `FileTreeImportPayload`, `FileIconKind`.

Internal move / reorder is intentionally deferred for v1 (external import only);
the heavyweight internal-move case is covered by `AssetBrowser`.

TreeView (additive, backwards-compatible): new generic drop-target props
`dropTargetId` and `onNodeDragOver` / `onNodeDragLeave` / `onNodeDrop`. These
finally wire up the long-declared-but-unused `droppable` field on
`TreeNodeData`, and are usable for building drop interactions on a plain
`TreeView`, not just `FileTree`.

Icons: add `ImageIcon` (no image glyph existed; `AssetBrowser` relied on
thumbnails, but a tree has none).

Docs: new FileTree page with live demos (project tree, drag-and-drop import,
icon resolution, selection, sizes).
