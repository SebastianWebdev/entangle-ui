import React, { useMemo, useState, type CSSProperties } from 'react';
import DemoWrapper from '../DemoWrapper';
import { AssetBrowser } from '@/components/editor';
import type {
  AssetItem,
  AssetPathSegment,
  AssetView,
} from '@/components/editor';
import type { DataTableColumn, DataTableDensity } from '@/components/data';
import type { TreeNodeData } from '@/components/controls';

// ── Shared data ─────────────────────────────────────────────────────────────

const TYPE_COLOR: Record<string, string> = {
  image: '#3b82f6',
  model: '#9333ea',
  material: '#16a34a',
  audio: '#ef4444',
  video: '#f59e0b',
  text: '#6b7280',
};

const swatch = (color: string, label = ''): React.ReactNode => (
  <div
    style={{
      width: '100%',
      height: '100%',
      background: color,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'white',
      fontFamily: 'monospace',
      fontWeight: 600,
      fontSize: 12,
      letterSpacing: 1,
    }}
  >
    {label}
  </div>
);

const typeThumb = (item: AssetItem): React.ReactNode => {
  const color = TYPE_COLOR[item.assetType ?? 'unknown'] ?? '#475569';
  const letter = (item.assetType ?? '?')[0]?.toUpperCase() ?? '?';
  return swatch(color, letter);
};

const FOLDER_TREE: TreeNodeData[] = [
  {
    id: 'root',
    label: 'Assets',
    children: [
      { id: 'textures', label: 'Textures' },
      { id: 'models', label: 'Models' },
      { id: 'audio', label: 'Audio' },
      { id: 'materials', label: 'Materials' },
    ],
  },
];

const CONTENTS: Record<string, AssetItem[]> = {
  root: [
    { id: 'textures', name: 'Textures', kind: 'folder' },
    { id: 'models', name: 'Models', kind: 'folder' },
    { id: 'audio', name: 'Audio', kind: 'folder' },
    { id: 'materials', name: 'Materials', kind: 'folder' },
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
    {
      id: 'grass',
      name: 'grass.png',
      kind: 'file',
      assetType: 'image',
      size: 178000,
      modifiedAt: Date.parse('2025-11-09'),
      meta: { color: '#3f7a3a' },
    },
    {
      id: 'sand',
      name: 'sand.png',
      kind: 'file',
      assetType: 'image',
      size: 142000,
      modifiedAt: Date.parse('2025-11-10'),
      meta: { color: '#d4b46a' },
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
    {
      id: 'lamp',
      name: 'lamp.glb',
      kind: 'file',
      assetType: 'model',
      size: 524288,
      modifiedAt: Date.parse('2025-10-28'),
    },
    {
      id: 'shelf',
      name: 'shelf.fbx',
      kind: 'file',
      assetType: 'model',
      size: 1572864,
      modifiedAt: Date.parse('2025-10-29'),
    },
  ],
  audio: [
    {
      id: 'click',
      name: 'click.wav',
      kind: 'file',
      assetType: 'audio',
      size: 32000,
      modifiedAt: Date.parse('2025-10-15'),
    },
    {
      id: 'theme',
      name: 'theme.ogg',
      kind: 'file',
      assetType: 'audio',
      size: 4194304,
      modifiedAt: Date.parse('2025-10-18'),
    },
    {
      id: 'step',
      name: 'footstep.wav',
      kind: 'file',
      assetType: 'audio',
      size: 48000,
      modifiedAt: Date.parse('2025-10-19'),
    },
  ],
  materials: [
    {
      id: 'rough-wood',
      name: 'rough-wood.mat',
      kind: 'file',
      assetType: 'material',
      size: 8192,
      modifiedAt: Date.parse('2025-11-12'),
    },
    {
      id: 'polished-metal',
      name: 'polished-metal.mat',
      kind: 'file',
      assetType: 'material',
      size: 8192,
      modifiedAt: Date.parse('2025-11-13'),
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
  audio: [
    { id: 'root', name: 'Assets' },
    { id: 'audio', name: 'Audio' },
  ],
  materials: [
    { id: 'root', name: 'Assets' },
    { id: 'materials', name: 'Materials' },
  ],
};

const colorThumb = (item: AssetItem): React.ReactNode => {
  const color = item.meta?.['color'];
  return typeof color === 'string' ? swatch(color) : typeThumb(item);
};

// ── Default live preview ───────────────────────────────────────────────────

export default function AssetBrowserDemo(): React.ReactElement {
  const [folder, setFolder] = useState('textures');
  const [selection, setSelection] = useState<string[]>(['wood']);

  return (
    <DemoWrapper>
      <div style={{ height: 460 }}>
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
          renderThumbnail={colorThumb}
          showStatusBar
        />
      </div>
    </DemoWrapper>
  );
}

// ── View modes ─────────────────────────────────────────────────────────────

export function AssetBrowserGridView(): React.ReactElement {
  const [selection, setSelection] = useState<string[]>([]);
  return (
    <DemoWrapper>
      <div style={{ height: 360 }}>
        <AssetBrowser
          items={CONTENTS.textures ?? []}
          selection={selection}
          onSelectionChange={ids => setSelection(ids)}
          renderThumbnail={colorThumb}
        />
      </div>
    </DemoWrapper>
  );
}

export function AssetBrowserListView(): React.ReactElement {
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

export function AssetBrowserThumbnailSizes(): React.ReactElement {
  return (
    <DemoWrapper>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1fr',
          gap: 12,
        }}
      >
        {(['sm', 'md', 'lg'] as const).map(size => (
          <div key={size}>
            <div
              style={{
                fontSize: 11,
                marginBottom: 6,
                color: 'var(--etui-color-text-muted)',
              }}
            >
              thumbnailSize=&quot;{size}&quot;
            </div>
            <div style={{ height: 280 }}>
              <AssetBrowser
                items={CONTENTS.textures ?? []}
                defaultThumbnailSize={size}
                selectionMode={false}
                renderThumbnail={colorThumb}
              />
            </div>
          </div>
        ))}
      </div>
    </DemoWrapper>
  );
}

export function AssetBrowserDensities(): React.ReactElement {
  return (
    <DemoWrapper>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1fr',
          gap: 12,
        }}
      >
        {(['comfortable', 'compact', 'dense'] as const).map(
          (density: DataTableDensity) => (
            <div key={density}>
              <div
                style={{
                  fontSize: 11,
                  marginBottom: 6,
                  color: 'var(--etui-color-text-muted)',
                }}
              >
                density=&quot;{density}&quot;
              </div>
              <div style={{ height: 260 }}>
                <AssetBrowser
                  items={CONTENTS.textures ?? []}
                  defaultView="list"
                  density={density}
                  selectionMode={false}
                />
              </div>
            </div>
          )
        )}
      </div>
    </DemoWrapper>
  );
}

