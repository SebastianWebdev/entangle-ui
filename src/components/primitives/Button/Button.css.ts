import { recipe, type RecipeVariants } from '@vanilla-extract/recipes';
import { style, keyframes } from '@vanilla-extract/css';
import { vars } from '@/theme/contract.css';

export const buttonRecipe = recipe({
  base: {
    margin: 0,
    border: 'none',
    outline: 'none',
    cursor: 'pointer',
    userSelect: 'none',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: 'inherit',
    fontWeight: vars.typography.fontWeight.medium,
    borderRadius: vars.borderRadius.md,
    transition: `all ${vars.transitions.normal}`,

    ':focus-visible': {
      boxShadow: vars.shadows.focus,
    },

    ':disabled': {
      opacity: 0.5,
      cursor: 'not-allowed',
    },
  },

  variants: {
    variant: {
      default: {
        background: 'transparent',
        border: `1px solid ${vars.colors.border.default}`,
        color: vars.colors.text.primary,
        selectors: {
          '&:hover:not(:disabled)': {
            background: vars.colors.surface.hover,
            borderColor: 'transparent',
          },
          '&:active:not(:disabled)': {
            background: vars.colors.surface.active,
          },
        },
      },
      ghost: {
        background: 'transparent',
        border: '1px solid transparent',
        color: vars.colors.text.secondary,
        selectors: {
          '&:hover:not(:disabled)': {
            background: vars.colors.surface.hover,
            color: vars.colors.text.primary,
          },
          '&:active:not(:disabled)': {
            background: vars.colors.surface.active,
          },
        },
      },
      filled: {
        background: vars.colors.accent.primary,
        border: `1px solid ${vars.colors.accent.primary}`,
        color: 'white',
        selectors: {
          '&:hover:not(:disabled)': {
            background: vars.colors.accent.secondary,
            borderColor: vars.colors.accent.secondary,
          },
          '&:active:not(:disabled)': {
            background: vars.colors.accent.secondary,
          },
        },
      },
    },

    size: {
      sm: {
        height: '20px',
        padding: `0 ${vars.spacing.sm}`,
        fontSize: vars.typography.fontSize.md,
        gap: vars.spacing.xs,
      },
      md: {
        height: '24px',
        padding: `0 ${vars.spacing.md}`,
        fontSize: vars.typography.fontSize.md,
        gap: vars.spacing.sm,
      },
      lg: {
        height: '32px',
        padding: `0 ${vars.spacing.xl}`,
        fontSize: vars.typography.fontSize.lg,
        gap: vars.spacing.md,
      },
    },

    fullWidth: {
      true: {
        width: '100%',
      },
    },
  },

  defaultVariants: {
    variant: 'default',
    size: 'md',
  },
});

export type ButtonVariants = RecipeVariants<typeof buttonRecipe>;

const spin = keyframes({
  to: { transform: 'rotate(360deg)' },
});

export const loadingSpinnerStyle = style({
  width: '16px',
  height: '16px',
  border: '2px solid currentColor',
  borderTopColor: 'transparent',
  borderRadius: '50%',
  animation: `${spin} 1s linear infinite`,
});

export const iconWrapperStyle = style({
  width: '16px',
  height: '16px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
});
