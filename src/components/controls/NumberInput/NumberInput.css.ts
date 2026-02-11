import { style, globalStyle } from '@vanilla-extract/css';
import { recipe } from '@vanilla-extract/recipes';
import { vars } from '@/theme/contract.css';

// --- Container ---
export const numberInputContainerStyle = style({
  display: 'flex',
  flexDirection: 'column',
  gap: vars.spacing.xs,
});

export const containerHoveredStyle = style({
  cursor: 'ew-resize',
});

export const containerDraggingStyle = style({
  cursor: 'ew-resize',
  userSelect: 'none',
});

// --- Label ---
export const labelRecipe = recipe({
  base: {
    fontSize: vars.typography.fontSize.sm,
    fontWeight: vars.typography.fontWeight.medium,
    lineHeight: vars.typography.lineHeight.tight,
  },
  variants: {
    disabled: {
      true: {
        color: vars.colors.text.disabled,
      },
      false: {
        color: vars.colors.text.secondary,
      },
    },
  },
  defaultVariants: {
    disabled: false,
  },
});

// --- Step button ---
const stepButtonBase = style({
  position: 'absolute',
  top: '1px',
  bottom: '1px',
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: 0,
  zIndex: 1,
  transition: `opacity ${vars.transitions.fast}`,
  selectors: {
    '&:hover': {
      background: vars.colors.surface.hover,
      borderRadius: vars.borderRadius.sm,
    },
    '&:active': {
      background: vars.colors.surface.active,
    },
  },
});

globalStyle(`${stepButtonBase}:hover svg`, {
  color: vars.colors.text.primary,
});

export const stepButtonRecipe = recipe({
  base: [stepButtonBase],
  variants: {
    position: {
      left: { left: '1px' },
      right: { right: '1px' },
    },
    size: {
      sm: { width: '18px' },
      md: { width: '22px' },
      lg: { width: '28px' },
    },
    visible: {
      true: {
        opacity: 1,
        pointerEvents: 'auto',
      },
      false: {
        opacity: 0,
        pointerEvents: 'none',
      },
    },
  },
  defaultVariants: {
    position: 'left',
    size: 'md',
    visible: false,
  },
});

export const stepButtonIconLeftStyle = style({
  transform: 'rotate(90deg)',
  color: vars.colors.text.muted,
  transition: `color ${vars.transitions.fast}`,
});

export const stepButtonIconRightStyle = style({
  transform: 'rotate(-90deg)',
  color: vars.colors.text.muted,
  transition: `color ${vars.transitions.fast}`,
});

// --- Input ---
export const inputRecipe = recipe({
  base: {
    flex: 1,
    border: 'none',
    outline: 'none',
    background: 'transparent',
    fontFamily: 'inherit',
    color: vars.colors.text.primary,
    textAlign: 'center',
    selectors: {
      '&::placeholder': {
        color: vars.colors.text.muted,
      },
      '&:disabled': {
        cursor: 'not-allowed',
      },
      '&::-webkit-outer-spin-button': {
        WebkitAppearance: 'none',
        margin: 0,
      },
      '&::-webkit-inner-spin-button': {
        WebkitAppearance: 'none',
        margin: 0,
      },
      "&[type='number']": {
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

// --- Value display ---
export const valueDisplayRecipe = recipe({
  base: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    pointerEvents: 'none',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    color: vars.colors.text.primary,
  },
  variants: {
    size: {
      sm: { fontSize: vars.typography.fontSize.md },
      md: { fontSize: vars.typography.fontSize.md },
      lg: { fontSize: vars.typography.fontSize.lg },
    },
    hasStepButtons: {
      true: {},
      false: {},
    },
  },
  compoundVariants: [
    {
      variants: { hasStepButtons: true, size: 'sm' },
      style: { maxWidth: 'calc(100% - 40px)' },
    },
    {
      variants: { hasStepButtons: true, size: 'md' },
      style: { maxWidth: 'calc(100% - 48px)' },
    },
    {
      variants: { hasStepButtons: true, size: 'lg' },
      style: { maxWidth: 'calc(100% - 60px)' },
    },
  ],
  defaultVariants: {
    size: 'md',
    hasStepButtons: false,
  },
});

// --- Unit label ---
export const unitLabelStyle = style({
  color: vars.colors.text.muted,
  whiteSpace: 'nowrap',
});

// --- Helper text ---
export const helperTextRecipe = recipe({
  base: {
    fontSize: vars.typography.fontSize.xs,
    lineHeight: vars.typography.lineHeight.tight,
  },
  variants: {
    error: {
      true: {
        color: vars.colors.accent.error,
      },
      false: {
        color: vars.colors.text.muted,
      },
    },
  },
  defaultVariants: {
    error: false,
  },
});
