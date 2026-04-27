import { style } from '@vanilla-extract/css';
import { recipe } from '@vanilla-extract/recipes';
import { vars } from '@/theme/contract.css';

export const textAreaContainerStyle = style({
  display: 'flex',
  flexDirection: 'column',
  gap: vars.spacing.xs,
  width: '100%',
});

export const textAreaWrapperRecipe = recipe({
  base: {
    position: 'relative',
    display: 'flex',
    border: '1px solid',
    borderRadius: vars.borderRadius.md,
    transition: `all ${vars.transitions.normal}`,
    boxSizing: 'border-box',

    '@media': {
      '(prefers-reduced-motion: reduce)': {
        transition: 'none',
      },
    },
  },
  variants: {
    size: {
      sm: {
        minHeight: '48px',
        padding: `${vars.spacing.xs} ${vars.spacing.sm}`,
      },
      md: {
        minHeight: '64px',
        padding: `${vars.spacing.sm} ${vars.spacing.md}`,
      },
      lg: {
        minHeight: '88px',
        padding: `${vars.spacing.md} ${vars.spacing.lg}`,
      },
    },
    error: {
      true: { borderColor: vars.colors.border.error },
      false: {},
    },
    disabled: {
      true: {
        background: vars.colors.surface.disabled,
        opacity: 0.5,
        cursor: 'not-allowed',
      },
      false: { background: vars.colors.surface.default },
    },
    focused: { true: {}, false: {} },
  },
  compoundVariants: [
    {
      variants: { focused: true, error: false },
      style: {
        borderColor: vars.colors.border.focus,
        boxShadow: `0 0 0 2px color-mix(in srgb, ${vars.colors.accent.primary} 12.5%, transparent)`,
      },
    },
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
    {
      variants: { focused: false, error: false, disabled: true },
      style: { borderColor: vars.colors.border.default },
    },
  ],
  defaultVariants: {
    size: 'md',
    error: false,
    disabled: false,
    focused: false,
  },
});

export const textAreaRecipe = recipe({
  base: {
    flex: 1,
    width: '100%',
    border: 'none',
    outline: 'none',
    background: 'transparent',
    fontFamily: vars.typography.fontFamily.sans,
    color: vars.colors.text.primary,
    lineHeight: vars.typography.lineHeight.normal,
    boxSizing: 'border-box',

    '::placeholder': {
      color: vars.colors.text.muted,
    },
    ':disabled': {
      cursor: 'not-allowed',
    },
  },
  variants: {
    size: {
      sm: { fontSize: vars.typography.fontSize.md },
      md: { fontSize: vars.typography.fontSize.md },
      lg: { fontSize: vars.typography.fontSize.lg },
    },
    monospace: {
      true: { fontFamily: vars.typography.fontFamily.mono },
    },
  },
  defaultVariants: { size: 'md' },
});

export const textAreaFooterStyle = style({
  display: 'flex',
  justifyContent: 'flex-end',
  fontSize: vars.typography.fontSize.xs,
  color: vars.colors.text.muted,
});
