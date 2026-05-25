import { useMemo, useState } from 'react';

import DemoWrapper from '../DemoWrapper';
import {
  ContextMenu,
  Menu,
  Tabs,
  TabList,
  Tab,
  TabPanel,
} from '@/components/navigation';
import { Text } from '@/components/primitives';
import { Input } from '@/components/primitives/Input';
import {
  AddIcon,
  CopyIcon,
  CutIcon,
  EditIcon,
  EyeIcon,
  GridIcon,
  LockIcon,
  PasteIcon,
  PlayIcon,
  SearchIcon,
  TrashIcon,
} from '@/components/Icons';

const dashedArea: React.CSSProperties = {
  padding: '32px',
  border: '1px dashed #4a4a4a',
  borderRadius: 4,
  textAlign: 'center',
};

/** Basic right-click area with shared Menu items. */
export default function ContextMenuDemo() {
  return (
    <DemoWrapper>
      <ContextMenu>
        <ContextMenu.Trigger>
          <div style={dashedArea}>
            <Text size="sm" color="muted">
              Right-click here
            </Text>
          </div>
        </ContextMenu.Trigger>
        <ContextMenu.Content>
          <Menu.Item icon={<CutIcon size="sm" />} shortcut="⌘X">
            Cut
          </Menu.Item>
          <Menu.Item icon={<CopyIcon size="sm" />} shortcut="⌘C">
            Copy
          </Menu.Item>
          <Menu.Item icon={<PasteIcon size="sm" />} shortcut="⌘V">
            Paste
          </Menu.Item>
          <Menu.Separator />
          <Menu.Item icon={<TrashIcon size="sm" />} shortcut="⌫">
            Delete
          </Menu.Item>
        </ContextMenu.Content>
      </ContextMenu>
    </DemoWrapper>
  );
}

/** Two areas, each with its own menu — no config resolver. */
export function ContextMenuPerArea() {
  return (
    <DemoWrapper>
      <div style={{ display: 'flex', gap: 12 }}>
        <ContextMenu>
          <ContextMenu.Trigger>
            <div style={{ ...dashedArea, flex: 1 }}>
              <Text size="sm" color="muted">
                Canvas
              </Text>
            </div>
          </ContextMenu.Trigger>
          <ContextMenu.Content>
            <Menu.Item icon={<AddIcon size="sm" />}>Add Node</Menu.Item>
            <Menu.Item icon={<PasteIcon size="sm" />}>Paste</Menu.Item>
          </ContextMenu.Content>
        </ContextMenu>

        <ContextMenu>
          <ContextMenu.Trigger>
            <div style={{ ...dashedArea, flex: 1 }}>
              <Text size="sm" color="muted">
                Node card
              </Text>
            </div>
          </ContextMenu.Trigger>
          <ContextMenu.Content>
            <Menu.Item icon={<EditIcon size="sm" />}>Rename</Menu.Item>
            <Menu.Item icon={<LockIcon size="sm" />}>Lock</Menu.Item>
            <Menu.Separator />
            <Menu.Item icon={<TrashIcon size="sm" />}>Delete</Menu.Item>
          </ContextMenu.Content>
        </ContextMenu>
      </div>
    </DemoWrapper>
  );
}

/** Selection state reusing the Menu RadioGroup primitives. */
export function ContextMenuSelection() {
  const [mode, setMode] = useState('edit');

  return (
    <DemoWrapper>
      <ContextMenu>
        <ContextMenu.Trigger>
          <div style={dashedArea}>
            <Text size="sm" color="muted">
              Right-click — mode: {mode}
            </Text>
          </div>
        </ContextMenu.Trigger>
        <ContextMenu.Content>
          <Menu.RadioGroup value={mode} onValueChange={setMode}>
            <Menu.RadioItem value="edit">Edit Mode</Menu.RadioItem>
            <Menu.RadioItem value="object">Object Mode</Menu.RadioItem>
            <Menu.RadioItem value="sculpt">Sculpt Mode</Menu.RadioItem>
          </Menu.RadioGroup>
        </ContextMenu.Content>
      </ContextMenu>
    </DemoWrapper>
  );
}

