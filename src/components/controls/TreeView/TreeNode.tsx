import React, { useState, useRef, useCallback } from 'react';
import styled from '@emotion/styled';
import type {
  TreeNodeData,
  TreeNodeState,
  TreeViewSize,
} from './TreeView.types';

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

// --- Styled components ---

interface StyledRowProps {
  $size: TreeViewSize;
  $selected: boolean;
  $focused: boolean;
  $disabled: boolean;
  $depth: number;
  $indent: number;
}

const StyledRow = styled.div<StyledRowProps>`
  display: flex;
  align-items: center;
  height: ${props => sizeConfig[props.$size].rowHeight}px;
  padding-left: ${props => props.$depth * props.$indent}px;
  padding-right: ${props => props.theme.spacing.xs}px;
  cursor: ${props => (props.$disabled ? 'default' : 'pointer')};
  user-select: none;
  opacity: ${props => (props.$disabled ? 0.5 : 1)};
  position: relative;

  background: ${props =>
    props.$selected ? `${props.theme.colors.accent.primary}26` : 'transparent'};

  ${props =>
    props.$focused &&
    !props.$selected &&
    `box-shadow: inset 0 0 0 1px ${props.theme.colors.border.focus};`}

  &:hover {
    background: ${props =>
      props.$selected
        ? `${props.theme.colors.accent.primary}33`
        : props.theme.colors.surface.hover};
  }
`;

interface StyledChevronProps {
  $expanded: boolean;
  $size: TreeViewSize;
  $visible: boolean;
}

const StyledChevron = styled.span<StyledChevronProps>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: ${props => sizeConfig[props.$size].chevronSize + 4}px;
  height: ${props => sizeConfig[props.$size].chevronSize + 4}px;
  flex-shrink: 0;
  visibility: ${props => (props.$visible ? 'visible' : 'hidden')};
  transition: transform ${props => props.theme.transitions.fast};
  transform: rotate(${props => (props.$expanded ? '90deg' : '0deg')});
  color: ${props => props.theme.colors.text.muted};

  &:hover {
    color: ${props => props.theme.colors.text.primary};
  }
`;

const StyledIcon = styled.span<{ $size: TreeViewSize }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: ${props => sizeConfig[props.$size].iconSize}px;
  height: ${props => sizeConfig[props.$size].iconSize}px;
  flex-shrink: 0;
  margin-right: ${props => props.theme.spacing.xs}px;
  color: ${props => props.theme.colors.text.secondary};
`;

const StyledLabel = styled.span<{ $size: TreeViewSize }>`
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: ${props =>
    props.theme.typography.fontSize[sizeConfig[props.$size].fontSizeKey]}px;
  color: ${props => props.theme.colors.text.primary};
  line-height: ${props => props.theme.typography.lineHeight.normal};
`;

const StyledActions = styled.span`
  display: flex;
  align-items: center;
  gap: 2px;
  margin-left: auto;
  flex-shrink: 0;
`;

const StyledRenameInput = styled.input<{ $size: TreeViewSize }>`
  flex: 1;
  min-width: 0;
  border: 1px solid ${props => props.theme.colors.border.focus};
  border-radius: ${props => props.theme.borderRadius.sm}px;
  background: ${props => props.theme.colors.surface.default};
  color: ${props => props.theme.colors.text.primary};
  font-size: ${props =>
    props.theme.typography.fontSize[sizeConfig[props.$size].fontSizeKey]}px;
  padding: 0 4px;
  outline: none;
  height: ${props => sizeConfig[props.$size].rowHeight - 4}px;
`;

// --- Guide line styled component ---

interface StyledGuideLineProps {
  $left: number;
  $size: TreeViewSize;
}

const StyledGuideLine = styled.span<StyledGuideLineProps>`
  position: absolute;
  left: ${props => props.$left + sizeConfig[props.$size].defaultIndent / 2}px;
  top: 0;
  bottom: 0;
  width: 1px;
  background: ${props => props.theme.colors.border.default}4D;
  pointer-events: none;
`;

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
          <StyledGuideLine key={i} $left={i * indent} $size={size} />
        ))
      : null;

  return (
    <StyledRow
      id={`treenode-${nodeId}`}
      role="treeitem"
      aria-expanded={isLeaf ? undefined : isExpanded}
      aria-selected={isSelected}
      aria-disabled={node.disabled ?? undefined}
      aria-level={depth + 1}
      $size={size}
      $selected={isSelected}
      $focused={isFocused}
      $disabled={node.disabled ?? false}
      $depth={depth}
      $indent={indent}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      onContextMenu={handleContextMenu}
      tabIndex={-1}
    >
      {guideLines}

      {/* Chevron */}
      {showChevrons && (
        <StyledChevron
          $expanded={isExpanded}
          $size={size}
          $visible={!isLeaf}
          onClick={handleChevronClick}
          aria-hidden="true"
        >
          <ChevronSvg size={config.chevronSize} />
        </StyledChevron>
      )}

      {/* Content */}
      {renderNode ? (
        renderNode(node, state)
      ) : (
        <>
          {node.icon && <StyledIcon $size={size}>{node.icon}</StyledIcon>}
          {isRenaming ? (
            <StyledRenameInput
              ref={renameInputRef}
              $size={size}
              value={renameValue}
              onChange={e => setRenameValue(e.target.value)}
              onKeyDown={handleRenameKeyDown}
              onBlur={confirmRename}
              aria-label={`Rename ${node.label}`}
              onClick={e => e.stopPropagation()}
            />
          ) : (
            <StyledLabel $size={size}>{node.label}</StyledLabel>
          )}
        </>
      )}

      {/* Actions */}
      {renderActions && (
        <StyledActions onClick={e => e.stopPropagation()}>
          {renderActions(node, state)}
        </StyledActions>
      )}
    </StyledRow>
  );
};

TreeNodeComponent.displayName = 'TreeNode';
