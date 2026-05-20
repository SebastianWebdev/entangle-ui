# DataTable

> Data-driven table with sortable columns, row selection, sticky header, optional column resizing, and row virtualization for large datasets.

A data-driven table for asset browsers, log views, scene outliners, and any other surface that lists structured rows. Built around a CSS grid under `role="grid"` so columns line up between the sticky header and individual rows — including virtualized ones. Supports sortable columns, single or multi-row selection, density, sticky-left columns, column resizing, a loading state, an empty state, and row virtualization that auto-engages above 100 rows.

**Live Preview**

## Import

```tsx
import { DataTable } from 'entangle-ui';
import type {
  DataTableColumn,
  DataTableSortState,
  DataTableSelectionState,
} from 'entangle-ui';
```

## Usage

Pass `rows`, `columns`, and a `rowKey`. The table reads each cell with the column's `accessor` (string key or function) and renders it through the column's optional `cell` renderer.

```tsx
interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

const columns: DataTableColumn<User>[] = [
  { id: 'name', header: 'Name', accessor: 'name', sortable: true },
  { id: 'email', header: 'Email', accessor: 'email' },
  { id: 'role', header: 'Role', accessor: 'role' },
];

<DataTable<User>
  rows={users}
  columns={columns}
  rowKey="id"
  aria-label="Users"
/>;
```

`rowKey` is required and must produce a stable string for every row — it is used as the React key, the selection identifier, and the virtualization key.

## Columns

A `DataTableColumn<R>` describes one column:

```tsx
const columns: DataTableColumn<User>[] = [
  {
    id: 'name',
    header: 'Name',
    accessor: 'name', // key into the row
    sortable: true,
    minWidth: 200,
  },
  {
    id: 'status',
    header: 'Status',
    accessor: 'status',
    width: 120, // fixed track
    cell: ({ value }) => <StatusBadge status={value} />,
  },
  {
    id: 'size',
    header: 'Size (MB)',
    accessor: 'size',
    align: 'right',
  },
];
```

| Field            | Purpose                                                                    |
| ---------------- | -------------------------------------------------------------------------- |
| `id`             | Required stable identifier.                                                |
| `header`         | Header content (string or any node).                                       |
| `accessor`       | `keyof R` or `(row) => unknown` — how to read the cell value.              |
| `cell`           | Custom renderer for the cell. Receives `{ value, row, rowIndex, column }`. |
| `width`          | Fixed track width. Number → px, string → CSS dimension.                    |
| `minWidth`       | Minimum width. Used both as the grid floor and the resize floor.           |
| `maxWidth`       | Maximum width when resizing.                                               |
| `sortable`       | Enables the header click + sort cycle.                                     |
| `sortComparator` | Custom comparator. Defaults handle string, number, boolean, Date.          |
| `align`          | `left` / `center` / `right`. Defaults to `left`.                           |
| `sticky`         | Pins the column to the left edge while scrolling.                          |
| `disableResize`  | Locks this column even when `resizableColumns` is on.                      |

## Sorting

Set `sortable: true` on each sortable column. Clicking the header cycles through `asc → desc → none`. The default comparator handles strings (locale-aware), numbers, booleans, and Date instances; `null` and `undefined` are pushed to the end.

**Sortable columns**

```tsx
<DataTable
  rows={rows}
  columns={columns}
  rowKey="id"
  defaultSort={{ columnId: 'name', direction: 'asc' }}
/>
```

Use controlled mode for server-side sorting — pass `sort`, react in `onSortChange`, and set `manualSort` so the table renders the rows as supplied without re-sorting them client-side:

```tsx
const [sort, setSort] = useState<DataTableSortState>({
  columnId: 'name',
  direction: 'asc',
});

<DataTable
  rows={rowsFromServer}
  columns={columns}
  rowKey="id"
  sort={sort}
  onSortChange={setSort}
  manualSort
/>;
```

## Selection

Two modes: `single` (radio-style, one row at a time) or `multiple` (checkbox column with a select-all header).

**Multiple selection**

```tsx
const [selection, setSelection] = useState<DataTableSelectionState>([]);

<DataTable
  rows={rows}
  columns={columns}
  rowKey="id"
  selectionMode="multiple"
  selection={selection}
  onSelectionChange={setSelection}
/>;
```

Single-mode selection adds no checkbox column — instead, clicking a row toggles its selection and Enter activates it:

**Single selection**

Use `isRowSelectable={(row) => row.status !== 'archived'}` to disable selection per row. The select-all header reflects the resulting subset.

`defaultSelection` enables uncontrolled mode; omit `selection` / `onSelectionChange` and the table tracks state internally.

### Range selection

