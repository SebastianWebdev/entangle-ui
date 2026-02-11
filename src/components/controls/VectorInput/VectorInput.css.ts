import { style, createVar } from '@vanilla-extract/css';
import { recipe } from '@vanilla-extract/recipes';
import { vars } from '@/theme/contract.css';

// --- Dynamic vars ---
export const axisColorVar = createVar();
export const gapVar = createVar();

// --- Container ---
export const vectorContainerStyle = style({
  display: 'flex',
  flexDirection: 'column',
});

// --- Row ---
export const vectorRowRecipe = recipe({
  base: {
    display: 'flex',
    gap: gapVar,
  },
  variants: {
    direction: {
      row: {
        flexDirection: 'row',
        alignItems: 'center',
      },
      column: {
        flexDirection: 'column',
        alignItems: 'stretch',
      },
    },
  },
  defaultVariants: {
    direction: 'row',
  },
});

// --- Axis input ---
export const axisInputStyle = style({
  position: 'relative',
  flex: 1,
  minWidth: 0,
  display: 'flex',
  alignItems: 'center',
  gap: 0,
});

// --- Axis label ---
export const axisLabelRecipe = recipe({
  base: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: vars.typography.fontWeight.semibold,
    borderRadius: vars.borderRadius.sm,
    userSelect: 'none',
    flexShrink: 0,
    marginRight: vars.spacing.xs,
    color: axisColorVar,
    background: `color-mix(in srgb, ${axisColorVar} 20%, transparent)`,
  },
  variants: {
    size: {
      sm: {
        width: '16px',
        minWidth: '16px',
        height: '16px',
        fontSize: vars.typography.fontSize.xs,
      },
      md: {
        width: '18px',
        minWidth: '18px',
        height: '18px',
        fontSize: vars.typography.fontSize.xs,
      },
      lg: {
        width: '22px',
        minWidth: '22px',
        height: '22px',
        fontSize: vars.typography.fontSize.sm,
      },
    },
  },
  defaultVariants: {
    size: 'md',
  },
});

// --- Link button ---
export const linkButtonRecipe = recipe({
  base: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: `1px solid ${vars.colors.border.default}`,
    borderRadius: vars.borderRadius.sm,
    cursor: 'pointer',
    padding: 0,
    marginLeft: vars.spacing.xs,
    transition: `all ${vars.transitions.fast}`,
    flexShrink: 0,
    selectors: {
      '&:hover': {
        background: vars.colors.surface.hover,
      },
      '&:disabled': {
        opacity: 0.5,
        cursor: 'not-allowed',
      },
    },
  },
  variants: {
    active: {
      true: {
        background: `color-mix(in srgb, ${vars.colors.accent.primary} 13%, transparent)`,
        color: vars.colors.accent.primary,
        selectors: {
          '&:hover': {
            color: vars.colors.accent.primary,
          },
        },
      },
      false: {
        background: 'transparent',
        color: vars.colors.text.muted,
        selectors: {
          '&:hover': {
            color: vars.colors.text.secondary,
          },
        },
      },
    },
    size: {
      sm: { width: '20px', height: '20px', minWidth: '20px' },
      md: { width: '24px', height: '24px', minWidth: '24px' },
      lg: { width: '32px', height: '32px', minWidth: '32px' },
    },
  },
  defaultVariants: {
    active: false,
    size: 'md',
  },
});
