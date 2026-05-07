import type React from 'react';
import type { BaseComponent } from '@/types/common';
import type { Prettify } from '@/types/utilities';

/** Visual density. Affects row height and cell padding. */
export type DataTableDensity = 'comfortable' | 'compact' | 'dense';

/** Cell horizontal alignment. */
export type DataTableAlign = 'left' | 'center' | 'right';

/** Sort direction. `null` means unsorted (third state of the sort cycle). */
export type DataTableSortDirection = 'asc' | 'desc' | null;

/** Selection behavior. */
export type DataTableSelectionMode = 'single' | 'multiple' | false;

/**
 * Description of a single column.
 *
 * `R` is the row data type.
 *
 * `accessor` may be a string (key of `R`) or a function returning the cell
 * value. When omitted, `id` is used as a key into `R` if it matches a key,
 * otherwise the cell is empty.
 */
export interface DataTableColumn<R> {
  /** Stable column identifier. Required. */
  id: string;
  /** Header content (string or any node). */
  header?: React.ReactNode;
  /** How to read the cell value from a row. */
  accessor?: keyof R | ((row: R, rowIndex: number) => unknown);
  /**
   * Cell renderer. Receives the resolved value and the row.
   * When omitted, the value is rendered with `String(value)` (or empty for
   * `null`/`undefined`).
   */
  cell?: (info: {
    value: unknown;
    row: R;
    rowIndex: number;
    column: DataTableColumn<R>;
  }) => React.ReactNode;
  /** Fixed column width (px or any CSS dimension). */
  width?: number | string;
  /** Minimum column width in px (used for resizing). */
  minWidth?: number;
  /** Maximum column width in px (used for resizing). */
  maxWidth?: number;
  /** When true, header click toggles sort on this column. */
  sortable?: boolean;
  /**
   * Custom comparator. Receives the resolved cell values for two rows.
   * Default: `localeCompare` for strings, `<` for numbers, `Date`,
   * `null`/`undefined` ordered last.
   */
  sortComparator?: (a: unknown, b: unknown, rowA: R, rowB: R) => number;
  /** Cell horizontal alignment. @default "left" */
  align?: DataTableAlign;
  /** Per-column className. */
  className?: string;
  /** When true, this column sticks to the left edge while scrolling. */
  sticky?: boolean;
  /** When false, the column header is not focusable for keyboard users. */
  ariaHidden?: boolean;
  /** When true, this column cannot be resized even if `resizableColumns` is on. */
  disableResize?: boolean;
}

/** Controlled sort state. */
export interface DataTableSortState {
  /** Column id, or null when no sort is applied. */
  columnId: string | null;
  /** Direction. `null` is treated as no sort. */
  direction: DataTableSortDirection;
}

/** Selection state. Always an array of row keys; for `single` it has 0 or 1 items. */
export type DataTableSelectionState = string[];

/** Argument passed to render slot helpers. */
export interface DataTableRowRenderInfo<R> {
  row: R;
  rowIndex: number;
  selected: boolean;
}

/** Virtualization mode. `'auto'` enables virtualization above the threshold. */
export type DataTableVirtualizationMode = boolean | 'auto';

export interface DataTableBaseProps<R> extends Omit<
  BaseComponent<HTMLDivElement>,
  'onSelect' | 'children' | 'onChange'
> {
  /** Row data. */
  rows: readonly R[];
  /** Column definitions. */
  columns: readonly DataTableColumn<R>[];
  /**
   * How to derive a stable key for each row. Either a string key on `R` or a
   * function. Required for selection and virtualization stability.
   */
  rowKey: keyof R | ((row: R, rowIndex: number) => string);
  /** Visual density. @default "comfortable" */
  density?: DataTableDensity;
  /** Sticky column header. @default true */
  stickyHeader?: boolean;

  /** Controlled sort state. */
  sort?: DataTableSortState | null;
  /** Default sort state for the uncontrolled mode. */
  defaultSort?: DataTableSortState | null;
  /** Called when the user changes the sort. */
  onSortChange?: (state: DataTableSortState) => void;
  /**
   * When true, the consumer fully owns sorting and the table renders rows
   * as-is. Useful for server-side sorting. @default false
   */
  manualSort?: boolean;

  /** Selection mode. @default false */
  selectionMode?: DataTableSelectionMode;
  /** Controlled selection (array of row keys). */
  selection?: DataTableSelectionState;
  /** Default selection for the uncontrolled mode. */
  defaultSelection?: DataTableSelectionState;
  /** Called when selection changes. */
  onSelectionChange?: (next: DataTableSelectionState) => void;
  /** Disable selection of a specific row. */
  isRowSelectable?: (row: R, rowIndex: number) => boolean;

  /** Row click handler. Independent of selection. */
  onRowClick?: (row: R, rowIndex: number, event: React.MouseEvent) => void;
  /** Row activation (Enter key or double click). */
  onRowActivate?: (row: R, rowIndex: number) => void;

  /** Custom row renderer. Receives the default cells; consumer wraps them. */
  renderRow?: (
    info: DataTableRowRenderInfo<R>,
    cells: React.ReactNode
  ) => React.ReactNode;

  /** Empty state slot (or text). Rendered when `rows.length === 0`. */
  emptyState?: React.ReactNode;
  /** Loading flag — renders skeleton rows. @default false */
  loading?: boolean;
  /** Number of skeleton rows shown while loading. @default 5 */
  loadingRowCount?: number;

  /**
   * Virtualization mode. `'auto'` enables it once `rows.length` exceeds
   * `virtualizationThreshold`. Set to `false` for tests / a11y tools or for
   * very small tables.
   * @default "auto"
   */
  virtualized?: DataTableVirtualizationMode;
  /** Threshold above which `'auto'` mode flips on. @default 100 */
  virtualizationThreshold?: number;
  /** Estimated row height in px. @default depends on density */
  estimatedRowHeight?: number;
  /** Number of off-screen rows kept mounted. @default 8 */
  overscan?: number;

  /** Total scroll container height. Required when virtualized. @default 480 */
  height?: number | string;
  /** Maximum height before scroll engages (non-virtualized mode). */
  maxHeight?: number | string;

  /** Resizable columns (drag the right edge of the header). @default false */
  resizableColumns?: boolean;
  /** Called when a column is resized. */
  onColumnResize?: (columnId: string, width: number) => void;

  /** Optional aria-label for the grid. */
  'aria-label'?: string;
  /** Optional aria-labelledby for the grid. */
  'aria-labelledby'?: string;

  /** Hidden form id. Forwarded to the root element. */
  id?: string;
}

export type DataTableProps<R> = Prettify<DataTableBaseProps<R>>;
