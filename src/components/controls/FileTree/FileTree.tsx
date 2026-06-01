'use client';

import React, { useCallback, useMemo, useRef } from 'react';

import { TreeView } from '@/components/controls/TreeView';
import {
  ArchiveIcon,
  CodeIcon,
  FileTextIcon,
  FolderIcon,
  FolderOpenIcon,
  ImageIcon,
  PlayIcon,
} from '@/components/Icons';
import { useMergedRef } from '@/hooks';
import { cx } from '@/utils/cx';

import { containerStyle, iconStyle, labelStyle } from './FileTree.css';
import { getFileIconKind } from './fileTreeIcons';
import { useFileTreeDrop } from './useFileTreeDrop';

import type {
  FileTreeNode,
  FileTreeNodeState,
  FileTreeProps,
} from './FileTree.types';
import type { FileIconKind } from './fileTreeIcons';
import type {
  TreeNodeData,
  TreeNodeState,
  TreeViewSize,
} from '@/components/controls/TreeView';

const ICON_PX: Record<TreeViewSize, number> = { sm: 12, md: 14, lg: 16 };

/** Renders a resolved {@link FileIconKind} into a themed icon element. */
function fileIconForKind(kind: FileIconKind, px: number): React.ReactElement {
  const color =
    kind === 'folder' || kind === 'folder-open' ? 'secondary' : 'muted';
  switch (kind) {
    case 'folder':
      return <FolderIcon size={px} color={color} decorative />;
    case 'folder-open':
      return <FolderOpenIcon size={px} color={color} decorative />;
    case 'image':
      return <ImageIcon size={px} color={color} decorative />;
    case 'media':
      return <PlayIcon size={px} color={color} decorative />;
    case 'code':
      return <CodeIcon size={px} color={color} decorative />;
    case 'archive':
      return <ArchiveIcon size={px} color={color} decorative />;
    case 'text':
    case 'file':
      return <FileTextIcon size={px} color={color} decorative />;
  }
}

/** Maps a FileTreeNode subtree to TreeView's node shape. */
function toTreeNode(node: FileTreeNode): TreeNodeData {
  return {
    id: node.id,
    label: node.name,
    children: node.children?.map(toTreeNode),
    disabled: node.disabled,
    // Folders accept dropped files; files do not (the field finally gets used).
    droppable: node.kind === 'folder',
    data: node.data,
  };
}

/**
 * A file-system-flavored specialization of {@link TreeView}: it maps a
 * file/folder model onto the tree, auto-assigns file-type icons (by extension)
 * and open/closed folder glyphs, and adds drag-and-drop import of OS files onto
 * a folder (or the root). Expansion, selection, keyboard navigation, and sizing
 * are inherited from TreeView unchanged.
 *
 * @example
 * ```tsx
 * const nodes: FileTreeNode[] = [
 *   { id: 'src', name: 'src', kind: 'folder', children: [
 *     { id: 'btn', name: 'Button.tsx', kind: 'file' },
 *     { id: 'logo', name: 'logo.svg', kind: 'file' },
 *   ]},
 * ];
 *
 * <FileTree
 *   nodes={nodes}
 *   defaultExpandedIds={['src']}
 *   onImport={({ files, targetFolder }) =>
 *     uploadInto(targetFolder?.id ?? 'root', files)
 *   }
 * />
 * ```
 */
