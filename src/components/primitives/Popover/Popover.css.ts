import { style } from '@vanilla-extract/css';
import { recipe } from '@vanilla-extract/recipes';
import { vars } from '@/theme/contract.css';

// --- PopoverContent ---

export const contentPanelRecipe = recipe({
  base: {
    zIndex: vars.zIndex.popover,
    background: vars.colors.background.elevated,
    border: `1px solid ${vars.colors.border.default}`,
    borderRadius: vars.borderRadius.lg,
    boxShadow: vars.shadows.lg,
    color: vars.colors.text.primary,
    fontSize: vars.typography.fontSize.sm,
    fontFamily: vars.typography.fontFamily.sans,
    transition: `opacity ${vars.transitions.fast}, transform ${vars.transitions.fast}`,

    selectors: {
      '&:focus': {
        outline: 'none',
      },
    },
  },

  variants: {
    padding: {
      none: { padding: '0' },
      sm: { padding: vars.spacing.sm },
      md: { padding: vars.spacing.md },
      lg: { padding: vars.spacing.lg },
    },

    visible: {
      true: {
        opacity: 1,
        transform: 'scale(1)',
        pointerEvents: 'auto' as const,
      },
      false: {
        opacity: 0,
        transform: 'scale(0.96)',
        pointerEvents: 'none' as const,
      },
    },
  },

  defaultVariants: {
    padding: 'md',
    visible: false,
  },
});

// --- PopoverClose ---

export const closeButtonStyle = style({
  margin: 0,
  padding: 0,
  border: 'none',
  background: 'transparent',
  fontFamily: 'inherit',
  outline: 'none',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '20px',
  height: '20px',
  borderRadius: vars.borderRadius.sm,
  color: vars.colors.text.muted,
  transition: `background ${vars.transitions.fast}`,

  ':hover': {
    background: vars.colors.surface.hover,
    color: vars.colors.text.primary,
  },

  ':focus-visible': {
    boxShadow: vars.shadows.focus,
  },
});
