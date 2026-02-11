'use client';

import { useState, useMemo, useCallback } from 'react';
import type { TreeNodeData, TreeSelectionMode } from './TreeView.types';

interface FlatNode {
  node: TreeNodeData;
  depth: number;
  parentId: string | null;
}

interface UseTreeStateOptions {
  nodes: TreeNodeData[];
  expandedIds?: string[];
  defaultExpandedIds?: string[];
  selectedIds?: string[];
  defaultSelectedIds?: string[];
  selectionMode: TreeSelectionMode;
  expandOnSelect?: boolean;
  onExpandedChange?: (expandedIds: string[]) => void;
  onSelectionChange?: (selectedIds: string[]) => void;
}

export interface UseTreeStateReturn {
  expandedSet: Set<string>;
  selectedSet: Set<string>;
  focusedId: string | null;
  visibleNodes: FlatNode[];
  toggleExpand: (id: string) => void;
  select: (id: string, mode: 'replace' | 'toggle' | 'range') => void;
  setFocused: (id: string | null) => void;
  selectAll: () => void;
}

/**
 * Flatten tree into a list of visible nodes, respecting expansion state.
 */
function flattenTree(
  nodes: TreeNodeData[],
  expandedSet: Set<string>,
  depth: number = 0,
  parentId: string | null = null
): FlatNode[] {
  const result: FlatNode[] = [];
  for (const node of nodes) {
    result.push({ node, depth, parentId });
    if (node.children && node.children.length > 0 && expandedSet.has(node.id)) {
      result.push(
        ...flattenTree(node.children, expandedSet, depth + 1, node.id)
      );
    }
  }
  return result;
}

/**
 * Collect all node IDs from a tree for "expand all" or "select all".
 */
function collectAllIds(nodes: TreeNodeData[]): string[] {
  const ids: string[] = [];
  for (const node of nodes) {
    ids.push(node.id);
    if (node.children) {
      ids.push(...collectAllIds(node.children));
    }
  }
  return ids;
}

export function useTreeState({
  nodes,
  expandedIds: controlledExpanded,
  defaultExpandedIds,
  selectedIds: controlledSelected,
  defaultSelectedIds,
  selectionMode,
  expandOnSelect = false,
  onExpandedChange,
  onSelectionChange,
}: UseTreeStateOptions): UseTreeStateReturn {
  // Internal expansion state
  const [internalExpanded, setInternalExpanded] = useState<Set<string>>(
    () => new Set(defaultExpandedIds ?? [])
  );
  const expandedSet = controlledExpanded
    ? new Set(controlledExpanded)
    : internalExpanded;

  // Internal selection state
  const [internalSelected, setInternalSelected] = useState<Set<string>>(
    () => new Set(defaultSelectedIds ?? [])
  );
  const selectedSet = controlledSelected
    ? new Set(controlledSelected)
    : internalSelected;

  // Focused node
  const [focusedId, setFocused] = useState<string | null>(null);

  // Flatten visible nodes
  const visibleNodes = useMemo(
    () => flattenTree(nodes, expandedSet),
    [nodes, expandedSet]
  );

  // Toggle expansion
  const toggleExpand = useCallback(
    (id: string) => {
      const next = new Set(expandedSet);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      if (controlledExpanded === undefined) {
        setInternalExpanded(next);
      }
      onExpandedChange?.([...next]);
    },
    [expandedSet, controlledExpanded, onExpandedChange]
  );

  // Selection
  const select = useCallback(
    (id: string, mode: 'replace' | 'toggle' | 'range') => {
      if (selectionMode === 'none') return;

      let next: Set<string>;

      if (selectionMode === 'single') {
        next = new Set([id]);
      } else {
        // multiple mode
        if (mode === 'replace') {
          next = new Set([id]);
        } else if (mode === 'toggle') {
          next = new Set(selectedSet);
          if (next.has(id)) {
            next.delete(id);
          } else {
            next.add(id);
          }
        } else {
          // range — select from last selected to this id
          const visibleIds = visibleNodes.map(vn => vn.node.id);
          const lastSelected = [...selectedSet].pop();
          if (!lastSelected) {
            next = new Set([id]);
          } else {
            const startIdx = visibleIds.indexOf(lastSelected);
            const endIdx = visibleIds.indexOf(id);
            if (startIdx === -1 || endIdx === -1) {
              next = new Set([id]);
            } else {
              const from = Math.min(startIdx, endIdx);
              const to = Math.max(startIdx, endIdx);
              next = new Set(selectedSet);
              for (let i = from; i <= to; i++) {
                const nodeId = visibleIds[i];
                if (nodeId !== undefined) {
                  next.add(nodeId);
                }
              }
            }
          }
        }
      }

      if (controlledSelected === undefined) {
        setInternalSelected(next);
      }
      onSelectionChange?.([...next]);

      // Expand on select
      if (expandOnSelect && !expandedSet.has(id)) {
        // Check if node has children
        const flat = flattenTree(nodes, new Set(collectAllIds(nodes)));
        const targetNode = flat.find(fn => fn.node.id === id);
        if (targetNode?.node.children && targetNode.node.children.length > 0) {
          toggleExpand(id);
        }
      }
    },
    [
      selectionMode,
      selectedSet,
      controlledSelected,
      onSelectionChange,
      expandOnSelect,
      expandedSet,
      nodes,
      visibleNodes,
      toggleExpand,
    ]
  );

  // Select all visible nodes
  const selectAll = useCallback(() => {
    if (selectionMode !== 'multiple') return;
    const allIds = new Set(visibleNodes.map(vn => vn.node.id));
    if (controlledSelected === undefined) {
      setInternalSelected(allIds);
    }
    onSelectionChange?.([...allIds]);
  }, [selectionMode, visibleNodes, controlledSelected, onSelectionChange]);

  return {
    expandedSet,
    selectedSet,
    focusedId,
    visibleNodes,
    toggleExpand,
    select,
    setFocused,
    selectAll,
  };
}
