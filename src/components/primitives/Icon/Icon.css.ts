import { recipe, type RecipeVariants } from '@vanilla-extract/recipes';
import { vars } from '@/theme/contract.css';

export const iconRecipe = recipe({
  base: {
    display: 'inline-block',
    verticalAlign: 'middle',
    flexShrink: 0,
    userSelect: 'none',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 2,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    shapeRendering: 'geometricPrecision',
  },

  variants: {
    size: {
      sm: {
        width: '12px',
        height: '12px',
      },
      md: {
        width: '16px',
        height: '16px',
      },
      lg: {
        width: '20px',
        height: '20px',
      },
    },

    color: {
      primary: { color: vars.colors.text.primary },
      secondary: { color: vars.colors.text.secondary },
      muted: { color: vars.colors.text.muted },
      accent: { color: vars.colors.accent.primary },
      success: { color: vars.colors.accent.success },
      warning: { color: vars.colors.accent.warning },
      error: { color: vars.colors.accent.error },
    },
  },

  defaultVariants: {
    size: 'md',
    color: 'primary',
  },
});

export type IconVariants = RecipeVariants<typeof iconRecipe>;
