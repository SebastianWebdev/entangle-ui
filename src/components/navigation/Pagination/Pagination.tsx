'use client';

import React, { useCallback } from 'react';

import { ChevronLeftIcon } from '@/components/Icons/ChevronLeftIcon';
import { ChevronRightIcon } from '@/components/Icons/ChevronRightIcon';
import { FirstIcon } from '@/components/Icons/FirstIcon';
import { LastIcon } from '@/components/Icons/LastIcon';
import { useControlledState } from '@/hooks/useControlledState';
import { cx } from '@/utils/cx';

import {
  paginationButtonRecipe,
  paginationEllipsisRecipe,
  paginationIconStyle,
  paginationItemStyle,
  paginationListRecipe,
  paginationRootStyle,
} from './Pagination.css';
import { usePaginationItems } from './usePagination';

import type {
  PaginationItem,
  PaginationItemAriaLabelGetter,
  PaginationItemType,
  PaginationProps,
  PaginationSize,
} from './Pagination.types';

const defaultGetItemAriaLabel: PaginationItemAriaLabelGetter = (
  type,
  page,
  selected
) => {
  switch (type) {
    case 'first':
      return 'Go to first page';
    case 'last':
      return 'Go to last page';
    case 'previous':
      return 'Go to previous page';
    case 'next':
      return 'Go to next page';
    case 'ellipsis':
      return 'More pages';
    case 'page':
    default:
      return selected ? `page ${String(page)}` : `Go to page ${String(page)}`;
  }
};

function renderItemContent(
  type: PaginationItemType,
  page: number | null
): React.ReactNode {
  switch (type) {
    case 'first':
      return <FirstIcon className={paginationIconStyle} />;
    case 'last':
      return <LastIcon className={paginationIconStyle} />;
    case 'previous':
      return <ChevronLeftIcon className={paginationIconStyle} />;
    case 'next':
      return <ChevronRightIcon className={paginationIconStyle} />;
    case 'ellipsis':
      return '…';
    case 'page':
    default:
      return page;
  }
}

/**
 * Page navigator with sibling/boundary ellipsis logic. Controlled when `page`
 * is set, otherwise uncontrolled with `defaultPage`. Pages are 1-based.
 *
 * @example
 * ```tsx
 * <Pagination count={20} defaultPage={1} onChange={(_, p) => setPage(p)} />
 *
 * // Compact: only prev/next + numbers
 * <Pagination count={20} siblingCount={0} boundaryCount={1} />
 *
 * // Full controls
 * <Pagination count={50} showFirstButton showLastButton />
 * ```
 */
export const Pagination: React.FC<PaginationProps> = ({
  count,
  page: pageProp,
  defaultPage = 1,
  onChange,
  siblingCount = 1,
  boundaryCount = 1,
  showFirstButton = false,
  showLastButton = false,
  hidePrevButton = false,
  hideNextButton = false,
  size = 'md',
  disabled = false,
  className,
  style,
  testId,
  getItemAriaLabel = defaultGetItemAriaLabel,
  ref,
  ...rest
}) => {
  const safeCount = Math.max(0, Math.floor(count));
  const clampedDefault = Math.min(
    Math.max(1, defaultPage),
    Math.max(1, safeCount)
  );

  const [page, setPage] = useControlledState<number>({
    value: pageProp,
    defaultValue: clampedDefault,
    onChange: undefined,
    fallback: 1,
  });

  const items = usePaginationItems({
    count: safeCount,
    page,
    siblingCount: Math.max(0, siblingCount),
    boundaryCount: Math.max(1, boundaryCount),
    showFirstButton,
    showLastButton,
    hidePrevButton,
    hideNextButton,
    disabled,
  });

  const handleClick = useCallback(
    (event: React.MouseEvent<HTMLButtonElement>, item: PaginationItem) => {
      if (item.disabled || item.page === null || item.type === 'ellipsis')
        return;
      const next = item.page;
      if (next === page) return;
      setPage(next);
      onChange?.(event, next);
    },
    [onChange, page, setPage]
  );

  return (
    <nav
      ref={ref}
      aria-label="pagination"
      className={cx(paginationRootStyle, className)}
      style={style}
      data-testid={testId}
      {...rest}
    >
      <ul className={paginationListRecipe({ size })}>
        {items.map((item, index) => {
          const key = `${item.type}-${item.page ?? 'na'}-${String(index)}`;
          if (item.type === 'ellipsis') {
            return (
              <li key={key} className={paginationItemStyle}>
                <span
                  className={paginationEllipsisRecipe({ size })}
                  aria-hidden="true"
                >
                  &#8230;
                </span>
              </li>
            );
          }
          return (
            <li key={key} className={paginationItemStyle}>
              <button
                type="button"
                className={paginationButtonRecipe({
                  size,
                  selected: item.selected || undefined,
                })}
                disabled={item.disabled}
                aria-current={item.selected ? 'page' : undefined}
                aria-label={getItemAriaLabel(
                  item.type,
                  item.page,
                  item.selected
                )}
                onClick={event => {
                  handleClick(event, item);
                }}
                data-page={item.page ?? undefined}
                data-type={item.type}
              >
                {renderItemContent(item.type, item.page)}
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};

Pagination.displayName = 'Pagination';

export type { PaginationSize };
