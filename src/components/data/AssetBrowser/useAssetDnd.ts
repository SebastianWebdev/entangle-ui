'use client';

import { useCallback, useMemo, type DragEvent } from 'react';
import { useLatest } from '@/hooks';
import type { AssetItem } from './AssetBrowser.types';
import type { AssetBrowserStore } from './AssetBrowserStore';
import type { AssetDndContext } from './AssetBrowserContext';

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

export function useAssetDnd(options: UseAssetDndOptions): AssetDndContext {
  const { store, mime } = options;
  const ref = useLatest(options);

  const internalEnabled = options.onItemsMove !== undefined;
  const externalEnabled = options.onFilesImport !== undefined;

  const resolveItems = useCallback(
    (ids: string[]): AssetItem[] => {
      const map = new Map(ref.current.items.map(item => [item.id, item]));
      return ids
        .map(id => map.get(id))
        .filter((item): item is AssetItem => item !== undefined);
    },
    [ref]
  );

  const onItemDragStart = useCallback(
    (item: AssetItem, event: DragEvent): void => {
      const { selection, getDragData, onItemDragStart: cb } = ref.current;
      const ids = selection.has(item.id) ? Array.from(selection) : [item.id];
      const dragged = resolveItems(ids);
      const payload = getDragData?.(dragged) ?? {
        [mime]: JSON.stringify(ids),
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
      cb?.(dragged, event);
    },
    [ref, mime, resolveItems, store]
  );

  const onItemDragEnd = useCallback(
    (item: AssetItem, event: DragEvent): void => {
      const ids = store.getDrag().draggingIds;
      const dragged = resolveItems(ids.length > 0 ? ids : [item.id]);
      store.clearDrag();
      ref.current.onItemDragEnd?.(dragged, event);
    },
    [ref, resolveItems, store]
  );

  const onFolderDragOver = useCallback(
    (folderId: string, event: DragEvent): void => {
      const drag = store.getDrag();
      const external = externalEnabled && hasFiles(event);
      const internal = internalEnabled && drag.active;
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
    [store, externalEnabled, internalEnabled]
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
      const { onItemsMove, onFilesImport } = ref.current;
      const files = Array.from(event.dataTransfer.files);
      if (files.length > 0 && onFilesImport) {
        onFilesImport({ files, targetFolderId: folderId });
      } else if (onItemsMove) {
        const drag = store.getDrag();
        let ids = drag.draggingIds;
        if (ids.length === 0) {
          const raw = event.dataTransfer.getData(mime);
          if (raw) {
            try {
              ids = JSON.parse(raw) as string[];
            } catch {
              ids = [];
            }
          }
        }
        if (ids.length > 0)
          onItemsMove({ itemIds: ids, targetFolderId: folderId });
      }
      store.clearDrag();
    },
    [ref, store, mime]
  );

  const onSurfaceDragOver = useCallback(
    (event: DragEvent): void => {
      if (!externalEnabled || !hasFiles(event)) return;
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
    [store, externalEnabled]
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
      if (!externalEnabled) return;
      const files = Array.from(event.dataTransfer.files);
      if (files.length === 0) {
        store.clearDrag();
        return;
      }
      event.preventDefault();
      ref.current.onFilesImport?.({
        files,
        targetFolderId: ref.current.currentFolderId ?? null,
      });
      store.clearDrag();
    },
    [ref, store, externalEnabled]
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
