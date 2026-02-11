import { style, createVar } from '@vanilla-extract/css';
import { recipe } from '@vanilla-extract/recipes';
import { vars } from '@/theme/contract.css';

// --- Dynamic vars ---
export const paddingLeftVar = createVar();
export const guideLineLeftVar = createVar();

// --- Row ---
export const rowRecipe = recipe({
  base: {
    display: 'flex',
    alignItems: 'center',
    paddingLeft: paddingLeftVar,
    paddingRight: vars.spacing.xs,
    userSelect: 'none',
    position: 'relative',
  },
  variants: {
    size: {
      sm: { height: '20px' },
      md: { height: '24px' },
      lg: { height: '32px' },
    },
    selected: {
      true: {},
      false: {},
    },
    focused: {
      true: {},
      false: {},
    },
    disabled: {
      true: {
        cursor: 'default',
        opacity: 0.5,
      },
      false: {
        cursor: 'pointer',
      },
    },
  },
  compoundVariants: [
    {
      variants: { selected: true },
      style: {
        background: `color-mix(in srgb, ${vars.colors.accent.primary} 15%, transparent)`,
        selectors: {
          '&:hover': {
            background: `color-mix(in srgb, ${vars.colors.accent.primary} 20%, transparent)`,
          },
        },
      },
    },
    {
      variants: { selected: false },
      style: {
        background: 'transparent',
        selectors: {
          '&:hover': {
            background: vars.colors.surface.hover,
          },
        },
      },
    },
    {
      variants: { focused: true, selected: false },
      style: {
        boxShadow: `inset 0 0 0 1px ${vars.colors.border.focus}`,
      },
    },
  ],
  defaultVariants: {
    size: 'md',
    selected: false,
    focused: false,
    disabled: false,
  },
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
    selectors: {
      '&:hover': {
        color: vars.colors.text.primary,
      },
    },
  },
  variants: {
    size: {
      sm: { width: '14px', height: '14px' },
      md: { width: '16px', height: '16px' },
      lg: { width: '18px', height: '18px' },
    },
    expanded: {
      true: { transform: 'rotate(90deg)' },
      false: { transform: 'rotate(0deg)' },
    },
    visible: {
      true: { visibility: 'visible' as const },
      false: { visibility: 'hidden' as const },
    },
  },
  defaultVariants: {
    size: 'md',
    expanded: false,
    visible: true,
  },
});

// --- Icon ---
export const iconRecipe = recipe({
  base: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    marginRight: vars.spacing.xs,
    color: vars.colors.text.secondary,
  },
  variants: {
    size: {
      sm: { width: '12px', height: '12px' },
      md: { width: '14px', height: '14px' },
      lg: { width: '16px', height: '16px' },
    },
  },
  defaultVariants: {
    size: 'md',
  },
});

// --- Label ---
export const labelRecipe = recipe({
  base: {
    flex: 1,
    minWidth: 0,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    color: vars.colors.text.primary,
    lineHeight: vars.typography.lineHeight.normal,
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

// --- Actions ---
export const actionsStyle = style({
  display: 'flex',
  alignItems: 'center',
  gap: '2px',
  marginLeft: 'auto',
  flexShrink: 0,
});

// --- Rename input ---
export const renameInputRecipe = recipe({
  base: {
    flex: 1,
    minWidth: 0,
    border: `1px solid ${vars.colors.border.focus}`,
    borderRadius: vars.borderRadius.sm,
    background: vars.colors.surface.default,
    color: vars.colors.text.primary,
    padding: '0 4px',
    outline: 'none',
  },
  variants: {
    size: {
      sm: {
        fontSize: vars.typography.fontSize.md,
        height: '16px',
      },
      md: {
        fontSize: vars.typography.fontSize.md,
        height: '20px',
      },
      lg: {
        fontSize: vars.typography.fontSize.lg,
        height: '28px',
      },
    },
  },
  defaultVariants: {
    size: 'md',
  },
});

// --- Guide line ---
export const guideLineStyle = style({
  position: 'absolute',
  left: guideLineLeftVar,
  top: 0,
  bottom: 0,
  width: '1px',
  background: `color-mix(in srgb, ${vars.colors.border.default} 30%, transparent)`,
  pointerEvents: 'none',
});
