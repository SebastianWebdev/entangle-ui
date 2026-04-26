'use client';

import React from 'react';
import { assignInlineVars } from '@vanilla-extract/dynamic';
import { vars } from '@/theme/contract.css';
import { cx } from '@/utils/cx';
import type { LinkColor, LinkProps, LinkVariant } from './Link.types';
import {
  externalIconStyle,
  linkColorVar,
  linkHoverColorVar,
  linkRecipe,
  srOnlyStyle,
} from './Link.css';

const EXTERNAL_PROTOCOL_RE = /^https?:\/\//i;

/**
 * Defaults — keep variant and color in sync so consumers can pass either
 * (or both) without surprising results.
 */
const VARIANT_DEFAULT_COLOR: Record<LinkVariant, LinkColor> = {
  default: 'primary',
  subtle: 'secondary',
  inline: 'inherit',
};

const VARIANT_DEFAULT_UNDERLINE = {
  default: 'hover',
  subtle: 'hover',
  inline: 'always',
} as const;

const NAMED_COLOR_TOKENS: Record<string, { base: string; hover: string }> = {
  primary: {
    base: vars.colors.accent.primary,
    hover: vars.colors.accent.secondary,
  },
  secondary: {
    base: vars.colors.text.secondary,
    hover: vars.colors.accent.primary,
  },
  inherit: {
    base: 'inherit',
    hover: vars.colors.accent.primary,
  },
};

function resolveLinkColor(color: LinkColor): { base: string; hover: string } {
  const named = NAMED_COLOR_TOKENS[color as string];
  if (named) return named;
  return { base: color, hover: color };
}

const ExternalIcon: React.FC = () => (
  <svg
    className={externalIconStyle}
    viewBox="0 0 12 12"
    fill="none"
    aria-hidden="true"
    focusable="false"
  >
    <path
      d="M4 2h6v6"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M10 2L5 7"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M9 7v3H2V3h3"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

/**
 * Styled anchor primitive.
 *
 * Standardises link color, underline behavior, hover/focus states, and
 * external-link affordances. Polymorphic via `as` so it can wrap a
 * router's link component (react-router, TanStack Router, Next.js).
 *
 * Scope: **styling-only**, not router-aware. Pass your router's link
 * component via `as` for client-side navigation.
 *
 * @example
 * ```tsx
 * <Link href="/docs">Documentation</Link>
 *
 * <Link href="https://example.com">External</Link> // auto-detected
 *
 * <Link as={RouterLink} to="/profile">
 *   Profile
 * </Link>
 *
 * <Text>
 *   Read the <Link variant="inline" href="/guide">guide</Link> first.
 * </Text>
 * ```
 */
export const Link = /*#__PURE__*/ React.memo<LinkProps>(
  ({
    href,
    as,
    variant = 'default',
    color,
    underline,
    size = 'md',
    external,
    disabled = false,
    children,
    className,
    style,
    testId,
    ref,
    'aria-label': ariaLabel,
    ...rest
  }) => {
    const resolvedColor = color ?? VARIANT_DEFAULT_COLOR[variant];
    const resolvedUnderline = underline ?? VARIANT_DEFAULT_UNDERLINE[variant];

    const isExternal =
      external ?? (typeof href === 'string' && EXTERNAL_PROTOCOL_RE.test(href));

    const { base, hover } = resolveLinkColor(resolvedColor);
    const inlineVars = assignInlineVars({
      [linkColorVar]: base,
      [linkHoverColorVar]: hover,
    });

    const Component: React.ElementType = as ?? (disabled ? 'span' : 'a');

    const commonProps = {
      ref,
      className: cx(
        linkRecipe({
          variant,
          underline: resolvedUnderline,
          size,
          disabled: disabled || undefined,
        }),
        className
      ),
      style: { ...inlineVars, ...style },
      'data-testid': testId,
      'data-disabled': disabled || undefined,
    };

    const externalProps =
      isExternal && !disabled
        ? {
            target: '_blank',
            rel: 'noopener noreferrer',
          }
        : {};

    const anchorHref = disabled ? undefined : href;
    const ariaProps = ariaLabel
      ? {
          'aria-label': isExternal
            ? `${ariaLabel} (opens in new tab)`
            : ariaLabel,
        }
      : {};

    return (
      <Component
        {...rest}
        {...commonProps}
        {...(Component === 'a' || as ? { href: anchorHref } : {})}
        {...externalProps}
        {...ariaProps}
        aria-disabled={disabled || undefined}
      >
        {children}
        {isExternal && (
          <>
            <ExternalIcon />
            {!ariaLabel && (
              <span className={srOnlyStyle}> (opens in new tab)</span>
            )}
          </>
        )}
      </Component>
    );
  }
);

Link.displayName = 'Link';