export const FileTree = ({
  nodes,
  expandedIds,
  defaultExpandedIds,
  onExpandedChange,
  selectedIds,
  defaultSelectedIds,
  selectionMode = 'single',
  onSelectionChange,
  size = 'md',
  indent,
  showChevrons,
  showGuideLines,
  maxHeight,
  resolveIcon,
  renderNode,
  renderActions,
  emptyContent,
  onImport,
  onNodeClick,
  onNodeDoubleClick,
  onNodeContextMenu,
  className,
  style,
  testId,
  ref,
  ...rest
}: FileTreeProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const setContainerRef = useMergedRef(containerRef, ref);

  const treeNodes = useMemo(() => nodes.map(toTreeNode), [nodes]);

  // id → node and id → parent folder, used to resolve drop targets and to
  // recover the original FileTreeNode inside render / event callbacks.
  const { nodeById, parentFolderById } = useMemo(() => {
    const byId = new Map<string, FileTreeNode>();
    const parentById = new Map<string, FileTreeNode | null>();
    const walk = (list: FileTreeNode[], parent: FileTreeNode | null): void => {
      for (const node of list) {
        byId.set(node.id, node);
        parentById.set(node.id, parent);
        if (node.children) {
          walk(node.children, node.kind === 'folder' ? node : parent);
        }
      }
    };
    walk(nodes, null);
    return { nodeById: byId, parentFolderById: parentById };
  }, [nodes]);

  const dnd = useFileTreeDrop({ onImport, nodeById, parentFolderById });

  const iconPx = ICON_PX[size];

  const toFileState = useCallback(
    (state: TreeNodeState, node: FileTreeNode): FileTreeNodeState => ({
      ...state,
      isFolder: node.kind === 'folder',
    }),
    []
  );

  const renderTreeNode = useCallback(
    (treeNode: TreeNodeData, state: TreeNodeState): React.ReactNode => {
      const node = nodeById.get(treeNode.id);
      if (!node) return null;
      if (renderNode) return renderNode(node, toFileState(state, node));

      const overrideIcon = resolveIcon?.(node, { expanded: state.expanded });
      const icon =
        overrideIcon ??
        fileIconForKind(getFileIconKind(node, state.expanded), iconPx);

      return (
        <>
          <span className={iconStyle({ size })}>{icon}</span>
          <span className={labelStyle({ size })}>{node.name}</span>
        </>
      );
    },
    [nodeById, renderNode, resolveIcon, toFileState, iconPx, size]
  );

  const renderTreeActions = useMemo(() => {
    if (!renderActions) return undefined;
    return (treeNode: TreeNodeData, state: TreeNodeState): React.ReactNode => {
      const node = nodeById.get(treeNode.id);
      if (!node) return null;
      return renderActions(node, toFileState(state, node));
    };
  }, [renderActions, nodeById, toFileState]);

  const handleNodeClick = useMemo(() => {
    if (!onNodeClick) return undefined;
    return (treeNode: TreeNodeData, event: React.MouseEvent): void => {
      const node = nodeById.get(treeNode.id);
      if (node) onNodeClick(node, event);
    };
  }, [onNodeClick, nodeById]);

  const handleNodeDoubleClick = useMemo(() => {
    if (!onNodeDoubleClick) return undefined;
    return (treeNode: TreeNodeData, event: React.MouseEvent): void => {
      const node = nodeById.get(treeNode.id);
      if (node) onNodeDoubleClick(node, event);
    };
  }, [onNodeDoubleClick, nodeById]);

  const handleNodeContextMenu = useMemo(() => {
    if (!onNodeContextMenu) return undefined;
    return (treeNode: TreeNodeData, event: React.MouseEvent): void => {
      const node = nodeById.get(treeNode.id);
      if (node) onNodeContextMenu(node, event);
    };
  }, [onNodeContextMenu, nodeById]);

  return (
    <div
      ref={setContainerRef}
      className={cx(containerStyle, className)}
      style={style}
      data-testid={testId}
      data-root-active={dnd.enabled && dnd.rootActive ? 'true' : undefined}
      {...rest}
      onDragOver={dnd.enabled ? dnd.onRootDragOver : undefined}
      onDragLeave={dnd.enabled ? dnd.onRootDragLeave : undefined}
      onDrop={dnd.enabled ? dnd.onRootDrop : undefined}
    >
      <TreeView
        nodes={treeNodes}
        expandedIds={expandedIds}
        defaultExpandedIds={defaultExpandedIds}
        onExpandedChange={onExpandedChange}
        selectedIds={selectedIds}
        defaultSelectedIds={defaultSelectedIds}
        selectionMode={selectionMode}
        onSelectionChange={onSelectionChange}
        size={size}
        indent={indent}
        showChevrons={showChevrons}
        showGuideLines={showGuideLines}
        maxHeight={maxHeight}
        renderNode={renderTreeNode}
        renderActions={renderTreeActions}
        emptyContent={emptyContent}
        dropTargetId={dnd.enabled ? dnd.dropTargetId : undefined}
        onNodeClick={handleNodeClick}
        onNodeDoubleClick={handleNodeDoubleClick}
        onNodeContextMenu={handleNodeContextMenu}
        onNodeDragOver={dnd.enabled ? dnd.onNodeDragOver : undefined}
        onNodeDrop={dnd.enabled ? dnd.onNodeDrop : undefined}
      />
    </div>
  );
};

FileTree.displayName = 'FileTree';
