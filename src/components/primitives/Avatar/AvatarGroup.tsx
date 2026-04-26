'use client';

import React, { useMemo } from 'react';
import { assignInlineVars } from '@vanilla-extract/dynamic';
import { vars } from '@/theme/contract.css';
import { cx } from '@/utils/cx';
import { Tooltip } from '@/components/primitives/Tooltip';
import { Avatar } from './Avatar';
import type { AvatarGroupProps, AvatarProps } from './Avatar.types';
import {
  avatarBgVar,
  avatarGroupItemStyle,
  avatarGroupRootStyle,
  avatarGroupSpacingVar,
  avatarRecipe,
} from './Avatar.css';

const DEFAULT_MAX = 4;
const DEFAULT_SPACING = -8;

function resolveSpacing(spacing: number | string): string {
  return typeof spacing === 'number' ? `${spacing}px` : spacing;
}

function isAvatarElement(
  node: React.ReactNode
): node is React.ReactElement<AvatarProps> {
  return React.isValidElement(node) && node.type === Avatar;
}

/**
 * Display a row of `Avatar`s with optional overlap and overflow handling.
 *
 * Children are rendered in order, with negative margin (controlled via the
 * `spacing` prop) creating the classic overlapping cluster. When the number
 * of children exceeds `max`, the remainder collapses into a `+N` indicator;
 * hovering it reveals the names of the hidden avatars.
 *
 * `size` and `bordered` are applied to every child — the group always wins
 * over per-avatar values to keep the visual treatment uniform.
 *
 * @example
 * ```tsx
 * <AvatarGroup max={4}>
 *   <Avatar name="Alice" />
 *   <Avatar name="Bob" />
 *   <Avatar name="Carol" />
 *   <Avatar name="Dave" />
 *   <Avatar name="Eve" />
 * </AvatarGroup>
 * ```
 */
export const AvatarGroup = /*#__PURE__*/ React.memo<AvatarGroupProps>(
  ({
    max = DEFAULT_MAX,
    spacing = DEFAULT_SPACING,
    size = 'md',
    bordered = true,
    showOverflowTooltip = true,
    children,
    className,
    style,
    testId,
    ref,
    ...rest
  }) => {
    const items = useMemo(
      () => React.Children.toArray(children).filter(isAvatarElement),
      [children]
    );

    const visibleCount = Math.min(items.length, max);
    const visibleItems = items.slice(0, visibleCount);
    const hiddenItems = items.slice(visibleCount);
    const overflowCount = hiddenItems.length;

    const spacingStyle = assignInlineVars({
      [avatarGroupSpacingVar]: resolveSpacing(spacing),
    });

    const hiddenNames = useMemo(
      () =>
        hiddenItems
          .map(child => child.props.name ?? child.props.alt)
          .filter((value): value is string => Boolean(value)),
      [hiddenItems]
    );

    const renderOverflow = () => {
      if (overflowCount <= 0) return null;

      const overflowEl = (
        <span
          className={avatarRecipe({
            size,
            shape: 'circle',
            bordered: bordered || undefined,
          })}
          style={assignInlineVars({
            [avatarBgVar]: vars.colors.surface.active,
          })}
          data-overflow="true"
          aria-label={`${overflowCount} more`}
        >
          {`+${overflowCount}`}
        </span>
      );

      const wrapped =
        showOverflowTooltip && hiddenNames.length > 0 ? (
          <Tooltip title={hiddenNames.join(', ')} placement="top">
            {overflowEl}
          </Tooltip>
        ) : (
          overflowEl
        );

      // The wrapper span owns the spacing rule (`:not(:first-child)`), so the
      // overlap stays correct whether or not Tooltip injects its own trigger
      // div between this wrapper and the +N span.
      return (
        <span className={avatarGroupItemStyle} style={{ zIndex: 0 }}>
          {wrapped}
        </span>
      );
    };

    return (
      <div
        ref={ref}
        className={cx(avatarGroupRootStyle, className)}
        style={{ ...spacingStyle, ...style }}
        data-testid={testId}
        {...rest}
      >
        {visibleItems.map((child, index) => {
          const childKey = child.key ?? index;
          const itemZIndex = visibleItems.length - index;
          return (
            <span
              key={childKey}
              className={avatarGroupItemStyle}
              style={{ zIndex: itemZIndex }}
            >
              {React.cloneElement(child, {
                size,
                bordered,
              })}
            </span>
          );
        })}
        {renderOverflow()}
      </div>
    );
  }
);

AvatarGroup.displayName = 'AvatarGroup';
