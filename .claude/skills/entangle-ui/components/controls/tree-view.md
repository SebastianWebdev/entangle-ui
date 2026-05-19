# TreeView

> Hierarchical collapsible tree for scene hierarchies, file browsers, and layer stacks with multi-selection and inline renaming.

Hierarchical collapsible tree for displaying and managing nested data. Supports single and multi-selection, full keyboard navigation, inline renaming, custom node rendering, and expandable/collapsible branches. The go-to component for scene hierarchies, file browsers, and layer stacks.

**Live Preview**

## Import

```tsx
import { TreeView } from 'entangle-ui';
```

## Usage

```tsx
const nodes = [
  {
    id: 'scene',
    label: 'Scene',
    children: [
      { id: 'camera', label: 'Camera' },
      { id: 'light', label: 'Sun Light' },
      {
        id: 'objects',
        label: 'Objects',
        children: [
          { id: 'cube', label: 'Cube' },
          { id: 'sphere', label: 'Sphere' },
        ],
      },
    ],
  },
];

<TreeView nodes={nodes} onSelectionChange={setSelected} />;
```

## Selection Modes

The `selectionMode` prop controls how nodes can be selected.

```tsx
// Single selection (default)
<TreeView nodes={nodes} selectionMode="single" />

// Multi-selection with Ctrl+Click, Shift+Click, Ctrl+A
<TreeView nodes={nodes} selectionMode="multiple" />

// No selection (display-only)
<TreeView nodes={nodes} selectionMode="none" />
```

## Controlled vs Uncontrolled

Both expanded and selected states can be controlled or uncontrolled.

```tsx
// Controlled
<TreeView
  nodes={nodes}
  expandedIds={expanded}
  onExpandedChange={setExpanded}
  selectedIds={selected}
  onSelectionChange={setSelected}
/>

// Uncontrolled with defaults
<TreeView
  nodes={nodes}
  defaultExpandedIds={['scene', 'objects']}
  defaultSelectedIds={['cube']}
/>
```

## Inline Renaming

Enable double-click-to-rename with the `renamable` prop. Per-node renaming can also be controlled via the node's `renamable` property.

```tsx
<TreeView
  nodes={nodes}
  renamable
  onNodeRename={(nodeId, newLabel) => {
    updateNodeLabel(nodeId, newLabel);
  }}
/>
```

## Node Icons

Each node can include an icon rendered before its label.

```tsx
const nodes = [
  { id: 'mesh', label: 'Mesh', icon: <MeshIcon /> },
  { id: 'light', label: 'Light', icon: <LightIcon /> },
  { id: 'camera', label: 'Camera', icon: <CameraIcon /> },
];

<TreeView nodes={nodes} />;
```

## Custom Node Rendering

Use `renderNode` to completely customize how each node is displayed. Use `renderActions` to add trailing action buttons.

```tsx
<TreeView
  nodes={nodes}
  renderNode={(node, state) => (
    <span style={{ fontWeight: state.selected ? 'bold' : 'normal' }}>
      {node.icon} {node.label}
      {state.expanded ? ' (open)' : ''}
    </span>
  )}
  renderActions={(node, state) => (
    <button onClick={() => deleteNode(node.id)}>x</button>
  )}
/>
```

The `state` object provides: `selected`, `expanded`, `focused`, `depth`, `isLeaf`, `isFirst`, `isLast`.

## Guide Lines

Show connecting guide lines between parent and child nodes.

```tsx
<TreeView nodes={nodes} showGuideLines />
```

## Indentation

Control the indentation per depth level. Default is 16px.

```tsx
<TreeView nodes={nodes} indent={24} />
```

## Expand on Select

Automatically expand parent nodes when they are selected.

```tsx
<TreeView nodes={nodes} expandOnSelect />
```

## Max Height

Set a maximum height before the tree scrolls.

```tsx
<TreeView nodes={nodes} maxHeight={300} />
```

## Empty State

Customize the content shown when the tree is empty.

```tsx
<TreeView nodes={[]} emptyContent={<div>No items in scene</div>} />
```

## Sizes

```tsx
<TreeView nodes={nodes} size="sm" />
<TreeView nodes={nodes} size="md" />
<TreeView nodes={nodes} size="lg" />
```

## Event Handlers

