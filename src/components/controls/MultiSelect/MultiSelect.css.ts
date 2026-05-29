import { style, keyframes } from '@vanilla-extract/css';
import { recipe } from '@vanilla-extract/recipes';

import { vars } from '@/theme/contract.css';

export const containerStyle = style({
  display: 'flex',
  flexDirection: 'column',
  position: 'relative',
});

export const triggerRecipe = recipe({
  base: {
    margin: 0,
    fontFamily: 'inherit',
    userSelect: 'none',
    outline: 'none',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    fontWeight: vars.typography.fontWeight.normal,
    borderRadius: vars.borderRadius.md,
    transition: `all ${vars.transitions.fast}`,
    textAlign: 'left' as const,
    gap: vars.spacing.sm,
    minWidth: 0,
    width: '100%',

    selectors: {
      '&:disabled': {
        opacity: 0.5,
        cursor: 'not-allowed',
      },
      '&:focus-visible': {
        boxShadow: vars.shadows.focus,
      },
    },

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
        padding: `0 ${vars.spacing.sm}`,
        fontSize: vars.typography.fontSize.xs,
      },
      md: {
        minHeight: '24px',
        padding: `0 ${vars.spacing.md}`,
        fontSize: vars.typography.fontSize.xs,
      },
      lg: {
        minHeight: '32px',
        padding: `0 ${vars.spacing.xl}`,
        fontSize: vars.typography.fontSize.sm,
      },
    },
    variant: {
      default: {
        background: 'transparent',
        border: `1px solid ${vars.colors.border.default}`,
        color: vars.colors.text.primary,
        selectors: {
          '&:hover:not(:disabled)': {
            background: vars.colors.surface.hover,
            borderColor: 'transparent',
          },
        },
      },
      ghost: {
        background: 'transparent',
        border: '1px solid transparent',
        color: vars.colors.text.primary,
        selectors: {
          '&:hover:not(:disabled)': {
            background: vars.colors.surface.hover,
          },
        },
      },
      filled: {
        background: vars.colors.surface.default,
        border: `1px solid ${vars.colors.border.default}`,
        color: vars.colors.text.primary,
        selectors: {
          '&:hover:not(:disabled)': {
            borderColor: vars.colors.border.focus,
          },
        },
      },
    },
    open: {
      true: {},
      false: {},
    },
    error: {
      true: {},
      false: {},
    },
    disabled: {
      true: { cursor: 'not-allowed' },
      false: { cursor: 'pointer' },
    },
    empty: {
      true: {},
      false: {},
    },
  },
  compoundVariants: [
    {
      variants: { open: true },
      style: { boxShadow: vars.shadows.focus },
    },
    {
      variants: { error: true, variant: 'default' },
      style: { borderColor: vars.colors.accent.error },
    },
    {
      variants: { error: true, variant: 'filled' },
      style: { borderColor: vars.colors.accent.error },
    },
    {
      variants: { open: true, variant: 'default' },
      style: { borderColor: vars.colors.border.focus },
    },
    {
      variants: { open: true, variant: 'filled' },
      style: { borderColor: vars.colors.border.focus },
    },
    {
      variants: { empty: true, variant: 'default' },
      style: { color: vars.colors.text.muted },
    },
    {
      variants: { empty: true, variant: 'ghost' },
      style: { color: vars.colors.text.muted },
    },
    {
      variants: { empty: true, variant: 'filled' },
      style: { color: vars.colors.text.muted },
    },
  ],
  defaultVariants: {
    size: 'md',
    variant: 'default',
    open: false,
    disabled: false,
    error: false,
    empty: true,
  },
});

export const triggerContentStyle = style({
  display: 'flex',
  alignItems: 'center',
  flexWrap: 'wrap',
  gap: vars.spacing.xs,
  overflow: 'hidden',
  minWidth: 0,
  flex: 1,
  paddingTop: 2,
  paddingBottom: 2,
});

export const chipRecipe = recipe({
  base: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: vars.spacing.xs,
    padding: `0 ${vars.spacing.xs}`,
    borderRadius: vars.borderRadius.sm,
    background: vars.colors.surface.active,
    color: vars.colors.text.primary,
    lineHeight: 1,
    whiteSpace: 'nowrap',
    maxWidth: '100%',
  },
  variants: {
    size: {
      sm: { height: '14px', fontSize: '10px' },
      md: { height: '16px', fontSize: vars.typography.fontSize.xs },
      lg: { height: '20px', fontSize: vars.typography.fontSize.sm },
    },
  },
  defaultVariants: {
    size: 'md',
  },
});

export const chipLabelStyle = style({
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
});

