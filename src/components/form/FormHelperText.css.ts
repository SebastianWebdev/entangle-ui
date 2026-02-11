import { recipe, type RecipeVariants } from '@vanilla-extract/recipes';
import { vars } from '@/theme/contract.css';

export const formHelperTextRecipe = recipe({
  base: {
    fontSize: vars.typography.fontSize.xs,
    lineHeight: vars.typography.lineHeight.tight,
    marginTop: vars.spacing.xs,
  },

  variants: {
    error: {
      true: {
        color: vars.colors.accent.error,
      },
      false: {
        color: vars.colors.text.muted,
      },
    },
  },

  defaultVariants: {
    error: false,
  },
});

export type FormHelperTextVariants = RecipeVariants<
  typeof formHelperTextRecipe
>;
