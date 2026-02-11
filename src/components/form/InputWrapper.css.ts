import { recipe, type RecipeVariants } from '@vanilla-extract/recipes';
import { vars } from '@/theme/contract.css';

export const inputWrapperRecipe = recipe({
  base: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    border: '1px solid',
    borderRadius: vars.borderRadius.md,
    transition: `all ${vars.transitions.normal}`,
  },

  variants: {
    size: {
      sm: {
        height: '20px',
        padding: `0 ${vars.spacing.sm}`,
      },
      md: {
        height: '24px',
        padding: `0 ${vars.spacing.md}`,
      },
      lg: {
        height: '32px',
        padding: `0 ${vars.spacing.lg}`,
      },
    },

    error: {
      true: {
        borderColor: vars.colors.border.error,
      },
      false: {},
    },

    disabled: {
      true: {
        background: vars.colors.surface.disabled,
        opacity: 0.5,
        cursor: 'not-allowed',
      },
      false: {
        background: vars.colors.surface.default,
      },
    },

    focused: {
      true: {},
      false: {},
    },
  },

  compoundVariants: [
    // Focused, not error: focus border + ring
    {
      variants: { focused: true, error: false },
      style: {
        borderColor: vars.colors.border.focus,
        boxShadow: `0 0 0 2px color-mix(in srgb, ${vars.colors.accent.primary} 12.5%, transparent)`,
      },
    },
    // Not focused, not error, not disabled: default border
    {
      variants: { focused: false, error: false, disabled: false },
      style: {
        borderColor: vars.colors.border.default,
        selectors: {
          '&:hover:not(:focus-within)': {
            borderColor: vars.colors.border.focus,
          },
        },
      },
    },
    // Not focused, not error, disabled: default border (no hover)
    {
      variants: { focused: false, error: false, disabled: true },
      style: {
        borderColor: vars.colors.border.default,
      },
    },
  ],

  defaultVariants: {
    size: 'md',
    error: false,
    disabled: false,
    focused: false,
  },
});

export type InputWrapperVariants = RecipeVariants<typeof inputWrapperRecipe>;
