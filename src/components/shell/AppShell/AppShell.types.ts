import type { ReactNode } from 'react';

export type ToolbarPosition = 'top' | 'left' | 'right';
export type AppShellTopChromeSeparator = 'none' | 'border' | 'shadow' | 'both';
export type AppShellSideChromeSeparator = 'none' | 'border' | 'shadow' | 'both';

export interface AppShellProps {
  /** Lock the shell to the viewport (injects global html/body styles) */
  viewportLock?: boolean;
  /**
   * Visual separator under the top chrome area (menu + top toolbar).
   * Applied to the top toolbar slot when present.
   * @default "border"
   */
  topChromeSeparator?: AppShellTopChromeSeparator;
  /**
   * Visual separator between side toolbars and dock content.
   * Applied to toolbar slots with position="left" and position="right".
   * @default "border"
   */
  sideChromeSeparator?: AppShellSideChromeSeparator;
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
  /** Visual separator style under top chrome */
  topChromeSeparator: AppShellTopChromeSeparator;
  /** Visual separator style between side chrome and dock */
  sideChromeSeparator: AppShellSideChromeSeparator;
}