```tsx
<TreeView
  nodes={nodes}
  onNodeClick={(node, event) => console.log('Clicked:', node.id)}
  onNodeDoubleClick={(node, event) => console.log('Double-clicked:', node.id)}
  onNodeContextMenu={(node, event) => showContextMenu(node, event)}
  onSelectionChange={ids => setSelected(ids)}
  onExpandedChange={ids => setExpanded(ids)}
/>
```

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `nodes` | `TreeNodeData[]` | — | Tree data — array of root-level nodes. |
| `expandedIds` | `string[]` | — | Expanded node IDs (controlled). |
| `defaultExpandedIds` | `string[]` | — | Default expanded node IDs (uncontrolled). |
| `selectedIds` | `string[]` | — | Selected node IDs (controlled). |
| `defaultSelectedIds` | `string[]` | — | Default selected node IDs (uncontrolled). |
| `selectionMode` | `'single' \| 'multiple' \| 'none'` | `'single'` | Selection mode for the tree. |
| `renamable` | `boolean` | `false` | Whether to allow inline renaming via double-click. |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Tree node size. |
| `indent` | `number` | `16` | Indentation per depth level in pixels. |
| `showChevrons` | `boolean` | `true` | Whether to show expand/collapse chevrons for parent nodes. |
| `showGuideLines` | `boolean` | `false` | Whether to show connecting guide lines. |
| `expandOnSelect` | `boolean` | `false` | Whether to expand parent nodes when selected. |
| `maxHeight` | `number \| string` | — | Maximum height before scrolling. |
| `renderNode` | `(node: TreeNodeData, state: TreeNodeState) => ReactNode` | — | Custom render function for node content. |
| `renderActions` | `(node: TreeNodeData, state: TreeNodeState) => ReactNode` | — | Custom render function for trailing actions (right side). |
| `emptyContent` | `ReactNode` | — | Content shown when nodes array is empty. |
| `onExpandedChange` | `(expandedIds: string[]) => void` | — | Fired when expanded nodes change. |
| `onSelectionChange` | `(selectedIds: string[]) => void` | — | Fired when selected nodes change. |
| `onNodeClick` | `(node: TreeNodeData, event: MouseEvent) => void` | — | Fired when a node is clicked. |
| `onNodeDoubleClick` | `(node: TreeNodeData, event: MouseEvent) => void` | — | Fired when a node is double-clicked. |
| `onNodeContextMenu` | `(node: TreeNodeData, event: MouseEvent) => void` | — | Fired when a node is right-clicked. |
| `onNodeRename` | `(nodeId: string, newLabel: string) => void` | — | Fired when a node is renamed. |
| `className` | `string` | — | Additional CSS class names. |
| `testId` | `string` | — | Test identifier for automated testing. |

### TreeNodeData

| Property    | Type                      | Description                              |
| ----------- | ------------------------- | ---------------------------------------- |
| `id`        | `string`                  | Unique identifier for this node.         |
| `label`     | `string`                  | Display label.                           |
| `icon`      | `ReactNode`               | Optional icon rendered before the label. |
| `children`  | `TreeNodeData[]`          | Child nodes (undefined for leaf nodes).  |
| `disabled`  | `boolean`                 | Whether this node is disabled.           |
| `draggable` | `boolean`                 | Whether this node can be dragged.        |
| `droppable` | `boolean`                 | Whether this node accepts drop targets.  |
| `renamable` | `boolean`                 | Whether this node can be renamed inline. |
| `data`      | `Record<string, unknown>` | Additional custom data.                  |

## Accessibility

- The tree container uses `role="tree"` with `aria-multiselectable` when in multiple mode
- Each node uses `role="treeitem"` with proper `aria-expanded` and `aria-selected` attributes
- `aria-activedescendant` tracks the focused node
- Full keyboard navigation:
  - **Arrow Down/Up**: Move focus between visible nodes
  - **Arrow Right**: Expand collapsed node, or move to first child
  - **Arrow Left**: Collapse expanded node, or move to parent
  - **Home/End**: Move to first/last visible node
  - **Enter**: Select focused node
  - **Space**: Toggle selection (multi-select mode)
  - **Ctrl+A**: Select all nodes (multi-select mode)
  - **Shift+Arrow**: Range selection (multi-select mode)
- Focused nodes are scrolled into view automatically
