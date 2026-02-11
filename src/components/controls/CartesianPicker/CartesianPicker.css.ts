import { style, createVar } from '@vanilla-extract/css';
import { recipe } from '@vanilla-extract/recipes';
import { vars } from '@/theme/contract.css';

export const pickerWidthVar = createVar();

export const cartesianPickerRecipe = recipe({
  base: {
    display: 'flex',
    flexDirection: 'column',
    border: `1px solid ${vars.colors.border.default}`,
    borderRadius: vars.borderRadius.md,
    overflow: 'hidden',
    background: vars.colors.background.secondary,
  },
  variants: {
    disabled: {
      true: { opacity: 0.6 },
      false: {},
    },
    responsive: {
      true: { width: '100%' },
      false: { width: pickerWidthVar },
    },
  },
  defaultVariants: {
    disabled: false,
    responsive: false,
  },
});

export const bottomBarStyle = style({
  borderTop: `1px solid ${vars.colors.border.default}`,
  background: vars.colors.surface.default,
  padding: `${vars.spacing.xs} ${vars.spacing.sm}`,
  flexShrink: 0,
});
