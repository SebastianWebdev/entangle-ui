import { recipe, type RecipeVariants } from '@vanilla-extract/recipes';
import { vars } from '@/theme/contract.css';

export const paperRecipe = recipe({
  base: {
    boxSizing: 'border-box',
    position: 'relative',
    borderRadius: vars.borderRadius.md,
    transition: `box-shadow ${vars.transitions.normal}, background-color ${vars.transitions.normal}`,
  },

  variants: {
    elevation: {
      0: {
        boxShadow: 'none',
      },
      1: {
        boxShadow: vars.shadows.sm,
        selectors: {
          '&:hover': {
            boxShadow: vars.shadows.md,
          },
        },
      },
      2: {
        boxShadow: vars.shadows.md,
        selectors: {
          '&:hover': {
            boxShadow: vars.shadows.lg,
          },
        },
      },
      3: {
        boxShadow: vars.shadows.lg,
        selectors: {
          '&:hover': {
            boxShadow: vars.shadows.xl,
          },
        },
      },
    },

    bordered: {
      true: {
        border: `1px solid ${vars.colors.border.default}`,
      },
      false: {},
    },

    padding: {
      xs: { padding: vars.spacing.xs },
      sm: { padding: vars.spacing.sm },
      md: { padding: vars.spacing.md },
      lg: { padding: vars.spacing.lg },
      xl: { padding: vars.spacing.xl },
      xxl: { padding: vars.spacing.xxl },
      xxxl: { padding: vars.spacing.xxxl },
    },

    nestLevel: {
      0: { backgroundColor: vars.colors.background.primary },
      1: { backgroundColor: vars.colors.background.secondary },
      2: { backgroundColor: vars.colors.background.tertiary },
      3: { backgroundColor: vars.colors.background.elevated },
    },

    expand: {
      true: {
        width: '100%',
        height: '100%',
      },
      false: {},
    },
  },

  defaultVariants: {
    elevation: 1,
    bordered: false,
    padding: 'md',
    nestLevel: 0,
    expand: false,
  },
});

export type PaperVariants = RecipeVariants<typeof paperRecipe>;
