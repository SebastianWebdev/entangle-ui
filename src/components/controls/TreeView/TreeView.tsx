import React, { useCallback, useRef } from 'react';
import styled from '@emotion/styled';
import type { TreeViewProps, TreeNodeData } from './TreeView.types';
import { useTreeState } from './useTreeState';
import { TreeNodeComponent } from './TreeNode';

// --- Styled components ---

interface StyledTreeContainerProps {
  $maxHeight?: number | string;
}

const StyledTreeContainer = styled.div<StyledTreeContainerProps>`
  display: flex;
  flex-direction: column;
  ${props =>
    props.$maxHeight
      ? `max-height: ${typeof props.$maxHeight === 'number' ? `${props.$maxHeight}px` : props.$maxHeight}; overflow-y: auto;`
      : ''}
`;

const StyledEmptyState = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: ${props => props.theme.spacing.md}px;
  color: ${props => props.theme.colors.text.muted};
  font-size: ${props => props.theme.typography.fontSize.sm}px;
`;

/**
 * A hierarchical collapsible tree for displaying and managing nested data.
 *
 * Supports multi-selection, keyboard navigation, inline renaming,
 * and custom node rendering. The most iconic editor panel — scene hierarchy,
 * file browser, layer stack.
 *
 * @example
 * ```tsx
 * const nodes = [
 *   { id: '1', label: 'Root', children: [
 *     { id: '1.1', label: 'Child A' },
 *     { id: '1.2', label: 'Child B' },
 *   ]},
 * ];
 * <TreeView nodes={nodes} onSelectionChange={setSelected} />
 * ```
 */
export const TreeView = ({
  nodes,
  expandedIds,
  defaultExpandedIds,
  selectedIds,
  defaultSelectedIds,
  selectionMode = 'single',
  renamable = false,
  size = 'md',
  indent = 16,
  showChevrons = true,
  showGuideLines = false,
  expandOnSelect = false,
  maxHeight,
  renderNode,
  renderActions,
  emptyContent,
  onExpandedChange,
  onSelectionChange,
  onNodeClick,
  onNodeDoubleClick,
  onNodeContextMenu,
  onNodeRename,
  className,
  testId,
  ...rest
}: TreeViewProps) => {
  const treeRef = useRef<HTMLDivElement>(null);

  const {
    expandedSet,
    selectedSet,
    focusedId,
    visibleNodes,
    toggleExpand,
    select,
    setFocused,
    selectAll,
  } = useTreeState({
    nodes,
    expandedIds,
    defaultExpandedIds,
    selectedIds,
    defaultSelectedIds,
    selectionMode,
    expandOnSelect,
    onExpandedChange,
    onSelectionChange,
  });

  // Handle node click with selection logic
  const handleNodeClick = useCallback(
    (node: TreeNodeData, event: React.MouseEvent) => {
      if (node.disabled) return;

      setFocused(node.id);

      if (selectionMode !== 'none') {
        if (event.ctrlKey || event.metaKey) {
          select(node.id, 'toggle');
        } else if (event.shiftKey) {
          select(node.id, 'range');
        } else {
          select(node.id, 'replace');
        }
      }

      onNodeClick?.(node, event);
    },
    [selectionMode, select, setFocused, onNodeClick]
  );

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      const currentIdx = focusedId
        ? visibleNodes.findIndex(vn => vn.node.id === focusedId)
        : -1;
      const currentNode =
        currentIdx >= 0 ? visibleNodes[currentIdx] : undefined;

      switch (event.key) {
        case 'ArrowDown': {
          event.preventDefault();
          const nextIdx = currentIdx + 1;
          if (nextIdx < visibleNodes.length) {
            const nextNode = visibleNodes[nextIdx];
            if (nextNode) {
              setFocused(nextNode.node.id);
              if (event.shiftKey && selectionMode === 'multiple') {
                select(nextNode.node.id, 'range');
              }
            }
          }
          break;
        }
        case 'ArrowUp': {
          event.preventDefault();
          const prevIdx = currentIdx - 1;
          if (prevIdx >= 0) {
            const prevNode = visibleNodes[prevIdx];
            if (prevNode) {
              setFocused(prevNode.node.id);
              if (event.shiftKey && selectionMode === 'multiple') {
                select(prevNode.node.id, 'range');
              }
            }
          }
          break;
        }
        case 'ArrowRight': {
          event.preventDefault();
          if (currentNode) {
            const hasChildren =
              currentNode.node.children && currentNode.node.children.length > 0;
            if (hasChildren && !expandedSet.has(currentNode.node.id)) {
              toggleExpand(currentNode.node.id);
            } else if (hasChildren && expandedSet.has(currentNode.node.id)) {
              // Move to first child
              const nextIdx = currentIdx + 1;
              if (nextIdx < visibleNodes.length) {
                const nextNode = visibleNodes[nextIdx];
                if (nextNode) {
                  setFocused(nextNode.node.id);
                }
              }
            }
          }
          break;
        }
        case 'ArrowLeft': {
          event.preventDefault();
          if (currentNode) {
            const hasChildren =
              currentNode.node.children && currentNode.node.children.length > 0;
            if (hasChildren && expandedSet.has(currentNode.node.id)) {
              toggleExpand(currentNode.node.id);
            } else if (currentNode.parentId) {
              // Move to parent
              setFocused(currentNode.parentId);
            }
          }
          break;
        }
        case 'Home': {
          event.preventDefault();
          const firstNode = visibleNodes[0];
          if (firstNode) {
            setFocused(firstNode.node.id);
          }
          break;
        }
        case 'End': {
          event.preventDefault();
          const lastNode = visibleNodes[visibleNodes.length - 1];
          if (lastNode) {
            setFocused(lastNode.node.id);
          }
          break;
        }
        case 'Enter': {
          event.preventDefault();
          if (focusedId && selectionMode !== 'none') {
            select(focusedId, 'replace');
          }
          break;
        }
        case ' ': {
          event.preventDefault();
          if (focusedId) {
            if (selectionMode === 'multiple') {
              select(focusedId, 'toggle');
            } else if (selectionMode === 'single') {
              select(focusedId, 'replace');
            }
          }
          break;
        }
        case 'a': {
          if (event.ctrlKey || event.metaKey) {
            event.preventDefault();
            selectAll();
          }
          break;
        }
      }
    },
    [
      focusedId,
      visibleNodes,
      expandedSet,
      selectionMode,
      setFocused,
      select,
      toggleExpand,
      selectAll,
    ]
  );

  // Scroll focused node into view
  React.useEffect(() => {
    if (focusedId && treeRef.current) {
      const el = treeRef.current.querySelector(
        `#treenode-${CSS.escape(focusedId)}`
      );
      if (el && typeof el.scrollIntoView === 'function') {
        el.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [focusedId]);

  if (nodes.length === 0) {
    return (
      <StyledTreeContainer
        ref={treeRef}
        className={className}
        data-testid={testId}
        role="tree"
        aria-label="Empty tree"
        {...rest}
      >
        <StyledEmptyState>{emptyContent ?? 'No items'}</StyledEmptyState>
      </StyledTreeContainer>
    );
  }

  return (
    <StyledTreeContainer
      ref={treeRef}
      className={className}
      data-testid={testId}
      role="tree"
      aria-label="Tree"
      aria-multiselectable={selectionMode === 'multiple' ? true : undefined}
      aria-activedescendant={focusedId ? `treenode-${focusedId}` : undefined}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      $maxHeight={maxHeight}
      {...rest}
    >
      {visibleNodes.map((flatNode, idx) => {
        const { node, depth } = flatNode;
        return (
          <TreeNodeComponent
            key={node.id}
            node={node}
            depth={depth}
            size={size}
            indent={indent}
            isSelected={selectedSet.has(node.id)}
            isExpanded={expandedSet.has(node.id)}
            isFocused={focusedId === node.id}
            isFirst={idx === 0}
            isLast={idx === visibleNodes.length - 1}
            showChevrons={showChevrons}
            showGuideLines={showGuideLines}
            renamable={renamable}
            nodeId={node.id}
            renderNode={renderNode}
            renderActions={renderActions}
            onToggleExpand={toggleExpand}
            onClick={handleNodeClick}
            onDoubleClick={onNodeDoubleClick}
            onContextMenu={onNodeContextMenu}
            onRename={onNodeRename}
          />
        );
      })}
    </StyledTreeContainer>
  );
};

TreeView.displayName = 'TreeView';
