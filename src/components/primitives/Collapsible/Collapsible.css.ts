import { style, createVar } from '@vanilla-extract/css';
import { recipe } from '@vanilla-extract/recipes';
import { vars } from '@/theme/contract.css';

// --- Root ---

export const collapsibleRootStyle = style({
  display: 'flex',
  flexDirection: 'column',
});

// --- Trigger ---

export const triggerHeightVar = createVar();
export const triggerPaddingVar = createVar();
export const triggerFontSizeVar = createVar();

export const triggerRecipe = recipe({
  base: {
    margin: 0,
    border: 'none',
    fontFamily: 'inherit',
    outline: 'none',
    userSelect: 'none',
    width: '100%',
    textAlign: 'left' as const,
    display: 'flex',
    alignItems: 'center',
    gap: vars.spacing.sm,
    height: triggerHeightVar,
    padding: `0 ${triggerPaddingVar}`,
    fontSize: triggerFontSizeVar,
    fontWeight: vars.typography.fontWeight.medium,
    background: 'transparent',
    color: vars.colors.text.muted,
    transition: `color ${vars.transitions.fast}, background ${vars.transitions.fast}`,

    ':focus-visible': {
      boxShadow: vars.shadows.focus,
      borderRadius: vars.borderRadius.sm,
      zIndex: 1,
    },
  },

  variants: {
    disabled: {
      true: {
        cursor: 'not-allowed',
        opacity: 0.5,
        selectors: {
          '&:hover': {
            color: vars.colors.text.muted,
          },
        },
      },
      false: {
        cursor: 'pointer',
        opacity: 1,
        selectors: {
          '&:hover': {
            color: vars.colors.text.primary,
          },
        },
      },
    },
  },

  defaultVariants: {
    disabled: false,
  },
});

// --- Chevron ---

export const chevronSizeVar = createVar();

export const chevronRecipe = recipe({
  base: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    transition: `transform ${vars.transitions.fast}`,
    color: 'currentColor',
  },

  variants: {
    open: {
      true: { transform: 'rotate(90deg)' },
      false: { transform: 'rotate(0deg)' },
    },
  },

  defaultVariants: {
    open: false,
  },
});

// --- Content wrapper ---

export const contentWrapperRecipe = recipe({
  base: {
    display: 'grid',
    transition: `grid-template-rows ${vars.transitions.normal}`,
  },

  variants: {
    open: {
      true: { gridTemplateRows: '1fr' },
      false: { gridTemplateRows: '0fr' },
    },
  },

  defaultVariants: {
    open: false,
  },
});

export const contentInnerStyle = style({
  overflow: 'hidden',
  minHeight: 0,
});

// --- Content body ---

export const contentPaddingVVar = createVar();
export const contentPaddingHVar = createVar();

export const contentBodyStyle = style({
  padding: `${contentPaddingVVar} ${contentPaddingHVar}`,
});
