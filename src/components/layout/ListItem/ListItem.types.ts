import type React from 'react';
import type { BaseComponent } from '@/types/common';
import type { Prettify } from '@/types/utilities';

export type ListItemDensity = 'compact' | 'comfortable';

export interface ListItemBaseProps extends Omit<
  BaseComponent<HTMLDivElement>,
  'onClick'
> {
  /** Click handler — when set, the item becomes keyboard-activatable. */
  onClick?: (event: React.MouseEvent<HTMLDivElement>) => void;
  /** Leading content (icon, checkbox, avatar). */
  leading?: React.ReactNode;
  /** Trailing content (actions, badge, chevron). */
  trailing?: React.ReactNode;
  /**
   * Is the item currently selected?
   * @default false
   */
  selected?: boolean;
  /**
   * Is the item in an active (pressed/opened) state?
   * @default false
   */
  active?: boolean;
  /** @default false */
  disabled?: boolean;
  /**
   * Row density.
   * @default "comfortable"
   */
  density?: ListItemDensity;
  /** Primary content (typically a title + optional description). */
  children?: React.ReactNode;
}

export type ListItemProps = Prettify<ListItemBaseProps>;