/** Nested submenu inside a context menu. */
export function ContextMenuSubmenu() {
  return (
    <DemoWrapper>
      <ContextMenu>
        <ContextMenu.Trigger>
          <div style={dashedArea}>
            <Text size="sm" color="muted">
              Right-click to add
            </Text>
          </div>
        </ContextMenu.Trigger>
        <ContextMenu.Content>
          <Menu.Sub>
            <Menu.SubTrigger icon={<GridIcon size="sm" />}>
              Add Mesh
            </Menu.SubTrigger>
            <Menu.SubContent>
              <Menu.Item>Cube</Menu.Item>
              <Menu.Item>Sphere</Menu.Item>
              <Menu.Item>Plane</Menu.Item>
            </Menu.SubContent>
          </Menu.Sub>
          <Menu.Sub>
            <Menu.SubTrigger icon={<PlayIcon size="sm" />}>
              Add Light
            </Menu.SubTrigger>
            <Menu.SubContent>
              <Menu.Item>Point</Menu.Item>
              <Menu.Item>Spot</Menu.Item>
            </Menu.SubContent>
          </Menu.Sub>
          <Menu.Item icon={<EyeIcon size="sm" />}>Add Camera</Menu.Item>
        </ContextMenu.Content>
      </ContextMenu>
    </DemoWrapper>
  );
}

const NODE_LIBRARY = [
  { id: 'add', label: 'Add', category: 'Math' },
  { id: 'multiply', label: 'Multiply', category: 'Math' },
  { id: 'clamp', label: 'Clamp', category: 'Math' },
  { id: 'mix', label: 'Mix', category: 'Math' },
  { id: 'texture', label: 'Texture', category: 'Input' },
  { id: 'value', label: 'Value', category: 'Input' },
  { id: 'time', label: 'Time', category: 'Input' },
  { id: 'noise', label: 'Noise', category: 'Generate' },
  { id: 'gradient', label: 'Gradient', category: 'Generate' },
  { id: 'output', label: 'Output', category: 'Output' },
];

const RECENT_NODES = ['Mix', 'Noise', 'Texture'];

/**
 * Advanced custom panel: ContextMenu owns open/close + positioning, the
 * consumer renders a node picker with tabs, search, and a results grid.
 */
export function ContextMenuAdvanced() {
  const [query, setQuery] = useState('');

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return NODE_LIBRARY;
    return NODE_LIBRARY.filter(
      n =>
        n.label.toLowerCase().includes(q) ||
        n.category.toLowerCase().includes(q)
    );
  }, [query]);

  return (
    <DemoWrapper height="320px">
      <ContextMenu>
        <ContextMenu.Trigger>
          <div
            style={{
              ...dashedArea,
              height: 220,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundImage:
                'radial-gradient(circle, #2a2a2a 1px, transparent 1px)',
              backgroundSize: '16px 16px',
            }}
          >
            <Text size="sm" color="muted">
              Right-click the graph to add a node
            </Text>
          </div>
        </ContextMenu.Trigger>
        <ContextMenu.Content style={{ width: 280, padding: 0 }}>
          <Tabs defaultValue="add">
            <div style={{ padding: '8px 8px 0' }}>
              <TabList>
                <Tab value="add">Add</Tab>
                <Tab value="recent">Recent</Tab>
              </TabList>
            </div>
            <TabPanel value="add">
              <div style={{ padding: 8 }}>
                <Input
                  size="sm"
                  placeholder="Search nodes…"
                  value={query}
                  onChange={setQuery}
                  startIcon={<SearchIcon size="sm" />}
                />
                <div
                  style={{
                    marginTop: 8,
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: 4,
                    maxHeight: 160,
                    overflow: 'auto',
                  }}
                >
                  {results.map(node => (
                    <button
                      key={node.id}
                      type="button"
                      onClick={() => console.log('add', node.id)}
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'flex-start',
                        gap: 2,
                        padding: '6px 8px',
                        border: '1px solid var(--etui-color-border-default)',
                        borderRadius: 'var(--etui-radius-sm)',
                        background: 'var(--etui-color-bg-secondary)',
                        color: 'var(--etui-color-text-primary)',
                        cursor: 'pointer',
                        textAlign: 'left',
                        font: 'inherit',
                      }}
                    >
                      <span style={{ fontSize: 'var(--etui-font-size-sm)' }}>
                        {node.label}
                      </span>
                      <span
                        style={{
                          fontSize: 'var(--etui-font-size-xs)',
                          color: 'var(--etui-color-text-muted)',
                        }}
                      >
                        {node.category}
                      </span>
                    </button>
                  ))}
                  {results.length === 0 && (
                    <div style={{ gridColumn: '1 / -1', padding: '8px 4px' }}>
                      <Text size="xs" color="muted">
                        No nodes match “{query}”.
                      </Text>
                    </div>
                  )}
                </div>
              </div>
            </TabPanel>
            <TabPanel value="recent">
              <div style={{ padding: 4 }}>
                {RECENT_NODES.map(name => (
                  <Menu.Item key={name} icon={<AddIcon size="sm" />}>
                    {name}
                  </Menu.Item>
                ))}
              </div>
            </TabPanel>
          </Tabs>
        </ContextMenu.Content>
      </ContextMenu>
    </DemoWrapper>
  );
}
