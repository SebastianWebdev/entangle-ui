import { style } from '@vanilla-extract/css';
import { recipe } from '@vanilla-extract/recipes';
import { vars } from '@/theme/contract.css';

export const kbdRoot = style({
  display: 'inline-flex',
  alignItems: 'center',
  verticalAlign: 'middle',
  whiteSpace: 'nowrap',
});

export const keycapRecipe = recipe({
  base: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxSizing: 'border-box',
    borderRadius: vars.borderRadius.sm,
    fontFamily: vars.typography.fontFamily.mono,
    lineHeight: 1,
    whiteSpace: 'nowrap',
    verticalAlign: 'middle',
  },

  variants: {
    size: {
      sm: {
        height: '16px',
        minWidth: '16px',
        padding: `0 ${vars.spacing.sm}`,
        fontSize: vars.typography.fontSize.xxs,
      },
      md: {
        height: '20px',
        minWidth: '20px',
        padding: `0 calc(${vars.spacing.sm} + ${vars.spacing.xs})`,
        fontSize: vars.typography.fontSize.xs,
      },
      lg: {
        height: '24px',
        minWidth: '24px',
        padding: `0 ${vars.spacing.md}`,
        fontSize: vars.typography.fontSize.sm,
      },
    },

    variant: {
      solid: {
        background: vars.colors.surface.default,
        border: `1px solid ${vars.colors.border.default}`,
        color: vars.colors.text.primary,
        boxShadow: `inset 0 -1px 0 0 ${vars.colors.surface.disabled}`,
      },
      outline: {
        background: 'transparent',
        border: `1px solid ${vars.colors.border.default}`,
        color: vars.colors.text.secondary,
      },
      ghost: {
        background: 'transparent',
        border: 'none',
        color: vars.colors.text.muted,
        fontWeight: vars.typography.fontWeight.semibold,
      },
    },
  },

  defaultVariants: {
    size: 'md',
    variant: 'outline',
  },
});

export const separatorStyle = style({
  display: 'inline-flex',
  alignItems: 'center',
  color: vars.colors.text.muted,
  fontFamily: vars.typography.fontFamily.mono,
  fontSize: vars.typography.fontSize.xs,
  lineHeight: 1,
});
