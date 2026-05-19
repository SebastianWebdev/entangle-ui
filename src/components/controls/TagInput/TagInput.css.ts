import { style } from '@vanilla-extract/css';
import { recipe } from '@vanilla-extract/recipes';
import { vars } from '@/theme/contract.css';

export const containerStyle = style({
  display: 'flex',
  flexDirection: 'column',
  width: '100%',
});

export const wrapperRecipe = recipe({
  base: {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: vars.spacing.xs,
    width: '100%',
    minHeight: '24px',
    borderRadius: vars.borderRadius.md,
    transition: `border-color ${vars.transitions.fast}, background ${vars.transitions.fast}, box-shadow ${vars.transitions.fast}`,
    fontFamily: vars.typography.fontFamily.sans,
    cursor: 'text',

    '@media': {
      '(prefers-reduced-motion: reduce)': {
        transition: 'none',
      },
    },
  },
  variants: {
    size: {
      sm: {
        minHeight: '20px',
        padding: `2px ${vars.spacing.xs}`,
        fontSize: vars.typography.fontSize.xs,
      },
      md: {
        minHeight: '24px',
        padding: `2px ${vars.spacing.sm}`,
        fontSize: vars.typography.fontSize.xs,
      },
      lg: {
        minHeight: '32px',
        padding: `4px ${vars.spacing.md}`,
        fontSize: vars.typography.fontSize.sm,
      },
    },
    variant: {
      default: {
        background: 'transparent',
        border: `1px solid ${vars.colors.border.default}`,
        color: vars.colors.text.primary,
      },
      ghost: {
        background: 'transparent',
        border: '1px solid transparent',
        color: vars.colors.text.primary,
      },
      filled: {
        background: vars.colors.surface.default,
        border: `1px solid ${vars.colors.border.default}`,
        color: vars.colors.text.primary,
      },
    },
    focused: {
      true: {
        borderColor: vars.colors.border.focus,
        boxShadow: vars.shadows.focus,
      },
      false: {},
    },
    error: {
      true: {
        borderColor: vars.colors.accent.error,
      },
      false: {},
    },
    disabled: {
      true: {
        opacity: 0.5,
        cursor: 'not-allowed',
      },
      false: {},
    },
  },
  defaultVariants: {
    size: 'md',
    variant: 'default',
    focused: false,
    error: false,
    disabled: false,
  },
});

export const tagRecipe = recipe({
  base: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: vars.spacing.xs,
    padding: `0 ${vars.spacing.xs}`,
    height: '18px',
    borderRadius: vars.borderRadius.sm,
    background: vars.colors.surface.active,
    color: vars.colors.text.primary,
    fontSize: vars.typography.fontSize.xs,
    lineHeight: 1,
    whiteSpace: 'nowrap',
    maxWidth: '100%',
  },
  variants: {
    size: {
      sm: { height: '16px', fontSize: '10px' },
      md: { height: '18px', fontSize: vars.typography.fontSize.xs },
      lg: { height: '22px', fontSize: vars.typography.fontSize.sm },
    },
    invalid: {
      true: {
        background: vars.colors.accent.error,
        color: vars.colors.text.primary,
      },
      false: {},
    },
  },
  defaultVariants: {
    size: 'md',
    invalid: false,
  },
});

export const tagLabelStyle = style({
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
});

export const tagRemoveStyle = style({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '12px',
  height: '12px',
  padding: 0,
  margin: 0,
  border: 'none',
  background: 'transparent',
  color: 'inherit',
  opacity: 0.7,
  cursor: 'pointer',
  borderRadius: vars.borderRadius.sm,
  selectors: {
    '&:hover': { opacity: 1 },
    '&:focus-visible': {
      outline: 'none',
      boxShadow: vars.shadows.focus,
    },
    '&:disabled': {
      cursor: 'not-allowed',
      opacity: 0.4,
    },
  },
});

export const inputStyle = style({
  flex: '1 1 60px',
  minWidth: '60px',
  border: 'none',
  outline: 'none',
  background: 'transparent',
  color: 'inherit',
  fontFamily: 'inherit',
  fontSize: 'inherit',
  padding: '0 2px',
  selectors: {
    '&::placeholder': { color: vars.colors.text.muted },
    '&:disabled': { cursor: 'not-allowed' },
  },
});
