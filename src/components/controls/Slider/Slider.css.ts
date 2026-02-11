import { style, createVar } from '@vanilla-extract/css';
import { recipe } from '@vanilla-extract/recipes';
import { vars } from '@/theme/contract.css';

// --- Dynamic vars for runtime values ---
export const fillPercentageVar = createVar();
export const thumbPercentageVar = createVar();
export const tooltipPercentageVar = createVar();

// --- Container ---
export const sliderContainerRecipe = recipe({
  base: {
    display: 'flex',
    flexDirection: 'column',
    gap: vars.spacing.xs,
    width: '100%',
    minWidth: 0,
  },
  variants: {
    disabled: {
      true: {
        opacity: 0.5,
        pointerEvents: 'none',
      },
      false: {},
    },
  },
  defaultVariants: {
    disabled: false,
  },
});

// --- Slider wrapper ---
export const sliderWrapperStyle = style({
  position: 'relative',
  display: 'flex',
  alignItems: 'center',
  cursor: 'pointer',
  userSelect: 'none',
  padding: '0px 0',
  width: '100%',
});

// --- Track ---
export const trackRecipe = recipe({
  base: {
    position: 'relative',
    flex: 1,
    borderRadius: vars.borderRadius.sm,
    overflow: 'hidden',
    border: '1px solid',
  },
  variants: {
    size: {
      sm: { height: '4px' },
      md: { height: '6px' },
      lg: { height: '8px' },
    },
    error: {
      true: {
        background: vars.colors.accent.error,
        borderColor: vars.colors.border.error,
        selectors: {
          '&:hover': {
            borderColor: vars.colors.border.error,
          },
        },
      },
      false: {
        background: vars.colors.surface.default,
        borderColor: vars.colors.border.default,
        selectors: {
          '&:hover': {
            borderColor: vars.colors.border.focus,
          },
        },
      },
    },
  },
  defaultVariants: {
    size: 'md',
    error: false,
  },
});

// --- Fill ---
export const fillRecipe = recipe({
  base: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: fillPercentageVar,
  },
  variants: {
    error: {
      true: {
        background: vars.colors.accent.error,
      },
      false: {
        background: vars.colors.accent.primary,
      },
    },
    isDragging: {
      true: {
        transition: 'none',
      },
      false: {
        transition: 'width 0.1s ease-out',
      },
    },
  },
  defaultVariants: {
    error: false,
    isDragging: false,
  },
});

// --- Thumb ---
export const thumbRecipe = recipe({
  base: {
    position: 'absolute',
    top: '50%',
    left: thumbPercentageVar,
    transform: 'translate(-50%, -50%)',
    border: `2px solid ${vars.colors.background.primary}`,
    borderRadius: '50%',
    cursor: 'grab',
    boxShadow: vars.shadows.sm,
    selectors: {
      '&:hover': {
        transform: 'translate(-50%, -50%) scale(1.1)',
        boxShadow: vars.shadows.md,
      },
    },
  },
  variants: {
    size: {
      sm: { width: '12px', height: '12px' },
      md: { width: '16px', height: '16px' },
      lg: { width: '20px', height: '20px' },
    },
    error: {
      true: {
        background: vars.colors.accent.error,
      },
      false: {
        background: vars.colors.accent.primary,
      },
    },
    isDragging: {
      true: {
        cursor: 'grabbing',
        transform: 'translate(-50%, -50%) scale(1.15)',
        boxShadow: vars.shadows.lg,
        transition: 'none',
      },
      false: {
        transition: `all ${vars.transitions.fast}`,
      },
    },
  },
  defaultVariants: {
    size: 'md',
    error: false,
    isDragging: false,
  },
});

// --- Ticks ---
export const ticksStyle = style({
  position: 'absolute',
  top: '100%',
  left: 0,
  right: 0,
  height: '8px',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
  pointerEvents: 'none',
  '::before': {
    content: '""',
    position: 'absolute',
    top: '2px',
    left: 0,
    right: 0,
    height: '1px',
    background: vars.colors.border.default,
  },
});

export const tickStyle = style({
  width: '1px',
  height: '4px',
  background: vars.colors.text.muted,
  marginTop: '2px',
});

// --- Tooltip ---
export const tooltipRecipe = recipe({
  base: {
    position: 'absolute',
    bottom: 'calc(100% + 8px)',
    left: tooltipPercentageVar,
    transform: 'translateX(-50%)',
    background: vars.colors.background.elevated,
    color: vars.colors.text.primary,
    border: `1px solid ${vars.colors.border.default}`,
    borderRadius: vars.borderRadius.sm,
    padding: '4px 8px',
    fontSize: vars.typography.fontSize.xs,
    fontWeight: vars.typography.fontWeight.medium,
    whiteSpace: 'nowrap',
    pointerEvents: 'none',
    zIndex: vars.zIndex.tooltip,
    transition: `all ${vars.transitions.fast}`,
    '::after': {
      content: '""',
      position: 'absolute',
      top: '100%',
      left: '50%',
      transform: 'translateX(-50%)',
      width: 0,
      height: 0,
      borderLeft: '4px solid transparent',
      borderRight: '4px solid transparent',
      borderTop: `4px solid ${vars.colors.border.default}`,
    },
  },
  variants: {
    visible: {
      true: {
        opacity: 1,
        transform: 'translateX(-50%) translateY(0)',
      },
      false: {
        opacity: 0,
        transform: 'translateX(-50%) translateY(4px)',
      },
    },
  },
  defaultVariants: {
    visible: false,
  },
});
