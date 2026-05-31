'use client';

import { useCallback, useMemo } from 'react';

import { useLatest } from '@/hooks';

import type { AssetItem, AssetRenameResult } from './AssetBrowser.types';
import type { AssetBrowserStore } from './AssetBrowserStore';

export interface UseAssetMutationsOptions {
  store: AssetBrowserStore;
  /** Displayed (filtered + sorted) list — used to resolve the focus-after-delete target. */
  displayed: readonly AssetItem[];
  /** Live selection set — delete/duplicate default to acting on it. */
  selection: ReadonlySet<string>;
  currentFolderId: string | undefined;
  onItemRename?: (item: AssetItem, newName: string) => AssetRenameResult;
  onItemsDelete?: (items: AssetItem[]) => void;
  onCreateFolder?: (parentFolderId: string | null) => void;
  onItemsDuplicate?: (items: AssetItem[]) => void;
}

export interface AssetMutationsApi {
  /** Whether each operation is enabled (its callback is present). */
  canRename: boolean;
  canDelete: boolean;
  canCreateFolder: boolean;
  canDuplicate: boolean;
  /** Enter inline-rename on `id` (no-op when rename is disabled). */
  beginRename: (id: string) => void;
  /**
   * Commit a rename. Returns whether the editor should close (`true`) or stay
   * open (`false`, e.g. the consumer rejected the name). Empty / unchanged
   * names close without firing the callback.
   */
  commitRename: (item: AssetItem, newName: string) => Promise<boolean>;
  /** Leave rename mode without committing. */
  cancelRename: () => void;
  /** Delete the given items (defaults to the current selection when omitted). */
  deleteItems: (items?: readonly AssetItem[]) => void;
  /** Create a folder in the current folder. */
  createFolder: () => void;
  /** Duplicate the given items (defaults to the current selection when omitted). */
  duplicateItems: (items?: readonly AssetItem[]) => void;
}

/**
 * Owns the mutation intents — inline rename (begin/commit/cancel), delete,
 * create-folder, duplicate — for `AssetBrowser`. AssetBrowser is presentational:
 * these report intent through the consumer's callbacks and never touch `items`.
 *
 * The "which cell is editing" flag lives in the store (so rename can be started
 * from the keyboard, a menu, or the imperative handle — all outside the cell);
 * the transient text buffer is local to the rename field. Every handler has a
 * stable identity (`useCallback`) and reads the latest props through `useLatest`
 * refs, matching `component-patterns.md` rules #3/#11.
 */
export function useAssetMutations(
  options: UseAssetMutationsOptions
): AssetMutationsApi {
  const { store } = options;

  const canRename = options.onItemRename !== undefined;
  const canDelete = options.onItemsDelete !== undefined;
  const canCreateFolder = options.onCreateFolder !== undefined;
  const canDuplicate = options.onItemsDuplicate !== undefined;

  const displayedRef = useLatest(options.displayed);
  const selectionRef = useLatest(options.selection);
  const currentFolderIdRef = useLatest(options.currentFolderId);
  const onItemRenameRef = useLatest(options.onItemRename);
  const onItemsDeleteRef = useLatest(options.onItemsDelete);
  const onCreateFolderRef = useLatest(options.onCreateFolder);
  const onItemsDuplicateRef = useLatest(options.onItemsDuplicate);

  /** Resolve the items an operation targets: the explicit arg, else the selection. */
  const resolveTargets = useCallback(
    (items?: readonly AssetItem[]): AssetItem[] => {
      if (items) return [...items];
      const sel = selectionRef.current;
      return displayedRef.current.filter(it => sel.has(it.id));
    },
    [displayedRef, selectionRef]
  );

  const beginRename = useCallback(
    (id: string): void => {
      if (onItemRenameRef.current === undefined) return;
      store.setFocusedId(id);
      store.setEditingId(id);
    },
    [store, onItemRenameRef]
  );

  const cancelRename = useCallback((): void => {
    store.setEditingId(null);
  }, [store]);

  const commitRename = useCallback(
    async (item: AssetItem, newName: string): Promise<boolean> => {
      const trimmed = newName.trim();
      const cb = onItemRenameRef.current;
      // Empty or unchanged → close silently without firing the callback.
      if (cb === undefined || trimmed === '' || trimmed === item.name) {
        store.setEditingId(null);
        return true;
      }
      const result = await cb(item, trimmed);
      // Only an explicit `false` keeps the editor open (rejected name).
      const accepted = result !== false;
      if (accepted) store.setEditingId(null);
      return accepted;
    },
    [store, onItemRenameRef]
  );

  const deleteItems = useCallback(
    (items?: readonly AssetItem[]): void => {
      const cb = onItemsDeleteRef.current;
      if (cb === undefined) return;
      const targets = resolveTargets(items);
      if (targets.length === 0) return;
      // Move roving focus to a survivor before the data updates, so focus
      // doesn't vanish when the deleted cells unmount.
      const list = displayedRef.current;
      const doomed = new Set(targets.map(it => it.id));
      const focusedId = store.getFocusedId();
      if (focusedId !== null && doomed.has(focusedId)) {
        const from = list.findIndex(it => it.id === focusedId);
        let survivor: string | null = null;
        for (let i = from + 1; i < list.length; i += 1) {
          const it = list[i];
          if (it && !doomed.has(it.id)) {
            survivor = it.id;
            break;
          }
        }
        if (survivor === null) {
          for (let i = from - 1; i >= 0; i -= 1) {
            const it = list[i];
            if (it && !doomed.has(it.id)) {
              survivor = it.id;
              break;
            }
          }
        }
        store.setFocusedId(survivor);
      }
      cb(targets);
    },
    [store, resolveTargets, displayedRef, onItemsDeleteRef]
  );

  const createFolder = useCallback((): void => {
    onCreateFolderRef.current?.(currentFolderIdRef.current ?? null);
  }, [onCreateFolderRef, currentFolderIdRef]);

  const duplicateItems = useCallback(
    (items?: readonly AssetItem[]): void => {
      const cb = onItemsDuplicateRef.current;
      if (cb === undefined) return;
      const targets = resolveTargets(items);
      if (targets.length === 0) return;
      cb(targets);
    },
    [resolveTargets, onItemsDuplicateRef]
  );

  return useMemo<AssetMutationsApi>(
    () => ({
      canRename,
      canDelete,
      canCreateFolder,
      canDuplicate,
      beginRename,
      commitRename,
      cancelRename,
      deleteItems,
      createFolder,
      duplicateItems,
    }),
    [
      canRename,
      canDelete,
      canCreateFolder,
      canDuplicate,
      beginRename,
      commitRename,
      cancelRename,
      deleteItems,
      createFolder,
      duplicateItems,
    ]
  );
}
