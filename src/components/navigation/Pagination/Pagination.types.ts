import type React from 'react';
import type { BaseComponent } from '@/types/common';
import type { Prettify } from '@/types/utilities';

export type PaginationSize = 'sm' | 'md' | 'lg';

export type PaginationItemType =
  | 'page'
  | 'ellipsis'
  | 'first'
  | 'previous'
  | 'next'
  | 'last';

/**
 * A single item resolved by the pagination algorithm. `page` is `null` for
 * ellipsis items and for prev/next/first/last when the corresponding action
 * is not available (e.g. `previous` while on page 1).
 */
export interface PaginationItem {
  type: PaginationItemType;
  page: number | null;
  selected: boolean;
  disabled: boolean;
}

export type PaginationItemAriaLabelGetter = (
  type: PaginationItemType,
  page: number | null,
  selected: boolean
) => string;

export interface PaginationBaseProps extends Omit<
  BaseComponent<HTMLElement>,
  'onChange'
> {
  /** Total number of pages. */
  count: number;
  /** Currently selected page (1-based). Controls the component when set. */
  page?: number;
  /** Default selected page in uncontrolled mode (1-based). @default 1 */
  defaultPage?: number;
  /** Called when the user requests a new page. */
  onChange?: (event: React.SyntheticEvent, page: number) => void;
  /** Pages shown on each side of the current page. @default 1 */
  siblingCount?: number;
  /** Pages always shown at the start and end of the list. @default 1 */
  boundaryCount?: number;
  /** Show the "jump to first" button. @default false */
  showFirstButton?: boolean;
  /** Show the "jump to last" button. @default false */
  showLastButton?: boolean;
  /** Hide the previous-page button. @default false */
  hidePrevButton?: boolean;
  /** Hide the next-page button. @default false */
  hideNextButton?: boolean;
  /** Visual size. @default "md" */
  size?: PaginationSize;
  /** Disable the whole control. @default false */
  disabled?: boolean;
  /** Custom aria-label generator for each item. */
  getItemAriaLabel?: PaginationItemAriaLabelGetter;
}

export type PaginationProps = Prettify<PaginationBaseProps>;
