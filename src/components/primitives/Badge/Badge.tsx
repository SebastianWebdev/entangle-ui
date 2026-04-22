'use client';

import React, { useCallback } from 'react';
import { assignInlineVars } from '@vanilla-extract/dynamic';
import { vars } from '@/theme/contract.css';
import { cx } from '@/utils/cx';
import type { BadgeColor, BadgeProps } from './Badge.types';
import {
  badgeColorVar,
  badgeContrastVar,
  badgeDotStyle,
  badgeIconStyle,
  badgeRecipe,
  badgeRemoveButtonStyle,
} from './Badge.css';

const NAMED_COLOR_MAP: Record<string, string> = {
  neutral: vars.colors.text.muted,
  primary: vars.colors.accent.primary,
  info: vars.colors.accent.primary,
  success: vars.colors.accent.success,
  warning: vars.colors.accent.warning,
  error: vars.colors.accent.error,
};

/**
 * Resolve a `BadgeColor` to a CSS color value.
 *
 * Named values produce a `var(...)` reference into the theme; everything
 * else is treated as a raw CSS color string (hex, rgb, hsl, …).
 */
function resolveBadgeColor(color: BadgeColor): {
  color: string;
  contrast: string;
} {
  const named = NAMED_COLOR_MAP[color as string];
  if (named) {
    // For neutral we keep contrast as the text primary so solid reads well.
    const contrast =
      color === 'neutral' ? vars.colors.text.primary : vars.colors.text.primary;
    return { color: named, contrast };
  }
  return { color, contrast: '#ffffff' };
}

const RemoveIcon: React.FC = () => (
  <svg
    width="10"
    height="10"
    viewBox="0 0 10 10"
    aria-hidden="true"
    focusable="false"
  >
    <path
      d="M2 2 L8 8 M8 2 L2 8"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  </svg>
);

/**
 * A small inline status indicator / tag.
 *
 * Badges are visual labels for status, counts, or tags. Pair with an
 * editor item to indicate its state (e.g. "DRAFT", "ERROR", "3 NEW").
 *
 * @example
 * ```tsx
 * <Badge color="success">Saved</Badge>
 * <Badge variant="outline" color="warning" icon={<WarningIcon />}>
 *   Warning
 * </Badge>
 * <Badge removable onRemove={handleRemove}>feature/foo</Badge>
 * ```
 */
export const Badge = /*#__PURE__*/ React.memo<BadgeProps>(
  ({
    variant = 'subtle',
    size = 'sm',
    color = 'neutral',
    uppercase = false,
    icon,
    removable = false,
    onRemove,
    children,
    className,
    style,
    testId,
    ref,
    ...rest
  }) => {
    const resolved = resolveBadgeColor(color);

    const handleRemoveClick = useCallback(
      (event: React.MouseEvent<HTMLButtonElement>) => {
        event.stopPropagation();
        onRemove?.(event);
      },
      [onRemove]
    );

    const inlineVars = assignInlineVars({
      [badgeColorVar]: resolved.color,
      [badgeContrastVar]: resolved.contrast,
    });

    return (
      <span
        ref={ref}
        className={cx(
          badgeRecipe({
            variant,
            size,
            uppercase: uppercase || undefined,
          }),
          className
        )}
        style={{ ...inlineVars, ...style }}
        data-testid={testId}
        {...rest}
      >
        {variant === 'dot' && <span className={badgeDotStyle} aria-hidden />}
        {icon && (
          <span className={badgeIconStyle} aria-hidden>
            {icon}
          </span>
        )}
        {children && <span>{children}</span>}
        {removable && (
          <button
            type="button"
            className={badgeRemoveButtonStyle}
            onClick={handleRemoveClick}
            aria-label="Remove"
          >
            <RemoveIcon />
          </button>
        )}
      </span>
    );
  }
);

Badge.displayName = 'Badge';
