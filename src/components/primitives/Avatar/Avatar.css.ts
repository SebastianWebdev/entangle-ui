import { createVar, style } from '@vanilla-extract/css';
import { recipe } from '@vanilla-extract/recipes';
import { vars } from '@/theme/contract.css';

/**
 * Per-instance background color resolved from the `color` prop. Used for the
 * initials / icon fallback surface.
 */
export const avatarBgVar = createVar();

/**
 * Status-dot color, set per-instance from the `status` prop.
 */
export const avatarStatusVar = createVar();

export const avatarRecipe = recipe({
  base: {
    position: 'relative',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    overflow: 'visible',
    boxSizing: 'border-box',
    fontFamily: vars.typography.fontFamily.sans,
    fontWeight: vars.typography.fontWeight.semibold,
    color: vars.colors.text.primary,
    background: avatarBgVar,
    userSelect: 'none',
    verticalAlign: 'middle',
    lineHeight: 1,
  },

  variants: {
    size: {
      xs: {
        width: '16px',
        height: '16px',
        fontSize: vars.typography.fontSize.xxs,
      },
      sm: {
        width: '20px',
        height: '20px',
        fontSize: vars.typography.fontSize.xs,
      },
      md: {
        width: '24px',
        height: '24px',
        fontSize: vars.typography.fontSize.sm,
      },
      lg: {
        width: '32px',
        height: '32px',
        fontSize: vars.typography.fontSize.md,
      },
      xl: {
        width: '40px',
        height: '40px',
        fontSize: vars.typography.fontSize.lg,
      },
      xxl: {
        width: '56px',
        height: '56px',
        fontSize: vars.typography.fontSize.xl,
      },
    },

    shape: {
      circle: { borderRadius: '50%' },
      square: { borderRadius: vars.borderRadius.none },
      rounded: { borderRadius: vars.borderRadius.md },
    },

    bordered: {
      true: {
        boxShadow: `0 0 0 2px ${vars.colors.background.primary}`,
      },
    },

    interactive: {
      true: {
        cursor: 'pointer',
        transition: `transform ${vars.transitions.fast}, box-shadow ${vars.transitions.fast}`,
        ':hover': {
          transform: 'scale(1.04)',
        },
        ':focus-visible': {
          outline: 'none',
          boxShadow: vars.shadows.focus,
        },

        '@media': {
          '(prefers-reduced-motion: reduce)': {
            transition: 'none',
          },
        },
      },
    },
  },

  defaultVariants: {
    size: 'md',
    shape: 'circle',
  },
});

/**
 * The fallback content (initials text or icon) sits in the centre of the
 * avatar surface. It is always rendered so it shows behind a loading image —
 * an image that successfully loads simply paints over it.
 */
export const avatarFallbackStyle = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '100%',
  height: '100%',
  textTransform: 'uppercase',
  letterSpacing: '0.02em',
});

/**
 * The image overlays the fallback. When the image errors, the consumer toggles
 * the `data-loaded="false"` attribute and we hide the image entirely so the
 * underlying initials/icon become visible.
 */
export const avatarImageStyle = style({
  position: 'absolute',
  inset: 0,
  width: '100%',
  height: '100%',
  objectFit: 'cover',
  display: 'block',
  selectors: {
    '&[data-loaded="false"]': {
      display: 'none',
    },
  },
});

/**
 * Inherit the parent's border radius so the image clips correctly for any
 * shape. Applied via the parent recipe's `borderRadius` value.
 */
export const avatarImageInheritRadius = style({
  borderRadius: 'inherit',
});

/**
 * Status indicator dot positioned bottom-right. Size is a fixed fraction of
 * the avatar — small enough to read as a presence cue, large enough to remain
 * legible at the smallest avatar size.
 */
export const avatarStatusRecipe = recipe({
  base: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    background: avatarStatusVar,
    border: `2px solid ${vars.colors.background.primary}`,
    borderRadius: '50%',
    boxSizing: 'content-box',
    pointerEvents: 'none',
  },
  variants: {
    size: {
      xs: { width: '4px', height: '4px', borderWidth: '1px' },
      sm: { width: '5px', height: '5px', borderWidth: '1px' },
      md: { width: '6px', height: '6px', borderWidth: '1.5px' },
      lg: { width: '8px', height: '8px', borderWidth: '2px' },
      xl: { width: '10px', height: '10px', borderWidth: '2px' },
      xxl: { width: '14px', height: '14px', borderWidth: '2px' },
    },
  },
  defaultVariants: {
    size: 'md',
  },
});

/**
 * Per-instance overlap spacing for AvatarGroup, set via inline vars from the
 * `spacing` prop. Negative values produce overlap; the leftmost avatar stays
 * on top via descending z-index.
 */
export const avatarGroupSpacingVar = createVar();

export const avatarGroupRootStyle = style({
  display: 'inline-flex',
  alignItems: 'center',
  flexDirection: 'row',
  isolation: 'isolate',
});

export const avatarGroupItemStyle = style({
  position: 'relative',
  selectors: {
    '&:not(:first-child)': {
      marginLeft: avatarGroupSpacingVar,
    },
  },
});
