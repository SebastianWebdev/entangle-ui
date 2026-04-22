import { recipe } from '@vanilla-extract/recipes';
import { vars } from '@/theme/contract.css';

export const codeRecipe = recipe({
  base: {
    fontFamily: vars.typography.fontFamily.mono,
    background: vars.colors.background.inset,
    color: vars.colors.text.primary,
    padding: `1px ${vars.spacing.sm}`,
    borderRadius: vars.borderRadius.sm,
    lineHeight: 1.4,
    whiteSpace: 'nowrap',
    boxSizing: 'border-box',
  },
  variants: {
    size: {
      xs: { fontSize: '0.8em' },
      sm: { fontSize: '0.9em' },
      md: { fontSize: '1em' },
    },
  },
  defaultVariants: { size: 'sm' },
});
