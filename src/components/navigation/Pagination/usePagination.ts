'use client';

import { useMemo } from 'react';

import type { PaginationItem } from './Pagination.types';

export interface UsePaginationOptions {
  count: number;
  page: number;
  siblingCount: number;
  boundaryCount: number;
  showFirstButton: boolean;
  showLastButton: boolean;
  hidePrevButton: boolean;
  hideNextButton: boolean;
  disabled: boolean;
}

function range(start: number, end: number): number[] {
  const length = Math.max(0, end - start + 1);
  return Array.from({ length }, (_, i) => start + i);
}

/**
 * MUI-style pagination algorithm. Produces the list of items to render given
 * the total count, the current page, and the sibling/boundary counts.
 */
export function usePaginationItems(
  options: UsePaginationOptions
): PaginationItem[] {
  const {
    count,
    page,
    siblingCount,
    boundaryCount,
    showFirstButton,
    showLastButton,
    hidePrevButton,
    hideNextButton,
    disabled,
  } = options;

  return useMemo(() => {
    const safeCount = Math.max(0, Math.floor(count));
    if (safeCount === 0) {
      const items: PaginationItem[] = [];
      if (showFirstButton) {
        items.push({
          type: 'first',
          page: null,
          selected: false,
          disabled: true,
        });
      }
      if (!hidePrevButton) {
        items.push({
          type: 'previous',
          page: null,
          selected: false,
          disabled: true,
        });
      }
      if (!hideNextButton) {
        items.push({
          type: 'next',
          page: null,
          selected: false,
          disabled: true,
        });
      }
      if (showLastButton) {
        items.push({
          type: 'last',
          page: null,
          selected: false,
          disabled: true,
        });
      }
      return items;
    }

    const startBoundary = range(1, Math.min(boundaryCount, safeCount));
    const endBoundary = range(
      Math.max(safeCount - boundaryCount + 1, boundaryCount + 1),
      safeCount
    );

    const siblingStart = Math.max(
      Math.min(
        page - siblingCount,
        safeCount - boundaryCount - siblingCount * 2 - 1
      ),
      boundaryCount + 2
    );

    const firstEndBoundary = endBoundary[0];
    const siblingEnd = Math.min(
      Math.max(page + siblingCount, boundaryCount + siblingCount * 2 + 2),
      firstEndBoundary !== undefined ? firstEndBoundary - 2 : safeCount - 1
    );

    /**
     * Builds a sequence:
     * [1, ..., boundaryCount] [start ellipsis] [siblings] [end ellipsis] [count - boundaryCount + 1, ..., count]
     */
    const itemList: (number | 'start-ellipsis' | 'end-ellipsis')[] = [
      ...startBoundary,
      // Start ellipsis or single page bridging the gap
      ...(siblingStart > boundaryCount + 2
        ? (['start-ellipsis'] as const)
        : boundaryCount + 1 < safeCount - boundaryCount
          ? [boundaryCount + 1]
          : []),
      ...range(siblingStart, siblingEnd),
      ...(siblingEnd < safeCount - boundaryCount - 1
        ? (['end-ellipsis'] as const)
        : safeCount - boundaryCount > boundaryCount
          ? [safeCount - boundaryCount]
          : []),
      ...endBoundary,
    ];

    const items: PaginationItem[] = [];

    if (showFirstButton) {
      items.push({
        type: 'first',
        page: 1,
        selected: false,
        disabled: disabled || page <= 1,
      });
    }
    if (!hidePrevButton) {
      items.push({
        type: 'previous',
        page: Math.max(1, page - 1),
        selected: false,
        disabled: disabled || page <= 1,
      });
    }

    for (const it of itemList) {
      if (it === 'start-ellipsis' || it === 'end-ellipsis') {
        items.push({
          type: 'ellipsis',
          page: null,
          selected: false,
          disabled: true,
        });
      } else {
        items.push({
          type: 'page',
          page: it,
          selected: it === page,
          disabled,
        });
      }
    }

    if (!hideNextButton) {
      items.push({
        type: 'next',
        page: Math.min(safeCount, page + 1),
        selected: false,
        disabled: disabled || page >= safeCount,
      });
    }
    if (showLastButton) {
      items.push({
        type: 'last',
        page: safeCount,
        selected: false,
        disabled: disabled || page >= safeCount,
      });
    }

    return items;
  }, [
    count,
    page,
    siblingCount,
    boundaryCount,
    showFirstButton,
    showLastButton,
    hidePrevButton,
    hideNextButton,
    disabled,
  ]);
}
