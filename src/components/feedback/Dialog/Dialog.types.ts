import type React from 'react';
import type { Prettify } from '@/types/utilities';
import type { BaseComponent } from '@/types/common';

export type DialogSize = 'sm' | 'md' | 'lg' | 'xl' | 'fullscreen';

export interface DialogBaseProps extends BaseComponent {
  /** Whether the dialog is open */
  open: boolean;

  /** Callback fired when the dialog should close */
  onClose: () => void;

  /** Dialog width preset */
  size?: DialogSize;

  /** Dialog title — used for aria-labelledby */
  title?: string;

  /** Dialog description — used for aria-describedby */
  description?: string;

  /** Whether clicking the overlay closes the dialog */
  closeOnOverlayClick?: boolean;

  /** Whether pressing Escape closes the dialog */
  closeOnEscape?: boolean;

  /** Whether to show the overlay backdrop */
  showOverlay?: boolean;

  /** Whether to trap focus within the dialog */
  trapFocus?: boolean;

  /** Ref to the element that should receive initial focus */
  initialFocusRef?: React.RefObject<HTMLElement>;

  /** Whether to render the dialog in a portal (document.body) */
  portal?: boolean;

  /** Dialog content (use DialogHeader, DialogBody, DialogFooter) */
  children: React.ReactNode;
}

export type DialogProps = Prettify<DialogBaseProps>;

export interface DialogHeaderBaseProps extends BaseComponent {
  /** Header content (typically a title) */
  children: React.ReactNode;

  /** Whether to show the close button */
  showClose?: boolean;

  /** Optional description text below the title */
  description?: string;
}

export type DialogHeaderProps = Prettify<DialogHeaderBaseProps>;

export interface DialogBodyBaseProps extends BaseComponent {
  /** Body content */
  children: React.ReactNode;
}

export type DialogBodyProps = Prettify<DialogBodyBaseProps>;

export interface DialogFooterBaseProps extends BaseComponent {
  /** Footer content (typically action buttons) */
  children: React.ReactNode;

  /** Horizontal alignment of footer content */
  align?: 'left' | 'center' | 'right' | 'space-between';
}

export type DialogFooterProps = Prettify<DialogFooterBaseProps>;

export interface DialogContextValue {
  onClose: () => void;
  titleId: string;
  descriptionId: string;
}
