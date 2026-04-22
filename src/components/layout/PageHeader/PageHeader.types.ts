import type React from 'react';
import type { BaseComponent, Size } from '@/types/common';
import type { Prettify } from '@/types/utilities';

export type PageHeaderSize = Size;

export interface PageHeaderBaseProps extends Omit<
  BaseComponent<HTMLElement>,
  'title'
> {
  /** Icon rendered before the title. */
  icon?: React.ReactNode;
  /** Title — plain string or custom ReactNode. */
  title: React.ReactNode;
  /** Optional subtitle below the title. */
  subtitle?: React.ReactNode;
  /** Actions rendered on the right (buttons, menus, IconButtons). */
  actions?: React.ReactNode;
  /** Breadcrumb slot rendered above the title. */
  breadcrumbs?: React.ReactNode;
  /**
   * Size scale.
   * @default "md"
   */
  size?: PageHeaderSize;
  /**
   * Render a bottom border separating the header from content.
   * @default true
   */
  bordered?: boolean;
}

export type PageHeaderProps = Prettify<PageHeaderBaseProps>;