// ── Folder navigation ──────────────────────────────────────────────────────

export function AssetBrowserFolderNavigation(): React.ReactElement {
  const [folder, setFolder] = useState('root');
  return (
    <DemoWrapper>
      <div style={{ height: 360 }}>
        <AssetBrowser
          items={CONTENTS[folder] ?? []}
          path={PATHS[folder]}
          folderTree={FOLDER_TREE}
          currentFolderId={folder}
          onNavigate={id => setFolder(id)}
          renderThumbnail={colorThumb}
        />
      </div>
    </DemoWrapper>
  );
}

// ── Selection ───────────────────────────────────────────────────────────────

export function AssetBrowserSelectionMultiple(): React.ReactElement {
  const [selection, setSelection] = useState<string[]>([]);
  return (
    <DemoWrapper>
      <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
        <div style={{ flex: 1, height: 320 }}>
          <AssetBrowser
            items={CONTENTS.textures ?? []}
            selection={selection}
            onSelectionChange={ids => setSelection(ids)}
            renderThumbnail={colorThumb}
          />
        </div>
        <aside
          style={{
            width: 180,
            padding: 12,
            border: '1px solid var(--etui-color-border-default)',
            borderRadius: 'var(--etui-borderRadius-md)',
            background: 'var(--etui-color-bg-secondary)',
            fontSize: 12,
            color: 'var(--etui-color-text-secondary)',
          }}
        >
          <div
            style={{
              fontWeight: 600,
              marginBottom: 6,
              color: 'var(--etui-color-text-primary)',
            }}
          >
            {selection.length} selected
          </div>
          {selection.length === 0 && (
            <div>Click, Ctrl/⌘-click, or Shift-click to select.</div>
          )}
          <ul style={{ margin: 0, padding: '0 0 0 16px' }}>
            {selection.map(id => (
              <li key={id}>{id}</li>
            ))}
          </ul>
        </aside>
      </div>
    </DemoWrapper>
  );
}

