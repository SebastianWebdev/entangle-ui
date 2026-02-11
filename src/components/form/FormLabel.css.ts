import { recipe, type RecipeVariants } from '@vanilla-extract/recipes';
import { style } from '@vanilla-extract/css';
import { vars } from '@/theme/contract.css';

export const formLabelRecipe = recipe({
  base: {
    fontSize: vars.typography.fontSize.sm,
    fontWeight: vars.typography.fontWeight.medium,
    lineHeight: vars.typography.lineHeight.tight,
    marginBottom: vars.spacing.xs,
    display: 'inline-block',
  },

  variants: {
    disabled: {
      true: {
        color: vars.colors.text.disabled,
      },
      false: {
        color: vars.colors.text.secondary,
      },
    },
  },

  defaultVariants: {
    disabled: false,
  },
});

export type FormLabelVariants = RecipeVariants<typeof formLabelRecipe>;

export const requiredIndicatorStyle = style({
  color: vars.colors.accent.error,
  marginLeft: '2px',
});
