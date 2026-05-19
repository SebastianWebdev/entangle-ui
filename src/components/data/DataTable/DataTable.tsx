'use client';

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { assignInlineVars } from '@vanilla-extract/dynamic';
import { useVirtualizer } from '@tanstack/react-virtual';
import { cx } from '@/utils/cx';
import { useControlledState } from '@/hooks/useControlledState';
import { Checkbox } from '@/components/primitives/Checkbox';
import { ChevronDownIcon } from '@/components/Icons/ChevronDownIcon';
import { ChevronUpIcon } from '@/components/Icons/ChevronUpIcon';
import { SortIcon } from '@/components/Icons/SortIcon';
import {
  bodyStyle,
  cellRecipe,
  emptyStateStyle,
  gridTemplateColumnsVar,
  headerCellInnerStyle,
  headerCellRecipe,
  headerStyle,
  innerWrapperStyle,
  resizeHandleStyle,
  rootRecipe,
  rowRecipe,
  scrollContainerStyle,
  skeletonBarStyle,
  skeletonCellStyle,
  skeletonRowStyle,
  sortIndicatorRecipe,
  tableMinWidthVar,
  totalHeightVar,
  virtualBodyStyle,
} from './DataTable.css';
import type {
  DataTableColumn,
  DataTableDensity,
  DataTableProps,
  DataTableSelectionState,
  DataTableSortDirection,
  DataTableSortState,
} from './DataTable.types';

const DENSITY_ROW_HEIGHT: Record<DataTableDensity, number> = {
  comfortable: 40,
  compact: 32,
  dense: 24,
};

const VIRTUALIZATION_THRESHOLD_DEFAULT = 100;
const SELECT_COLUMN_WIDTH = 40;

function getRowKey<R>(
  rowKey: keyof R | ((row: R, rowIndex: number) => string),
  row: R,
  rowIndex: number
): string {
  if (typeof rowKey === 'function') return rowKey(row, rowIndex);
  const value = row[rowKey];
  return typeof value === 'string' ? value : String(value);
}

function readCellValue<R>(
  column: DataTableColumn<R>,
  row: R,
  rowIndex: number
): unknown {
  const accessor = column.accessor;
  if (typeof accessor === 'function') return accessor(row, rowIndex);
  if (typeof accessor === 'string')
    return (row as Record<string, unknown>)[accessor];
  return (row as Record<string, unknown>)[column.id];
}

function defaultCompare(a: unknown, b: unknown): number {
  if (a === b) return 0;
  if (a === null || a === undefined) return 1;
  if (b === null || b === undefined) return -1;
  if (typeof a === 'number' && typeof b === 'number') return a - b;
  if (a instanceof Date && b instanceof Date) return a.getTime() - b.getTime();
  if (typeof a === 'boolean' && typeof b === 'boolean')
    return a === b ? 0 : a ? 1 : -1;
  const sa = typeof a === 'string' ? a : JSON.stringify(a);
  const sb = typeof b === 'string' ? b : JSON.stringify(b);
  return sa.localeCompare(sb);
}

function nextSortDirection(
  current: DataTableSortDirection
): DataTableSortDirection {
  if (current === null) return 'asc';
  if (current === 'asc') return 'desc';
  return null;
}

function resolveDimension(
  value: number | string | undefined
): string | undefined {
  if (value === undefined) return undefined;
  return typeof value === 'number' ? `${value}px` : value;
}

interface ColumnTrack {
  templateValue: string;
  minPx: number;
}

function getColumnTrack<R>(
  column: DataTableColumn<R>,
  override: number | undefined
): ColumnTrack {
  if (override !== undefined) {
    return { templateValue: `${override}px`, minPx: override };
  }
  if (column.width !== undefined) {
    const resolved = resolveDimension(column.width) ?? '1fr';
    const minPx = typeof column.width === 'number' ? column.width : 0;
    return { templateValue: resolved, minPx };
  }
  const minWidth = column.minWidth ?? 80;
  return { templateValue: `minmax(${minWidth}px, 1fr)`, minPx: minWidth };
}

