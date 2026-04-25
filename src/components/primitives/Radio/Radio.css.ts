import { style, createVar } from '@vanilla-extract/css';
import { recipe } from '@vanilla-extract/recipes';
import { vars } from '@/theme/contract.css';

// --- Container (when label or helper text wraps the radio) ---

export const radioContainerStyle = style({
  display: 'flex',
  flexDirection: 'column',
});

// --- Visually hidden input ---

export const visuallyHiddenInputStyle = style({
  position: 'absolute',
  width: '1px',
  height: '1px',
  padding: 0,
  margin: '-1px',
  overflow: 'hidden',
  clip: 'rect(0, 0, 0, 0)',
  whiteSpace: 'nowrap',
  border: 0,
});

// --- Label row (label + radio together) ---

export const radioLabelRecipe = recipe({
  base: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: vars.spacing.sm,
    lineHeight: vars.typography.lineHeight.normal,
    userSelect: 'none',
    position: 'relative',
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
        color: vars.colors.text.primary,
      },
    },
  },

  defaultVariants: {
    labelPosition: 'right',
    size: 'md',
    disabled: false,
  },
});

// --- Outer circle ---

export const outerSizeVar = createVar();
export const innerSizeVar = createVar();

export const radioOuterRecipe = recipe({
  base: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    width: outerSizeVar,
    height: outerSizeVar,
    borderRadius: '50%',
    background: 'transparent',
    border: `1px solid ${vars.colors.border.default}`,
    transition: `border-color ${vars.transitions.fast}, background ${vars.transitions.fast}, box-shadow ${vars.transitions.fast}`,
    boxSizing: 'border-box',

    selectors: {
      // Hover (only when interactive)
      [`label:hover &`]: {
        background: vars.colors.surface.hover,
      },
      // Focus ring driven by sibling input
      [`input:focus-visible + &`]: {
        boxShadow: vars.shadows.focus,
      },
      // Checked: drive by sibling input :checked
      [`input:checked + &`]: {
        borderColor: vars.colors.accent.primary,
      },
    },
  },

  variants: {
    checked: {
      true: {
        borderColor: vars.colors.accent.primary,
      },
      false: {},
    },
    disabled: {
      true: {
        opacity: 0.5,
        cursor: 'not-allowed',
        selectors: {
          [`label:hover &`]: {
            background: 'transparent',
          },
        },
      },
      false: {},
    },
    error: {
      true: {
        borderColor: vars.colors.border.error,
        selectors: {
          [`input:checked + &`]: {
            borderColor: vars.colors.border.error,
          },
        },
      },
      false: {},
    },
  },

  compoundVariants: [
    // Hover, not disabled, not checked, not error: subtle accent ring
    {
      variants: { disabled: false, checked: false, error: false },
      style: {
        selectors: {
          [`label:hover &`]: {
            borderColor: vars.colors.accent.primary,
          },
        },
      },
    },
    // Disabled + checked: keep accent border but dimmed via opacity
    {
      variants: { disabled: true, checked: true, error: false },
      style: {
        borderColor: vars.colors.accent.primary,
      },
    },
  ],

  defaultVariants: {
    checked: false,
    disabled: false,
    error: false,
  },
});

// --- Inner dot ---

export const radioDotRecipe = recipe({
  base: {
    display: 'block',
    width: innerSizeVar,
    height: innerSizeVar,
    borderRadius: '50%',
    background: vars.colors.accent.primary,
    transform: 'scale(0)',
    transformOrigin: 'center',
    transition: `transform ${vars.transitions.fast}`,

    '@media': {
      '(prefers-reduced-motion: reduce)': {
        transition: 'none',
      },
    },
  },

  variants: {
    checked: {
      true: {
        transform: 'scale(1)',
      },
      false: {
        transform: 'scale(0)',
      },
    },
    error: {
      true: {
        background: vars.colors.accent.error,
      },
      false: {},
    },
  },

  defaultVariants: {
    checked: false,
    error: false,
  },
});

// --- Label text ---

export const radioLabelTextStyle = style({
  color: 'inherit',
});

// --- RadioGroup ---

export const groupContainerStyle = style({
  display: 'flex',
  flexDirection: 'column',
});

export const groupOrientationVar = createVar();
export const groupSpacingVar = createVar();

export const groupItemsStyle = style({
  display: 'flex',
  flexDirection: groupOrientationVar as 'row' | 'column',
  gap: groupSpacingVar,
  flexWrap: 'wrap',
});
