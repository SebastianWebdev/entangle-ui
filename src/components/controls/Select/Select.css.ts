import { style, createVar, keyframes } from '@vanilla-extract/css';
import { recipe } from '@vanilla-extract/recipes';
import { vars } from '@/theme/contract.css';

// --- Container ---
export const selectContainerStyle = style({
  display: 'flex',
  flexDirection: 'column',
  position: 'relative',
});

// --- Trigger ---
export const chevronSizeVar = createVar();

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
    selectors: {
      '&:disabled': {
        opacity: 0.5,
        cursor: 'not-allowed',
      },
      '&:focus-visible': {
        boxShadow: vars.shadows.focus,
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
    disabled: {
      true: { cursor: 'not-allowed' },
      false: { cursor: 'pointer' },
    },
    hasValue: {
      true: {},
      false: {},
    },
    open: {
      true: {},
      false: {},
    },
    error: {
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
      variants: { hasValue: false, variant: 'default' },
      style: { color: vars.colors.text.muted },
    },
    {
      variants: { hasValue: false, variant: 'ghost' },
      style: { color: vars.colors.text.muted },
    },
    {
      variants: { hasValue: false, variant: 'filled' },
      style: { color: vars.colors.text.muted },
    },
  ],
  defaultVariants: {
    size: 'md',
    variant: 'default',
    disabled: false,
    hasValue: false,
    open: false,
    error: false,
  },
});

// --- Trigger content ---
export const triggerContentStyle = style({
  display: 'flex',
  alignItems: 'center',
  gap: vars.spacing.sm,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  minWidth: 0,
  flex: 1,
});

// --- Chevron ---
export const chevronRecipe = recipe({
  base: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    transition: `transform ${vars.transitions.fast}`,
    color: vars.colors.text.muted,
  },
  variants: {
    open: {
      true: { transform: 'rotate(180deg)' },
      false: { transform: 'rotate(0deg)' },
    },
  },
  defaultVariants: {
    open: false,
  },
});

// --- Clear button ---
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
    '&:hover': {
      color: vars.colors.text.primary,
    },
  },
});

// --- Dropdown ---
const selectDropdownIn = keyframes({
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
  animation: `${selectDropdownIn} ${vars.transitions.fast} forwards`,
});

// --- Search input ---
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
    '&::placeholder': {
      color: vars.colors.text.muted,
    },
  },
});

// --- Options list ---
export const optionsListStyle = style({
  width: '100%',
});

// --- Option item ---
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
    highlighted: {
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
          '&:hover': {
            background: vars.colors.surface.hover,
          },
        },
      },
    },
  },
  compoundVariants: [
    {
      variants: { highlighted: true },
      style: { background: vars.colors.surface.hover },
    },
  ],
  defaultVariants: {
    highlighted: false,
    selected: false,
    disabled: false,
  },
});

// --- Group label ---
export const groupLabelStyle = style({
  padding: `${vars.spacing.sm} ${vars.spacing.md}`,
  fontSize: vars.typography.fontSize.xs,
  color: vars.colors.text.muted,
  textTransform: 'uppercase',
  fontWeight: vars.typography.fontWeight.medium,
  letterSpacing: '0.5px',
  borderBottom: `1px solid ${vars.colors.border.default}`,
});

// --- Empty message ---
export const emptyMessageStyle = style({
  padding: vars.spacing.md,
  textAlign: 'center',
  color: vars.colors.text.muted,
  fontSize: vars.typography.fontSize.md,
});

// --- Checkmark ---
export const checkmarkStyle = style({
  marginLeft: 'auto',
  flexShrink: 0,
  color: vars.colors.accent.primary,
  display: 'flex',
  alignItems: 'center',
});
