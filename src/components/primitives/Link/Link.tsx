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

/**
 * Props stripped from the rest spread when the link is disabled.
 *
 * Without this, `<Link as={RouterLink} disabled to="/x" onClick={fn} />`
 * would still navigate / fire the handler — `aria-disabled` and CSS
 * pointer-events alone don't block keyboard activation or programmatic
 * triggers fired by router libraries.
 */
const NAV_PROPS_TO_STRIP_WHEN_DISABLED = [
  'href',
  'to',
  'onClick',
  'onClickCapture',
  'onPointerDown',
  'onPointerDownCapture',
  'onMouseDown',
  'onMouseDownCapture',
  'onKeyDown',
  'onKeyDownCapture',
  'onKeyUp',
  'onKeyUpCapture',
  'onAuxClick',
  'replace',
  'reloadDocument',
  'preventScrollReset',
  'state',
  'relative',
] as const;

function stripNavProps(
  props: Record<string, unknown>
): Record<string, unknown> {
  const cleaned: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(props)) {
    if ((NAV_PROPS_TO_STRIP_WHEN_DISABLED as readonly string[]).includes(key)) {
      continue;
    }
    cleaned[key] = value;
  }
  return cleaned;
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
 * component via `as` for client-side navigation — the router's props
 * (`to`, `replace`, …) are type-checked automatically.
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
function LinkImpl<E extends React.ElementType = 'a'>(
  props: LinkProps<E>
): React.ReactElement {
  const {
    href,
    as,
    variant,
    color,
    underline,
    size,
    external,
    disabled,
    children,
    className,
    style,
    testId,
    ref,
    'aria-label': ariaLabel,
    ...rest
  } = props;

  const resolvedVariant: LinkVariant = variant ?? 'default';
  const resolvedSize = size ?? 'md';
  const isDisabled = disabled === true;
  const resolvedColor = color ?? VARIANT_DEFAULT_COLOR[resolvedVariant];
  const resolvedUnderline =
    underline ?? VARIANT_DEFAULT_UNDERLINE[resolvedVariant];

  // External affordances only apply when the link is actually navigable.
  // A disabled link with `external` would be misleading: no target, no
  // rel, no real navigation — but icon + "opens in new tab" suggest
  // otherwise. So we suppress all of it.
  const isExternal =
    !isDisabled &&
    (external ?? (typeof href === 'string' && EXTERNAL_PROTOCOL_RE.test(href)));

  const { base, hover } = resolveLinkColor(resolvedColor);
  const inlineVars = assignInlineVars({
    [linkColorVar]: base,
    [linkHoverColorVar]: hover,
  });

  // Disabled forces a non-navigating <span> regardless of `as`. If we
  // honored `as` while disabled, a router link would still respond to
  // `to` / `onClick` because pointer-events: none and aria-disabled are
  // visual hints, not functional locks for programmatic triggers.
  const Component: React.ElementType = isDisabled ? 'span' : (as ?? 'a');

  const cleanedRest = isDisabled
    ? stripNavProps(rest as Record<string, unknown>)
    : (rest as Record<string, unknown>);

  // Only set `href` when rendering a plain anchor and not disabled. For
  // custom `as` components (router links) the navigation prop is the
  // router's own (`to`, `href`, …), passed through `...rest`.
  const hrefProp =
    !isDisabled && Component === 'a' && href !== undefined ? { href } : {};

  const externalAttrs = isExternal
    ? { target: '_blank', rel: 'noopener noreferrer' }
    : {};

  const ariaLabelProp = ariaLabel
    ? {
        'aria-label': isExternal
          ? `${ariaLabel} (opens in new tab)`
          : ariaLabel,
      }
    : {};

  const linkClassName = cx(
    linkRecipe({
      variant: resolvedVariant,
      underline: resolvedUnderline,
      size: resolvedSize,
      disabled: isDisabled || undefined,
    }),
    className
  );

  return (
    <Component
      {...cleanedRest}
      {...hrefProp}
      {...externalAttrs}
      {...ariaLabelProp}
      ref={ref}
      className={linkClassName}
      style={{ ...inlineVars, ...style }}
      data-testid={testId}
      data-disabled={isDisabled || undefined}
      aria-disabled={isDisabled || undefined}
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

/**
 * Public Link signature.
 *
 * Modelled as a callable interface so the polymorphic generic
 * (`<Link as={RouterLink} to="/x" />`) survives the export. `React.memo`
 * is intentionally not applied here — wrapping a generic function in
 * `memo` collapses the call signature and forces an `as unknown as` cast,
 * which the codebase forbids. The library has precedent for non-memoised
 * primitives (e.g. `Switch`), and Link's render is cheap.
 */
interface LinkComponent {
  <E extends React.ElementType = 'a'>(props: LinkProps<E>): React.ReactElement;
  displayName?: string;
}

export const Link = LinkImpl as LinkComponent;
Link.displayName = 'Link';
