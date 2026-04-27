import React from 'react';
import type { BaseComponent, Size } from '@/types/common';
import type { Prettify } from '@/types/utilities';

export type BreadcrumbsSize = Size;

export interface BreadcrumbsBaseProps extends BaseComponent<HTMLElement> {
  /**
   * Custom separator. Can be a string or any ReactNode.
   * @default <ArrowRightIcon size="sm" decorative />
   */
  separator?: React.ReactNode;

  /**
   * Maximum number of items to show before collapsing the middle into an ellipsis.
   * `0` or `undefined` never collapses.
   * @default 0
   */
  maxItems?: number;

  /**
   * Number of items to keep visible at the start when collapsing.
   * @default 1
   */
  itemsBeforeCollapse?: number;

  /**
   * Number of items to keep visible at the end when collapsing.
   * @default 2
   */
  itemsAfterCollapse?: number;

  /**
   * Render the ellipsis as a clickable button that expands to show all items.
   * @default true
   */
  expandable?: boolean;

  /**
   * Size applied to all items.
   * @default "sm"
   */
  size?: BreadcrumbsSize;

  /**
   * Children, typically BreadcrumbItem components with optional custom
   * BreadcrumbSeparator components between them.
   */
  children: React.ReactNode;
}

export type BreadcrumbsProps = Prettify<BreadcrumbsBaseProps>;

export interface BreadcrumbItemBaseProps extends BaseComponent<HTMLElement> {
  /**
   * Render as a link with this href.
   */
  href?: string;

  /**
   * Click handler, useful for SPA routing.
   */
  onClick?: (event: React.MouseEvent<HTMLElement>) => void;

  /**
   * Marks this item as the current page.
   * @default false
   */
  isCurrent?: boolean;

  /**
   * Optional icon rendered before the label.
   */
  icon?: React.ReactNode;

  /**
   * Truncate a string label when it exceeds this many characters.
   */
  maxLength?: number;

  /**
   * Breadcrumb label.
   */
  children: React.ReactNode;
}

export type BreadcrumbItemProps = Prettify<BreadcrumbItemBaseProps>;

export interface BreadcrumbSeparatorBaseProps extends BaseComponent<HTMLElement> {
  children?: React.ReactNode;
}

export type BreadcrumbSeparatorProps = Prettify<BreadcrumbSeparatorBaseProps>;

export interface BreadcrumbEllipsisBaseProps extends BaseComponent<HTMLElement> {
  /**
   * Click handler used when the collapsed items can be expanded.
   */
  onClick?: () => void;

  /**
   * Tooltip content describing the collapsed breadcrumb labels.
   */
  tooltip?: React.ReactNode;
}

export type BreadcrumbEllipsisProps = Prettify<BreadcrumbEllipsisBaseProps>;
