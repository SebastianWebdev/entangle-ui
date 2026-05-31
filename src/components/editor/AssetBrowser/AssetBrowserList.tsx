'use client';

import React, { useMemo } from 'react';

import { DataTable } from '@/components/data/DataTable';
import { FileTextIcon, FolderIcon } from '@/components/Icons';
import { Icon } from '@/components/primitives/Icon';

import { listScroller, nameCell } from './AssetBrowser.css';
import {
  useAssetBrowserChrome,
  useAssetBrowserContext,
  useAssetSelection,
} from './AssetBrowserContext';
import { formatBytes, formatDate } from './assetBrowserFormat';

import type { AssetItem } from './AssetBrowser.types';
import type { AssetBrowserLabels } from './assetBrowserLabels';
import type {
  DataTableColumn,
  DataTableSortState,
} from '@/components/data/DataTable';

/**
 * Default name/type/size/modified columns, built from the resolved labels so
 * the headers and the folder "Type" value follow the `labels` prop.
 */
function buildDefaultColumns(
  labels: AssetBrowserLabels
): readonly DataTableColumn<AssetItem>[] {
  return [
    {
      id: 'name',
      header: labels.sortFields.name,
      accessor: 'name',
      sortable: true,
      sticky: true,
      minWidth: 160,
      cell: ({ row }) => (
        <span className={nameCell}>
          <Icon size="sm" color="muted" decorative>
            {row.kind === 'folder' ? <FolderIcon /> : <FileTextIcon />}
          </Icon>
          <span>{row.name}</span>
        </span>
      ),
    },
    {
      id: 'type',
      header: labels.sortFields.type,
      sortable: true,
      width: 120,
      accessor: row =>
        row.kind === 'folder' ? labels.folder : (row.assetType ?? ''),
    },
    {
      id: 'size',
      header: labels.sortFields.size,
      sortable: true,
      align: 'right',
      width: 100,
      accessor: 'size',
      cell: ({ row }) => (row.kind === 'folder' ? '—' : formatBytes(row.size)),
    },
    {
      id: 'modified',
      header: labels.sortFields.modified,
      sortable: true,
      align: 'right',
      width: 140,
      accessor: 'modifiedAt',
      cell: ({ row }) => formatDate(row.modifiedAt),
    },
  ];
}

export function AssetBrowserList(): React.ReactElement {
  const ctx = useAssetBrowserContext();
  const chrome = useAssetBrowserChrome();
  const selectionSet = useAssetSelection();

  const defaultColumns = useMemo(
    () => buildDefaultColumns(ctx.labels),
    [ctx.labels]
  );
  const columns = ctx.columns ?? defaultColumns;

  // We own sorting (rows arrive already shaped); DataTable only reflects the
  // indicator and reports the next desired sort.
  const sort: DataTableSortState = {
    columnId: chrome.sort.field,
    direction: chrome.sort.direction,
  };

  const selection = useMemo(() => Array.from(selectionSet), [selectionSet]);

  return (
    <div className={listScroller}>
      <DataTable<AssetItem>
        rows={ctx.displayedItems}
        columns={columns}
        rowKey="id"
        density={ctx.density}
        height="100%"
        sort={sort}
        manualSort
        onSortChange={next => {
          if (!next.columnId || !next.direction) {
            chrome.setSort({ field: 'name', direction: 'asc' });
            return;
          }
          chrome.setSort({ field: next.columnId, direction: next.direction });
        }}
        selectionMode={ctx.selectionMode}
        selection={selection}
        onSelectionChange={ids => {
          ctx.setSelectionIds(ids, 'click');
        }}
        isRowSelectable={row =>
          row.selectable !== false && row.disabled !== true
        }
        onRowActivate={row => {
          ctx.activateItem(row);
        }}
        emptyState={ctx.emptyState}
        loading={ctx.loading}
        aria-label="Assets"
      />
    </div>
  );
}