export function AssetBrowserSelectionSingle(): React.ReactElement {
  const [selection, setSelection] = useState<string[]>([]);
  return (
    <DemoWrapper>
      <div style={{ height: 320 }}>
        <AssetBrowser
          items={CONTENTS.textures ?? []}
          selectionMode="single"
          selection={selection}
          onSelectionChange={ids => setSelection(ids)}
          renderThumbnail={colorThumb}
        />
      </div>
    </DemoWrapper>
  );
}

// ── Search / filter / sort ──────────────────────────────────────────────────

export function AssetBrowserSearchAndFilter(): React.ReactElement {
  const allItems = useMemo<AssetItem[]>(
    () => [
      ...(CONTENTS.textures ?? []),
      ...(CONTENTS.models ?? []),
      ...(CONTENTS.audio ?? []),
    ],
    []
  );
  return (
    <DemoWrapper>
      <div style={{ height: 360 }}>
        <AssetBrowser
          items={allItems}
          defaultSearch=""
          filterableTypes={['image', 'model', 'audio']}
          renderThumbnail={typeThumb}
          showStatusBar
        />
      </div>
    </DemoWrapper>
  );
}

export function AssetBrowserSorting(): React.ReactElement {
  return (
    <DemoWrapper>
      <div style={{ height: 360 }}>
        <AssetBrowser
          items={CONTENTS.textures ?? []}
          defaultView="list"
          defaultSort={{ field: 'size', direction: 'desc' }}
          selectionMode={false}
        />
      </div>
    </DemoWrapper>
  );
}

// ── Drag & drop ─────────────────────────────────────────────────────────────

export function AssetBrowserDragAndDrop(): React.ReactElement {
  const [folder, setFolder] = useState('root');
  const [log, setLog] = useState<string[]>([]);
  const push = (message: string): void =>
    setLog(prev =>
      [`[${new Date().toLocaleTimeString()}] ${message}`, ...prev].slice(0, 5)
    );

  return (
    <DemoWrapper>
      <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
        <div style={{ flex: 1, height: 360 }}>
          <AssetBrowser
            items={CONTENTS[folder] ?? []}
            path={PATHS[folder]}
            folderTree={FOLDER_TREE}
            currentFolderId={folder}
            onNavigate={id => setFolder(id)}
            renderThumbnail={typeThumb}
            onItemsMove={({ itemIds, targetFolderId }) =>
              push(`move [${itemIds.join(', ')}] → ${targetFolderId}`)
            }
            onFilesImport={({ files, targetFolderId }) =>
              push(
                `import ${files.length} file(s) → ${targetFolderId ?? 'current folder'}`
              )
            }
          />
        </div>
        <aside
          style={{
            width: 220,
            padding: 12,
            border: '1px solid var(--etui-color-border-default)',
            borderRadius: 'var(--etui-borderRadius-md)',
            background: 'var(--etui-color-bg-secondary)',
            fontSize: 11,
            fontFamily: 'monospace',
            color: 'var(--etui-color-text-secondary)',
            minHeight: 200,
          }}
        >
          <div
            style={{
              fontWeight: 600,
              marginBottom: 8,
              color: 'var(--etui-color-text-primary)',
              fontFamily: 'inherit',
            }}
          >
            DnD log
          </div>
          {log.length === 0 && (
            <div style={{ fontFamily: 'inherit' }}>
              Drag an item onto a folder, or drop files from your OS into the
              browser.
            </div>
          )}
          {log.map((entry, i) => (
            <div key={i} style={{ marginBottom: 4 }}>
              {entry}
            </div>
          ))}
        </aside>
      </div>
    </DemoWrapper>
  );
}

// ── Render props ────────────────────────────────────────────────────────────

export function AssetBrowserCustomThumbnail(): React.ReactElement {
  return (
    <DemoWrapper>
      <div style={{ height: 320 }}>
        <AssetBrowser
          items={CONTENTS.textures ?? []}
          renderThumbnail={(item, { size }) => {
            const color = item.meta?.['color'];
            return (
              <div
                style={{
                  width: '100%',
                  height: '100%',
                  background:
                    typeof color === 'string'
                      ? `linear-gradient(135deg, ${color} 0%, #000 140%)`
                      : '#444',
                  display: 'flex',
                  alignItems: 'flex-end',
                  padding: 4,
                  color: 'white',
                  fontSize: Math.max(9, size / 10),
                  fontFamily: 'monospace',
                  textShadow: '0 1px 2px rgba(0,0,0,0.6)',
                }}
              >
                {item.assetType}
              </div>
            );
          }}
          selectionMode={false}
        />
      </div>
    </DemoWrapper>
  );
}

