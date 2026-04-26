import type React from 'react';
import type { BaseComponent, Size } from '@/types/common';
import type { LiteralUnion, Prettify } from '@/types/utilities';

/**
 * Avatar size scale.
 *
 * - `xs`  — 16px (used inside dense rows / chips)
 * - `sm`  — 20px
 * - `md`  — 24px (default)
 * - `lg`  — 32px
 * - `xl`  — 40px
 * - `xxl` — 56px (profile headers)
 */
export type AvatarSize = 'xs' | Size | 'xl' | 'xxl';

/**
 * Geometric treatment of the avatar.
 *
 * - `circle`  — full round (default)
 * - `square`  — square corners
 * - `rounded` — slightly rounded corners (`borderRadius.md`)
 */
export type AvatarShape = 'circle' | 'square' | 'rounded';

/**
 * Background color used when an avatar falls back to initials or icon.
 *
 * - `auto` — derived deterministically from `name` (default)
 * - named — maps to theme accents
 * - any other string — passed through verbatim (hex, rgb, hsl, …)
 */
export type AvatarColor = LiteralUnion<
  'auto' | 'neutral' | 'primary' | 'success' | 'warning' | 'error' | 'info'
>;

/**
 * Presence indicator rendered in the bottom-right corner.
 */
export type AvatarStatus = 'online' | 'away' | 'busy' | 'offline';

export interface AvatarBaseProps extends BaseComponent<HTMLSpanElement> {
  /**
   * Image source URL. If the image fails to load, the avatar falls back to
   * initials, then to an icon.
   */
  src?: string;

  /**
   * Alt text for the image. Also used as the accessible name when no `name`
   * is provided.
   */
  alt?: string;

  /**
   * Display name. The first character of the first and last word forms the
   * initials fallback. `"Sebastian Kowalski"` → `"SK"`, `"Sebastian"` → `"S"`.
   */
  name?: string;

  /**
   * Manually set initials, overriding the name-derived ones. Truncated to
   * the first two characters and uppercased.
   */
  initials?: string;

  /**
   * Icon shown when neither `src` nor `name`/`initials` resolves. Defaults to
   * a generic user glyph.
   */
  fallbackIcon?: React.ReactNode;

  /**
   * Avatar size.
   * @default "md"
   */
  size?: AvatarSize;

  /**
   * Avatar shape.
   * @default "circle"
   */
  shape?: AvatarShape;

  /**
   * Background color used for the initials / icon fallback.
   *
   * - `auto` — deterministic hash of `name` (only when `name` is set;
   *   otherwise the muted text token is used)
   * - named — maps to theme accents
   * - other strings — used as raw CSS color
   * @default "auto"
   */
  color?: AvatarColor;

  /**
   * Optional presence indicator.
   */
  status?: AvatarStatus;

  /**
   * Activation handler. When present, the avatar becomes an interactive
   * button (focusable, Enter/Space-activatable). Receives either a mouse
   * event (click) or a keyboard event (Enter/Space).
   */
  onClick?: (
    event:
      | React.MouseEvent<HTMLSpanElement>
      | React.KeyboardEvent<HTMLSpanElement>
  ) => void;

  /**
   * Render a 2px border around the avatar. Useful when avatars overlap inside
   * an `AvatarGroup`.
   * @default false
   */
  bordered?: boolean;
}

export type AvatarProps = Prettify<AvatarBaseProps>;

export interface AvatarGroupBaseProps extends BaseComponent<HTMLDivElement> {
  /**
   * Maximum number of avatars to show before collapsing the rest into a
   * `+N` overflow indicator.
   * @default 4
   */
  max?: number;

  /**
   * Spacing between avatars. Negative values produce overlap. Numbers are
   * interpreted as pixels; strings are passed through.
   * @default -8
   */
  spacing?: number | string;

  /**
   * Size applied to every child avatar (and to the `+N` indicator).
   * @default "md"
   */
  size?: AvatarSize;

  /**
   * Force a border on every child avatar — visually separates overlapping
   * circles.
   * @default true
   */
  bordered?: boolean;

  /**
   * When `true` (default) the `+N` indicator shows a tooltip listing the
   * names of the hidden avatars on hover.
   * @default true
   */
  showOverflowTooltip?: boolean;

  /** Avatar children. */
  children: React.ReactNode;
}

export type AvatarGroupProps = Prettify<AvatarGroupBaseProps>;
