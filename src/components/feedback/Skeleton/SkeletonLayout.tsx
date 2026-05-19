'use client';

import React from 'react';
import { assignInlineVars } from '@vanilla-extract/dynamic';
import { cx } from '@/utils/cx';
import { Skeleton } from './Skeleton';
import type {
  SkeletonAnimation,
  SkeletonLayoutProps,
  SkeletonLayoutVariant,
} from './Skeleton.types';
import {
  cardBodyStyle,
  cardLayoutStyle,
  chatBubbleStyle,
  chatLayoutStyle,
  chatRowEndStyle,
  chatRowStyle,
  gridLayoutStyle,
  layoutColumnsVar,
  listLayoutStyle,
  listRowBodyStyle,
  listRowStyle,
  tableHeaderCellStyle,
  tableLayoutStyle,
} from './SkeletonLayout.css';

const DEFAULT_COUNT: Record<SkeletonLayoutVariant, number> = {
  card: 1,
  list: 5,
  table: 5,
  grid: 12,
  chat: 4,
};

const DEFAULT_ANIMATION: Record<SkeletonLayoutVariant, SkeletonAnimation> = {
  card: 'pulse',
  list: 'pulse',
  table: 'pulse',
  grid: 'none',
  chat: 'pulse',
};

const DEFAULT_COLUMNS = 4;

function renderCard(animation: SkeletonAnimation): React.ReactNode {
  return (
    <div className={cardLayoutStyle}>
      <Skeleton shape="circle" width={40} animation={animation} />
      <div className={cardBodyStyle}>
        <Skeleton shape="line" width="70%" animation={animation} />
        <Skeleton shape="line" width="100%" animation={animation} />
        <Skeleton shape="line" width="50%" animation={animation} />
        <Skeleton width="100%" height={80} animation={animation} />
      </div>
    </div>
  );
}

function renderList(
  count: number,
  animation: SkeletonAnimation
): React.ReactNode {
  return (
    <div className={listLayoutStyle}>
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className={listRowStyle}>
          <Skeleton shape="circle" width={32} animation={animation} />
          <div className={listRowBodyStyle}>
            <Skeleton shape="line" width="60%" animation={animation} />
            <Skeleton shape="line" width="90%" animation={animation} />
          </div>
        </div>
      ))}
    </div>
  );
}

function renderTable(
  rows: number,
  columns: number,
  animation: SkeletonAnimation
): React.ReactNode {
  const totalCells = (rows + 1) * columns;
  return (
    <div
      className={tableLayoutStyle}
      style={assignInlineVars({ [layoutColumnsVar]: String(columns) })}
    >
      {Array.from({ length: totalCells }, (_, i) => {
        const isHeader = i < columns;
        return (
          <div key={i} className={isHeader ? tableHeaderCellStyle : undefined}>
            <Skeleton
              shape="line"
              width={isHeader ? '50%' : '80%'}
              animation={animation}
            />
          </div>
        );
      })}
    </div>
  );
}

function renderGrid(
  count: number,
  columns: number,
  animation: SkeletonAnimation
): React.ReactNode {
  return (
    <div
      className={gridLayoutStyle}
      style={assignInlineVars({ [layoutColumnsVar]: String(columns) })}
    >
      {Array.from({ length: count }, (_, i) => (
        <Skeleton key={i} width="100%" height={80} animation={animation} />
      ))}
    </div>
  );
}

const CHAT_BUBBLE_WIDTHS = ['85%', '60%', '95%', '70%', '50%', '80%'] as const;

function renderChat(
  count: number,
  animation: SkeletonAnimation
): React.ReactNode {
  return (
    <div className={chatLayoutStyle}>
      {Array.from({ length: count }, (_, i) => {
        const isOutgoing = i % 2 === 1;
        const bubbleWidth = CHAT_BUBBLE_WIDTHS[i % CHAT_BUBBLE_WIDTHS.length];
        return (
          <div
            key={i}
            className={cx(chatRowStyle, isOutgoing && chatRowEndStyle)}
          >
            <Skeleton shape="circle" width={28} animation={animation} />
            <div className={chatBubbleStyle}>
              <Skeleton
                shape="line"
                width={bubbleWidth}
                animation={animation}
              />
              {i % 3 === 0 ? (
                <Skeleton shape="line" width="40%" animation={animation} />
              ) : null}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/**
 * Pre-built skeleton layouts for common loading patterns — card, list, table,
 * grid, and chat. Drop one in when the surrounding UI shape is known and you
 * want the placeholder structure to mirror it without composing every block
 * by hand.
 *
 * Each variant uses the base `Skeleton` primitive underneath, so animation
 * and reduced-motion behavior match the rest of the library. Use `count` to
 * scale the number of rows/cells, `columns` for `grid` and `table`, and
 * `animation` to opt out of motion for dense surfaces.
 *
 * @example
 * ```tsx
 * <SkeletonLayout variant="card" />
 * <SkeletonLayout variant="list" count={8} />
 * <SkeletonLayout variant="table" columns={5} count={6} />
 * <SkeletonLayout variant="grid" columns={3} count={9} />
 * <SkeletonLayout variant="chat" count={6} />
 * ```
 */
export const SkeletonLayout = /*#__PURE__*/ React.memo<SkeletonLayoutProps>(
  ({
    variant,
    count,
    columns = DEFAULT_COLUMNS,
    animation,
    width = '100%',
    className,
    style,
    testId,
    ref,
    ...rest
  }) => {
    const resolvedCount = count ?? DEFAULT_COUNT[variant];
    const resolvedAnimation = animation ?? DEFAULT_ANIMATION[variant];
    const resolvedWidth = typeof width === 'number' ? `${width}px` : width;

    let content: React.ReactNode;
    switch (variant) {
      case 'card':
        content = renderCard(resolvedAnimation);
        break;
      case 'list':
        content = renderList(resolvedCount, resolvedAnimation);
        break;
      case 'table':
        content = renderTable(resolvedCount, columns, resolvedAnimation);
        break;
      case 'grid':
        content = renderGrid(resolvedCount, columns, resolvedAnimation);
        break;
      case 'chat':
        content = renderChat(resolvedCount, resolvedAnimation);
        break;
    }

    return (
      <div
        ref={ref}
        aria-hidden="true"
        aria-busy="true"
        className={cx(className)}
        style={{ width: resolvedWidth, ...style }}
        data-testid={testId}
        data-variant={variant}
        {...rest}
      >
        {content}
      </div>
    );
  }
);

SkeletonLayout.displayName = 'SkeletonLayout';
