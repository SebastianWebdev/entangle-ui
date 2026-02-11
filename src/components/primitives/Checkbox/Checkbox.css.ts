import { style, createVar } from '@vanilla-extract/css';
import { recipe } from '@vanilla-extract/recipes';
import { vars } from '@/theme/contract.css';

// --- Container ---

export const checkboxContainerStyle = style({
  display: 'flex',
  flexDirection: 'column',
});

// --- Label ---

export const checkboxLabelRecipe = recipe({
  base: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: vars.spacing.sm,
    lineHeight: vars.typography.lineHeight.normal,
    userSelect: 'none',
  },

  variants: {
    labelPosition: {
      left: { flexDirection: 'row-reverse' },
      right: { flexDirection: 'row' },
    },

    size: {
      sm: { fontSize: vars.typography.fontSize.xs },
      md: { fontSize: vars.typography.fontSize.sm },
      lg: { fontSize: vars.typography.fontSize.md },
    },

    disabled: {
      true: {
        cursor: 'not-allowed',
        color: vars.colors.text.disabled,
      },
      false: {
        cursor: 'pointer',
        color: vars.colors.text.secondary,
      },
    },
  },

  defaultVariants: {
    labelPosition: 'right',
    size: 'md',
    disabled: false,
  },
});

// --- Box ---

export const boxSizeVar = createVar();

export const checkboxBoxRecipe = recipe({
  base: {
    padding: 0,
    margin: 0,
    border: 'none',
    font: 'inherit',
    outline: 'none',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    width: boxSizeVar,
    height: boxSizeVar,
    borderRadius: vars.borderRadius.sm,
    transition: `all ${vars.transitions.fast}`,

    ':focus-visible': {
      boxShadow: vars.shadows.focus,
    },

    ':disabled': {
      opacity: 0.5,
      cursor: 'not-allowed',
    },
  },

  variants: {
    active: {
      true: {
        background: vars.colors.accent.primary,
        border: `1px solid ${vars.colors.accent.primary}`,
        selectors: {
          '&:hover:not(:disabled)': {
            background: vars.colors.accent.secondary,
            borderColor: vars.colors.accent.secondary,
          },
        },
      },
      false: {
        background: 'transparent',
        border: `1px solid ${vars.colors.border.default}`,
        selectors: {
          '&:hover:not(:disabled)': {
            borderColor: vars.colors.border.focus,
          },
        },
      },
    },

    variant: {
      default: {},
      filled: {},
    },

    disabled: {
      true: {
        cursor: 'not-allowed',
      },
      false: {
        cursor: 'pointer',
      },
    },

    error: {
      true: {},
      false: {},
    },
  },

  compoundVariants: [
    // Error + not active
    {
      variants: { error: true, active: false },
      style: {
        background: 'transparent',
        border: `1px solid ${vars.colors.accent.error}`,
        selectors: {
          '&:hover:not(:disabled)': {
            borderColor: vars.colors.accent.error,
            background: 'transparent',
          },
        },
      },
    },
    // Error + active
    {
      variants: { error: true, active: true },
      style: {
        background: vars.colors.accent.error,
        border: `1px solid ${vars.colors.accent.error}`,
        selectors: {
          '&:hover:not(:disabled)': {
            background: vars.colors.accent.error,
            borderColor: vars.colors.accent.error,
          },
        },
      },
    },
    // Filled variant + not active
    {
      variants: { variant: 'filled', active: false },
      style: {
        background: vars.colors.surface.default,
        border: `1px solid ${vars.colors.border.default}`,
        selectors: {
          '&:hover:not(:disabled)': {
            borderColor: vars.colors.border.focus,
          },
        },
      },
    },
    // Disabled + active
    {
      variants: { disabled: true, active: true },
      style: {
        opacity: 0.5,
        background: vars.colors.accent.primary,
        border: `1px solid ${vars.colors.accent.primary}`,
      },
    },
    // Disabled + not active + filled
    {
      variants: { disabled: true, active: false, variant: 'filled' },
      style: {
        opacity: 0.5,
        background: vars.colors.surface.default,
        border: `1px solid ${vars.colors.border.default}`,
      },
    },
    // Disabled + not active + default
    {
      variants: { disabled: true, active: false, variant: 'default' },
      style: {
        opacity: 0.5,
        background: 'transparent',
        border: `1px solid ${vars.colors.border.default}`,
      },
    },
  ],

  defaultVariants: {
    active: false,
    variant: 'default',
    disabled: false,
    error: false,
  },
});

// --- CheckboxGroup ---

export const groupContainerStyle = style({
  display: 'flex',
  flexDirection: 'column',
});

export const groupDirectionVar = createVar();
export const groupGapVar = createVar();

export const groupItemsStyle = style({
  display: 'flex',
  flexDirection: groupDirectionVar as 'row' | 'column',
  gap: groupGapVar,
});
