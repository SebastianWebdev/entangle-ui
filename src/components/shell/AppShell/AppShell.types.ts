import type { ReactNode } from 'react';

export type ToolbarPosition = 'top' | 'left' | 'right';

export interface AppShellProps {
  /** Lock the shell to the viewport (injects global html/body styles) */
  viewportLock?: boolean;
  /** Children (AppShell slot components) */
  children?: ReactNode;
  /** Additional CSS class */
  className?: string;
}

export interface AppShellSlotProps {
  /** Slot content */
  children?: ReactNode;
  /** Additional CSS class */
  className?: string;
}

export interface AppShellToolbarSlotProps extends AppShellSlotProps {
  /** Toolbar position */
  position?: ToolbarPosition;
}

export interface AppShellContextValue {
  /** Check if a toolbar position is visible */
  isToolbarVisible: (position: ToolbarPosition) => boolean;
  /** Toggle toolbar visibility */
  setToolbarVisible: (position: ToolbarPosition, visible: boolean) => void;
}
