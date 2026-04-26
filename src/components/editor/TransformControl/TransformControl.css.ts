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
 * Inner control container for every transform row (position, rotation,
 * scale). Each row reserves the same prefix slot on the left so all three
 * `VectorInput`s end up with identical width — the scale row uses that
 * slot for the lock toggle, the others fill it with an invisible spacer.
 */
export const rowInner = style({
  display: 'flex',
  alignItems: 'center',
  gap: vars.spacing.xs,
  width: '100%',
  minWidth: 0,
});

export const rowVectorWrapper = style({
  flex: 1,
  minWidth: 0,
});

/**
 * Invisible placeholder rendered in the Position / Rotation rows that
 * matches the dimensions of the lock toggle, so all three rows align.
 */
export const lockSpacerRecipe = recipe({
  base: {
    flexShrink: 0,
    visibility: 'hidden',
    pointerEvents: 'none',
  },
  variants: {
    size: {
      sm: { width: '20px', height: '20px', minWidth: '20px' },
      md: { width: '24px', height: '24px', minWidth: '24px' },
      lg: { width: '28px', height: '28px', minWidth: '28px' },
    },
  },
  defaultVariants: {
    size: 'sm',
  },
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
