import type { ReactNode } from 'react';
import type { BaseComponent } from '@/types/common';
import type { Prettify } from '@/types/utilities';

export type ToolbarPosition = 'top' | 'left' | 'right';
export type AppShellTopChromeSeparator = 'none' | 'border' | 'shadow' | 'both';
export type AppShellSideChromeSeparator = 'none' | 'border' | 'shadow' | 'both';

export interface AppShellBaseProps extends Omit<
  BaseComponent<HTMLDivElement>,
  'children'
> {
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
}
export type AppShellProps = Prettify<AppShellBaseProps>;

export interface AppShellSlotBaseProps extends Omit<
  BaseComponent<HTMLElement>,
  'children'
> {
  /** Slot content */
  children?: ReactNode;
}
export type AppShellSlotProps = Prettify<AppShellSlotBaseProps>;

export interface AppShellToolbarSlotBaseProps extends AppShellSlotBaseProps {
  /** Toolbar position */
  position?: ToolbarPosition;
}
export type AppShellToolbarSlotProps = Prettify<AppShellToolbarSlotBaseProps>;

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
