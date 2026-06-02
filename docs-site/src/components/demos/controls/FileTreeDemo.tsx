import { useState } from 'react';
import DemoWrapper from '../DemoWrapper';
import { FileTree } from '@/components/controls';
import type { FileTreeNode } from '@/components/controls';
import { Stack } from '@/components/layout';
import { Text } from '@/components/primitives';
import {
  CodeIcon,
  FolderIcon,
  FolderOpenIcon,
  ImageIcon,
  StarIcon,
} from '@/components/Icons';

const PROJECT: FileTreeNode[] = [
  {
    id: 'src',
    name: 'src',
    kind: 'folder',
    children: [
      {
        id: 'components',
        name: 'components',
        kind: 'folder',
        children: [
          { id: 'button', name: 'Button.tsx', kind: 'file' },
          { id: 'input', name: 'Input.tsx', kind: 'file' },
          { id: 'styles', name: 'styles.css', kind: 'file' },
        ],
      },
      {
        id: 'assets',
        name: 'assets',
        kind: 'folder',
        children: [
          { id: 'logo', name: 'logo.svg', kind: 'file' },
          { id: 'hero', name: 'hero.png', kind: 'file' },
        ],
      },
      { id: 'index', name: 'index.ts', kind: 'file' },
    ],
  },
  {
    id: 'public',
    name: 'public',
    kind: 'folder',
    children: [
      { id: 'favicon', name: 'favicon.ico', kind: 'file' },
      { id: 'intro', name: 'intro.mp4', kind: 'file' },
    ],
  },
  { id: 'archive', name: 'release.zip', kind: 'file' },
  { id: 'readme', name: 'README.md', kind: 'file' },
  { id: 'pkg', name: 'package.json', kind: 'file' },
];

export default function FileTreeDemo() {
  return (
    <DemoWrapper withKeyboard>
      <div style={{ maxWidth: 320 }}>
        <FileTree
          nodes={PROJECT}
          defaultExpandedIds={['src', 'components', 'assets']}
          defaultSelectedIds={['button']}
        />
      </div>
    </DemoWrapper>
  );
}

export function FileTreeDragImport() {
  const [log, setLog] = useState<string[]>([]);
  return (
    <DemoWrapper withKeyboard>
      <Stack gap={2} style={{ maxWidth: 360 }}>
        <Text size="sm" color="muted">
          Drag files from your OS onto a folder (or the empty area for the
          root).
        </Text>
        <FileTree
          nodes={PROJECT}
          defaultExpandedIds={['src', 'assets']}
          maxHeight={260}
          onImport={({ files, targetFolder }) => {
            const names = files.map(f => f.name).join(', ');
            const dest = targetFolder ? targetFolder.name : 'root';
            setLog(prev =>
              [`${files.length} → ${dest}: ${names}`, ...prev].slice(0, 4)
            );
          }}
        />
        <Text size="sm" color={log.length > 0 ? 'secondary' : 'muted'}>
          {log.length > 0 ? log.join(' · ') : 'No imports yet.'}
        </Text>
      </Stack>
    </DemoWrapper>
  );
}

export function FileTreeIcons() {
  return (
    <DemoWrapper withKeyboard>
      <Stack gap={2} style={{ maxWidth: 320 }}>
        <Text size="sm" color="muted">
          Built-in icons by extension; <code>resolveIcon</code> stars JSON
          files.
        </Text>
        <FileTree
          nodes={PROJECT}
          defaultExpandedIds={['src', 'components', 'assets', 'public']}
          resolveIcon={node =>
            node.name.endsWith('.json') ? (
              <StarIcon size={14} color="warning" decorative />
            ) : undefined
          }
        />
      </Stack>
    </DemoWrapper>
  );
}

export function FileTreeSelection() {
  const [selected, setSelected] = useState<string[]>(['button', 'styles']);
  return (
    <DemoWrapper withKeyboard>
      <Stack gap={2} style={{ maxWidth: 320 }}>
        <Text size="sm" color="muted">
          Multiple selection — Ctrl / Shift click.
        </Text>
        <FileTree
          nodes={PROJECT}
          selectionMode="multiple"
          defaultExpandedIds={['src', 'components']}
          selectedIds={selected}
          onSelectionChange={setSelected}
        />
        <Text size="sm" color="secondary">
          Selected: {selected.length > 0 ? selected.join(', ') : 'none'}
        </Text>
      </Stack>
    </DemoWrapper>
  );
}

export function FileTreeSizes() {
  return (
    <DemoWrapper withKeyboard>
      <Stack gap={3} style={{ maxWidth: 320 }}>
        {(['sm', 'md', 'lg'] as const).map(size => (
          <Stack key={size} gap={1}>
            <Text size="sm" color="muted">
              {size}
            </Text>
            <FileTree
              nodes={PROJECT}
              size={size}
              defaultExpandedIds={['src', 'components']}
            />
          </Stack>
        ))}
      </Stack>
    </DemoWrapper>
  );
}

export function FileTreeColoredIcons() {
  return (
    <DemoWrapper withKeyboard>
      <Stack gap={2} style={{ maxWidth: 320 }}>
        <Text size="sm" color="muted">
          <code>resolveIcon</code> returns any icon with any color — here, by
          type.
        </Text>
        <FileTree
          nodes={PROJECT}
          defaultExpandedIds={['src', 'components', 'assets', 'public']}
          resolveIcon={(node, { expanded }) => {
            if (node.kind === 'folder') {
              return expanded ? (
                <FolderOpenIcon size={14} color="accent" decorative />
              ) : (
                <FolderIcon size={14} color="accent" decorative />
              );
            }
            const ext = node.name.split('.').pop();
            if (ext === 'png' || ext === 'svg' || ext === 'jpg') {
              return <ImageIcon size={14} color="success" decorative />;
            }
            if (ext && ['ts', 'tsx', 'js', 'css'].includes(ext)) {
              return <CodeIcon size={14} color="warning" decorative />;
            }
            return undefined;
          }}
        />
      </Stack>
    </DemoWrapper>
  );
}

export function FileTreeLocalized() {
  return (
    <DemoWrapper withKeyboard>
      <Stack gap={2} style={{ maxWidth: 320 }}>
        <Text size="sm" color="muted">
          Accessible name + empty state localized to Polish via{' '}
          <code>labels</code>.
        </Text>
        <FileTree
          nodes={PROJECT}
          defaultExpandedIds={['src']}
          labels={{ treeLabel: 'Drzewo plików', emptyLabel: 'Brak plików' }}
        />
        <FileTree nodes={[]} labels={{ emptyLabel: 'Brak plików' }} />
      </Stack>
    </DemoWrapper>
  );
}

export function FileTreeStyled() {
  return (
    <DemoWrapper withKeyboard>
      <Stack gap={2} style={{ maxWidth: 320 }}>
        <Text size="sm" color="muted">
          Re-skinned by overriding <code>--etui-*</code> tokens on the root.
        </Text>
        <FileTree
          nodes={PROJECT}
          defaultExpandedIds={['src', 'components']}
          defaultSelectedIds={['button']}
          style={{
            ['--etui-color-accent-primary' as string]: '#d946ef',
            ['--etui-color-text-secondary' as string]: '#d946ef',
          }}
        />
      </Stack>
    </DemoWrapper>
  );
}