export const chipRemoveStyle = style({
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
  cursor: 'pointer',
  opacity: 0.7,
  borderRadius: vars.borderRadius.sm,
  selectors: {
    '&:hover': { opacity: 1 },
  },
});

export const moreBadgeStyle = style({
  display: 'inline-flex',
  alignItems: 'center',
  padding: `0 ${vars.spacing.xs}`,
  height: '16px',
  borderRadius: vars.borderRadius.sm,
  background: vars.colors.surface.default,
  color: vars.colors.text.secondary,
  fontSize: vars.typography.fontSize.xs,
});

export const placeholderStyle = style({
  color: vars.colors.text.muted,
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
});

export const clearButtonStyle = style({
  padding: 0,
  margin: 0,
  border: 'none',
  background: 'none',
  outline: 'none',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: vars.colors.text.muted,
  flexShrink: 0,
  selectors: {
    '&:hover': { color: vars.colors.text.primary },
  },
});

export const chevronRecipe = recipe({
  base: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    transition: `transform ${vars.transitions.fast}`,
    color: vars.colors.text.muted,

    '@media': {
      '(prefers-reduced-motion: reduce)': {
        transition: 'none',
      },
    },
  },
  variants: {
    open: {
      true: { transform: 'rotate(180deg)' },
      false: { transform: 'rotate(0deg)' },
    },
  },
  defaultVariants: { open: false },
});

const dropdownIn = keyframes({
  from: { opacity: 0, transform: 'scaleY(0.96)' },
  to: { opacity: 1, transform: 'scaleY(1)' },
});

export const dropdownStyle = style({
  position: 'fixed',
  zIndex: vars.zIndex.dropdown,
  background: vars.colors.background.elevated,
  border: `1px solid ${vars.colors.border.default}`,
  borderRadius: vars.borderRadius.md,
  boxShadow: vars.shadows.lg,
  overflow: 'hidden',
  fontFamily: vars.typography.fontFamily.sans,
  animation: `${dropdownIn} ${vars.transitions.fast} forwards`,
  display: 'flex',
  flexDirection: 'column',
  minWidth: 0,

  '@media': {
    '(prefers-reduced-motion: reduce)': {
      animation: 'none',
    },
  },
});

export const searchInputStyle = style({
  width: '100%',
  padding: `${vars.spacing.sm} ${vars.spacing.md}`,
  border: 'none',
  borderBottom: `1px solid ${vars.colors.border.default}`,
  background: 'transparent',
  color: vars.colors.text.primary,
  fontSize: vars.typography.fontSize.md,
  outline: 'none',
  fontFamily: 'inherit',
  selectors: {
    '&::placeholder': { color: vars.colors.text.muted },
  },
});

export const optionsListStyle = style({
  width: '100%',
  overflowY: 'auto',
});

export const optionItemRecipe = recipe({
  base: {
    display: 'flex',
    alignItems: 'center',
    padding: `${vars.spacing.sm} ${vars.spacing.md}`,
    fontSize: vars.typography.fontSize.md,
    gap: vars.spacing.sm,
    transition: `background ${vars.transitions.fast}`,
  },
  variants: {
    active: {
      true: { background: vars.colors.surface.hover },
      false: {},
    },
    selected: {
      true: { background: vars.colors.surface.active },
      false: {},
    },
    disabled: {
      true: {
        color: vars.colors.text.disabled,
        cursor: 'not-allowed',
        opacity: 0.5,
      },
      false: {
        color: vars.colors.text.primary,
        cursor: 'pointer',
        selectors: {
          '&:hover': { background: vars.colors.surface.hover },
        },
      },
    },
  },
  defaultVariants: {
    active: false,
    selected: false,
    disabled: false,
  },
});

export const groupLabelStyle = style({
  padding: `${vars.spacing.sm} ${vars.spacing.md}`,
  fontSize: vars.typography.fontSize.xs,
  color: vars.colors.text.muted,
  textTransform: 'uppercase',
  fontWeight: vars.typography.fontWeight.medium,
  letterSpacing: '0.5px',
});

export const emptyMessageStyle = style({
  padding: vars.spacing.md,
  textAlign: 'center',
  color: vars.colors.text.muted,
  fontSize: vars.typography.fontSize.md,
});

export const checkboxRecipe = recipe({
  base: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '14px',
    height: '14px',
    borderRadius: vars.borderRadius.sm,
    border: `1px solid ${vars.colors.border.default}`,
    flexShrink: 0,
    background: vars.colors.background.primary,
    color: vars.colors.text.primary,
  },
  variants: {
    selected: {
      true: {
        background: vars.colors.accent.primary,
        borderColor: vars.colors.accent.primary,
      },
      false: {},
    },
  },
  defaultVariants: { selected: false },
});
