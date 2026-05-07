import type { FC } from 'react';
import { useMemo, useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { DataTable } from './DataTable';
import type {
  DataTableColumn,
  DataTableSelectionState,
  DataTableSortState,
} from './DataTable.types';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  joined: string;
  status: 'active' | 'invited' | 'suspended';
  storage: number;
}

const ROLES = ['engineer', 'designer', 'manager', 'analyst'] as const;
const STATUSES: User['status'][] = ['active', 'invited', 'suspended'];

function generateUsers(count: number): User[] {
  const users: User[] = [];
  for (let i = 0; i < count; i++) {
    users.push({
      id: `u${i + 1}`,
      name: `User ${(i + 1).toString().padStart(3, '0')}`,
      email: `user${i + 1}@example.com`,
      role: ROLES[i % ROLES.length] ?? 'engineer',
      joined: new Date(2020, i % 12, ((i * 7) % 27) + 1)
        .toISOString()
        .slice(0, 10),
      status: STATUSES[i % STATUSES.length] ?? 'active',
      storage: Math.round((i * 1.7) % 100),
    });
  }
  return users;
}

const SHORT_USERS = generateUsers(8);
const LARGE_USERS = generateUsers(2_000);

const COLUMNS: DataTableColumn<User>[] = [
  {
    id: 'name',
    header: 'Name',
    accessor: 'name',
    sortable: true,
    minWidth: 160,
  },
  {
    id: 'email',
    header: 'Email',
    accessor: 'email',
    sortable: true,
    minWidth: 220,
  },
  { id: 'role', header: 'Role', accessor: 'role', sortable: true, width: 140 },
  { id: 'status', header: 'Status', accessor: 'status', width: 120 },
  {
    id: 'storage',
    header: 'Storage (%)',
    accessor: 'storage',
    sortable: true,
    align: 'right',
    width: 120,
  },
];

const meta: Meta<typeof DataTable> = {
  title: 'Data/DataTable',
  component: DataTable as FC,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Data-driven table with sortable columns, single/multiple row selection, sticky header, optional sticky first column, optional column resizing, and optional row virtualization (auto-enabled above 100 rows).',
      },
    },
  },
};
export default meta;

type Story = StoryObj<typeof DataTable>;

export const Default: Story = {
  render: () => (
    <div style={{ padding: 24 }}>
      <DataTable<User>
        rows={SHORT_USERS}
        columns={COLUMNS}
        rowKey="id"
        aria-label="Users"
      />
    </div>
  ),
};

export const Sortable: Story = {
  render: () => (
    <div style={{ padding: 24 }}>
      <DataTable<User>
        rows={SHORT_USERS}
        columns={COLUMNS}
        rowKey="id"
        defaultSort={{ columnId: 'name', direction: 'asc' }}
        aria-label="Users"
      />
    </div>
  ),
};

export const MultipleSelection: Story = {
  render: () => {
    const [selection, setSelection] = useState<DataTableSelectionState>([]);
    return (
      <div style={{ padding: 24 }}>
        <p style={{ marginBottom: 12 }}>Selected: {selection.length}</p>
        <DataTable<User>
          rows={SHORT_USERS}
          columns={COLUMNS}
          rowKey="id"
          selectionMode="multiple"
          selection={selection}
          onSelectionChange={setSelection}
          aria-label="Users"
        />
      </div>
    );
  },
};

export const SingleSelection: Story = {
  render: () => {
    const [selection, setSelection] = useState<DataTableSelectionState>([]);
    return (
      <div style={{ padding: 24 }}>
        <p style={{ marginBottom: 12 }}>
          Selected row: {selection[0] ?? 'none'}
        </p>
        <DataTable<User>
          rows={SHORT_USERS}
          columns={COLUMNS}
          rowKey="id"
          selectionMode="single"
          selection={selection}
          onSelectionChange={setSelection}
          aria-label="Users"
        />
      </div>
    );
  },
};

export const Densities: Story = {
  render: () => (
    <div
      style={{
        padding: 24,
        display: 'grid',
        gap: 24,
        gridTemplateColumns: '1fr',
      }}
    >
      {(['comfortable', 'compact', 'dense'] as const).map(density => (
        <div key={density}>
          <h4 style={{ margin: '0 0 8px' }}>{density}</h4>
          <DataTable<User>
            rows={SHORT_USERS}
            columns={COLUMNS}
            rowKey="id"
            density={density}
            height={260}
            aria-label={`Users (${density})`}
          />
        </div>
      ))}
    </div>
  ),
};

export const StickyFirstColumn: Story = {
  render: () => {
    const cols: DataTableColumn<User>[] = useMemo(() => {
      const first = COLUMNS[0];
      if (!first) throw new Error('COLUMNS is empty');
      return [{ ...first, sticky: true, width: 200 }, ...COLUMNS.slice(1)];
    }, []);
    return (
      <div style={{ padding: 24, maxWidth: 600 }}>
        <DataTable<User>
          rows={SHORT_USERS}
          columns={cols}
          rowKey="id"
          aria-label="Users"
        />
      </div>
    );
  },
};

export const ResizableColumns: Story = {
  render: () => (
    <div style={{ padding: 24 }}>
      <DataTable<User>
        rows={SHORT_USERS}
        columns={COLUMNS}
        rowKey="id"
        resizableColumns
        aria-label="Users"
      />
    </div>
  ),
};

export const Loading: Story = {
  render: () => (
    <div style={{ padding: 24 }}>
      <DataTable<User>
        rows={[]}
        columns={COLUMNS}
        rowKey="id"
        loading
        loadingRowCount={6}
        aria-label="Users"
      />
    </div>
  ),
};

export const Empty: Story = {
  render: () => (
    <div style={{ padding: 24 }}>
      <DataTable<User>
        rows={[]}
        columns={COLUMNS}
        rowKey="id"
        emptyState="No users yet — invite some to get started."
        aria-label="Users"
      />
    </div>
  ),
};

export const Virtualized: Story = {
  render: () => {
    const [sort, setSort] = useState<DataTableSortState>({
      columnId: null,
      direction: null,
    });
    return (
      <div style={{ padding: 24 }}>
        <p style={{ marginBottom: 12 }}>2,000 rows, virtualization auto-on.</p>
        <DataTable<User>
          rows={LARGE_USERS}
          columns={COLUMNS}
          rowKey="id"
          height={480}
          sort={sort}
          onSortChange={setSort}
          aria-label="Users"
        />
      </div>
    );
  },
};

export const ControlledSelectionAndSort: Story = {
  render: () => {
    const [sort, setSort] = useState<DataTableSortState>({
      columnId: 'name',
      direction: 'asc',
    });
    const [selection, setSelection] = useState<DataTableSelectionState>([
      'u1',
      'u3',
    ]);
    return (
      <div style={{ padding: 24 }}>
        <p style={{ marginBottom: 12 }}>
          Sort: {sort.columnId ?? 'none'} ({sort.direction ?? '—'}) · Selected:{' '}
          {selection.length}
        </p>
        <DataTable<User>
          rows={SHORT_USERS}
          columns={COLUMNS}
          rowKey="id"
          sort={sort}
          onSortChange={setSort}
          selection={selection}
          onSelectionChange={setSelection}
          selectionMode="multiple"
          aria-label="Users"
        />
      </div>
    );
  },
};
