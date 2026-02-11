import { recipe, type RecipeVariants } from '@vanilla-extract/recipes';
import { style, keyframes, globalStyle } from '@vanilla-extract/css';
import { vars } from '@/theme/contract.css';

const iconButtonBase = style({
  margin: 0,
  padding: 0,
  fontFamily: 'inherit',
  userSelect: 'none',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  transition: `all ${vars.transitions.normal}`,
  outline: 'none',
  position: 'relative',

  ':focus-visible': {
    boxShadow: vars.shadows.focus,
  },

  ':disabled': {
    opacity: 0.5,
    cursor: 'not-allowed',
  },

  selectors: {
    '&:active:not(:disabled)': {
      transform: 'translateY(0.5px)',
    },
  },
});

globalStyle(`${iconButtonBase} > *`, {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
});

export const iconButtonRecipe = recipe({
  base: [iconButtonBase],

  variants: {
    size: {
      sm: {
        width: '20px',
        height: '20px',
        padding: '4px',
      },
      md: {
        width: '24px',
        height: '24px',
        padding: '4px',
      },
      lg: {
        width: '32px',
        height: '32px',
        padding: '6px',
      },
    },

    variant: {
      default: {
        background: 'transparent',
        border: `1px solid ${vars.colors.border.default}`,
        color: vars.colors.text.primary,
        cursor: 'pointer',
        selectors: {
          '&:hover:not(:disabled)': {
            background: vars.colors.surface.hover,
            borderColor: vars.colors.border.focus,
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
        cursor: 'pointer',
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
        cursor: 'pointer',
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

    radius: {
      none: { borderRadius: '0px' },
      sm: { borderRadius: vars.borderRadius.sm },
      md: { borderRadius: vars.borderRadius.md },
      lg: { borderRadius: vars.borderRadius.lg },
      full: { borderRadius: '50%' },
    },

    pressed: {
      true: {
        background: `${vars.colors.surface.active} !important`,
        borderColor: `${vars.colors.border.focus} !important`,
      },
      false: {},
    },
  },

  defaultVariants: {
    size: 'md',
    variant: 'ghost',
    radius: 'md',
    pressed: false,
  },
});

export type IconButtonVariants = RecipeVariants<typeof iconButtonRecipe>;

const spin = keyframes({
  to: { transform: 'rotate(360deg)' },
});

export const loadingSpinnerRecipe = recipe({
  base: {
    border: '2px solid currentColor',
    borderTopColor: 'transparent',
    borderRadius: '50%',
    animation: `${spin} 1s linear infinite`,
  },

  variants: {
    size: {
      sm: { width: '12px', height: '12px' },
      md: { width: '16px', height: '16px' },
      lg: { width: '20px', height: '20px' },
    },
  },

  defaultVariants: {
    size: 'md',
  },
});
