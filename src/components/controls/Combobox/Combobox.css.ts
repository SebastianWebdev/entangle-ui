import { keyframes, style } from '@vanilla-extract/css';
import { recipe } from '@vanilla-extract/recipes';
import { vars } from '@/theme/contract.css';

export const containerStyle = style({
  display: 'flex',
  flexDirection: 'column',
  position: 'relative',
});

export const inputWrapperRecipe = recipe({
  base: {
    display: 'flex',
    alignItems: 'center',
    gap: vars.spacing.xs,
    width: '100%',
    borderRadius: vars.borderRadius.md,
    transition: `border-color ${vars.transitions.fast}, background ${vars.transitions.fast}, box-shadow ${vars.transitions.fast}`,
    fontFamily: vars.typography.fontFamily.sans,

    '@media': {
      '(prefers-reduced-motion: reduce)': {
        transition: 'none',
      },
    },
  },
  variants: {
    size: {
      sm: {
        height: '20px',
        padding: `0 ${vars.spacing.sm}`,
        fontSize: vars.typography.fontSize.xs,
      },
      md: {
        height: '24px',
        padding: `0 ${vars.spacing.md}`,
        fontSize: vars.typography.fontSize.xs,
      },
      lg: {
        height: '32px',
        padding: `0 ${vars.spacing.md}`,
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
      true: { borderColor: vars.colors.accent.error },
      false: {},
    },
    disabled: {
      true: { opacity: 0.5, cursor: 'not-allowed' },
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

export const inputStyle = style({
  flex: 1,
  minWidth: 0,
  border: 'none',
  outline: 'none',
  background: 'transparent',
  color: 'inherit',
  fontFamily: 'inherit',
  fontSize: 'inherit',
  padding: 0,
  selectors: {
    '&::placeholder': { color: vars.colors.text.muted },
    '&:disabled': { cursor: 'not-allowed' },
  },
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

export const chevronButtonStyle = style({
  padding: 0,
  margin: 0,
  border: 'none',
  background: 'none',
  outline: 'none',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
  color: vars.colors.text.muted,
  selectors: {
    '&:disabled': {
      cursor: 'not-allowed',
      opacity: 0.5,
    },
  },
});

export const chevronIconRecipe = recipe({
  base: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: `transform ${vars.transitions.fast}`,
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

  '@media': {
    '(prefers-reduced-motion: reduce)': {
      animation: 'none',
    },
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

export const optionLabelStyle = style({
  flex: 1,
  minWidth: 0,
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
});

export const optionDescriptionStyle = style({
  color: vars.colors.text.muted,
  fontSize: vars.typography.fontSize.xs,
  marginLeft: 'auto',
  whiteSpace: 'nowrap',
});

export const emptyMessageStyle = style({
  padding: vars.spacing.md,
  textAlign: 'center',
  color: vars.colors.text.muted,
  fontSize: vars.typography.fontSize.md,
});

export const checkmarkStyle = style({
  marginLeft: 'auto',
  flexShrink: 0,
  color: vars.colors.accent.primary,
  display: 'flex',
  alignItems: 'center',
});

export const createRowStyle = style({
  fontStyle: 'italic',
});
