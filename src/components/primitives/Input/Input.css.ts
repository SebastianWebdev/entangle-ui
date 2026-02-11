import { style } from '@vanilla-extract/css';
import { recipe } from '@vanilla-extract/recipes';
import { vars } from '@/theme/contract.css';

export const inputContainerStyle = style({
  display: 'flex',
  flexDirection: 'column',
  gap: vars.spacing.xs,
});

export const labelRecipe = recipe({
  base: {
    fontSize: vars.typography.fontSize.sm,
    fontWeight: vars.typography.fontWeight.medium,
    lineHeight: vars.typography.lineHeight.tight,
  },

  variants: {
    disabled: {
      true: { color: vars.colors.text.disabled },
      false: { color: vars.colors.text.secondary },
    },
  },

  defaultVariants: {
    disabled: false,
  },
});

export const inputRecipe = recipe({
  base: {
    flex: 1,
    border: 'none',
    outline: 'none',
    background: 'transparent',
    fontFamily: 'inherit',
    color: vars.colors.text.primary,

    '::placeholder': {
      color: vars.colors.text.muted,
    },

    ':disabled': {
      cursor: 'not-allowed',
    },

    selectors: {
      '&::-webkit-outer-spin-button, &::-webkit-inner-spin-button': {
        WebkitAppearance: 'none',
        margin: 0,
      },
      '&[type="number"]': {
        MozAppearance: 'textfield',
      },
    },
  },

  variants: {
    size: {
      sm: { fontSize: vars.typography.fontSize.md },
      md: { fontSize: vars.typography.fontSize.md },
      lg: { fontSize: vars.typography.fontSize.lg },
    },
  },

  defaultVariants: {
    size: 'md',
  },
});

export const iconStartStyle = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: vars.colors.text.muted,
  marginRight: '6px',
});

export const iconEndStyle = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: vars.colors.text.muted,
  marginLeft: '6px',
});

export const iconChildStyle = style({
  width: '14px',
  height: '14px',
});

export const helperTextRecipe = recipe({
  base: {
    fontSize: vars.typography.fontSize.xs,
    lineHeight: vars.typography.lineHeight.tight,
  },

  variants: {
    error: {
      true: { color: vars.colors.accent.error },
      false: { color: vars.colors.text.muted },
    },
  },

  defaultVariants: {
    error: false,
  },
});