export function AssetBrowserCustomItem(): React.ReactElement {
  return (
    <DemoWrapper>
      <div style={{ height: 320 }}>
        <AssetBrowser
          items={CONTENTS.textures ?? []}
          renderItem={(item, state) => (
            <div
              style={{
                width: 140,
                height: 140,
                borderRadius: 12,
                background: 'var(--etui-color-bg-secondary)',
                border: state.selected
                  ? '2px solid var(--etui-color-accent-primary)'
                  : '1px solid var(--etui-color-border-default)',
                padding: 8,
                display: 'flex',
                flexDirection: 'column',
                gap: 6,
                cursor: 'pointer',
              }}
            >
              <div style={{ flex: 1, borderRadius: 8, overflow: 'hidden' }}>
                {colorThumb(item)}
              </div>
              <div
                style={{
                  fontSize: 12,
                  color: 'var(--etui-color-text-primary)',
                  fontWeight: state.selected ? 600 : 400,
                }}
              >
                {item.name}
              </div>
            </div>
          )}
        />
      </div>
    </DemoWrapper>
  );
}

// ── Custom slots ────────────────────────────────────────────────────────────

export function AssetBrowserCustomToolbar(): React.ReactElement {
  const [search, setSearch] = useState('');
  return (
    <DemoWrapper>
      <div style={{ height: 320 }}>
        <AssetBrowser
          items={CONTENTS.textures ?? []}
          search={search}
          onSearchChange={setSearch}
          renderThumbnail={colorThumb}
        >
          <AssetBrowser.Toolbar>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: 8,
                borderBottom: '1px solid var(--etui-color-border-default)',
                background: 'var(--etui-color-bg-secondary)',
              }}
            >
              <strong style={{ fontSize: 12 }}>My textures</strong>
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Filter by name…"
                style={{
                  flex: 1,
                  padding: '4px 8px',
                  background: 'var(--etui-color-bg-inset)',
                  border: '1px solid var(--etui-color-border-default)',
                  borderRadius: 'var(--etui-borderRadius-sm)',
                  color: 'var(--etui-color-text-primary)',
                  fontSize: 12,
                }}
              />
            </div>
          </AssetBrowser.Toolbar>
        </AssetBrowser>
      </div>
    </DemoWrapper>
  );
}

export function AssetBrowserCustomSidebar(): React.ReactElement {
  const [folder, setFolder] = useState('textures');
  return (
    <DemoWrapper>
      <div style={{ height: 360 }}>
        <AssetBrowser
          items={CONTENTS[folder] ?? []}
          path={PATHS[folder]}
          currentFolderId={folder}
          onNavigate={id => setFolder(id)}
          renderThumbnail={colorThumb}
        >
          <AssetBrowser.Sidebar>
            <div
              style={{
                padding: 8,
                display: 'flex',
                flexDirection: 'column',
                gap: 4,
              }}
            >
              {Object.keys(PATHS).map(id => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setFolder(id)}
                  style={{
                    padding: '6px 8px',
                    textAlign: 'left',
                    background:
                      id === folder
                        ? 'var(--etui-color-surface-active)'
                        : 'transparent',
                    border: 'none',
                    color: 'var(--etui-color-text-primary)',
                    borderRadius: 'var(--etui-borderRadius-sm)',
                    cursor: 'pointer',
                    fontSize: 12,
                  }}
                >
                  📁 {id}
                </button>
              ))}
            </div>
          </AssetBrowser.Sidebar>
        </AssetBrowser>
      </div>
    </DemoWrapper>
  );
}

// ── Custom columns (list) ───────────────────────────────────────────────────

export function AssetBrowserCustomColumns(): React.ReactElement {
  const columns = useMemo<DataTableColumn<AssetItem>[]>(
    () => [
      {
        id: 'name',
        header: 'Asset',
        accessor: 'name',
        sortable: true,
        sticky: true,
      },
      {
        id: 'type',
        header: 'Type',
        sortable: true,
        width: 120,
        accessor: row => row.assetType ?? '',
      },
      {
        id: 'tags',
        header: 'Tags',
        accessor: row =>
          row.kind === 'folder' ? '' : [row.assetType, 'demo'].join(', '),
      },
    ],
    []
  );

  return (
    <DemoWrapper>
      <div style={{ height: 320 }}>
        <AssetBrowser
          items={CONTENTS.textures ?? []}
          defaultView="list"
          columns={columns}
          selectionMode={false}
        />
      </div>
    </DemoWrapper>
  );
}