In `multiple` mode the table tracks the last clicked row as a selection anchor. Hold `Shift` while clicking another row's checkbox to toggle every row between the anchor and the target — selecting them when the target was unselected, deselecting them when it was already selected. Disabled rows (`isRowSelectable` returns `false`) are skipped over.

`Shift + Space` does the same with the keyboard once a row is focused. No prop to enable it — range selection is on by default for multi-select tables.

## Density

Three densities cover most table surfaces.

**Densities**

| Density       | Row height | Use for                                    |
| ------------- | ---------- | ------------------------------------------ |
| `comfortable` | 40 px      | Default. Wide layouts, mixed content.      |
| `compact`     | 32 px      | Dense lists, secondary tables.             |
| `dense`       | 24 px      | Logs, telemetry, anything with > 100 rows. |

```tsx
<DataTable density="compact" rows={rows} columns={columns} rowKey="id" />
```

## Sticky columns

Pin a column to the left edge by setting `sticky: true` on its definition. The sticky shadow appears as the user scrolls horizontally.

**Sticky first column**

```tsx
const columns: DataTableColumn<User>[] = [
  { id: 'name', header: 'Name', accessor: 'name', sticky: true, width: 200 },
  ...
];
```

The header is sticky by default (`stickyHeader: true`).

## Column resizing

Set `resizableColumns` to enable a drag handle on the right edge of each header cell. Per-column `minWidth` / `maxWidth` clamp the drag; `disableResize: true` opts an individual column out.

**Resizable columns**

```tsx
<DataTable
  rows={rows}
  columns={columns}
  rowKey="id"
  resizableColumns
  onColumnResize={(columnId, width) => persistWidth(columnId, width)}
/>
```

## Loading

Render skeleton rows while the consumer is fetching.

**Loading**

```tsx
<DataTable
  rows={[]}
  columns={columns}
  rowKey="id"
  loading
  loadingRowCount={6}
/>
```

## Empty state

When `rows.length === 0` and `loading` is false, the table renders the `emptyState` slot — pass a string or any node.

**Empty state**

```tsx
<DataTable
  rows={[]}
  columns={columns}
  rowKey="id"
  emptyState="No assets yet — drag a file to import."
/>
```

## Virtualization

`virtualized="auto"` (the default) enables row virtualization once the data set exceeds `virtualizationThreshold` (100 rows by default). The grid layout is unchanged, so column widths and the sticky header line up exactly the same as in non-virtualized mode.

**Virtualized (2,000 rows)**

```tsx
<DataTable rows={largeList} columns={columns} rowKey="id" height={480} />
```

Force virtualization with `virtualized={true}`, or disable it entirely (useful for tests or print views) with `virtualized={false}`. Tune the kept-mounted off-screen rows with `overscan` (default `8`).

Virtualization requires a fixed scroll-container `height` — pass a number (px) or any CSS dimension.

## Custom row renderer

Wrap the default cells in your own row element with `renderRow`. The render function receives `{ row, rowIndex, selected }` and the pre-built cells node — return whatever wrapper you need.

```tsx
<DataTable
  rows={rows}
  columns={columns}
  rowKey="id"
  renderRow={({ row, selected }, cells) => (
    <Link href={`/assets/${row.id}`} className={selected ? 'is-selected' : ''}>
      {cells}
    </Link>
  )}
/>
```

## Keyboard navigation

