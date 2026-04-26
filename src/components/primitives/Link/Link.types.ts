import type React from 'react';
import type { Size } from '@/types/common';
import type { LiteralUnion, Prettify } from '@/types/utilities';

/**
 * Link size — mirrors the typography scale.
 */
export type LinkSize = Size;

/**
 * Visual style of the link.
 *
 * - `default`: accent color, underline behavior driven by `underline` prop
 * - `subtle`: secondary text color, hover reveals accent
 * - `inline`: matches surrounding text color, always underlined — for prose
 */
export type LinkVariant = 'default' | 'subtle' | 'inline';

/**
 * Color override for the link.
 *
 * `primary` and `secondary` map onto the theme's accent and muted text
 * tokens; `inherit` defers to the surrounding text color. Any other CSS
 * color string is also accepted.
 */
export type LinkColor = LiteralUnion<'primary' | 'secondary' | 'inherit'>;

/**
 * Underline behavior.
 */
export type LinkUnderline = 'always' | 'hover' | 'never';

export interface LinkBaseProps extends Omit<
  React.AnchorHTMLAttributes<HTMLAnchorElement>,
  'color' | 'href'
> {
  /** Destination URL */
  href?: string;

  /**
   * Polymorphic root override. Pass a router's link component here:
   * `<Link as={RouterLink} to="/foo">...</Link>`.
   *
   * The replacement receives every prop except `as`. This is the only
   * place in the library where `as` is supported — Link needs it to
   * integrate cleanly with router libraries; other components don't.
   */
  as?: React.ElementType;

  /**
   * Visual variant.
   * @default "default"
   */
  variant?: LinkVariant;

  /**
   * Color override. Defaults follow the variant — `primary` for `default`,
   * `secondary` for `subtle`, `inherit` for `inline`.
   */
  color?: LinkColor;

  /**
   * Underline behavior.
   * @default "hover" (forced to "always" for variant="inline")
   */
  underline?: LinkUnderline;

  /**
   * Size — matches the typography scale.
   * @default "md"
   */
  size?: LinkSize;

  /**
   * Render as an external link. Auto-detected when `href` starts with
   * `http://` or `https://` — explicit prop overrides detection.
   *
   * External links get `target="_blank"`, `rel="noopener noreferrer"`,
   * an external-link icon, and an "(opens in new tab)" announcement for
   * screen readers.
   */
  external?: boolean;

  /**
   * Disable the link. Renders as a `<span>` with disabled styling and no
   * `href`, so the browser does not navigate.
   * @default false
   */
  disabled?: boolean;

  /** Link content */
  children: React.ReactNode;

  /** Additional CSS class names */
  className?: string;

  /** Custom inline styles */
  style?: React.CSSProperties;

  /** Test identifier for automated testing */
  testId?: string;

  ref?: React.Ref<HTMLAnchorElement>;
}

export type LinkProps = Prettify<LinkBaseProps>;
