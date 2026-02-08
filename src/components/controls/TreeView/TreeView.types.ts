import type React from 'react';
import type { Prettify } from '@/types/utilities';
import type { BaseComponent, Size } from '@/types/common';

export type TreeViewSize = Size;

/**
 * Selection mode for the tree.
 * - `single`: Only one node can be selected
 * - `multiple`: Multiple nodes via Ctrl+Click, Shift+Click
 * - `none`: No selection, tree is display-only
 */
export type TreeSelectionMode = 'single' | 'multiple' | 'none';

/**
 * Generic tree node data structure.
 */
export interface TreeNodeData {
  /** Unique identifier for this node */
  id: string;
  /** Display label */
  label: string;
  /** Optional icon rendered before the label */
  icon?: React.ReactNode;
  /** Child nodes (empty array or undefined for leaf nodes) */
  children?: TreeNodeData[];
  /** Whether this node is disabled */
  disabled?: boolean;
  /** Whether this node can be dragged */
  draggable?: boolean;
  /** Whether this node can accept children via drag-and-drop */
  droppable?: boolean;
  /** Whether this node can be renamed inline */
  renamable?: boolean;
  /** Additional data attached to this node */
  data?: Record<string, unknown>;
}

/**
 * State information passed to render functions.
 */
export interface TreeNodeState {
  selected: boolean;
  expanded: boolean;
  focused: boolean;
  depth: number;
  isLeaf: boolean;
  isFirst: boolean;
  isLast: boolean;
}

export interface TreeViewBaseProps extends Omit<BaseComponent, 'onChange'> {
  /**
   * Tree data — array of root-level nodes.
   */
  nodes: TreeNodeData[];

  /**
   * Expanded node IDs (controlled).
   */
  expandedIds?: string[];

  /**
   * Default expanded node IDs (uncontrolled).
   */
  defaultExpandedIds?: string[];

  /**
   * Selected node IDs (controlled).
   */
  selectedIds?: string[];

  /**
   * Default selected node IDs (uncontrolled).
   */
  defaultSelectedIds?: string[];

  /**
   * Selection mode.
   * @default "single"
   */
  selectionMode?: TreeSelectionMode;

  /**
   * Whether to allow inline renaming (double-click on label).
   * @default false
   */
  renamable?: boolean;

  /**
   * Tree node size.
   * @default "md"
   */
  size?: TreeViewSize;

  /**
   * Indentation per depth level in pixels.
   * @default 16
   */
  indent?: number;

  /**
   * Whether to show expand/collapse chevrons for parent nodes.
   * @default true
   */
  showChevrons?: boolean;

  /**
   * Whether to show connecting guide lines.
   * @default false
   */
  showGuideLines?: boolean;

  /**
   * Whether to expand parent nodes when they are selected.
   * @default false
   */
  expandOnSelect?: boolean;

  /**
   * Maximum height before scrolling.
   */
  maxHeight?: number | string;

  /**
   * Custom render function for node content.
   */
  renderNode?: (node: TreeNodeData, state: TreeNodeState) => React.ReactNode;

  /**
   * Custom render function for trailing actions (right side of node).
   */
  renderActions?: (node: TreeNodeData, state: TreeNodeState) => React.ReactNode;

  /**
   * Empty state content when nodes array is empty.
   */
  emptyContent?: React.ReactNode;

  /** Fired when expanded nodes change. */
  onExpandedChange?: (expandedIds: string[]) => void;

  /** Fired when selected nodes change. */
  onSelectionChange?: (selectedIds: string[]) => void;

  /** Fired when a node is clicked. */
  onNodeClick?: (node: TreeNodeData, event: React.MouseEvent) => void;

  /** Fired when a node is double-clicked. */
  onNodeDoubleClick?: (node: TreeNodeData, event: React.MouseEvent) => void;

  /** Fired when a node is right-clicked. */
  onNodeContextMenu?: (node: TreeNodeData, event: React.MouseEvent) => void;

  /** Fired when a node is renamed. */
  onNodeRename?: (nodeId: string, newLabel: string) => void;
}

export type TreeViewProps = Prettify<TreeViewBaseProps>;
