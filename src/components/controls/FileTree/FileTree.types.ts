import type { FileTreeLabels } from './fileTreeLabels';
import type {
  TreeNodeState,
  TreeSelectionMode,
  TreeViewSize,
} from '@/components/controls/TreeView';
import type { BaseComponent } from '@/types/common';
import type { Prettify } from '@/types/utilities';
import type React from 'react';

/** Whether an entry is a leaf file or a navigable folder. */
export type FileTreeNodeKind = 'file' | 'folder';

/**
 * A single file or folder in the tree. The file-system-flavored counterpart of
 * TreeView's `TreeNodeData`: `name` instead of `label`, an explicit `kind`, and
 * an optional `ext` that drives the auto-assigned file-type icon.
 */
export interface FileTreeNode {
  /** Stable unique id within the tree. */
  id: string;
  /** Display name, e.g. `"Button.tsx"` or `"components"`. */
  name: string;
  /** File vs. folder. Folders accept dropped files; files do not. */
  kind: FileTreeNodeKind;
  /**
   * Extension override **without** the leading dot (e.g. `"tsx"`). Inferred from
   * `name` when omitted. Drives the built-in file-type icon.
   */
  ext?: string;
  /** Optional path (informational; surfaced unchanged to consumers). */
  path?: string;
  /** Child entries. Present on folders; ignored on files. */
  children?: FileTreeNode[];
  /** Dim + non-interactive. */
  disabled?: boolean;
  /** Arbitrary consumer payload (size, modified date, GUID, …). */
  data?: Record<string, unknown>;
}

/** Per-node state handed to FileTree render/resolve props. */
export interface FileTreeNodeState extends TreeNodeState {
  /** Convenience flag — `true` when the node is a folder. */
  isFolder: boolean;
}

/** Payload for {@link FileTreeBaseProps.onImport}. */
export interface FileTreeImportPayload {
  /** The OS files extracted from the drop's `DataTransfer`. */
  files: File[];
  /**
   * The folder the files were dropped onto, or `null` for the tree root (a drop
   * on empty space, or on a top-level file).
   */
  targetFolder: FileTreeNode | null;
}

export interface FileTreeBaseProps extends Omit<BaseComponent, 'onChange'> {
  /** Tree data — array of root-level files/folders. */
  nodes: FileTreeNode[];

  // ── Expansion (controlled / uncontrolled — reuses TreeView verbatim) ──
  /** Expanded node IDs (controlled). */
  expandedIds?: string[];
  /** Default expanded node IDs (uncontrolled). */
  defaultExpandedIds?: string[];
  /** Fired when expanded nodes change. */
  onExpandedChange?: (expandedIds: string[]) => void;

  // ── Selection (controlled / uncontrolled — reuses TreeView verbatim) ──
  /** Selected node IDs (controlled). */
  selectedIds?: string[];
  /** Default selected node IDs (uncontrolled). */
  defaultSelectedIds?: string[];
  /**
   * Selection mode.
   * @default "single"
   */
  selectionMode?: TreeSelectionMode;
  /** Fired when selected nodes change. */
  onSelectionChange?: (selectedIds: string[]) => void;

  // ── Appearance (passthrough to TreeView) ──
  /**
   * Row size.
   * @default "md"
   */
  size?: TreeViewSize;
  /**
   * Indentation per depth level in pixels.
   * @default 16
   */
  indent?: number;
  /**
   * Whether to show expand/collapse chevrons for folders.
   * @default true
   */
  showChevrons?: boolean;
  /**
   * Whether to show connecting guide lines.
   * @default false
   */
  showGuideLines?: boolean;
  /**
   * Whether clicking anywhere on a folder row toggles it open/closed (not just
   * the chevron). Files are unaffected.
   * @default true
   */
  expandOnClick?: boolean;
  /** Maximum height before the tree scrolls. */
  maxHeight?: number | string;

  // ── Icons ──
  /**
   * Override the icon for a node. Return `undefined`/`null` to fall back to the
   * built-in extension→icon map. Receives the live expansion state so folder
   * open/closed glyphs can differ.
   */
  resolveIcon?: (
    node: FileTreeNode,
    state: { expanded: boolean }
  ) => React.ReactNode;

  // ── Render escape hatches ──
  /** Fully replace a node's inner content (icon + label). */
  renderNode?: (
    node: FileTreeNode,
    state: FileTreeNodeState
  ) => React.ReactNode;
  /** Render trailing actions on the right of a row. */
  renderActions?: (
    node: FileTreeNode,
    state: FileTreeNodeState
  ) => React.ReactNode;
  /** Content shown when `nodes` is empty. */
  emptyContent?: React.ReactNode;

  // ── Drag-and-drop import ──
  /**
   * Fired when OS files are dropped onto a folder (or the root). Presence of
   * this callback enables the import drop zone. FileTree only reports intent —
   * apply the change to your data and pass back fresh `nodes`.
   */
  onImport?: (payload: FileTreeImportPayload) => void;

  // ── Events (mapped to FileTreeNode) ──
  /** Fired when a node is clicked. */
  onNodeClick?: (node: FileTreeNode, event: React.MouseEvent) => void;
  /** Fired when a node is double-clicked. */
  onNodeDoubleClick?: (node: FileTreeNode, event: React.MouseEvent) => void;
  /** Fired when a node is right-clicked. */
  onNodeContextMenu?: (node: FileTreeNode, event: React.MouseEvent) => void;

  // ── i18n ──
  /**
   * Override the built-in English strings (the tree's accessible name and the
   * empty-state text). Merged onto the defaults, so you can localize a subset.
   * @see DEFAULT_FILE_TREE_LABELS
   */
  labels?: Partial<FileTreeLabels>;
}

export type FileTreeProps = Prettify<FileTreeBaseProps>;
