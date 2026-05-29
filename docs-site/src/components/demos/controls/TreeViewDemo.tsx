import { useState } from 'react';
import DemoWrapper from '../DemoWrapper';
import { TreeView } from '@/components/controls';
import type { TreeNodeData, TreeNodeState } from '@/components/controls';
import { Stack } from '@/components/layout';
import { Text, IconButton } from '@/components/primitives';
import {
  FolderIcon,
  FileTextIcon,
  GridIcon,
  StarIcon,
  EyeIcon,
  TrashIcon,
} from '@/components/Icons';

const FILE_TREE: TreeNodeData[] = [
  {
    id: 'src',
    label: 'src',
    children: [
      {
        id: 'components',
        label: 'components',
        children: [
          { id: 'button', label: 'Button.tsx' },
          { id: 'input', label: 'Input.tsx' },
          { id: 'slider', label: 'Slider.tsx' },
        ],
      },
      {
        id: 'utils',
        label: 'utils',
        children: [
          { id: 'cn', label: 'cn.ts' },
          { id: 'cx', label: 'cx.ts' },
        ],
      },
      { id: 'index', label: 'index.ts' },
    ],
  },
];

const SCENE_TREE: TreeNodeData[] = [
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
          { id: 'plane', label: 'Plane' },
        ],
      },
    ],
  },
];

const ICON_TREE: TreeNodeData[] = [
  {
    id: 'scene',
    label: 'Scene',
    icon: <FolderIcon />,
    children: [
      { id: 'mesh', label: 'Mesh', icon: <GridIcon /> },
      { id: 'light', label: 'Light', icon: <StarIcon /> },
      { id: 'camera', label: 'Camera', icon: <EyeIcon /> },
      { id: 'readme', label: 'notes.txt', icon: <FileTextIcon /> },
    ],
  },
];

export default function TreeViewDemo() {
  return (
    <DemoWrapper withKeyboard>
      <div style={{ maxWidth: 300 }}>
        <TreeView
          nodes={FILE_TREE}
          defaultExpandedIds={['src', 'components']}
          defaultSelectedIds={['button']}
        />
      </div>
    </DemoWrapper>
  );
}

export function TreeViewSelectionModes() {
  const [single, setSingle] = useState<string[]>(['cube']);
  const [multiple, setMultiple] = useState<string[]>(['cube', 'sphere']);
  return (
    <DemoWrapper withKeyboard>
      <Stack gap={3} style={{ maxWidth: 300 }}>
        <Stack gap={1}>
          <Text size="sm" color="muted">
            Single
          </Text>
          <TreeView
            nodes={SCENE_TREE}
            selectionMode="single"
            defaultExpandedIds={['scene', 'objects']}
            selectedIds={single}
            onSelectionChange={setSingle}
          />
        </Stack>
        <Stack gap={1}>
          <Text size="sm" color="muted">
            Multiple (Ctrl / Shift click)
          </Text>
          <TreeView
            nodes={SCENE_TREE}
            selectionMode="multiple"
            defaultExpandedIds={['scene', 'objects']}
            selectedIds={multiple}
            onSelectionChange={setMultiple}
          />
        </Stack>
        <Stack gap={1}>
          <Text size="sm" color="muted">
            None (display-only)
          </Text>
          <TreeView
            nodes={SCENE_TREE}
            selectionMode="none"
            defaultExpandedIds={['scene', 'objects']}
          />
        </Stack>
      </Stack>
    </DemoWrapper>
  );
}

export function TreeViewControlled() {
  const [expanded, setExpanded] = useState<string[]>(['scene', 'objects']);
  const [selected, setSelected] = useState<string[]>(['cube']);
  return (
    <DemoWrapper withKeyboard>
      <Stack gap={2} style={{ maxWidth: 300 }}>
        <TreeView
          nodes={SCENE_TREE}
          expandedIds={expanded}
          onExpandedChange={setExpanded}
          selectedIds={selected}
          onSelectionChange={setSelected}
        />
        <Text size="sm" color="muted">
          Selected: {selected.length > 0 ? selected.join(', ') : 'none'}
        </Text>
      </Stack>
    </DemoWrapper>
  );
}

export function TreeViewRenaming() {
  const [labels, setLabels] = useState<Record<string, string>>({});
  const nodes: TreeNodeData[] = SCENE_TREE.map(root => ({
    ...root,
    label: labels[root.id] ?? root.label,
    children: root.children?.map(child => ({
      ...child,
      label: labels[child.id] ?? child.label,
      children: child.children?.map(grand => ({
        ...grand,
        label: labels[grand.id] ?? grand.label,
      })),
    })),
  }));
  return (
    <DemoWrapper withKeyboard>
      <div style={{ maxWidth: 300 }}>
        <TreeView
          nodes={nodes}
          renamable
          defaultExpandedIds={['scene', 'objects']}
          onNodeRename={(nodeId, newLabel) =>
            setLabels(prev => ({ ...prev, [nodeId]: newLabel }))
          }
        />
      </div>
    </DemoWrapper>
  );
}