// ── States ──────────────────────────────────────────────────────────────────

export function AssetBrowserStates(): React.ReactElement {
  return (
    <DemoWrapper>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 12,
        }}
      >
        <div>
          <div
            style={{
              fontSize: 11,
              marginBottom: 6,
              color: 'var(--etui-color-text-muted)',
            }}
          >
            Empty
          </div>
          <div style={{ height: 220 }}>
            <AssetBrowser items={[]} />
          </div>
        </div>
        <div>
          <div
            style={{
              fontSize: 11,
              marginBottom: 6,
              color: 'var(--etui-color-text-muted)',
            }}
          >
            Loading
          </div>
          <div style={{ height: 220 }}>
            <AssetBrowser items={[]} loading />
          </div>
        </div>
      </div>
    </DemoWrapper>
  );
}

export function AssetBrowserStatusBar(): React.ReactElement {
  return (
    <DemoWrapper>
      <div style={{ height: 360 }}>
        <AssetBrowser
          items={CONTENTS.textures ?? []}
          renderThumbnail={colorThumb}
          defaultSelection={['wood', 'stone']}
          showStatusBar
        />
      </div>
    </DemoWrapper>
  );
}

// ── Styling via theme tokens ────────────────────────────────────────────────

const WARM_THEME: CSSProperties = {
  ['--etui-color-bg-primary' as string]: '#1f1612',
  ['--etui-color-bg-secondary' as string]: '#2a1d18',
  ['--etui-color-bg-inset' as string]: '#3a261d',
  ['--etui-color-border-default' as string]: '#5a4423',
  ['--etui-color-border-focus' as string]: '#f59e0b',
  ['--etui-color-accent-primary' as string]: '#f59e0b',
  ['--etui-color-surface-hover' as string]: '#3a261d',
  ['--etui-color-surface-active' as string]: '#4a2f1f',
  ['--etui-color-text-primary' as string]: '#f5e6d3',
  ['--etui-color-text-secondary' as string]: '#d4b88e',
  ['--etui-color-text-muted' as string]: '#a08960',
  ['--etui-borderRadius-md' as string]: '10px',
} as CSSProperties;

export function AssetBrowserStyledViaTokens(): React.ReactElement {
  return (
    <DemoWrapper>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 12,
        }}
      >
        <div>
          <div
            style={{
              fontSize: 11,
              marginBottom: 6,
              color: 'var(--etui-color-text-muted)',
            }}
          >
            Default tokens
          </div>
          <div style={{ height: 280 }}>
            <AssetBrowser
              items={CONTENTS.textures ?? []}
              defaultSelection={['wood']}
              renderThumbnail={colorThumb}
            />
          </div>
        </div>
        <div style={WARM_THEME}>
          <div
            style={{
              fontSize: 11,
              marginBottom: 6,
              color: 'var(--etui-color-text-muted)',
            }}
          >
            Custom <code>--etui-*</code> token overrides
          </div>
          <div style={{ height: 280 }}>
            <AssetBrowser
              items={CONTENTS.textures ?? []}
              defaultSelection={['wood']}
              renderThumbnail={colorThumb}
            />
          </div>
        </div>
      </div>
    </DemoWrapper>
  );
}

// ── Real-world example ─────────────────────────────────────────────────────

interface DnDLog {
  message: string;
  time: string;
}

