'use client';

import { useCallback, useMemo } from 'react';

import { useLatest } from '@/hooks';

import type { AssetItem } from './AssetBrowser.types';
import type { AssetDndContext } from './AssetBrowserContext';
import type { AssetBrowserStore } from './AssetBrowserStore';
import type { DragEvent } from 'react';

export interface UseAssetDndOptions {
  store: AssetBrowserStore;
  mime: string;
  items: readonly AssetItem[];
  selection: ReadonlySet<string>;
  currentFolderId: string | undefined;
  getDragData?: (items: AssetItem[]) => Record<string, string>;
  onItemDragStart?: (items: AssetItem[], event: DragEvent) => void;
  onItemDragEnd?: (items: AssetItem[], event: DragEvent) => void;
  onItemsMove?: (payload: {
    itemIds: string[];
    targetFolderId: string;
  }) => void;
  onFilesImport?: (payload: {
    files: File[];
    targetFolderId: string | null;
  }) => void;
}

function hasFiles(event: DragEvent): boolean {
  return Array.from(event.dataTransfer.types).includes('Files');
}

/** True when the drag is leaving the element entirely (not into a child). */
function leftElement(event: DragEvent): boolean {
  const related = event.relatedTarget as Node | null;
  return !(related && event.currentTarget.contains(related));
}

/**
 * Drag-and-drop wiring for the AssetBrowser: internal item moves (gated by
 * `onItemsMove`) and external file import (gated by `onFilesImport`). Every
 * handler has a stable identity (`useCallback`) and reads the latest props
 * through `useLatest` refs, matching `component-patterns.md` rules #3/#11.
 */
