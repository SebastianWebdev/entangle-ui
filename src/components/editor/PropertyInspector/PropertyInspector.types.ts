import type React from 'react';
import type { Prettify } from '@/types/utilities';
import type { BaseComponent, Size } from '@/types/common';

// --- Shared ---

export type PropertyInspectorSize = Size;

// --- PropertyPanel ---

export interface PropertyPanelBaseProps extends BaseComponent {
  /**
   * Panel content — PropertySection, PropertyGroup, or any elements
   */
  children: React.ReactNode;

  /**
   * Content rendered in the fixed header area (above scrollable content)
   */
  header?: React.ReactNode;

  /**
   * Content rendered in the fixed footer area (below scrollable content)
   */
  footer?: React.ReactNode;

  /**
   * Size applied to all nested PropertySection and PropertyRow components.
   * Individual components can override this.
   * @default "md"
   */
  size?: PropertyInspectorSize;

  /**
   * Maximum height of the panel (enables scrolling via ScrollArea)
   * @default "100%"
   */
  maxHeight?: number | string;

  /**
   * Whether to show a search/filter input in the header
   * @default false
   */
  searchable?: boolean;

  /**
   * Placeholder for the search input
   * @default "Search properties..."
   */
  searchPlaceholder?: string;

  /**
   * Callback when search query changes
   */
  onSearchChange?: (query: string) => void;

  /**
   * Text displayed when no sections/rows match the search
   * @default "No matching properties"
   */
  emptySearchMessage?: string;
}

export type PropertyPanelProps = Prettify<PropertyPanelBaseProps>;

// --- PropertySection ---

export interface PropertySectionBaseProps
  extends Omit<BaseComponent, 'onChange'> {
  /**
   * Section title displayed in the collapsible header
   */
  title: string;

  /**
   * Unique identifier for this section (used for expansion state).
   * Defaults to title if not provided.
   */
  value?: string;

  /**
   * Icon displayed before the section title
   */
  icon?: React.ReactNode;

  /**
   * Action buttons rendered on the right side of the header.
   * Clicking actions does NOT toggle the section.
   */
  actions?: React.ReactNode;

  /**
   * Whether this section is expanded (controlled)
   */
  expanded?: boolean;

  /**
   * Whether this section starts expanded (uncontrolled)
   * @default true
   */
  defaultExpanded?: boolean;

  /**
   * Callback when expanded state changes
   */
  onExpandedChange?: (expanded: boolean) => void;

  /**
   * Whether to keep content mounted when collapsed
   * @default false
   */
  keepMounted?: boolean;

  /**
   * Whether this section is disabled (not collapsible, dimmed)
   * @default false
   */
  disabled?: boolean;

  /**
   * Size override for this section and its rows
   */
  size?: PropertyInspectorSize;

  /**
   * Section content — PropertyRow, PropertyGroup, or any elements
   */
  children: React.ReactNode;

  /**
   * Custom chevron indicator — pass `null` to hide
   * @default built-in chevron icon
   */
  indicator?: React.ReactNode | null;

  /**
   * Right-click context menu handler on the section header
   */
  onContextMenu?: (event: React.MouseEvent) => void;
}

export type PropertySectionProps = Prettify<PropertySectionBaseProps>;

// --- PropertyRow ---

export interface PropertyRowBaseProps extends BaseComponent {
  /**
   * Property label text
   */
  label: string;

  /**
   * Tooltip text for the label (shown on hover)
   */
  tooltip?: string;

  /**
   * Control content — any form control or custom content.
   * Displayed on the right side, fills remaining space.
   */
  children: React.ReactNode;

  /**
   * Whether the row spans full width (label above, control below)
   * @default false
   */
  fullWidth?: boolean;

  /**
   * Label/value split ratio as percentages [label%, value%].
   * @default [40, 60]
   */
  splitRatio?: [number, number];

  /**
   * Whether this property has been modified from its default value.
   * Shows a visual indicator (dot or bold label).
   * @default false
   */
  modified?: boolean;

  /**
   * Whether this row is disabled
   * @default false
   */
  disabled?: boolean;

  /**
   * Whether this row is visible (controlled by search filtering)
   * @default true
   */
  visible?: boolean;

  /**
   * Size override for this row
   */
  size?: PropertyInspectorSize;

  /**
   * Action button on the right edge of the row (e.g., reset to default).
   * Appears on hover.
   */
  action?: React.ReactNode;

  /**
   * Callback when label is right-clicked (for context menu)
   */
  onLabelContextMenu?: (event: React.MouseEvent) => void;

  /**
   * Callback when reset action is triggered.
   * If provided, a reset button automatically appears on hover.
   */
  onReset?: () => void;
}

export type PropertyRowProps = Prettify<PropertyRowBaseProps>;

// --- PropertyGroup ---

export interface PropertyGroupBaseProps extends BaseComponent {
  /**
   * Optional group title (rendered as a small label divider)
   */
  title?: string;

  /**
   * Group content — PropertyRow elements
   */
  children: React.ReactNode;

  /**
   * Indent level for nested groups (number of indent steps)
   * @default 0
   */
  indent?: number;

  /**
   * Whether all rows in this group are disabled
   * @default false
   */
  disabled?: boolean;
}

export type PropertyGroupProps = Prettify<PropertyGroupBaseProps>;

// --- Context ---

export interface PropertyPanelContextValue {
  size: PropertyInspectorSize;
  searchQuery: string;
}

// --- usePropertyUndo ---

export interface PropertyUndoEntry<T = unknown> {
  /** Property path or identifier */
  propertyId: string;
  /** Value before the change */
  previousValue: T;
  /** Value after the change */
  newValue: T;
  /** Human-readable description */
  label: string;
  /** Timestamp */
  timestamp: number;
}

export interface UsePropertyUndoOptions {
  /** Maximum undo stack size @default 50 */
  maxHistory?: number;
}

export interface UsePropertyUndoReturn<T = unknown> {
  /** Wrap a value change to record it in the undo stack */
  record: (entry: Omit<PropertyUndoEntry<T>, 'timestamp'>) => void;
  /** Undo the last change — returns the entry that was undone, or null */
  undo: () => PropertyUndoEntry<T> | null;
  /** Redo the last undone change — returns the entry, or null */
  redo: () => PropertyUndoEntry<T> | null;
  /** Whether undo is available */
  canUndo: boolean;
  /** Whether redo is available */
  canRedo: boolean;
  /** Full undo history */
  history: PropertyUndoEntry<T>[];
  /** Clear all history */
  clear: () => void;
}
