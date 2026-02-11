import React, { useState, useRef, useCallback } from 'react';
import { assignInlineVars } from '@vanilla-extract/dynamic';
import type {
  TreeNodeData,
  TreeNodeState,
  TreeViewSize,
} from './TreeView.types';
import {
  rowRecipe,
  chevronRecipe,
  iconRecipe,
  labelRecipe,
  actionsStyle,
  renameInputRecipe,
  guideLineStyle,
  paddingLeftVar,
  guideLineLeftVar,
} from './TreeNode.css';

// --- Size configurations ---

const sizeConfig: Record<
  TreeViewSize,
  {
    rowHeight: number;
    chevronSize: number;
    iconSize: number;
    fontSizeKey: 'xs' | 'sm' | 'md' | 'lg';
    defaultIndent: number;
  }
> = {
  sm: {
    rowHeight: 20,
    chevronSize: 10,
    iconSize: 12,
    fontSizeKey: 'md',
    defaultIndent: 12,
  },
  md: {
    rowHeight: 24,
    chevronSize: 12,
    iconSize: 14,
    fontSizeKey: 'md',
    defaultIndent: 16,
  },
  lg: {
    rowHeight: 32,
    chevronSize: 14,
    iconSize: 16,
    fontSizeKey: 'lg',
    defaultIndent: 20,
  },
};

// --- Chevron icon SVG ---

const ChevronSvg = ({ size }: { size: number }) => (
  <svg width={size} height={size} viewBox="0 0 12 12" fill="none">
    <path
      d="M4.5 2.5L8 6L4.5 9.5"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

// --- TreeNode component ---

export interface TreeNodeComponentProps {
  node: TreeNodeData;
  depth: number;
  size: TreeViewSize;
  indent: number;
  isSelected: boolean;
  isExpanded: boolean;
  isFocused: boolean;
  isFirst: boolean;
  isLast: boolean;
  showChevrons: boolean;
  showGuideLines: boolean;
  renamable: boolean;
  nodeId: string;
  renderNode?: (node: TreeNodeData, state: TreeNodeState) => React.ReactNode;
  renderActions?: (node: TreeNodeData, state: TreeNodeState) => React.ReactNode;
  onToggleExpand: (id: string) => void;
  onClick: (node: TreeNodeData, event: React.MouseEvent) => void;
  onDoubleClick?: (node: TreeNodeData, event: React.MouseEvent) => void;
  onContextMenu?: (node: TreeNodeData, event: React.MouseEvent) => void;
  onRename?: (nodeId: string, newLabel: string) => void;
}

export const TreeNodeComponent = ({
  node,
  depth,
  size,
  indent,
  isSelected,
  isExpanded,
  isFocused,
  isFirst,
  isLast,
  showChevrons,
  showGuideLines,
  renamable,
  nodeId,
  renderNode,
  renderActions,
  onToggleExpand,
  onClick,
  onDoubleClick,
  onContextMenu,
  onRename,
}: TreeNodeComponentProps) => {
  const [isRenaming, setIsRenaming] = useState(false);
  const [renameValue, setRenameValue] = useState(node.label);
  const renameInputRef = useRef<HTMLInputElement>(null);

  const isLeaf = !node.children || node.children.length === 0;
  const config = sizeConfig[size];

  const state: TreeNodeState = {
    selected: isSelected,
    expanded: isExpanded,
    focused: isFocused,
    depth,
    isLeaf,
    isFirst,
    isLast,
  };

  const handleChevronClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      if (!node.disabled && !isLeaf) {
        onToggleExpand(node.id);
      }
    },
    [node.id, node.disabled, isLeaf, onToggleExpand]
  );

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      if (node.disabled || isRenaming) return;
      onClick(node, e);
    },
    [node, isRenaming, onClick]
  );

  const handleDoubleClick = useCallback(
    (e: React.MouseEvent) => {
      if (node.disabled) return;

      // Start rename if renamable
      if (renamable && node.renamable !== false) {
        setIsRenaming(true);
        setRenameValue(node.label);
        setTimeout(() => {
          renameInputRef.current?.focus();
          renameInputRef.current?.select();
        }, 0);
        return;
      }

      onDoubleClick?.(node, e);
    },
    [node, renamable, onDoubleClick]
  );

  const handleContextMenu = useCallback(
    (e: React.MouseEvent) => {
      onContextMenu?.(node, e);
    },
    [node, onContextMenu]
  );

  const confirmRename = useCallback(() => {
    if (renameValue.trim() && renameValue !== node.label) {
      onRename?.(node.id, renameValue.trim());
    }
    setIsRenaming(false);
  }, [renameValue, node.id, node.label, onRename]);

  const cancelRename = useCallback(() => {
    setRenameValue(node.label);
    setIsRenaming(false);
  }, [node.label]);

  const handleRenameKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        confirmRename();
      } else if (e.key === 'Escape') {
        cancelRename();
      }
    },
    [confirmRename, cancelRename]
  );

  // Guide lines for each parent level
  const guideLines =
    showGuideLines && depth > 0
      ? Array.from({ length: depth }, (_, i) => (
          <span
            key={i}
            className={guideLineStyle}
            style={assignInlineVars({
              [guideLineLeftVar]: `${i * indent + config.defaultIndent / 2}px`,
            })}
          />
        ))
      : null;

  return (
    <div
      id={`treenode-${nodeId}`}
      role="treeitem"
      aria-expanded={isLeaf ? undefined : isExpanded}
      aria-selected={isSelected}
      aria-disabled={node.disabled ?? undefined}
      aria-level={depth + 1}
      className={rowRecipe({
        size,
        selected: isSelected,
        focused: isFocused,
        disabled: node.disabled ?? false,
      })}
      style={assignInlineVars({
        [paddingLeftVar]: `${depth * indent}px`,
      })}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      onContextMenu={handleContextMenu}
      tabIndex={-1}
    >
      {guideLines}

      {/* Chevron */}
      {showChevrons && (
        <span
          className={chevronRecipe({
            expanded: isExpanded,
            size,
            visible: !isLeaf,
          })}
          onClick={handleChevronClick}
          aria-hidden="true"
        >
          <ChevronSvg size={config.chevronSize} />
        </span>
      )}

      {/* Content */}
      {renderNode ? (
        renderNode(node, state)
      ) : (
        <>
          {node.icon && <span className={iconRecipe({ size })}>{node.icon}</span>}
          {isRenaming ? (
            <input
              ref={renameInputRef}
              className={renameInputRecipe({ size })}
              value={renameValue}
              onChange={e => setRenameValue(e.target.value)}
              onKeyDown={handleRenameKeyDown}
              onBlur={confirmRename}
              aria-label={`Rename ${node.label}`}
              onClick={e => e.stopPropagation()}
            />
          ) : (
            <span className={labelRecipe({ size })}>{node.label}</span>
          )}
        </>
      )}

      {/* Actions */}
      {renderActions && (
        <span className={actionsStyle} onClick={e => e.stopPropagation()}>
          {renderActions(node, state)}
        </span>
      )}
    </div>
  );
};

TreeNodeComponent.displayName = 'TreeNode';
