import { style, createVar } from '@vanilla-extract/css';
import { recipe } from '@vanilla-extract/recipes';
import { vars } from '@/theme/contract.css';

// --- Container ---

export const switchContainerStyle = style({
  display: 'flex',
  flexDirection: 'column',
});

// --- Row ---

export const switchRowRecipe = recipe({
  base: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: vars.spacing.sm,
    lineHeight: vars.typography.lineHeight.normal,
    userSelect: 'none',
  },

  variants: {
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
    size: 'md',
    disabled: false,
  },
});

// --- Track ---

export const trackWidthVar = createVar();
export const trackHeightVar = createVar();

export const trackRecipe = recipe({
  base: {
    padding: 0,
    margin: 0,
    font: 'inherit',
    outline: 'none',
    display: 'inline-flex',
    alignItems: 'center',
    position: 'relative',
    flexShrink: 0,
    width: trackWidthVar,
    height: trackHeightVar,
    borderRadius: trackHeightVar,
    transition: `background-color ${vars.transitions.fast}, border-color ${vars.transitions.fast}`,

    ':focus-visible': {
      boxShadow: vars.shadows.focus,
    },

    ':disabled': {
      opacity: 0.5,
      cursor: 'not-allowed',
    },
  },

  variants: {
    checked: {
      true: {
        background: vars.colors.accent.primary,
        border: '1px solid transparent',
        selectors: {
          '&:hover:not(:disabled)': {
            background: vars.colors.accent.secondary,
          },
        },
      },
      false: {
        background: vars.colors.surface.active,
        border: `1px solid ${vars.colors.border.default}`,
        selectors: {
          '&:hover:not(:disabled)': {
            background: vars.colors.surface.hover,
          },
        },
      },
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
    {
      variants: { error: true, checked: false },
      style: {
        background: vars.colors.surface.active,
        border: `1px solid ${vars.colors.accent.error}`,
        selectors: {
          '&:hover:not(:disabled)': {
            background: vars.colors.surface.hover,
          },
        },
      },
    },
    {
      variants: { disabled: true, checked: true },
      style: {
        opacity: 0.5,
        background: vars.colors.accent.primary,
        border: '1px solid transparent',
      },
    },
    {
      variants: { disabled: true, checked: false },
      style: {
        opacity: 0.5,
        background: vars.colors.surface.active,
        border: `1px solid ${vars.colors.border.default}`,
      },
    },
  ],

  defaultVariants: {
    checked: false,
    disabled: false,
    error: false,
  },
});

// --- Thumb ---

export const thumbDiameterVar = createVar();
export const thumbTranslateVar = createVar();

export const thumbRecipe = recipe({
  base: {
    position: 'absolute',
    borderRadius: '50%',
    width: thumbDiameterVar,
    height: thumbDiameterVar,
    transition: `transform ${vars.transitions.fast}`,
  },

  variants: {
    checked: {
      true: {
        background: 'white',
        transform: `translateX(${thumbTranslateVar})`,
      },
      false: {
        background: vars.colors.text.muted,
      },
    },
  },

  defaultVariants: {
    checked: false,
  },
});

// --- Label text ---

export const labelTextStyle = style({});
