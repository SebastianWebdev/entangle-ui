import { useMemo, useState } from 'react';
import DemoWrapper from '../DemoWrapper';
import { DataTable } from '@/components/data';
import type {
  DataTableColumn,
  DataTableSelectionState,
  DataTableSortState,
} from '@/components/data';
import { Badge } from '@/components/primitives';
import { Stack } from '@/components/layout';
import { Text } from '@/components/primitives';

interface SceneAsset {
  id: string;
  name: string;
  kind: 'mesh' | 'material' | 'texture' | 'rig';
  owner: string;
  updated: string;
  size: number;
  status: 'ready' | 'processing' | 'failed';
}

const ASSETS: SceneAsset[] = [
  {
    id: 'a1',
    name: 'hero_character.fbx',
    kind: 'mesh',
    owner: 'maria',
    updated: '2025-11-02',
    size: 18.4,
    status: 'ready',
  },
  {
    id: 'a2',
    name: 'asphalt_diffuse.png',
    kind: 'texture',
    owner: 'tomek',
    updated: '2025-11-08',
    size: 6.1,
    status: 'ready',
  },
  {
    id: 'a3',
    name: 'glass_rough.mat',
    kind: 'material',
    owner: 'kira',
    updated: '2025-11-11',
    size: 0.4,
    status: 'processing',
  },
  {
    id: 'a4',
    name: 'crowd_a.rig',
    kind: 'rig',
    owner: 'alex',
    updated: '2025-10-29',
    size: 3.2,
    status: 'ready',
  },
  {
    id: 'a5',
    name: 'street_props.fbx',
    kind: 'mesh',
    owner: 'tomek',
    updated: '2025-11-14',
    size: 12.7,
    status: 'failed',
  },
  {
    id: 'a6',
    name: 'sky_dome.exr',
    kind: 'texture',
    owner: 'maria',
    updated: '2025-09-20',
    size: 42.3,
    status: 'ready',
  },
  {
    id: 'a7',
    name: 'lobby_arch.fbx',
    kind: 'mesh',
    owner: 'kira',
    updated: '2025-11-04',
    size: 9.5,
    status: 'ready',
  },
  {
    id: 'a8',
    name: 'metal_brushed.mat',
    kind: 'material',
    owner: 'alex',
    updated: '2025-10-15',
    size: 0.6,
    status: 'ready',
  },
];

function StatusBadge({ status }: { status: SceneAsset['status'] }) {
  if (status === 'ready')
    return (
      <Badge variant="solid" color="success" size="sm">
        Ready
      </Badge>
    );
  if (status === 'processing')
    return (
      <Badge variant="solid" color="warning" size="sm">
        Processing
      </Badge>
    );
  return (
    <Badge variant="solid" color="error" size="sm">
      Failed
    </Badge>
  );
}

const COLUMNS: DataTableColumn<SceneAsset>[] = [
  {
    id: 'name',
    header: 'Name',
    accessor: 'name',
    sortable: true,
    minWidth: 200,
  },
  {
    id: 'kind',
    header: 'Kind',
    accessor: 'kind',
    sortable: true,
    width: 120,
  },
  {
    id: 'owner',
    header: 'Owner',
    accessor: 'owner',
    sortable: true,
    width: 120,
  },
  {
    id: 'updated',
    header: 'Updated',
    accessor: 'updated',
    sortable: true,
    width: 140,
  },
  {
    id: 'size',
    header: 'Size (MB)',
    accessor: 'size',
    sortable: true,
    align: 'right',
    width: 110,
  },
  {
    id: 'status',
    header: 'Status',
    accessor: 'status',
    width: 130,
    cell: ({ value }) => <StatusBadge status={value as SceneAsset['status']} />,
  },
];

export default function DataTableDemo() {
  return (
    <DemoWrapper>
      <DataTable<SceneAsset>
        rows={ASSETS}
        columns={COLUMNS}
        rowKey="id"
        height={360}
        aria-label="Scene assets"
      />
    </DemoWrapper>
  );
}

export function DataTableSortable() {
  return (
    <DemoWrapper>
      <DataTable<SceneAsset>
        rows={ASSETS}
        columns={COLUMNS}
        rowKey="id"
        defaultSort={{ columnId: 'name', direction: 'asc' }}
        height={360}
        aria-label="Scene assets"
      />
    </DemoWrapper>
  );
}

export function DataTableMultipleSelection() {
  const [selection, setSelection] = useState<DataTableSelectionState>([]);
  return (
    <DemoWrapper>
      <Stack gap={2}>
        <Text size="sm" color="muted">
          Selected: {selection.length}
        </Text>
        <DataTable<SceneAsset>
          rows={ASSETS}
          columns={COLUMNS}
          rowKey="id"
          selectionMode="multiple"
          selection={selection}
          onSelectionChange={setSelection}
          height={360}
          aria-label="Scene assets"
        />
      </Stack>
    </DemoWrapper>
  );
}

