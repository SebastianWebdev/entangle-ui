'use client';

import { assignInlineVars } from '@vanilla-extract/dynamic';
import React, { useCallback, useState } from 'react';

import { UserIcon } from '@/components/Icons';
import { vars } from '@/theme/contract.css';
import { cx } from '@/utils/cx';

import {
  avatarBgVar,
  avatarFallbackStyle,
  avatarImageInheritRadius,
  avatarImageStyle,
  avatarRecipe,
  avatarStatusRecipe,
  avatarStatusVar,
} from './Avatar.css';

import type { AvatarColor, AvatarProps, AvatarStatus } from './Avatar.types';

const NAMED_COLOR_MAP: Record<string, string> = {
  neutral: vars.colors.text.muted,
  primary: vars.colors.accent.primary,
  info: vars.colors.accent.primary,
  success: vars.colors.accent.success,
  warning: vars.colors.accent.warning,
  error: vars.colors.accent.error,
};

const AUTO_PALETTE: readonly string[] = [
  vars.colors.accent.primary,
  vars.colors.accent.secondary,
  vars.colors.accent.success,
  vars.colors.accent.warning,
  vars.colors.accent.error,
];

const STATUS_COLOR_MAP: Record<AvatarStatus, string> = {
  online: vars.colors.accent.success,
  away: vars.colors.accent.warning,
  busy: vars.colors.accent.error,
  offline: vars.colors.text.muted,
};

const STATUS_LABEL_MAP: Record<AvatarStatus, string> = {
  online: 'Online',
  away: 'Away',
  busy: 'Busy',
  offline: 'Offline',
};

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i += 1) {
    hash = (hash * 31 + str.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

/**
 * Derive 1- or 2-letter initials from a display name.
 *
 * Single-word names contribute their first two characters; multi-word names
 * contribute the first character of the first and last word.
 */
export function getAvatarInitials(name: string): string {
  const trimmed = name.trim();
  if (!trimmed) return '';
  const parts = trimmed.split(/\s+/);
  const firstWord = parts[0] ?? '';
  if (parts.length === 1) {
    return firstWord.slice(0, 2).toUpperCase();
  }
  const lastWord = parts[parts.length - 1] ?? '';
  const first = firstWord[0] ?? '';
  const last = lastWord[0] ?? '';
  return (first + last).toUpperCase();
}

function resolveBackgroundColor(
  color: AvatarColor,
  name: string | undefined
): string {
  if (color === 'auto') {
    if (!name?.trim()) {
      return vars.colors.text.muted;
    }
    const index = hashString(name) % AUTO_PALETTE.length;
    return AUTO_PALETTE[index] ?? vars.colors.text.muted;
  }
  const named = NAMED_COLOR_MAP[color];
  if (named) return named;
  return color;
}

const DefaultUserIcon: React.FC = () => (
  <UserIcon size="60%" color="currentColor" decorative />
);

/**
 * Display a person, agent, or named entity.
 *
 * Renders an image when `src` is provided; if it fails to load (or no `src`
 * was given) falls back to initials derived from `name`, then to a generic
 * user icon. A deterministic auto color keeps a given `name` looking the
 * same across renders while different names look distinct.
 *
 * Provide `onClick` to render the avatar as an interactive button (focusable,
 * Enter/Space-activatable, hover affordance).
 *
 * @example
 * ```tsx
 * <Avatar src="/users/alice.png" name="Alice Wong" />
 * <Avatar name="Sebastian Kowalski" status="online" />
 * <Avatar name="Bot" color="primary" shape="rounded" />
 * <Avatar name="Owner" size="xl" onClick={openProfile} />
 * ```
 */
export const Avatar = /*#__PURE__*/ React.memo<AvatarProps>(
  ({
    src,
    alt,
    name,
    initials,
    fallbackIcon,
    size = 'md',
    shape = 'circle',
    color = 'auto',
    status,
    onClick,
    bordered = false,
    className,
    style,
    testId,
    'aria-label': ariaLabelProp,
    ref,
    ...rest
  }) => {
    const [imageOk, setImageOk] = useState<boolean>(true);

    const handleImageError = useCallback(() => {
      setImageOk(false);
    }, []);

    const handleImageLoad = useCallback(() => {
      setImageOk(true);
    }, []);

    const handleKeyDown = useCallback(
      (event: React.KeyboardEvent<HTMLSpanElement>) => {
        if (!onClick) return;
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onClick(event);
        }
      },
      [onClick]
    );

    const resolvedInitials =
      initials !== undefined && initials !== ''
        ? initials.slice(0, 2).toUpperCase()
        : name
          ? getAvatarInitials(name)
          : '';

    const hasInitials = resolvedInitials.length > 0;
    const showImage = Boolean(src) && imageOk;

    const bg = resolveBackgroundColor(color, name);
    const accessibleName = ariaLabelProp ?? name ?? alt;

    const inlineVars: Record<string, string> = {
      [avatarBgVar]: bg,
    };
    if (status) {
      inlineVars[avatarStatusVar] = STATUS_COLOR_MAP[status];
    }

    const interactive = Boolean(onClick);

    return (
      <span
        ref={ref}
        className={cx(
          avatarRecipe({
            size,
            shape,
            bordered: bordered || undefined,
            interactive: interactive || undefined,
          }),
          className
        )}
        style={{ ...assignInlineVars(inlineVars), ...style }}
        data-testid={testId}
        data-size={size}
        data-shape={shape}
        role={interactive ? 'button' : 'img'}
        tabIndex={interactive ? 0 : undefined}
        onClick={onClick}
        onKeyDown={interactive ? handleKeyDown : undefined}
        aria-label={accessibleName}
        {...rest}
      >
        <span className={avatarFallbackStyle} aria-hidden={showImage}>
          {hasInitials ? (
            resolvedInitials
          ) : fallbackIcon !== undefined ? (
            fallbackIcon
          ) : (
            <DefaultUserIcon />
          )}
        </span>

        {src && (
          <img
            src={src}
            alt={alt ?? name ?? ''}
            className={cx(avatarImageStyle, avatarImageInheritRadius)}
            data-loaded={imageOk ? 'true' : 'false'}
            onError={handleImageError}
            onLoad={handleImageLoad}
            draggable={false}
          />
        )}

        {status && (
          <span
            className={avatarStatusRecipe({ size })}
            data-status={status}
            role="status"
            aria-label={`Status: ${STATUS_LABEL_MAP[status]}`}
          />
        )}
      </span>
    );
  }
);

Avatar.displayName = 'Avatar';
