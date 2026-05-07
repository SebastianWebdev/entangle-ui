import type React from 'react';
import type { BaseComponent } from '@/types/common';
import type { Prettify } from '@/types/utilities';

export type DrawerAnchor = 'left' | 'right' | 'top' | 'bottom';
export type DrawerSizePreset = 'sm' | 'md' | 'lg' | 'xl';
export type DrawerSize = DrawerSizePreset | (string & {}) | number;
export type DrawerFooterAlign = 'left' | 'center' | 'right' | 'space-between';

export interface DrawerBaseProps extends BaseComponent {
  /** Whether the drawer is open. */
  open: boolean;
  /** Called when the drawer requests close (overlay click, Escape, close button). */
  onClose: () => void;
  /** Edge from which the drawer enters. @default "right" */
  anchor?: DrawerAnchor;
  /** Drawer size on the cross axis. Strings like "sm" use presets, number = px, string = CSS. @default "md" */
  size?: DrawerSize;
  /** Modal mode renders a backdrop and traps focus. @default true */
  modal?: boolean;
  /** Close when the overlay is clicked. Only applies when modal. @default true */
  closeOnOverlayClick?: boolean;
  /** Close on Escape. @default true */
  closeOnEscape?: boolean;
  /** Trap focus inside the drawer. Defaults to `modal`. */
  trapFocus?: boolean;
  /** Element to focus on open. */
  initialFocusRef?: React.RefObject<HTMLElement | null>;
  /** Render in a portal on document.body. @default true */
  portal?: boolean;
  /** Used as aria-labelledby reference. Pass as a string or use Drawer.Header. */
  title?: string;
  /** Used as aria-describedby reference. */
  description?: string;
  /** Drawer content (typically Drawer.Header/Body/Footer). */
  children: React.ReactNode;
}

export type DrawerProps = Prettify<DrawerBaseProps>;

export interface DrawerHeaderBaseProps extends BaseComponent {
  /** Title content. */
  children: React.ReactNode;
  /** Whether to render a close button on the right. @default true */
  showClose?: boolean;
  /** Optional description below the title. */
  description?: string;
}

export type DrawerHeaderProps = Prettify<DrawerHeaderBaseProps>;

export interface DrawerBodyBaseProps extends BaseComponent {
  children: React.ReactNode;
}

export type DrawerBodyProps = Prettify<DrawerBodyBaseProps>;

export interface DrawerFooterBaseProps extends BaseComponent {
  children: React.ReactNode;
  /** Horizontal alignment. @default "right" */
  align?: DrawerFooterAlign;
}

export type DrawerFooterProps = Prettify<DrawerFooterBaseProps>;

export interface DrawerCloseButtonBaseProps extends Omit<
  BaseComponent<HTMLButtonElement>,
  'children'
> {
  /** Custom button content; defaults to an X icon. */
  children?: React.ReactNode;
  /** Override aria-label. @default "Close drawer" */
  'aria-label'?: string;
}

export type DrawerCloseButtonProps = Prettify<DrawerCloseButtonBaseProps>;

export interface DrawerContextValue {
  onClose: () => void;
  titleId: string;
  descriptionId: string;
}
