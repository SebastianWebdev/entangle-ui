import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { TreeView } from './TreeView';
import type { TreeViewProps, TreeNodeData } from './TreeView.types';

const fileSystemNodes: TreeNodeData[] = [
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
          { id: 'tree', label: 'TreeView.tsx' },
        ],
      },
      {
        id: 'utils',
        label: 'utils',
        children: [
          { id: 'helpers', label: 'helpers.ts' },
          { id: 'constants', label: 'constants.ts' },
        ],
      },
      { id: 'index', label: 'index.ts' },
    ],
  },
  {
    id: 'package',
    label: 'package.json',
  },
  {
    id: 'readme',
    label: 'README.md',
  },
];

const sceneNodes: TreeNodeData[] = [
  {
    id: 'scene',
    label: 'Scene',
    children: [
      {
        id: 'camera',
        label: 'Main Camera',
      },
      {
        id: 'lights',
        label: 'Lights',
        children: [
          { id: 'sun', label: 'Sun Light' },
          { id: 'point', label: 'Point Light' },
        ],
      },
      {
        id: 'meshes',
        label: 'Meshes',
        children: [
          { id: 'cube', label: 'Cube' },
          { id: 'sphere', label: 'Sphere' },
          { id: 'plane', label: 'Ground Plane' },
        ],
      },
    ],
  },
];

const meta: Meta<TreeViewProps> = {
  title: 'Controls/TreeView',
  component: TreeView,
  args: {
    size: 'md',
    selectionMode: 'single',
    showChevrons: true,
    showGuideLines: false,
    indent: 16,
  },
  argTypes: {
    size: {
      control: { type: 'select' },
      options: ['sm', 'md', 'lg'],
    },
    selectionMode: {
      control: { type: 'select' },
      options: ['single', 'multiple', 'none'],
    },
  },
};

export default meta;
type Story = StoryObj<TreeViewProps>;

export const Default: Story = {
  args: {
    nodes: fileSystemNodes,
    defaultExpandedIds: ['src'],
  },
};

export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 24 }}>
      <div style={{ width: 200 }}>
        <div style={{ color: '#999', fontSize: 12, marginBottom: 8 }}>
          Small
        </div>
        <TreeView
          nodes={fileSystemNodes}
          size="sm"
          defaultExpandedIds={['src']}
        />
      </div>
      <div style={{ width: 200 }}>
        <div style={{ color: '#999', fontSize: 12, marginBottom: 8 }}>
          Medium
        </div>
        <TreeView
          nodes={fileSystemNodes}
          size="md"
          defaultExpandedIds={['src']}
        />
      </div>
      <div style={{ width: 200 }}>
        <div style={{ color: '#999', fontSize: 12, marginBottom: 8 }}>
          Large
        </div>
        <TreeView
          nodes={fileSystemNodes}
          size="lg"
          defaultExpandedIds={['src']}
        />
      </div>
    </div>
  ),
};

export const MultiSelection: Story = {
  args: {
    nodes: fileSystemNodes,
    selectionMode: 'multiple',
    defaultExpandedIds: ['src', 'components'],
  },
};

export const GuideLines: Story = {
  args: {
    nodes: fileSystemNodes,
    showGuideLines: true,
    defaultExpandedIds: ['src', 'components', 'utils'],
  },
};

export const EmptyState: Story = {
  args: {
    nodes: [],
    emptyContent: 'No items in the tree',
  },
};

export const SceneHierarchy: Story = {
  name: 'Editor — Scene Hierarchy',
  render: () => {
    const [selected, setSelected] = useState<string[]>([]);
    return (
      <div
        style={{
          width: 280,
          padding: 8,
          background: '#1e1e1e',
          borderRadius: 8,
        }}
      >
        <TreeView
          nodes={sceneNodes}
          defaultExpandedIds={['scene', 'meshes', 'lights']}
          selectedIds={selected}
          onSelectionChange={setSelected}
          size="sm"
          showGuideLines
        />
      </div>
    );
  },
};

export const Controlled: Story = {
  render: () => {
    const [expanded, setExpanded] = useState<string[]>(['src']);
    const [selected, setSelected] = useState<string[]>([]);

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <TreeView
          nodes={fileSystemNodes}
          expandedIds={expanded}
          onExpandedChange={setExpanded}
          selectedIds={selected}
          onSelectionChange={setSelected}
        />
        <div style={{ color: '#999', fontSize: 12 }}>
          Selected: {selected.join(', ') || 'none'}
        </div>
      </div>
    );
  },
};

export const WithMaxHeight: Story = {
  args: {
    nodes: fileSystemNodes,
    defaultExpandedIds: ['src', 'components', 'utils'],
    maxHeight: 150,
  },
};

export const DisabledNodes: Story = {
  args: {
    nodes: [
      {
        id: 'root',
        label: 'Root',
        children: [
          { id: 'enabled', label: 'Enabled Node' },
          { id: 'disabled', label: 'Disabled Node', disabled: true },
          { id: 'also-enabled', label: 'Also Enabled' },
        ],
      },
    ],
    defaultExpandedIds: ['root'],
  },
};
