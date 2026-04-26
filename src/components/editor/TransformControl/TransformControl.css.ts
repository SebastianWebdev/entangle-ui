import { style } from '@vanilla-extract/css';
import { recipe } from '@vanilla-extract/recipes';
import { vars } from '@/theme/contract.css';

/**
 * Outer wrapper. The component intentionally renders no `PropertySection`
 * — consumers slot it inside their own section. The wrapper is just a
 * vertical stack of rows.
 */
export const transformRoot = style({
  display: 'flex',
  flexDirection: 'column',
  width: '100%',
});

/**
 * The inner control container of the scale row holds the lock toggle
 * followed by the `VectorInput`. We keep the toggle on the left so the
 * row visually echoes Blender / Unity conventions where uniform-scale
 * locks sit before the value triplet.
 */
export const scaleRowInner = style({
  display: 'flex',
  alignItems: 'center',
  gap: vars.spacing.xs,
  width: '100%',
  minWidth: 0,
});

export const scaleVectorWrapper = style({
  flex: 1,
  minWidth: 0,
});

/**
 * Lock toggle for the linked-scale state. Visually mirrors VectorInput's
 * own link button so the two read as the same control family.
 */
export const lockButtonRecipe = recipe({
  base: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: `1px solid ${vars.colors.border.default}`,
    borderRadius: vars.borderRadius.sm,
    cursor: 'pointer',
    padding: 0,
    transition: `background ${vars.transitions.fast}, color ${vars.transitions.fast}`,
    flexShrink: 0,
    selectors: {
      '&:hover': {
        background: vars.colors.surface.hover,
      },
      '&:focus-visible': {
        outline: `2px solid ${vars.colors.accent.primary}`,
        outlineOffset: '1px',
      },
      '&:disabled': {
        opacity: 0.5,
        cursor: 'not-allowed',
      },
    },
  },
  variants: {
    active: {
      true: {
        background: `color-mix(in srgb, ${vars.colors.accent.primary} 13%, transparent)`,
        color: vars.colors.accent.primary,
        borderColor: `color-mix(in srgb, ${vars.colors.accent.primary} 40%, ${vars.colors.border.default})`,
      },
      false: {
        background: 'transparent',
        color: vars.colors.text.muted,
      },
    },
    size: {
      sm: { width: '20px', height: '20px', minWidth: '20px' },
      md: { width: '24px', height: '24px', minWidth: '24px' },
      lg: { width: '28px', height: '28px', minWidth: '28px' },
    },
  },
  defaultVariants: {
    active: true,
    size: 'sm',
  },
});
