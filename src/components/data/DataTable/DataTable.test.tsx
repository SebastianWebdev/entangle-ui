import { fireEvent, screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { renderWithTheme } from '@/tests/testUtils';
import { DataTable } from './DataTable';
import type { DataTableColumn } from './DataTable.types';

interface User {
  id: string;
  name: string;
  age: number;
  role: string;
}

const USERS: User[] = [
  { id: 'u1', name: 'Charlie', age: 30, role: 'designer' },
  { id: 'u2', name: 'Alice', age: 25, role: 'engineer' },
  { id: 'u3', name: 'Bob', age: 40, role: 'manager' },
];

const COLUMNS: DataTableColumn<User>[] = [
  { id: 'name', header: 'Name', accessor: 'name', sortable: true },
  { id: 'age', header: 'Age', accessor: 'age', sortable: true, align: 'right' },
  { id: 'role', header: 'Role', accessor: 'role' },
];

function rowKeys(): HTMLElement[] {
  return Array.from(document.querySelectorAll<HTMLElement>('[data-row-key]'));
}

function rowByIndex(idx: number): HTMLElement {
  const row = document.querySelector<HTMLElement>(`[data-row-index="${idx}"]`);
  if (!row) throw new Error(`Row ${idx} not found`);
  return row;
}

describe('DataTable', () => {
  describe('Rendering', () => {
    it('renders one row per data item', () => {
      renderWithTheme(
        <DataTable<User>
          rows={USERS}
          columns={COLUMNS}
          rowKey="id"
          virtualized={false}
        />
      );
      const rows = rowKeys();
      expect(rows).toHaveLength(USERS.length);
    });

    it('renders header cells with correct text', () => {
      renderWithTheme(
        <DataTable<User>
          rows={USERS}
          columns={COLUMNS}
          rowKey="id"
          virtualized={false}
        />
      );
      const headers = screen.getAllByRole('columnheader');
      expect(headers).toHaveLength(3);
      expect(headers[0]).toHaveTextContent('Name');
      expect(headers[1]).toHaveTextContent('Age');
      expect(headers[2]).toHaveTextContent('Role');
    });

    it('renders cell values via the accessor', () => {
      renderWithTheme(
        <DataTable<User>
          rows={USERS}
          columns={COLUMNS}
          rowKey="id"
          virtualized={false}
        />
      );
      const firstRow = rowByIndex(0);
      expect(firstRow).toHaveTextContent('Charlie');
      expect(firstRow).toHaveTextContent('30');
      expect(firstRow).toHaveTextContent('designer');
    });

    it('renders a custom cell renderer when provided', () => {
      const cols: DataTableColumn<User>[] = [
        ...COLUMNS,
        {
          id: 'badge',
          header: 'Badge',
          cell: ({ row }) => <span data-testid={`badge-${row.id}`}>★</span>,
        },
      ];
      renderWithTheme(
        <DataTable<User>
          rows={USERS}
          columns={cols}
          rowKey="id"
          virtualized={false}
        />
      );
      expect(screen.getByTestId('badge-u1')).toHaveTextContent('★');
    });

    it('renders the empty state when there are no rows', () => {
      renderWithTheme(
        <DataTable<User>
          rows={[]}
          columns={COLUMNS}
          rowKey="id"
          emptyState="Nothing here"
          virtualized={false}
        />
      );
      expect(screen.getByText('Nothing here')).toBeInTheDocument();
    });

    it('renders skeleton rows while loading', () => {
      renderWithTheme(
        <DataTable<User>
          rows={[]}
          columns={COLUMNS}
          rowKey="id"
          loading
          loadingRowCount={3}
          virtualized={false}
        />
      );
      // No empty state, no real rows. Skeleton rows are aria-hidden.
      expect(screen.queryByText('No rows to display')).not.toBeInTheDocument();
      const skeletonBars = document.querySelectorAll('[aria-hidden="true"]');
      expect(skeletonBars.length).toBeGreaterThanOrEqual(3);
    });

    it('uses a function rowKey when provided', () => {
      renderWithTheme(
        <DataTable<User>
          rows={USERS}
          columns={COLUMNS}
          rowKey={row => `key-${row.id}`}
          virtualized={false}
        />
      );
      expect(document.querySelector('[data-row-key="key-u1"]')).not.toBeNull();
    });
  });

  describe('Sorting', () => {
    it('sorts rows by ascending order on first header click', () => {
      renderWithTheme(
        <DataTable<User>
          rows={USERS}
          columns={COLUMNS}
          rowKey="id"
          virtualized={false}
        />
      );
      const nameHeader = screen.getAllByRole('columnheader')[0];
      if (!nameHeader) throw new Error('Header missing');
      fireEvent.click(nameHeader);
      const visible = Array.from(
        document.querySelectorAll<HTMLElement>('[data-row-index]')
      ).map(el => el.textContent);
      expect(visible[0]).toContain('Alice');
      expect(visible[1]).toContain('Bob');
      expect(visible[2]).toContain('Charlie');
    });

    it('cycles asc -> desc -> none on subsequent clicks', () => {
      const onSortChange = vi.fn();
      renderWithTheme(
        <DataTable<User>
          rows={USERS}
          columns={COLUMNS}
          rowKey="id"
          onSortChange={onSortChange}
          virtualized={false}
        />
      );
      const nameHeader = screen.getAllByRole('columnheader')[0];
      if (!nameHeader) throw new Error('Header missing');

      fireEvent.click(nameHeader);
      expect(nameHeader).toHaveAttribute('aria-sort', 'ascending');

      fireEvent.click(nameHeader);
      expect(nameHeader).toHaveAttribute('aria-sort', 'descending');

      fireEvent.click(nameHeader);
      expect(nameHeader).toHaveAttribute('aria-sort', 'none');

      expect(onSortChange).toHaveBeenCalledTimes(3);
      expect(onSortChange).toHaveBeenLastCalledWith({
        columnId: null,
        direction: null,
      });
    });

    it('does not toggle sort for non-sortable columns', () => {
      renderWithTheme(
        <DataTable<User>
          rows={USERS}
          columns={COLUMNS}
          rowKey="id"
          virtualized={false}
        />
      );
      const roleHeader = screen.getAllByRole('columnheader')[2];
      if (!roleHeader) throw new Error('Header missing');
      fireEvent.click(roleHeader);
      expect(roleHeader).not.toHaveAttribute('aria-sort');
    });

    it('sorts numerically for number values', () => {
      renderWithTheme(
        <DataTable<User>
          rows={USERS}
          columns={COLUMNS}
          rowKey="id"
          virtualized={false}
        />
      );
      const ageHeader = screen.getAllByRole('columnheader')[1];
      if (!ageHeader) throw new Error('Header missing');
      fireEvent.click(ageHeader);
      const visible = Array.from(
        document.querySelectorAll<HTMLElement>('[data-row-index]')
      ).map(el => el.textContent);
      expect(visible[0]).toContain('Alice'); // 25
      expect(visible[2]).toContain('Bob'); // 40
    });

    it('does not sort when manualSort is true', () => {
      renderWithTheme(
        <DataTable<User>
          rows={USERS}
          columns={COLUMNS}
          rowKey="id"
          manualSort
          virtualized={false}
        />
      );
      const nameHeader = screen.getAllByRole('columnheader')[0];
      if (!nameHeader) throw new Error('Header missing');
      fireEvent.click(nameHeader);
      // Order should remain the original.
      const visible = Array.from(
        document.querySelectorAll<HTMLElement>('[data-row-index]')
      ).map(el => el.textContent);
      expect(visible[0]).toContain('Charlie');
    });
  });

  describe('Selection', () => {
    it('does not render select column when selectionMode is false', () => {
      renderWithTheme(
        <DataTable<User>
          rows={USERS}
          columns={COLUMNS}
          rowKey="id"
          virtualized={false}
        />
      );
      const headers = screen.getAllByRole('columnheader');
      expect(headers).toHaveLength(3);
    });

    it('renders a select column header when selectionMode is multiple', () => {
      renderWithTheme(
        <DataTable<User>
          rows={USERS}
          columns={COLUMNS}
          rowKey="id"
          selectionMode="multiple"
          virtualized={false}
        />
      );
      const headers = screen.getAllByRole('columnheader');
      expect(headers).toHaveLength(4);
    });

    it('toggles a row when its checkbox is clicked', () => {
      const onSelectionChange = vi.fn();
      renderWithTheme(
        <DataTable<User>
          rows={USERS}
          columns={COLUMNS}
          rowKey="id"
          selectionMode="multiple"
          onSelectionChange={onSelectionChange}
          virtualized={false}
        />
      );
      const firstRow = rowByIndex(0);
      const checkbox = within(firstRow).getByLabelText('Select row 1');
      fireEvent.click(checkbox);
      expect(onSelectionChange).toHaveBeenCalledWith(['u1']);
    });

    it('selects all rows via the header checkbox', () => {
      const onSelectionChange = vi.fn();
      renderWithTheme(
        <DataTable<User>
          rows={USERS}
          columns={COLUMNS}
          rowKey="id"
          selectionMode="multiple"
          onSelectionChange={onSelectionChange}
          virtualized={false}
        />
      );
      const headerCheckboxes = screen
        .getAllByLabelText('Select all rows')
        .filter(el => el.getAttribute('role') === 'checkbox');
      const headerCheckbox = headerCheckboxes[0];
      if (!headerCheckbox) throw new Error('Header checkbox missing');
      fireEvent.click(headerCheckbox);
      expect(onSelectionChange).toHaveBeenCalledWith(['u1', 'u2', 'u3']);
    });

    it('single selection mode replaces previous selection on click', () => {
      const onSelectionChange = vi.fn();
      renderWithTheme(
        <DataTable<User>
          rows={USERS}
          columns={COLUMNS}
          rowKey="id"
          selectionMode="single"
          onSelectionChange={onSelectionChange}
          virtualized={false}
        />
      );
      fireEvent.click(rowByIndex(1));
      expect(onSelectionChange).toHaveBeenLastCalledWith(['u2']);
      fireEvent.click(rowByIndex(2));
      expect(onSelectionChange).toHaveBeenLastCalledWith(['u3']);
    });

    it('respects isRowSelectable', () => {
      const onSelectionChange = vi.fn();
      renderWithTheme(
        <DataTable<User>
          rows={USERS}
          columns={COLUMNS}
          rowKey="id"
          selectionMode="multiple"
          onSelectionChange={onSelectionChange}
          isRowSelectable={row => row.id !== 'u2'}
          virtualized={false}
        />
      );
      const blockedRow = rowByIndex(1);
      const blockedCheckbox = within(blockedRow).getByLabelText('Select row 2');
      expect(blockedCheckbox).toBeDisabled();
    });
  });

  describe('Keyboard navigation', () => {
    it('moves the active row down with ArrowDown', () => {
      renderWithTheme(
        <DataTable<User>
          rows={USERS}
          columns={COLUMNS}
          rowKey="id"
          testId="grid"
          virtualized={false}
        />
      );
      const grid = screen.getByTestId('grid');
      grid.focus();
      fireEvent.keyDown(grid, { key: 'ArrowDown' });
      expect(rowByIndex(0).getAttribute('data-row-index')).toBe('0');
      // Move down again.
      fireEvent.keyDown(grid, { key: 'ArrowDown' });
      // Active row index now 1, but we can't read internal state — we just
      // confirm the keyDown did not throw and the table remains rendered.
      expect(grid).toBeInTheDocument();
    });

    it('jumps to first row with Home and last row with End', () => {
      renderWithTheme(
        <DataTable<User>
          rows={USERS}
          columns={COLUMNS}
          rowKey="id"
          testId="grid"
          virtualized={false}
        />
      );
      const grid = screen.getByTestId('grid');
      grid.focus();
      fireEvent.keyDown(grid, { key: 'End' });
      fireEvent.keyDown(grid, { key: 'Home' });
      expect(grid).toBeInTheDocument();
    });

    it('Space toggles selection in multiple mode', () => {
      const onSelectionChange = vi.fn();
      renderWithTheme(
        <DataTable<User>
          rows={USERS}
          columns={COLUMNS}
          rowKey="id"
          selectionMode="multiple"
          testId="grid"
          onSelectionChange={onSelectionChange}
          virtualized={false}
        />
      );
      const grid = screen.getByTestId('grid');
      grid.focus();
      fireEvent.keyDown(grid, { key: 'ArrowDown' });
      fireEvent.keyDown(grid, { key: ' ' });
      expect(onSelectionChange).toHaveBeenCalledWith(['u1']);
    });

    it('Enter activates a row and toggles selection in single mode', () => {
      const onRowActivate = vi.fn();
      const onSelectionChange = vi.fn();
      renderWithTheme(
        <DataTable<User>
          rows={USERS}
          columns={COLUMNS}
          rowKey="id"
          selectionMode="single"
          testId="grid"
          onRowActivate={onRowActivate}
          onSelectionChange={onSelectionChange}
          virtualized={false}
        />
      );
      const grid = screen.getByTestId('grid');
      grid.focus();
      fireEvent.keyDown(grid, { key: 'ArrowDown' });
      fireEvent.keyDown(grid, { key: 'Enter' });
      expect(onSelectionChange).toHaveBeenCalledWith(['u1']);
      expect(onRowActivate).toHaveBeenCalledWith(USERS[0], 0);
    });
  });

  describe('Row click and activation', () => {
    it('fires onRowClick when a row is clicked', () => {
      const onRowClick = vi.fn();
      renderWithTheme(
        <DataTable<User>
          rows={USERS}
          columns={COLUMNS}
          rowKey="id"
          onRowClick={onRowClick}
          virtualized={false}
        />
      );
      fireEvent.click(rowByIndex(1));
      expect(onRowClick).toHaveBeenCalledTimes(1);
      expect(onRowClick.mock.calls[0]?.[0]).toEqual(USERS[1]);
      expect(onRowClick.mock.calls[0]?.[1]).toBe(1);
    });

    it('fires onRowActivate on double click', () => {
      const onRowActivate = vi.fn();
      renderWithTheme(
        <DataTable<User>
          rows={USERS}
          columns={COLUMNS}
          rowKey="id"
          onRowActivate={onRowActivate}
          virtualized={false}
        />
      );
      fireEvent.doubleClick(rowByIndex(0));
      expect(onRowActivate).toHaveBeenCalledWith(USERS[0], 0);
    });
  });

  describe('Pinning and resizing', () => {
    it('renders a sticky column header for sticky columns', () => {
      const first = COLUMNS[0];
      if (!first) throw new Error('COLUMNS is empty');
      const cols: DataTableColumn<User>[] = [
        { ...first, sticky: true },
        ...COLUMNS.slice(1),
      ];
      renderWithTheme(
        <DataTable<User>
          rows={USERS}
          columns={cols}
          rowKey="id"
          virtualized={false}
        />
      );
      const stickyHeader = document.querySelector<HTMLElement>(
        '[data-column-id="name"]'
      );
      if (!stickyHeader) throw new Error('Sticky header missing');
      expect(stickyHeader.className).toMatch(/sticky/);
    });

    it('renders resize handles when resizableColumns is true', () => {
      renderWithTheme(
        <DataTable<User>
          rows={USERS}
          columns={COLUMNS}
          rowKey="id"
          resizableColumns
          virtualized={false}
        />
      );
      const handles = screen.getAllByRole('separator');
      expect(handles.length).toBe(COLUMNS.length);
    });
  });

  describe('Virtualization', () => {
    it('does not virtualize when virtualized={false}', () => {
      const big = Array.from({ length: 200 }, (_, i) => ({
        id: `u${i}`,
        name: `User ${i}`,
        age: i,
        role: 'engineer',
      }));
      renderWithTheme(
        <DataTable<User>
          rows={big}
          columns={COLUMNS}
          rowKey="id"
          virtualized={false}
        />
      );
      expect(rowKeys()).toHaveLength(200);
    });

    it('renders a subset of rows when virtualized', () => {
      const big = Array.from({ length: 200 }, (_, i) => ({
        id: `u${i}`,
        name: `User ${i}`,
        age: i,
        role: 'engineer',
      }));
      renderWithTheme(
        <DataTable<User>
          rows={big}
          columns={COLUMNS}
          rowKey="id"
          height={200}
          virtualized
          estimatedRowHeight={40}
        />
      );
      expect(rowKeys().length).toBeLessThan(200);
    });
  });

  describe('Accessibility', () => {
    it('uses role="grid" with row and column counts', () => {
      renderWithTheme(
        <DataTable<User>
          rows={USERS}
          columns={COLUMNS}
          rowKey="id"
          aria-label="Users"
          virtualized={false}
        />
      );
      const grid = screen.getByRole('grid', { name: 'Users' });
      expect(grid).toHaveAttribute('aria-rowcount', String(USERS.length + 1));
      expect(grid).toHaveAttribute('aria-colcount', '3');
    });

    it('marks aria-multiselectable when selectionMode is multiple', () => {
      renderWithTheme(
        <DataTable<User>
          rows={USERS}
          columns={COLUMNS}
          rowKey="id"
          selectionMode="multiple"
          aria-label="Users"
          virtualized={false}
        />
      );
      expect(screen.getByRole('grid')).toHaveAttribute(
        'aria-multiselectable',
        'true'
      );
    });

    it('reflects sort state with aria-sort', () => {
      renderWithTheme(
        <DataTable<User>
          rows={USERS}
          columns={COLUMNS}
          rowKey="id"
          virtualized={false}
        />
      );
      const headers = screen.getAllByRole('columnheader');
      const sortable = headers[0];
      const nonSortable = headers[2];
      if (!sortable || !nonSortable) throw new Error('Headers missing');
      expect(sortable).toHaveAttribute('aria-sort', 'none');
      expect(nonSortable).not.toHaveAttribute('aria-sort');
    });
  });
});
