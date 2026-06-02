'use client';

import { useCallback, useState } from 'react';

import { useLatest } from '@/hooks';

import type { FileTreeImportPayload, FileTreeNode } from './FileTree.types';
import type { TreeNodeData } from '@/components/controls/TreeView';
import type { DragEvent } from 'react';

export interface UseFileTreeDropOptions {
  /** Import callback. Drop wiring is inert while this is `undefined`. */
  onImport?: (payload: FileTreeImportPayload) => void;
  /** Node lookup by id (the original `FileTreeNode`, recovered from TreeView). */
  nodeById: ReadonlyMap<string, FileTreeNode>;
  /** Parent folder lookup by node id. `null` means the node lives at the root. */
  parentFolderById: ReadonlyMap<string, FileTreeNode | null>;
}

export interface UseFileTreeDropReturn {
  /** Whether import drop wiring is active (`onImport` provided). */
  enabled: boolean;
  /** Folder id to highlight as the drop target (drives TreeView `dropTargetId`). */
  dropTargetId: string | null;
  /** Whether the tree root (empty area) is the active drop target. */
  rootActive: boolean;
  /** Fired by TreeView on `dragover` over a node row. */
  onNodeDragOver: (node: TreeNodeData, event: DragEvent) => void;
  /** Fired by TreeView on `drop` onto a node row. */
  onNodeDrop: (node: TreeNodeData, event: DragEvent) => void;
  /** Container-level handlers for root / empty-area drops. */
  onRootDragOver: (event: DragEvent) => void;
  onRootDragLeave: (event: DragEvent) => void;
  onRootDrop: (event: DragEvent) => void;
}

/** True when the drag carries OS files (vs. a text/element drag). */
function hasFiles(event: DragEvent): boolean {
  return Array.from(event.dataTransfer.types).includes('Files');
}

/** True when the drag is leaving the element entirely (not into a descendant). */
function leftElement(event: DragEvent): boolean {
  const related = event.relatedTarget as Node | null;
  return !(related && event.currentTarget.contains(related));
}

function extractFiles(event: DragEvent): File[] {
  return Array.from(event.dataTransfer.files);
}

/**
 * External file-import drag-and-drop for FileTree. Per-node `dragover` resolves
 * (and highlights) the destination folder and stops propagation; the container
 * handles drops on empty space (→ root) and clears the highlight when the drag
 * leaves the tree, so there's no row-to-row flicker. All handlers have stable
 * identities and read the latest props through `useLatest` (patterns #3 / #11).
 */
export function useFileTreeDrop({
  onImport,
  nodeById,
  parentFolderById,
}: UseFileTreeDropOptions): UseFileTreeDropReturn {
  // `null` = no active target; otherwise the destination folder id (`null`
  // folderId = the tree root).
  const [target, setTarget] = useState<{ folderId: string | null } | null>(
    null
  );

  const onImportRef = useLatest(onImport);
  const nodeByIdRef = useLatest(nodeById);
  const parentFolderByIdRef = useLatest(parentFolderById);

  const enabled = onImport !== undefined;

  /** The folder a drop on `node` should target (a folder targets itself; a file
   * targets its parent folder, or the root). */
  const resolveTargetFolder = useCallback(
    (nodeId: string): FileTreeNode | null => {
      const node = nodeByIdRef.current.get(nodeId);
      if (node?.kind === 'folder') return node;
      return parentFolderByIdRef.current.get(nodeId) ?? null;
    },
    [nodeByIdRef, parentFolderByIdRef]
  );

  const setTargetFolder = useCallback((folderId: string | null) => {
    setTarget(prev =>
      prev !== null && prev.folderId === folderId ? prev : { folderId }
    );
  }, []);

  const clearTarget = useCallback(() => {
    setTarget(prev => (prev === null ? prev : null));
  }, []);

  const onNodeDragOver = useCallback(
    (node: TreeNodeData, event: DragEvent): void => {
      if (onImportRef.current === undefined || !hasFiles(event)) return;
      event.preventDefault();
      // Owned by the row — keep the container from re-targeting the root.
      event.stopPropagation();
      event.dataTransfer.dropEffect = 'copy';
      setTargetFolder(resolveTargetFolder(node.id)?.id ?? null);
    },
    [onImportRef, resolveTargetFolder, setTargetFolder]
  );

  const onNodeDrop = useCallback(
    (node: TreeNodeData, event: DragEvent): void => {
      const onImportCb = onImportRef.current;
      if (onImportCb === undefined) return;
      const files = extractFiles(event);
      if (files.length === 0) {
        clearTarget();
        return;
      }
      event.preventDefault();
      event.stopPropagation();
      onImportCb({ files, targetFolder: resolveTargetFolder(node.id) });
      clearTarget();
    },
    [onImportRef, resolveTargetFolder, clearTarget]
  );

  const onRootDragOver = useCallback(
    (event: DragEvent): void => {
      if (onImportRef.current === undefined || !hasFiles(event)) return;
      event.preventDefault();
      event.dataTransfer.dropEffect = 'copy';
      setTargetFolder(null);
    },
    [onImportRef, setTargetFolder]
  );

  const onRootDragLeave = useCallback(
    (event: DragEvent): void => {
      if (!leftElement(event)) return;
      clearTarget();
    },
    [clearTarget]
  );

  const onRootDrop = useCallback(
    (event: DragEvent): void => {
      const onImportCb = onImportRef.current;
      if (onImportCb === undefined) return;
      const files = extractFiles(event);
      if (files.length === 0) {
        clearTarget();
        return;
      }
      event.preventDefault();
      onImportCb({ files, targetFolder: null });
      clearTarget();
    },
    [onImportRef, clearTarget]
  );

  return {
    enabled,
    dropTargetId: target?.folderId ?? null,
    rootActive: target !== null && target.folderId === null,
    onNodeDragOver,
    onNodeDrop,
    onRootDragOver,
    onRootDragLeave,
    onRootDrop,
  };
}
