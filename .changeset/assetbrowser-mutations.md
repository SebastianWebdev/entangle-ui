---
'entangle-ui': minor
---

AssetBrowser: add mutation operations — inline rename, delete, create-folder,
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

- Mutation affordances (inline rename, the `F2` / `Delete` / `Ctrl+D` shortcuts)
  are grid-view features; the context-menu actions work in both views.
- The "is editing" flag lives in the store as a per-id slice
  (`useAssetEditing`), so a rename re-renders only the affected cell and can be
  started from the keyboard, a menu, or the imperative handle.

Docs: new Mutations section + a live demo (rename / duplicate / delete / new
folder); the Context menus, Keyboard reference, and API tables are updated.