export function DataTableSingleSelection() {
  const [selection, setSelection] = useState<DataTableSelectionState>([]);
  return (
    <DemoWrapper>
      <Stack gap={2}>
        <Text size="sm" color="muted">
          Selected: {selection[0] ?? 'none'}
        </Text>
        <DataTable<SceneAsset>
          rows={ASSETS}
          columns={COLUMNS}
          rowKey="id"
          selectionMode="single"
          selection={selection}
          onSelectionChange={setSelection}
          height={360}
          aria-label="Scene assets"
        />
      </Stack>
    </DemoWrapper>
  );
}

export function DataTableDensities() {
  return (
    <DemoWrapper>
      <Stack gap={4}>
        {(['comfortable', 'compact', 'dense'] as const).map(density => (
          <Stack gap={1} key={density}>
            <Text size="xs" color="muted">
              {density}
            </Text>
            <DataTable<SceneAsset>
              rows={ASSETS.slice(0, 4)}
              columns={COLUMNS}
              rowKey="id"
              density={density}
              height={200}
              aria-label={`Scene assets (${density})`}
            />
          </Stack>
        ))}
      </Stack>
    </DemoWrapper>
  );
}

export function DataTableStickyColumn() {
  const cols: DataTableColumn<SceneAsset>[] = useMemo(() => {
    const first = COLUMNS[0];
    if (!first) throw new Error('COLUMNS is empty');
    return [{ ...first, sticky: true, width: 200 }, ...COLUMNS.slice(1)];
  }, []);
  return (
    <DemoWrapper>
      <div style={{ maxWidth: 520 }}>
        <DataTable<SceneAsset>
          rows={ASSETS}
          columns={cols}
          rowKey="id"
          height={320}
          aria-label="Scene assets"
        />
      </div>
    </DemoWrapper>
  );
}

export function DataTableResizable() {
  return (
    <DemoWrapper>
      <DataTable<SceneAsset>
        rows={ASSETS}
        columns={COLUMNS}
        rowKey="id"
        resizableColumns
        height={320}
        aria-label="Scene assets"
      />
    </DemoWrapper>
  );
}

export function DataTableLoading() {
  return (
    <DemoWrapper>
      <DataTable<SceneAsset>
        rows={[]}
        columns={COLUMNS}
        rowKey="id"
        loading
        loadingRowCount={6}
        height={320}
        aria-label="Scene assets"
      />
    </DemoWrapper>
  );
}

export function DataTableEmpty() {
  return (
    <DemoWrapper>
      <DataTable<SceneAsset>
        rows={[]}
        columns={COLUMNS}
        rowKey="id"
        emptyState="No assets yet — drag a file from disk to import."
        height={240}
        aria-label="Scene assets"
      />
    </DemoWrapper>
  );
}

function generateAssets(count: number): SceneAsset[] {
  const kinds: SceneAsset['kind'][] = ['mesh', 'material', 'texture', 'rig'];
  const statuses: SceneAsset['status'][] = ['ready', 'processing', 'failed'];
  const owners = ['maria', 'tomek', 'kira', 'alex'];
  const out: SceneAsset[] = [];
  for (let i = 0; i < count; i++) {
    out.push({
      id: `va${i + 1}`,
      name: `asset_${(i + 1).toString().padStart(4, '0')}.fbx`,
      kind: kinds[i % kinds.length] ?? 'mesh',
      owner: owners[i % owners.length] ?? 'maria',
      updated: new Date(2024, i % 12, ((i * 3) % 27) + 1)
        .toISOString()
        .slice(0, 10),
      size: Math.round((i * 0.7 + 1) * 10) / 10,
      status: statuses[i % statuses.length] ?? 'ready',
    });
  }
  return out;
}

const LARGE_ASSETS = generateAssets(2_000);

export function DataTableVirtualized() {
  const [sort, setSort] = useState<DataTableSortState>({
    columnId: null,
    direction: null,
  });
  return (
    <DemoWrapper>
      <Stack gap={2}>
        <Text size="sm" color="muted">
          2,000 rows — virtualization auto-on above 100.
        </Text>
        <DataTable<SceneAsset>
          rows={LARGE_ASSETS}
          columns={COLUMNS}
          rowKey="id"
          height={400}
          sort={sort}
          onSortChange={setSort}
          aria-label="Scene assets"
        />
      </Stack>
    </DemoWrapper>
  );
}