export function TreeViewIcons() {
  return (
    <DemoWrapper withKeyboard>
      <div style={{ maxWidth: 300 }}>
        <TreeView nodes={ICON_TREE} defaultExpandedIds={['scene']} />
      </div>
    </DemoWrapper>
  );
}

export function TreeViewCustomRender() {
  const [nodes, setNodes] = useState<TreeNodeData[]>(SCENE_TREE);
  const removeNode = (id: string) => {
    const filter = (list: TreeNodeData[]): TreeNodeData[] =>
      list
        .filter(node => node.id !== id)
        .map(node =>
          node.children ? { ...node, children: filter(node.children) } : node
        );
    setNodes(prev => filter(prev));
  };
  return (
    <DemoWrapper withKeyboard>
      <div style={{ maxWidth: 300 }}>
        <TreeView
          nodes={nodes}
          defaultExpandedIds={['scene', 'objects']}
          renderNode={(node: TreeNodeData, state: TreeNodeState) => (
            <span style={{ fontWeight: state.selected ? 600 : 400 }}>
              {node.label}
              {!state.isLeaf && state.expanded ? ' (open)' : ''}
            </span>
          )}
          renderActions={(node: TreeNodeData) => (
            <IconButton
              size="sm"
              variant="ghost"
              aria-label={`Delete ${node.label}`}
              onClick={event => {
                event.stopPropagation();
                removeNode(node.id);
              }}
            >
              <TrashIcon />
            </IconButton>
          )}
        />
      </div>
    </DemoWrapper>
  );
}

export function TreeViewGuideLines() {
  return (
    <DemoWrapper withKeyboard>
      <div style={{ maxWidth: 300 }}>
        <TreeView
          nodes={FILE_TREE}
          showGuideLines
          defaultExpandedIds={['src', 'components', 'utils']}
        />
      </div>
    </DemoWrapper>
  );
}

export function TreeViewIndentation() {
  return (
    <DemoWrapper withKeyboard>
      <div style={{ maxWidth: 300 }}>
        <TreeView
          nodes={FILE_TREE}
          indent={28}
          defaultExpandedIds={['src', 'components']}
        />
      </div>
    </DemoWrapper>
  );
}

export function TreeViewExpandOnSelect() {
  return (
    <DemoWrapper withKeyboard>
      <div style={{ maxWidth: 300 }}>
        <TreeView nodes={FILE_TREE} expandOnSelect />
      </div>
    </DemoWrapper>
  );
}

export function TreeViewMaxHeight() {
  const longTree: TreeNodeData[] = [
    {
      id: 'assets',
      label: 'assets',
      children: Array.from({ length: 24 }, (_, i) => ({
        id: `asset-${i}`,
        label: `texture_${String(i).padStart(2, '0')}.png`,
      })),
    },
  ];
  return (
    <DemoWrapper withKeyboard>
      <div style={{ maxWidth: 300 }}>
        <TreeView
          nodes={longTree}
          maxHeight={180}
          defaultExpandedIds={['assets']}
        />
      </div>
    </DemoWrapper>
  );
}

export function TreeViewEmpty() {
  return (
    <DemoWrapper withKeyboard>
      <div style={{ maxWidth: 300 }}>
        <TreeView
          nodes={[]}
          emptyContent={
            <Text size="sm" color="muted">
              No items in scene
            </Text>
          }
        />
      </div>
    </DemoWrapper>
  );
}

export function TreeViewSizes() {
  return (
    <DemoWrapper withKeyboard>
      <Stack gap={3} style={{ maxWidth: 300 }}>
        <Stack gap={1}>
          <Text size="sm" color="muted">
            sm
          </Text>
          <TreeView
            nodes={SCENE_TREE}
            size="sm"
            defaultExpandedIds={['scene', 'objects']}
          />
        </Stack>
        <Stack gap={1}>
          <Text size="sm" color="muted">
            md
          </Text>
          <TreeView
            nodes={SCENE_TREE}
            size="md"
            defaultExpandedIds={['scene', 'objects']}
          />
        </Stack>
        <Stack gap={1}>
          <Text size="sm" color="muted">
            lg
          </Text>
          <TreeView
            nodes={SCENE_TREE}
            size="lg"
            defaultExpandedIds={['scene', 'objects']}
          />
        </Stack>
      </Stack>
    </DemoWrapper>
  );
}

export function TreeViewEvents() {
  const [log, setLog] = useState<string>('Interact with a node...');
  return (
    <DemoWrapper withKeyboard>
      <Stack gap={2} style={{ maxWidth: 300 }}>
        <TreeView
          nodes={SCENE_TREE}
          defaultExpandedIds={['scene', 'objects']}
          onNodeClick={node => setLog(`Clicked: ${node.label}`)}
          onNodeDoubleClick={node => setLog(`Double-clicked: ${node.label}`)}
          onSelectionChange={ids =>
            setLog(`Selection: ${ids.length > 0 ? ids.join(', ') : 'none'}`)
          }
        />
        <Text size="sm" color="muted">
          {log}
        </Text>
      </Stack>
    </DemoWrapper>
  );
}