export function AssetBrowserRealWorldExample(): React.ReactElement {
  const [folder, setFolder] = useState('textures');
  const [selection, setSelection] = useState<string[]>([]);
  const [openedAsset, setOpenedAsset] = useState<AssetItem | null>(null);
  const [activity, setActivity] = useState<DnDLog[]>([]);
  const [view, setView] = useState<AssetView>('grid');

  const items = CONTENTS[folder] ?? [];
  const selectedItems = items.filter(it => selection.includes(it.id));

  const log = (message: string): void =>
    setActivity(prev =>
      [{ message, time: new Date().toLocaleTimeString() }, ...prev].slice(0, 8)
    );

  const formatBytes = (n: number | undefined): string => {
    if (!n) return '—';
    if (n < 1024) return `${n} B`;
    if (n < 1024 * 1024) return `${Math.round(n / 1024)} KB`;
    return `${(n / 1024 / 1024).toFixed(1)} MB`;
  };

  const button: CSSProperties = {
    padding: '4px 10px',
    background: 'var(--etui-color-bg-inset)',
    color: 'var(--etui-color-text-primary)',
    border: '1px solid var(--etui-color-border-default)',
    borderRadius: 'var(--etui-borderRadius-sm)',
    fontSize: 11,
    cursor: 'pointer',
  };

  return (
    <DemoWrapper>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 260px',
          gap: 12,
          height: 520,
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              fontSize: 12,
              color: 'var(--etui-color-text-secondary)',
            }}
          >
            <strong style={{ color: 'var(--etui-color-text-primary)' }}>
              Content Browser
            </strong>
            <span style={{ flex: 1 }} />
            <button
              type="button"
              style={button}
              disabled={selection.length === 0}
              onClick={() => log(`Delete ${selection.length} item(s)`)}
            >
              Delete
            </button>
            <button
              type="button"
              style={button}
              disabled={selection.length !== 1}
              onClick={() => log(`Rename ${selection[0]}`)}
            >
              Rename
            </button>
          </div>
          <div style={{ flex: 1, minHeight: 0 }}>
            <AssetBrowser
              items={items}
              path={PATHS[folder]}
              folderTree={FOLDER_TREE}
              currentFolderId={folder}
              view={view}
              onViewChange={setView}
              selection={selection}
              onSelectionChange={ids => setSelection(ids)}
              onNavigate={id => {
                setFolder(id);
                setSelection([]);
              }}
              onItemOpen={item => {
                setOpenedAsset(item);
                log(`Open ${item.name}`);
              }}
              onItemsMove={({ itemIds, targetFolderId }) =>
                log(`Move ${itemIds.length} → ${targetFolderId}`)
              }
              onFilesImport={({ files, targetFolderId }) =>
                log(
                  `Import ${files.length} file(s) → ${targetFolderId ?? 'current'}`
                )
              }
              renderThumbnail={typeThumb}
              filterableTypes={['image', 'model', 'audio', 'material', 'text']}
              showStatusBar
            />
          </div>
        </div>

        <aside
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
            padding: 12,
            border: '1px solid var(--etui-color-border-default)',
            borderRadius: 'var(--etui-borderRadius-md)',
            background: 'var(--etui-color-bg-secondary)',
            fontSize: 12,
            color: 'var(--etui-color-text-secondary)',
            minHeight: 0,
          }}
        >
          <div>
            <div
              style={{
                fontWeight: 600,
                color: 'var(--etui-color-text-primary)',
                marginBottom: 4,
              }}
            >
              Inspector
            </div>
            {selectedItems.length === 0 && (
              <div>Select an item to see details.</div>
            )}
            {selectedItems.length === 1 && (
              <dl style={{ margin: 0 }}>
                <dt style={{ fontWeight: 600, marginTop: 4 }}>Name</dt>
                <dd style={{ margin: 0 }}>{selectedItems[0]?.name}</dd>
                <dt style={{ fontWeight: 600, marginTop: 4 }}>Type</dt>
                <dd style={{ margin: 0 }}>
                  {selectedItems[0]?.assetType ?? '—'}
                </dd>
                <dt style={{ fontWeight: 600, marginTop: 4 }}>Size</dt>
                <dd style={{ margin: 0 }}>
                  {formatBytes(selectedItems[0]?.size)}
                </dd>
              </dl>
            )}
            {selectedItems.length > 1 && (
              <div>{selectedItems.length} items selected.</div>
            )}
          </div>

          <div style={{ flex: 1, minHeight: 0, overflow: 'auto' }}>
            <div
              style={{
                fontWeight: 600,
                color: 'var(--etui-color-text-primary)',
                marginBottom: 4,
              }}
            >
              Activity
            </div>
            {activity.length === 0 && <div>No activity yet.</div>}
            {activity.map((entry, i) => (
              <div
                key={i}
                style={{
                  fontFamily: 'monospace',
                  fontSize: 11,
                  marginBottom: 2,
                }}
              >
                <span style={{ color: 'var(--etui-color-text-muted)' }}>
                  {entry.time}
                </span>{' '}
                {entry.message}
              </div>
            ))}
          </div>

          {openedAsset && (
            <div
              style={{
                padding: 8,
                border: '1px dashed var(--etui-color-border-default)',
                borderRadius: 'var(--etui-borderRadius-sm)',
              }}
            >
              <div
                style={{
                  fontWeight: 600,
                  color: 'var(--etui-color-text-primary)',
                  marginBottom: 4,
                }}
              >
                Last opened
              </div>
              <div>{openedAsset.name}</div>
            </div>
          )}
        </aside>
      </div>
    </DemoWrapper>
  );
}