The table is a single focusable region (`tabIndex={0}`) with a [WAI-ARIA grid](https://www.w3.org/WAI/ARIA/apg/patterns/grid/) layout. Once focused:

| Key                     | Action                                                  |
| ----------------------- | ------------------------------------------------------- |
| `ArrowUp` / `ArrowDown` | Move row focus by one.                                  |
| `Home` / `End`          | Jump to the first / last row.                           |
| `PageUp` / `PageDown`   | Jump 10 rows at a time.                                 |
| `Space`                 | Toggle the focused row (multi-select only).             |
| `Enter`                 | Activate the focused row (and toggle in single-select). |

Sortable headers are individually focusable and respond to `Enter` / `Space`.

## Accessibility

- Root element renders as `role="grid"` with `aria-rowcount`, `aria-colcount`, and `aria-multiselectable` set accordingly.
- Each header cell is `role="columnheader"`; sortable headers expose `aria-sort` (`ascending` / `descending` / `none`).
- Body rows are `role="row"` with `aria-rowindex`; cells are `role="gridcell"`.
- Selected rows have `aria-selected="true"` when `selectionMode` is on.
- Skeleton rows during loading are `aria-hidden`; the surrounding container is responsible for announcing loading state.
- Resize handles are `role="separator"` with `aria-orientation="vertical"` and a per-column `aria-label`.

## API Reference

### `<DataTable>`

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `rows` | `readonly R[]` | — | Row data. |
| `columns` | `readonly DataTableColumn[]` | — | Column definitions. |
| `rowKey` | `keyof R \| ((row: R, rowIndex: number) => string)` | — | How to derive a stable key for each row. Required for selection and virtualization stability. |
| `density` | `'comfortable' \| 'compact' \| 'dense'` | `'comfortable'` | Visual density. Affects row height and cell padding. |
| `stickyHeader` | `boolean` | `true` | Whether the header sticks to the top while scrolling. |
| `sort` | `DataTableSortState \| null` | — | Controlled sort state. `{ columnId, direction }`. |
| `defaultSort` | `DataTableSortState \| null` | — | Default sort state for uncontrolled mode. |
| `onSortChange` | `(state: DataTableSortState) => void` | — | Called when the user changes the sort. |
| `manualSort` | `boolean` | `false` | When true, the consumer fully owns sorting — the table renders rows as-is. Useful for server-side sorting. |
| `selectionMode` | `'single' \| 'multiple' \| false` | `false` | Selection behavior. |
| `selection` | `string[]` | — | Controlled selection (array of row keys). |
| `defaultSelection` | `string[]` | — | Default selection for uncontrolled mode. |
| `onSelectionChange` | `(next: string[]) => void` | — | Called when selection changes. |
| `isRowSelectable` | `(row: R, rowIndex: number) => boolean` | — | Disable selection of a specific row. |
| `onRowClick` | `(row: R, rowIndex: number, event: MouseEvent) => void` | — | Row click handler. Independent of selection. |
| `onRowActivate` | `(row: R, rowIndex: number) => void` | — | Row activation (Enter key or double click). |
| `renderRow` | `(info: { row; rowIndex; selected }, cells: ReactNode) => ReactNode` | — | Custom row renderer. Receives the default cells; the consumer wraps them. |
| `emptyState` | `ReactNode` | — | Empty state slot or text. Rendered when `rows.length === 0`. |
| `loading` | `boolean` | `false` | Loading flag — renders skeleton rows. |
| `loadingRowCount` | `number` | `5` | Number of skeleton rows shown while loading. |
| `virtualized` | `boolean \| 'auto'` | `'auto'` | Virtualization mode. `'auto'` enables it once `rows.length` exceeds `virtualizationThreshold`. |
| `virtualizationThreshold` | `number` | `100` | Threshold above which `'auto'` mode flips on. |
| `estimatedRowHeight` | `number` | — | Estimated row height in px. Defaults to a density-dependent value. |
| `overscan` | `number` | `8` | Number of off-screen rows kept mounted. |
| `height` | `number \| string` | `480` | Total scroll container height. Required when virtualized. |
| `maxHeight` | `number \| string` | — | Maximum height before scroll engages (non-virtualized mode). |
| `resizableColumns` | `boolean` | `false` | Enable drag-to-resize on the right edge of each header. |
| `onColumnResize` | `(columnId: string, width: number) => void` | — | Called when a column is resized. |
| `aria-label` | `string` | — | Optional aria-label for the grid. |
| `aria-labelledby` | `string` | — | Optional aria-labelledby for the grid. |

### `DataTableColumn<R>`

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `id` | `string` | — | Stable column identifier. Required. |
| `header` | `ReactNode` | — | Header content (string or any node). |
| `accessor` | `keyof R \| ((row: R, rowIndex: number) => unknown)` | — | How to read the cell value from a row. When omitted, `id` is used as a key into the row. |
| `cell` | `(info: { value; row; rowIndex; column }) => ReactNode` | — | Cell renderer. When omitted, the value is stringified (empty for null/undefined). |
| `width` | `number \| string` | — | Fixed column width. Number → px, string → CSS dimension. |
| `minWidth` | `number` | — | Minimum column width in px (used for resizing and as the grid floor). |
| `maxWidth` | `number` | — | Maximum column width in px (used for resizing). |
| `sortable` | `boolean` | — | When true, header click toggles sort on this column. |
| `sortComparator` | `(a, b, rowA, rowB) => number` | — | Custom comparator. Default handles strings, numbers, booleans, Date; null/undefined ordered last. |
| `align` | `'left' \| 'center' \| 'right'` | `'left'` | Cell horizontal alignment. |
| `sticky` | `boolean` | — | When true, this column sticks to the left edge while scrolling. |
| `ariaHidden` | `boolean` | — | When true, the column header is not focusable for keyboard users. |
| `disableResize` | `boolean` | — | When true, this column cannot be resized even if `resizableColumns` is on. |
