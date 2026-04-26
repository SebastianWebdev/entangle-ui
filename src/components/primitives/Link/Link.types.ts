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

/**
 * Props that belong to Link itself, regardless of which element it renders.
 *
 * These are the keys that get stripped from the underlying element's props
 * when computing `LinkProps<E>` — so consumers don't get conflicts when
 * passing through router-specific props like `to`.
 */
export interface LinkOwnProps {
  /** Destination URL for the default `<a>` rendering. */
  href?: string;

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
   *
   * Ignored when `disabled` is true — disabled links never advertise
   * external behavior.
   */
  external?: boolean;

  /**
   * Disable the link. Renders as a `<span>` (overriding `as`), strips
   * navigation handlers (`href`, `to`, `onClick`), sets `aria-disabled`,
   * and turns off pointer events. The disabled span is also skipped for
   * the external-link affordance.
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
}

/**
 * Polymorphic Link props.
 *
 * The generic `E` is the element type passed via `as`. By default Link
 * renders an `<a>`, so all `<a>`-specific props (target, rel, …) are
 * accepted. Pass `as={RouterLink}` and you also get the router's props
 * (`to`, `replace`, …) typed automatically.
 *
 * Keys defined by `LinkOwnProps` are removed from the underlying
 * element's props so the Link's own meanings always win.
 *
 * @example
 * ```tsx
 * // <a href="...">
 * <Link href="/docs">Docs</Link>
 *
 * // react-router — `to` is typed because LinkProps<RouterLink> includes it
 * <Link as={RouterLink} to="/profile">Profile</Link>
 * ```
 */
export type LinkProps<E extends React.ElementType = 'a'> = Prettify<
  LinkOwnProps & {
    /**
     * Polymorphic root override. Pass a router's link component here:
     * `<Link as={RouterLink} to="/foo">...</Link>`.
     *
     * The replacement receives every prop except `as` and the keys
     * defined by `LinkOwnProps`. This is the only place in the library
     * where `as` is supported — Link needs it to integrate cleanly with
     * router libraries; other components don't.
     */
    as?: E;

    /** Ref to the rendered element. */
    ref?: React.ComponentPropsWithRef<E>['ref'];
  } & Omit<React.ComponentPropsWithoutRef<E>, keyof LinkOwnProps | 'as'>
>;
