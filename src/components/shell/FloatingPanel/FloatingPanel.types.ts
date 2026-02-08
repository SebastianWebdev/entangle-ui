import type { ReactNode } from 'react';

export interface Position {
  x: number;
  y: number;
}

export interface FloatingPanelSize {
  width: number;
  height: number;
}

export interface FloatingPanelProps {
  /** Panel title displayed in the header */
  title: string;
  /** Controlled position */
  position?: Position;
  /** Default position (uncontrolled) */
  defaultPosition?: Position;
  /** Called when position changes during drag */
  onPositionChange?: (position: Position) => void;
  /** Controlled size */
  size?: FloatingPanelSize;
  /** Default size (uncontrolled) */
  defaultSize?: FloatingPanelSize;
  /** Called when size changes during resize */
  onSizeChange?: (size: FloatingPanelSize) => void;
  /** Minimum width */
  minWidth?: number;
  /** Minimum height */
  minHeight?: number;
  /** Maximum width */
  maxWidth?: number;
  /** Maximum height */
  maxHeight?: number;
  /** Whether the panel body is collapsed */
  collapsed?: boolean;
  /** Default collapsed state (uncontrolled) */
  defaultCollapsed?: boolean;
  /** Called when collapsed state changes */
  onCollapsedChange?: (collapsed: boolean) => void;
  /** Called when the close button is clicked */
  onClose?: () => void;
  /** Whether to show the close button */
  closable?: boolean;
  /** Whether the panel is resizable */
  resizable?: boolean;
  /** Panel content */
  children?: ReactNode;
  /** Additional CSS class */
  className?: string;
  /** Unique panel ID for FloatingManager z-index tracking */
  panelId?: string;
}

export interface FloatingManagerContextValue {
  /** Bring a panel to the front */
  bringToFront: (id: string) => void;
  /** Get the z-index for a panel */
  getZIndex: (id: string) => number;
  /** Register a panel */
  register: (id: string) => void;
  /** Unregister a panel */
  unregister: (id: string) => void;
}

export interface FloatingManagerProps {
  /** Base z-index for floating panels */
  baseZIndex?: number;
  /** Children (FloatingPanel components) */
  children?: ReactNode;
}
