'use client';

import React, { useCallback } from 'react';
import { cx } from '@/utils/cx';
import type { ListItemProps } from './ListItem.types';
import {
  listItemContentStyle,
  listItemLeadingStyle,
  listItemRecipe,
  listItemTrailingStyle,
} from './ListItem.css';

/**
 * Reusable list row with leading / trailing slots and hover/selected/active
 * states. Becomes keyboard-activatable when `onClick` is provided (Enter
 * and Space trigger the handler).
 *
 * @example
 * ```tsx
 * <ListItem
 *   leading={<FileIcon />}
 *   trailing={<Badge color="success">done</Badge>}
 *   selected={id === activeId}
 *   onClick={() => select(id)}
 * >
 *   scene.blend
 * </ListItem>
 * ```
 */
export const ListItem = /*#__PURE__*/ React.memo<ListItemProps>(
  ({
    onClick,
    leading,
    trailing,
    selected = false,
    active = false,
    disabled = false,
    density = 'comfortable',
    children,
    className,
    style,
    testId,
    ref,
    ...rest
  }) => {
    const clickable = !!onClick && !disabled;

    const handleKeyDown = useCallback(
      (event: React.KeyboardEvent<HTMLDivElement>) => {
        if (!clickable) return;
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onClick?.(
            event as unknown as React.MouseEvent<HTMLDivElement, MouseEvent>
          );
        }
      },
      [clickable, onClick]
    );

    return (
      <div
        ref={ref}
        role={clickable ? 'button' : undefined}
        tabIndex={clickable ? 0 : undefined}
        aria-disabled={disabled || undefined}
        data-disabled={disabled ? 'true' : 'false'}
        data-selected={selected ? 'true' : undefined}
        data-active={active ? 'true' : undefined}
        onClick={clickable ? onClick : undefined}
        onKeyDown={handleKeyDown}
        className={cx(
          listItemRecipe({
            density,
            clickable: clickable || undefined,
            selected: selected || undefined,
            active: active || undefined,
            disabled: disabled || undefined,
          }),
          className
        )}
        style={style}
        data-testid={testId}
        {...rest}
      >
        {leading && <span className={listItemLeadingStyle}>{leading}</span>}
        <span className={listItemContentStyle}>{children}</span>
        {trailing && <span className={listItemTrailingStyle}>{trailing}</span>}
      </div>
    );
  }
);

ListItem.displayName = 'ListItem';
