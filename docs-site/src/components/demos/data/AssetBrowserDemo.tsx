import { useState } from 'react';
import DemoWrapper from '../DemoWrapper';
import { AssetBrowser } from '@/components/data';
import type { AssetItem, AssetPathSegment, AssetView } from '@/components/data';
import type { TreeNodeData } from '@/components/controls';

const swatch = (color: string) => (
  <div style={{ width: '100%', height: '100%', background: color }} />
);

const FOLDER_TREE: TreeNodeData[] = [
  {
    id: 'root',
    label: 'Assets',
    children: [
      { id: 'textures', label: 'Textures' },
      { id: 'models', label: 'Models' },
    ],
  },
];

const CONTENTS: Record<string, AssetItem[]> = {
  root: [
    { id: 'textures', name: 'Textures', kind: 'folder' },
    { id: 'models', name: 'Models', kind: 'folder' },
    {
      id: 'readme',
      name: 'README.txt',
      kind: 'file',
      assetType: 'text',
      size: 482,
      modifiedAt: Date.parse('2025-11-01'),
    },
  ],
  textures: [
    {
      id: 'wood',
      name: 'wood.png',
      kind: 'file',
      assetType: 'image',
      size: 204800,
      modifiedAt: Date.parse('2025-11-05'),
      meta: { color: '#8a5a2b' },
    },
    {
      id: 'stone',
      name: 'stone.png',
      kind: 'file',
      assetType: 'image',
      size: 153600,
      modifiedAt: Date.parse('2025-11-06'),
      meta: { color: '#6b6b6b' },
    },
    {
      id: 'metal',
      name: 'metal.png',
      kind: 'file',
      assetType: 'image',
      size: 256000,
      modifiedAt: Date.parse('2025-11-07'),
      meta: { color: '#9aa3ad' },
    },
    {
      id: 'brick',
      name: 'brick.png',
      kind: 'file',
      assetType: 'image',
      size: 198000,
      modifiedAt: Date.parse('2025-11-08'),
      meta: { color: '#a23b2e' },
    },
  ],
  models: [
    {
      id: 'chair',
      name: 'chair.fbx',
      kind: 'file',
      assetType: 'model',
      size: 1048576,
      modifiedAt: Date.parse('2025-10-22'),
    },
    {
      id: 'table',
      name: 'table.fbx',
      kind: 'file',
      assetType: 'model',
      size: 2097152,
      modifiedAt: Date.parse('2025-10-24'),
    },
  ],
};

const PATHS: Record<string, AssetPathSegment[]> = {
  root: [{ id: 'root', name: 'Assets' }],
  textures: [
    { id: 'root', name: 'Assets' },
    { id: 'textures', name: 'Textures' },
  ],
  models: [
    { id: 'root', name: 'Assets' },
    { id: 'models', name: 'Models' },
  ],
};

const renderThumbnail = (item: AssetItem) => {
  const color = item.meta?.['color'];
  return typeof color === 'string' ? swatch(color) : null;
};

export default function AssetBrowserDemo() {
  const [folder, setFolder] = useState('textures');
  const [selection, setSelection] = useState<string[]>(['wood']);

  return (
    <DemoWrapper>
      <div style={{ height: 440 }}>
        <AssetBrowser
          items={CONTENTS[folder] ?? []}
          path={PATHS[folder]}
          folderTree={FOLDER_TREE}
          currentFolderId={folder}
          selection={selection}
          onSelectionChange={ids => setSelection(ids)}
          onNavigate={id => {
            setFolder(id);
            setSelection([]);
          }}
          renderThumbnail={renderThumbnail}
          showStatusBar
        />
      </div>
    </DemoWrapper>
  );
}

export function AssetBrowserGridView() {
  const [selection, setSelection] = useState<string[]>([]);
  return (
    <DemoWrapper>
      <div style={{ height: 360 }}>
        <AssetBrowser
          items={CONTENTS.textures ?? []}
          selection={selection}
          onSelectionChange={ids => setSelection(ids)}
          renderThumbnail={renderThumbnail}
        />
      </div>
    </DemoWrapper>
  );
}

export function AssetBrowserListView() {
  const [view, setView] = useState<AssetView>('list');
  return (
    <DemoWrapper>
      <div style={{ height: 360 }}>
        <AssetBrowser
          items={CONTENTS.textures ?? []}
          view={view}
          onViewChange={setView}
        />
      </div>
    </DemoWrapper>
  );
}

export function AssetBrowserStates() {
  return (
    <DemoWrapper>
      <div style={{ height: 240 }}>
        <AssetBrowser items={[]} />
      </div>
    </DemoWrapper>
  );
}