export function useAssetDnd(options: UseAssetDndOptions): AssetDndContext {
  const {
    store,
    mime,
    items,
    selection,
    currentFolderId,
    getDragData,
    onItemDragStart: cbItemDragStart,
    onItemDragEnd: cbItemDragEnd,
    onItemsMove,
    onFilesImport,
  } = options;

  const internalEnabled = onItemsMove !== undefined;
  const externalEnabled = onFilesImport !== undefined;

  const mimeRef = useLatest(mime);
  const itemsRef = useLatest(items);
  const selectionRef = useLatest(selection);
  const currentFolderIdRef = useLatest(currentFolderId);
  const getDragDataRef = useLatest(getDragData);
  const cbItemDragStartRef = useLatest(cbItemDragStart);
  const cbItemDragEndRef = useLatest(cbItemDragEnd);
  const onItemsMoveRef = useLatest(onItemsMove);
  const onFilesImportRef = useLatest(onFilesImport);

  const resolveItems = useCallback(
    (ids: string[]): AssetItem[] => {
      const map = new Map(itemsRef.current.map(item => [item.id, item]));
      return ids
        .map(id => map.get(id))
        .filter((item): item is AssetItem => item !== undefined);
    },
    [itemsRef]
  );

  const onItemDragStart = useCallback(
    (item: AssetItem, event: DragEvent): void => {
      const sel = selectionRef.current;
      const ids = sel.has(item.id) ? Array.from(sel) : [item.id];
      const dragged = resolveItems(ids);
      const payload = getDragDataRef.current?.(dragged) ?? {
        [mimeRef.current]: JSON.stringify(ids),
      };
      for (const [type, value] of Object.entries(payload)) {
        event.dataTransfer.setData(type, value);
      }
      event.dataTransfer.effectAllowed = 'copyMove';
      store.setDrag({
        active: true,
        draggingIds: ids,
        dropTargetId: null,
        externalOver: false,
      });
      cbItemDragStartRef.current?.(dragged, event);
    },
    [
      store,
      resolveItems,
      selectionRef,
      getDragDataRef,
      mimeRef,
      cbItemDragStartRef,
    ]
  );

  const onItemDragEnd = useCallback(
    (item: AssetItem, event: DragEvent): void => {
      const ids = store.getDrag().draggingIds;
      const dragged = resolveItems(ids.length > 0 ? ids : [item.id]);
      store.clearDrag();
      cbItemDragEndRef.current?.(dragged, event);
    },
    [store, resolveItems, cbItemDragEndRef]
  );

  const onFolderDragOver = useCallback(
    (folderId: string, event: DragEvent): void => {
      const drag = store.getDrag();
      const external =
        onFilesImportRef.current !== undefined && hasFiles(event);
      const internal = onItemsMoveRef.current !== undefined && drag.active;
      if (!external && !internal) return;
      event.preventDefault();
      event.dataTransfer.dropEffect = external ? 'copy' : 'move';
      store.setDrag({
        active: true,
        draggingIds: drag.draggingIds,
        dropTargetId: folderId,
        externalOver: external,
      });
    },
    [store, onFilesImportRef, onItemsMoveRef]
  );

  const onFolderDragLeave = useCallback(
    (folderId: string, event: DragEvent): void => {
      if (!leftElement(event)) return;
      const drag = store.getDrag();
      if (drag.dropTargetId !== folderId) return;
      store.setDrag({ ...drag, dropTargetId: null });
    },
    [store]
  );

  const onFolderDrop = useCallback(
    (folderId: string, event: DragEvent): void => {
      event.preventDefault();
      const files = Array.from(event.dataTransfer.files);
      const filesImport = onFilesImportRef.current;
      const itemsMove = onItemsMoveRef.current;
      if (files.length > 0 && filesImport) {
        filesImport({ files, targetFolderId: folderId });
      } else if (itemsMove) {
        const drag = store.getDrag();
        let ids = drag.draggingIds;
        if (ids.length === 0) {
          const raw = event.dataTransfer.getData(mimeRef.current);
          if (raw) {
            try {
              ids = JSON.parse(raw) as string[];
            } catch {
              ids = [];
            }
          }
        }
        if (ids.length > 0) {
          itemsMove({ itemIds: ids, targetFolderId: folderId });
        }
      }
      store.clearDrag();
    },
    [store, onFilesImportRef, onItemsMoveRef, mimeRef]
  );

  const onSurfaceDragOver = useCallback(
    (event: DragEvent): void => {
      if (onFilesImportRef.current === undefined || !hasFiles(event)) return;
      event.preventDefault();
      event.dataTransfer.dropEffect = 'copy';
      const drag = store.getDrag();
      store.setDrag({
        active: true,
        draggingIds: drag.draggingIds,
        dropTargetId: null,
        externalOver: true,
      });
    },
    [store, onFilesImportRef]
  );

  const onSurfaceDragLeave = useCallback(
    (event: DragEvent): void => {
      if (!leftElement(event)) return;
      const drag = store.getDrag();
      if (!drag.externalOver) return;
      store.setDrag({ ...drag, externalOver: false });
    },
    [store]
  );

  const onSurfaceDrop = useCallback(
    (event: DragEvent): void => {
      const filesImport = onFilesImportRef.current;
      if (!filesImport) return;
      const files = Array.from(event.dataTransfer.files);
      if (files.length === 0) {
        store.clearDrag();
        return;
      }
      event.preventDefault();
      filesImport({
        files,
        targetFolderId: currentFolderIdRef.current ?? null,
      });
      store.clearDrag();
    },
    [store, onFilesImportRef, currentFolderIdRef]
  );

  return useMemo<AssetDndContext>(
    () => ({
      internalEnabled,
      externalEnabled,
      onItemDragStart,
      onItemDragEnd,
      onFolderDragOver,
      onFolderDragLeave,
      onFolderDrop,
      onSurfaceDragOver,
      onSurfaceDragLeave,
      onSurfaceDrop,
    }),
    [
      internalEnabled,
      externalEnabled,
      onItemDragStart,
      onItemDragEnd,
      onFolderDragOver,
      onFolderDragLeave,
      onFolderDrop,
      onSurfaceDragOver,
      onSurfaceDragLeave,
      onSurfaceDrop,
    ]
  );
}
