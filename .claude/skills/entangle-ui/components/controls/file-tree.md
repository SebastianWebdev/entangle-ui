# FileTree

> File-system-flavored TreeView specialization with automatic file-type icons and drag-and-drop import of OS files.

A file-system-flavored specialization of [`TreeView`](/components/controls/tree-view). It maps a file/folder model onto the tree, auto-assigns **file-type icons** by extension (plus open/closed folder glyphs), and adds **drag-and-drop import** of OS files onto a folder or the root. Expansion, selection, keyboard navigation, and sizing are inherited from `TreeView` unchanged.

**Live Preview**

## Import

```tsx
import { FileTree } from 'entangle-ui';
import type { FileTreeNode } from 'entangle-ui';
```

## Usage

`FileTree` takes a nested array of `FileTreeNode`s. Each node has a `kind` of
`'file'` or `'folder'`; folders carry `children`. File-type icons are derived
from the file `name` (or an explicit `ext`), so you don't assign them yourself.

```tsx
const nodes: FileTreeNode[] = [
  {
    id: 'src',
    name: 'src',
    kind: 'folder',
    children: [
      { id: 'btn', name: 'Button.tsx', kind: 'file' },
      { id: 'logo', name: 'logo.svg', kind: 'file' },
    ],
  },
  { id: 'readme', name: 'README.md', kind: 'file' },
];

<FileTree nodes={nodes} defaultExpandedIds={['src']} />;
```

## Drag-and-drop import

Provide `onImport` to enable the import drop zone. Dropping OS files onto a
folder targets that folder; dropping a file row targets its parent folder;
dropping on empty space targets the root (`targetFolder: null`). The active
target folder is highlighted while dragging. `FileTree` only reports
intent — apply the change to your data and pass back fresh `nodes`.

**Drag-and-drop import**

```tsx
<FileTree
  nodes={nodes}
  onImport={({ files, targetFolder }) => {
    uploadInto(targetFolder?.id ?? 'root', files);
  }}
/>
```

## File-type icons

Icons are resolved from the file extension into a small set of buckets
(image, media, code, archive, text) backed by the library icon set, with
open/closed folder glyphs. Pass `resolveIcon` to override per node — return
`undefined` to fall back to the built-in icon.

**File-type icons**

```tsx
<FileTree
  nodes={nodes}
  resolveIcon={(node, { expanded }) =>
    node.name.endsWith('.json') ? <StarIcon color="warning" /> : undefined
  }
/>
```

The `classifyExtension` / `getFileIconKind` helpers used internally are also
exported, in case you want to drive your own UI from the same mapping.

## Selection

Selection reuses `TreeView`'s controlled/uncontrolled model verbatim —
`single` (default), `multiple` (Ctrl / Shift click, Ctrl+A), or `none`.

**Selection**

```tsx
<FileTree
  nodes={nodes}
  selectionMode="multiple"
  selectedIds={selected}
  onSelectionChange={setSelected}
/>
```

## Sizes

**Sizes**

```tsx
<FileTree nodes={nodes} size="sm" />
<FileTree nodes={nodes} size="md" />
<FileTree nodes={nodes} size="lg" />
```

## Relationship to TreeView

`FileTree` renders a `TreeView` internally and feeds it derived nodes — it does
**not** reimplement expansion, selection, or keyboard navigation. The same
controlled/uncontrolled props (`expandedIds` / `defaultExpandedIds`,
`selectedIds` / `defaultSelectedIds`) and the same keyboard behaviour apply.
Reach for `TreeView` directly when you need a generic hierarchy; reach for
`FileTree` when the data is files and folders.

The drag-and-drop import is built on top of `TreeView`'s generic drop-target
props (`dropTargetId`, `onNodeDragOver` / `onNodeDragLeave` / `onNodeDrop`),
which are available for building your own drop interactions on a plain
`TreeView` as well.

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `nodes` | `FileTreeNode[]` | — | Tree data — array of root-level files/folders. |
| `expandedIds` | `string[]` | — | Expanded node IDs (controlled). |
| `defaultExpandedIds` | `string[]` | — | Default expanded node IDs (uncontrolled). |
| `onExpandedChange` | `(expandedIds: string[]) => void` | — | Fired when expanded nodes change. |
| `selectedIds` | `string[]` | — | Selected node IDs (controlled). |
| `defaultSelectedIds` | `string[]` | — | Default selected node IDs (uncontrolled). |
| `selectionMode` | `'single' \| 'multiple' \| 'none'` | `'single'` | Selection mode (reused from TreeView). |
| `onSelectionChange` | `(selectedIds: string[]) => void` | — | Fired when selected nodes change. |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Row size. |
| `indent` | `number` | `16` | Indentation per depth level in pixels. |
| `showChevrons` | `boolean` | `true` | Whether to show expand/collapse chevrons for folders. |
| `showGuideLines` | `boolean` | `false` | Whether to show connecting guide lines. |
| `maxHeight` | `number \| string` | — | Maximum height before the tree scrolls. |
| `resolveIcon` | `(node: FileTreeNode, state: { expanded: boolean }) => ReactNode` | — | Override a node icon. Return undefined to fall back to the built-in extension map. |
| `renderNode` | `(node: FileTreeNode, state: FileTreeNodeState) => ReactNode` | — | Fully replace a node's inner content (icon + label). |
| `renderActions` | `(node: FileTreeNode, state: FileTreeNodeState) => ReactNode` | — | Render trailing actions on the right of a row. |
| `emptyContent` | `ReactNode` | — | Content shown when nodes is empty. |
| `onImport` | `(payload: { files: File[]; targetFolder: FileTreeNode \| null }) => void` | — | Fired when OS files are dropped onto a folder or the root. Presence enables the import drop zone. |
| `onNodeClick` | `(node: FileTreeNode, event: MouseEvent) => void` | — | Fired when a node is clicked. |
| `onNodeDoubleClick` | `(node: FileTreeNode, event: MouseEvent) => void` | — | Fired when a node is double-clicked. |
| `onNodeContextMenu` | `(node: FileTreeNode, event: MouseEvent) => void` | — | Fired when a node is right-clicked. |
| `className` | `string` | — | Additional CSS class names. |
| `testId` | `string` | — | Test identifier for automated testing. |

### FileTreeNode

| Property   | Type                      | Description                                          |
| ---------- | ------------------------- | ---------------------------------------------------- |
| `id`       | `string`                  | Stable unique id within the tree.                    |
| `name`     | `string`                  | Display name, e.g. `"Button.tsx"`.                   |
| `kind`     | `'file' \| 'folder'`      | File vs. folder. Folders accept dropped files.       |
| `ext`      | `string`                  | Extension override (no dot). Inferred from `name`.   |
| `path`     | `string`                  | Optional path (informational; surfaced unchanged).   |
| `children` | `FileTreeNode[]`          | Child entries (folders).                             |
| `disabled` | `boolean`                 | Dim + non-interactive.                               |
| `data`     | `Record<string, unknown>` | Arbitrary consumer payload.                          |

## Accessibility

Accessibility is inherited from `TreeView`:

- The container is `role="tree"`; each row is `role="treeitem"` with
  `aria-expanded` / `aria-selected` and `aria-level`.
- `aria-activedescendant` tracks the focused node; focus is scrolled into view.
- Full keyboard navigation (Arrow keys, Home/End, Enter, Space, Ctrl+A,
  Shift+Arrow range selection). File-type icons are decorative
  (`aria-hidden`), so the file name is the accessible label.
