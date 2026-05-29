import { createVar, style } from '@vanilla-extract/css';
import { recipe } from '@vanilla-extract/recipes';

import { vars } from '@/theme/contract.css';

/**
 * Custom property exposing the requested aspect ratio for `Card.Media`.
 * Set per-instance via `assignInlineVars`.
 */
export const cardMediaAspectVar = createVar();

export const cardRecipe = recipe({
  base: {
    display: 'flex',
    flexDirection: 'column',
    boxSizing: 'border-box',
    position: 'relative',
    borderRadius: vars.borderRadius.md,
    overflow: 'hidden',
    transition: `box-shadow ${vars.transitions.fast}, background-color ${vars.transitions.fast}, border-color ${vars.transitions.fast}, transform ${vars.transitions.fast}`,
    border: '1px solid transparent',
    color: vars.colors.text.primary,
  },

  variants: {
    variant: {
      outlined: {
        background: 'transparent',
        borderColor: vars.colors.border.default,
      },
      filled: {
        background: vars.colors.surface.default,
        borderColor: 'transparent',
      },
      elevated: {
        background: vars.colors.surface.default,
        borderColor: 'transparent',
        boxShadow: vars.shadows.md,
      },
    },

    interactive: {
      true: {
        cursor: 'pointer',
        selectors: {
          '&:hover': {
            background: vars.colors.surface.hover,
          },
          '&:focus-visible': {
            outline: `2px solid ${vars.colors.border.focus}`,
            outlineOffset: '2px',
          },
          '&:active': {
            background: vars.colors.surface.active,
          },
        },
      },
    },

    selected: {
      true: {
        borderColor: vars.colors.accent.primary,
        background: `color-mix(in srgb, ${vars.colors.accent.primary} 8%, transparent)`,
      },
    },

    disabled: {
      true: {
        opacity: 0.6,
        cursor: 'not-allowed',
        pointerEvents: 'none',
      },
    },
  },

  compoundVariants: [
    {
      variants: { variant: 'elevated', interactive: true },
      style: {
        selectors: {
          '&:hover': {
            boxShadow: vars.shadows.lg,
          },
        },
      },
    },
  ],

  defaultVariants: {
    variant: 'outlined',
  },
});

export const cardHeaderStyle = style({
  display: 'flex',
  alignItems: 'flex-start',
  gap: vars.spacing.md,
  padding: vars.spacing.lg,
});

export const cardHeaderLeadingStyle = style({
  flexShrink: 0,
  display: 'flex',
  alignItems: 'center',
});

export const cardHeaderTextStyle = style({
  flex: 1,
  minWidth: 0,
  display: 'flex',
  flexDirection: 'column',
  gap: vars.spacing.xs,
});

export const cardHeaderTitleStyle = style({
  fontSize: vars.typography.fontSize.md,
  fontWeight: vars.typography.fontWeight.semibold,
  lineHeight: vars.typography.lineHeight.tight,
  color: vars.colors.text.primary,
  margin: 0,
});

export const cardHeaderSubtitleStyle = style({
  fontSize: vars.typography.fontSize.sm,
  color: vars.colors.text.secondary,
  margin: 0,
});

export const cardHeaderTrailingStyle = style({
  flexShrink: 0,
  display: 'flex',
  alignItems: 'center',
  gap: vars.spacing.xs,
});

export const cardMediaStyle = style({
  position: 'relative',
  width: '100%',
  aspectRatio: cardMediaAspectVar,
  overflow: 'hidden',
  background: vars.colors.background.inset,
});

export const cardMediaImageStyle = style({
  width: '100%',
  height: '100%',
  objectFit: 'cover',
  display: 'block',
});

export const cardBodyStyle = style({
  padding: vars.spacing.lg,
  fontSize: vars.typography.fontSize.sm,
  color: vars.colors.text.secondary,
  lineHeight: vars.typography.lineHeight.normal,
  flex: 1,
});

export const cardFooterStyle = recipe({
  base: {
    display: 'flex',
    alignItems: 'center',
    gap: vars.spacing.sm,
    padding: vars.spacing.lg,
    borderTop: `1px solid ${vars.colors.border.default}`,
  },

  variants: {
    align: {
      left: { justifyContent: 'flex-start' },
      center: { justifyContent: 'center' },
      right: { justifyContent: 'flex-end' },
      'space-between': { justifyContent: 'space-between' },
    },
  },

  defaultVariants: {
    align: 'right',
  },
});