/**
 * Data-driven table with sortable columns, row selection, sticky header,
 * optional sticky first column, optional column resizing, and optional
 * row virtualization (auto-enabled above 100 rows).
 *
 * Uses a CSS grid layout under `role="grid"` so columns line up across the
 * sticky header and individual virtualized rows without depending on real
 * `<table>` semantics.
 *
 * @example
 * ```tsx
 * <DataTable
 *   rows={users}
 *   rowKey="id"
 *   columns={[
 *     { id: 'name', header: 'Name', accessor: 'name', sortable: true },
 *     { id: 'role', header: 'Role', accessor: 'role' },
 *   ]}
 *   selectionMode="multiple"
 *   onSelectionChange={setSelected}
 * />
 * ```
 */
function DataTableInner<R>(props: DataTableProps<R>): React.ReactElement {
  const {
    rows,
    columns,
    rowKey,
    density = 'comfortable',
    stickyHeader = true,
    sort,
    defaultSort,
    onSortChange,
    manualSort = false,
    selectionMode = false,
    selection,
    defaultSelection,
    onSelectionChange,
    isRowSelectable,
    onRowClick,
    onRowActivate,
    renderRow,
    emptyState,
    loading = false,
    loadingRowCount = 5,
    virtualized = 'auto',
    virtualizationThreshold = VIRTUALIZATION_THRESHOLD_DEFAULT,
    estimatedRowHeight,
    overscan = 8,
    height = 480,
    maxHeight,
    resizableColumns = false,
    onColumnResize,
    className,
    style,
    testId,
    ref,
    'aria-label': ariaLabel,
    'aria-labelledby': ariaLabelledBy,
    ...rest
  } = props;

  const [sortState, setSortState] = useControlledState<DataTableSortState>({
    value: sort ?? undefined,
    defaultValue: defaultSort ?? undefined,
    onChange: onSortChange,
    fallback: { columnId: null, direction: null },
  });

  const [selectionState, setSelectionState] =
    useControlledState<DataTableSelectionState>({
      value: selection,
      defaultValue: defaultSelection,
      onChange: onSelectionChange,
      fallback: [],
    });

  const [columnWidths, setColumnWidths] = useState<Record<string, number>>({});
  const [activeRowIndex, setActiveRowIndex] = useState<number | null>(null);

  const showSelectColumn = selectionMode === 'multiple';
  const selectedSet = useMemo(() => new Set(selectionState), [selectionState]);

  const sortedRows = useMemo(() => {
    if (manualSort) return rows;
    const { columnId, direction } = sortState;
    if (!columnId || direction === null) return rows;
    const column = columns.find(c => c.id === columnId);
    if (!column) return rows;
    const indexed = rows.map((row, idx) => ({ row, idx }));
    indexed.sort((a, b) => {
      const valueA = readCellValue(column, a.row, a.idx);
      const valueB = readCellValue(column, b.row, b.idx);
      const cmp = column.sortComparator
        ? column.sortComparator(valueA, valueB, a.row, b.row)
        : defaultCompare(valueA, valueB);
      return direction === 'asc' ? cmp : -cmp;
    });
    return indexed.map(item => item.row);
  }, [rows, sortState, columns, manualSort]);

  const rowKeys = useMemo(
    () => sortedRows.map((row, idx) => getRowKey(rowKey, row, idx)),
    [sortedRows, rowKey]
  );

  const selectableIndexes = useMemo(() => {
    if (!selectionMode) return [];
    if (!isRowSelectable) return sortedRows.map((_, idx) => idx);
    const result: number[] = [];
    sortedRows.forEach((row, idx) => {
      if (isRowSelectable(row, idx)) result.push(idx);
    });
    return result;
  }, [sortedRows, isRowSelectable, selectionMode]);

  const allSelectableSelected =
    selectableIndexes.length > 0 &&
    selectableIndexes.every(idx => {
      const k = rowKeys[idx];
      return k !== undefined && selectedSet.has(k);
    });
  const someSelectableSelected =
    !allSelectableSelected &&
    selectableIndexes.some(idx => {
      const k = rowKeys[idx];
      return k !== undefined && selectedSet.has(k);
    });

  const handleSortClick = useCallback(
    (column: DataTableColumn<R>) => {
      if (!column.sortable) return;
      setSortState(prev => {
        if (prev.columnId === column.id) {
          const next = nextSortDirection(prev.direction);
          return next === null
            ? { columnId: null, direction: null }
            : { columnId: column.id, direction: next };
        }
        return { columnId: column.id, direction: 'asc' };
      });
    },
    [setSortState]
  );

  const selectionAnchorRef = useRef<number | null>(null);
  const selectionShiftKeyRef = useRef(false);

  const toggleRowSelection = useCallback(
    (rowKeyValue: string, row: R, rowIdx: number, rangeMode = false) => {
      if (!selectionMode) return;
      if (isRowSelectable && !isRowSelectable(row, rowIdx)) return;
      if (selectionMode === 'single') {
        selectionAnchorRef.current = rowIdx;
        setSelectionState(prev =>
          prev[0] === rowKeyValue ? [] : [rowKeyValue]
        );
        return;
      }

      const anchor = selectionAnchorRef.current;
      if (rangeMode && anchor !== null && anchor !== rowIdx) {
        const [start, end] =
          anchor < rowIdx ? [anchor, rowIdx] : [rowIdx, anchor];
        const rangeKeys: string[] = [];
        for (let i = start; i <= end; i += 1) {
          const candidate = sortedRows[i];
          const candidateKey = rowKeys[i];
          if (candidate === undefined || candidateKey === undefined) continue;
          if (isRowSelectable && !isRowSelectable(candidate, i)) continue;
          rangeKeys.push(candidateKey);
        }
        setSelectionState(prev => {
          const set = new Set(prev);
          const shouldDeselect = set.has(rowKeyValue);
          for (const key of rangeKeys) {
            if (shouldDeselect) set.delete(key);
            else set.add(key);
          }
          return Array.from(set);
        });
        return;
      }

      selectionAnchorRef.current = rowIdx;
      setSelectionState(prev => {
        const set = new Set(prev);
        if (set.has(rowKeyValue)) set.delete(rowKeyValue);
        else set.add(rowKeyValue);
        return Array.from(set);
      });
    },
    [selectionMode, isRowSelectable, setSelectionState, sortedRows, rowKeys]
  );

  const toggleSelectAll = useCallback(() => {
    if (selectionMode !== 'multiple') return;
    if (allSelectableSelected) {
      setSelectionState([]);
      return;
    }
    const next = selectableIndexes
      .map(idx => rowKeys[idx])
      .filter((k): k is string => typeof k === 'string');
    setSelectionState(next);
  }, [
    allSelectableSelected,
    selectableIndexes,
    rowKeys,
    selectionMode,
    setSelectionState,
  ]);

  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const shouldVirtualize =
    virtualized === true ||
    (virtualized === 'auto' && sortedRows.length > virtualizationThreshold);

  const rowHeightPx = estimatedRowHeight ?? DENSITY_ROW_HEIGHT[density];

  const virtualizer = useVirtualizer({
    count: shouldVirtualize ? sortedRows.length : 0,
    getScrollElement: () => scrollContainerRef.current,
    estimateSize: () => rowHeightPx,
    overscan,
  });

  const virtualItems = shouldVirtualize ? virtualizer.getVirtualItems() : [];
  const totalSize = shouldVirtualize ? virtualizer.getTotalSize() : 0;

  const tracks = useMemo(() => {
    const items: string[] = [];
    let minWidth = 0;
    if (showSelectColumn) {
      items.push(`${SELECT_COLUMN_WIDTH}px`);
      minWidth += SELECT_COLUMN_WIDTH;
    }
    columns.forEach(column => {
      const t = getColumnTrack(column, columnWidths[column.id]);
      items.push(t.templateValue);
      minWidth += t.minPx;
    });
    return { template: items.join(' '), minWidth };
  }, [columns, columnWidths, showSelectColumn]);

  const renderSortIndicator = (column: DataTableColumn<R>) => {
    if (!column.sortable) return null;
    const active =
      sortState.columnId === column.id && sortState.direction !== null;
    const direction = active ? sortState.direction : null;
    const Icon =
      direction === 'asc'
        ? ChevronUpIcon
        : direction === 'desc'
          ? ChevronDownIcon
          : SortIcon;
    return (
      <span
        className={sortIndicatorRecipe({ active: active || undefined })}
        aria-hidden="true"
      >
        <Icon size="sm" />
      </span>
    );
  };

  const beginResize = useCallback(
    (
      columnId: string,
      startX: number,
      startWidth: number,
      column: DataTableColumn<R>
    ) => {
      const minWidth = column.minWidth ?? 40;
      const maxWidth = column.maxWidth ?? Infinity;
      const handleMove = (event: PointerEvent) => {
        const delta = event.clientX - startX;
        const next = Math.max(minWidth, Math.min(maxWidth, startWidth + delta));
        setColumnWidths(prev => ({ ...prev, [columnId]: next }));
      };
      const handleUp = () => {
        window.removeEventListener('pointermove', handleMove);
        window.removeEventListener('pointerup', handleUp);
        setColumnWidths(prev => {
          const finalWidth = prev[columnId];
          if (finalWidth !== undefined) onColumnResize?.(columnId, finalWidth);
          return prev;
        });
      };
      window.addEventListener('pointermove', handleMove);
      window.addEventListener('pointerup', handleUp);
    },
    [onColumnResize]
  );

  const focusRow = useCallback(
    (index: number) => {
      if (sortedRows.length === 0) return;
      const clamped = Math.max(0, Math.min(sortedRows.length - 1, index));
      setActiveRowIndex(clamped);
      if (shouldVirtualize) {
        virtualizer.scrollToIndex(clamped, { align: 'auto' });
      }
    },
    [sortedRows.length, shouldVirtualize, virtualizer]
  );

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (sortedRows.length === 0) return;
      const current = activeRowIndex ?? -1;
      switch (event.key) {
        case 'ArrowDown':
          event.preventDefault();
          focusRow(current + 1);
          return;
        case 'ArrowUp':
          event.preventDefault();
          focusRow(current - 1);
          return;
        case 'Home':
          event.preventDefault();
          focusRow(0);
          return;
        case 'End':
          event.preventDefault();
          focusRow(sortedRows.length - 1);
          return;
        case 'PageDown':
          event.preventDefault();
          focusRow(current + 10);
          return;
        case 'PageUp':
          event.preventDefault();
          focusRow(current - 10);
          return;
        case 'Enter': {
          if (current < 0) return;
          event.preventDefault();
          const row = sortedRows[current];
          if (row === undefined) return;
          const k = rowKeys[current];
          if (selectionMode === 'single' && k !== undefined) {
            toggleRowSelection(k, row, current);
          }
          onRowActivate?.(row, current);
          return;
        }
        case ' ': {
          if (current < 0) return;
          if (selectionMode !== 'multiple') return;
          event.preventDefault();
          const row = sortedRows[current];
          const k = rowKeys[current];
          if (row === undefined || k === undefined) return;
          toggleRowSelection(k, row, current, event.shiftKey);
          return;
        }
        default:
          return;
      }
    },
    [
      activeRowIndex,
      focusRow,
      sortedRows,
      rowKeys,
      selectionMode,
      toggleRowSelection,
      onRowActivate,
    ]
  );

  useEffect(() => {
    if (activeRowIndex !== null && activeRowIndex >= sortedRows.length) {
      setActiveRowIndex(sortedRows.length === 0 ? null : sortedRows.length - 1);
    }
  }, [activeRowIndex, sortedRows.length]);

  const renderHeaderCell = (column: DataTableColumn<R>) => {
    const ariaSort: 'ascending' | 'descending' | 'none' | undefined =
      column.sortable
        ? sortState.columnId === column.id && sortState.direction === 'asc'
          ? 'ascending'
          : sortState.columnId === column.id && sortState.direction === 'desc'
            ? 'descending'
            : 'none'
        : undefined;
    return (
      <div
        key={column.id}
        role="columnheader"
        data-column-id={column.id}
        className={cx(
          headerCellRecipe({
            align: column.align ?? 'left',
            sortable: column.sortable ? true : undefined,
            sticky: column.sticky ? true : undefined,
          }),
          column.className
        )}
        aria-sort={ariaSort}
        aria-hidden={column.ariaHidden ? true : undefined}
        tabIndex={column.sortable ? 0 : undefined}
        onClick={
          column.sortable
            ? () => {
                handleSortClick(column);
              }
            : undefined
        }
        onKeyDown={
          column.sortable
            ? event => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  handleSortClick(column);
                }
              }
            : undefined
        }
      >
        <span className={headerCellInnerStyle}>
          <span>{column.header}</span>
          {renderSortIndicator(column)}
        </span>
        {resizableColumns && !column.disableResize && (
          <span
            className={resizeHandleStyle}
            role="separator"
            aria-orientation="vertical"
            aria-label={`Resize column ${column.id}`}
            onPointerDown={event => {
              event.preventDefault();
              event.stopPropagation();
              const startWidth =
                columnWidths[column.id] ??
                event.currentTarget.parentElement?.getBoundingClientRect()
                  .width ??
                100;
              beginResize(column.id, event.clientX, startWidth, column);
            }}
          />
        )}
      </div>
    );
  };

  const renderHeader = () => (
    <div
      role="row"
      aria-rowindex={1}
      className={headerStyle({ sticky: stickyHeader || undefined })}
    >
      {showSelectColumn && (
        <div
          role="columnheader"
          className={headerCellRecipe({ selectColumn: true, sticky: true })}
          aria-label="Select all rows"
        >
          <Checkbox
            checked={allSelectableSelected}
            indeterminate={someSelectableSelected}
            onChange={() => {
              toggleSelectAll();
            }}
            aria-label="Select all rows"
            size="sm"
          />
        </div>
      )}
      {columns.map(renderHeaderCell)}
    </div>
  );

  const renderCells = (row: R, rowIdx: number) =>
    columns.map(column => {
      const value = readCellValue(column, row, rowIdx);
      return (
        <div
          key={column.id}
          role="gridcell"
          className={cx(
            cellRecipe({
              align: column.align ?? 'left',
              sticky: column.sticky ? true : undefined,
            }),
            column.className
          )}
          data-column-id={column.id}
        >
          {column.cell
            ? column.cell({ value, row, rowIndex: rowIdx, column })
            : value === null || value === undefined
              ? ''
              : typeof value === 'string'
                ? value
                : typeof value === 'number' || typeof value === 'boolean'
                  ? String(value)
                  : JSON.stringify(value)}
        </div>
      );
    });

  const renderRowElement = (
    row: R,
    rowIdx: number,
    options: { virtualized?: boolean; transformY?: number } = {}
  ) => {
    const k = rowKeys[rowIdx] ?? `__row_${rowIdx}__`;
    const isSelected = selectedSet.has(k);
    const interactive = selectionMode === 'single' || onRowClick !== undefined;

    const cells = (
      <>
        {showSelectColumn && (
          <div
            role="gridcell"
            className={cellRecipe({ selectColumn: true, sticky: true })}
            onClickCapture={event => {
              selectionShiftKeyRef.current = event.shiftKey;
            }}
            onClick={event => {
              event.stopPropagation();
            }}
          >
            <Checkbox
              checked={isSelected}
              disabled={isRowSelectable ? !isRowSelectable(row, rowIdx) : false}
              onChange={() => {
                toggleRowSelection(
                  k,
                  row,
                  rowIdx,
                  selectionShiftKeyRef.current
                );
                selectionShiftKeyRef.current = false;
              }}
              aria-label={`Select row ${rowIdx + 1}`}
              size="sm"
            />
          </div>
        )}
        {renderCells(row, rowIdx)}
      </>
    );

    const handleRowClick = (event: React.MouseEvent<HTMLDivElement>) => {
      onRowClick?.(row, rowIdx, event);
      if (selectionMode === 'single') {
        toggleRowSelection(k, row, rowIdx);
      }
      setActiveRowIndex(rowIdx);
    };

    const handleRowDoubleClick = () => {
      onRowActivate?.(row, rowIdx);
    };

    const rowContent = renderRow
      ? renderRow({ row, rowIndex: rowIdx, selected: isSelected }, cells)
      : cells;

    const rowClassName = rowRecipe({
      virtualized: options.virtualized ? true : undefined,
      interactive: interactive ? true : undefined,
      selected: isSelected ? true : undefined,
      active: activeRowIndex === rowIdx ? true : undefined,
    });

    const rowStyle: React.CSSProperties | undefined =
      options.virtualized && options.transformY !== undefined
        ? { transform: `translateY(${options.transformY}px)` }
        : undefined;

    return (
      <div
        key={k}
        role="row"
        aria-rowindex={rowIdx + 2}
        aria-selected={selectionMode ? isSelected : undefined}
        data-row-key={k}
        data-row-index={rowIdx}
        data-row-interactive={interactive ? 'true' : undefined}
        className={rowClassName}
        style={rowStyle}
        onClick={interactive ? handleRowClick : undefined}
        onDoubleClick={onRowActivate ? handleRowDoubleClick : undefined}
      >
        {rowContent}
      </div>
    );
  };

  const renderSkeletonRows = () => {
    const rowsToRender = Array.from({ length: loadingRowCount }, (_, i) => i);
    const cellCount = columns.length + (showSelectColumn ? 1 : 0);
    return rowsToRender.map(idx => (
      <div
        key={`__skeleton_${idx}__`}
        className={skeletonRowStyle}
        aria-hidden="true"
      >
        {Array.from({ length: cellCount }, (_, ci) => (
          <div key={ci} className={skeletonCellStyle}>
            <span className={skeletonBarStyle} />
          </div>
        ))}
      </div>
    ));
  };

  const containerStyle: React.CSSProperties = {
    height: resolveDimension(height),
    ...(maxHeight !== undefined
      ? { maxHeight: resolveDimension(maxHeight) }
      : {}),
    ...style,
  };

  const isEmpty = !loading && sortedRows.length === 0;
  const totalColumnsCount = columns.length + (showSelectColumn ? 1 : 0);

  const gridVars = assignInlineVars({
    [gridTemplateColumnsVar]: tracks.template,
    [tableMinWidthVar]: `${tracks.minWidth}px`,
  });

  return (
    <div
      ref={ref}
      role="grid"
      aria-label={ariaLabel}
      aria-labelledby={ariaLabelledBy}
      aria-rowcount={sortedRows.length + 1}
      aria-colcount={totalColumnsCount}
      aria-multiselectable={selectionMode === 'multiple' ? true : undefined}
      data-testid={testId}
      data-density={density}
      tabIndex={0}
      className={cx(rootRecipe({ density }), className)}
      style={{ ...containerStyle, ...gridVars }}
      onKeyDown={handleKeyDown}
      {...rest}
    >
      <div ref={scrollContainerRef} className={scrollContainerStyle}>
        <div className={innerWrapperStyle}>
          {renderHeader()}
          {loading ? (
            <div className={bodyStyle}>{renderSkeletonRows()}</div>
          ) : isEmpty ? (
            <div className={bodyStyle}>
              <div className={emptyStateStyle} role="row">
                <div role="gridcell" aria-colspan={totalColumnsCount}>
                  {emptyState ?? 'No rows to display'}
                </div>
              </div>
            </div>
          ) : shouldVirtualize ? (
            <div
              className={virtualBodyStyle}
              style={assignInlineVars({
                [totalHeightVar]: `${totalSize}px`,
              })}
            >
              {virtualItems.map(item => {
                const row = sortedRows[item.index];
                if (row === undefined) return null;
                return renderRowElement(row, item.index, {
                  virtualized: true,
                  transformY: item.start,
                });
              })}
            </div>
          ) : (
            <div className={bodyStyle}>
              {sortedRows.map((row, rowIdx) => renderRowElement(row, rowIdx))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

DataTableInner.displayName = 'DataTable';

export const DataTable = DataTableInner as <R>(
  props: DataTableProps<R> & { ref?: React.Ref<HTMLDivElement> }
) => React.ReactElement;
