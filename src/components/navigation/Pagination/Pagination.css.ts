import { style } from '@vanilla-extract/css';
import { recipe } from '@vanilla-extract/recipes';

import { vars } from '@/theme/contract.css';

export const paginationRootStyle = style({
  display: 'inline-flex',
  alignItems: 'center',
});

export const paginationListRecipe = recipe({
  base: {
    display: 'inline-flex',
    alignItems: 'center',
    listStyle: 'none',
    margin: 0,
    padding: 0,
  },

  variants: {
    size: {
      sm: { gap: vars.spacing.xs },
      md: { gap: vars.spacing.xs },
      lg: { gap: vars.spacing.sm },
    },
  },

  defaultVariants: {
    size: 'md',
  },
});

export const paginationItemStyle = style({
  display: 'inline-flex',
});

export const paginationButtonRecipe = recipe({
  base: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxSizing: 'border-box',
    padding: `0 ${vars.spacing.xs}`,
    fontFamily: vars.typography.fontFamily.sans,
    fontWeight: vars.typography.fontWeight.medium,
    lineHeight: 1,
    color: vars.colors.text.primary,
    background: 'transparent',
    border: '1px solid transparent',
    borderRadius: vars.borderRadius.md,
    cursor: 'pointer',
    userSelect: 'none',
    transition: `background-color ${vars.transitions.fast}, color ${vars.transitions.fast}, border-color ${vars.transitions.fast}`,

    selectors: {
      '&:hover:not(:disabled)': {
        background: vars.colors.surface.hover,
      },
      '&:focus-visible': {
        outline: `2px solid ${vars.colors.border.focus}`,
        outlineOffset: '2px',
      },
      '&:disabled': {
        cursor: 'not-allowed',
        opacity: 0.5,
      },
    },
  },

  variants: {
    size: {
      sm: {
        minWidth: '24px',
        height: '24px',
        fontSize: vars.typography.fontSize.xs,
      },
      md: {
        minWidth: '32px',
        height: '32px',
        fontSize: vars.typography.fontSize.sm,
      },
      lg: {
        minWidth: '40px',
        height: '40px',
        fontSize: vars.typography.fontSize.md,
      },
    },

    selected: {
      true: {
        background: vars.colors.accent.primary,
        color: 'white',
        borderColor: vars.colors.accent.primary,
        selectors: {
          '&:hover:not(:disabled)': {
            background: vars.colors.accent.secondary,
            borderColor: vars.colors.accent.secondary,
          },
        },
      },
    },
  },

  defaultVariants: {
    size: 'md',
  },
});

export const paginationEllipsisRecipe = recipe({
  base: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxSizing: 'border-box',
    color: vars.colors.text.secondary,
    userSelect: 'none',
  },

  variants: {
    size: {
      sm: {
        minWidth: '24px',
        height: '24px',
        fontSize: vars.typography.fontSize.xs,
      },
      md: {
        minWidth: '32px',
        height: '32px',
        fontSize: vars.typography.fontSize.sm,
      },
      lg: {
        minWidth: '40px',
        height: '40px',
        fontSize: vars.typography.fontSize.md,
      },
    },
  },

  defaultVariants: {
    size: 'md',
  },
});

export const paginationIconStyle = style({
  display: 'inline-flex',
  width: '1em',
  height: '1em',
});
