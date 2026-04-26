import { recipe, type RecipeVariants } from '@vanilla-extract/recipes';
import { style, globalStyle } from '@vanilla-extract/css';
import { vars } from '@/theme/contract.css';

// --- Root container ---

export const segmentedControlRecipe = recipe({
  base: {
    position: 'relative',
    display: 'inline-flex',
    padding: '2px',
    borderRadius: vars.borderRadius.md,
    boxSizing: 'border-box',
    minWidth: 0,
    minHeight: 0,
    selectors: {
      '&[aria-disabled="true"]': {
        opacity: 0.6,
        cursor: 'not-allowed',
      },
    },
  },

  variants: {
    orientation: {
      horizontal: {
        flexDirection: 'row',
        alignItems: 'stretch',
      },
      vertical: {
        flexDirection: 'column',
        alignItems: 'stretch',
      },
    },
    variant: {
      subtle: {
        background: vars.colors.background.secondary,
      },
      solid: {
        background: vars.colors.surface.default,
        border: `1px solid ${vars.colors.border.default}`,
      },
      outline: {
        background: 'transparent',
        border: `1px solid ${vars.colors.border.default}`,
      },
    },
    fullWidth: {
      true: {
        display: 'flex',
        width: '100%',
      },
      false: {},
    },
  },

  defaultVariants: {
    orientation: 'horizontal',
    variant: 'subtle',
    fullWidth: false,
  },
});

export type SegmentedControlVariants = RecipeVariants<
  typeof segmentedControlRecipe
>;

// --- Sliding indicator ---

export const segmentedIndicatorRecipe = recipe({
  base: {
    position: 'absolute',
    top: 0,
    left: 0,
    boxSizing: 'border-box',
    pointerEvents: 'none',
    transitionProperty: 'transform, width, height, opacity',
    transitionDuration: vars.transitions.normal,
    transitionTimingFunction: 'ease',
    willChange: 'transform, width, height',
    '@media': {
      '(prefers-reduced-motion: reduce)': {
        transitionDuration: '0s',
      },
    },
  },

  variants: {
    variant: {
      subtle: {
        background: vars.colors.background.elevated,
        border: `1px solid ${vars.colors.border.default}`,
        boxShadow: vars.shadows.sm,
        borderRadius: `calc(${vars.borderRadius.md} - 2px)`,
      },
      solid: {
        background: vars.colors.accent.primary,
        borderRadius: `calc(${vars.borderRadius.md} - 2px)`,
      },
      outline: {
        background: vars.colors.accent.primary,
        borderRadius: vars.borderRadius.sm,
      },
    },
    orientation: {
      horizontal: {},
      vertical: {},
    },
  },

  compoundVariants: [
    // Outline: thin edge bar instead of full background
    {
      variants: { variant: 'outline', orientation: 'horizontal' },
      style: {
        height: '2px',
      },
    },
    {
      variants: { variant: 'outline', orientation: 'vertical' },
      style: {
        width: '2px',
      },
    },
  ],

  defaultVariants: {
    variant: 'subtle',
    orientation: 'horizontal',
  },
});

// --- Item wrapper (direct child of root: flex item + measurement target) ---

const segmentedItemWrapperBase = style({
  position: 'relative',
  display: 'inline-flex',
  alignItems: 'stretch',
  justifyContent: 'stretch',
  minWidth: 0,
  minHeight: 0,
});

export const segmentedItemWrapperRecipe = recipe({
  base: [segmentedItemWrapperBase],

  variants: {
    fullWidth: {
      true: { flex: 1 },
      false: {},
    },
    orientation: {
      horizontal: {},
      vertical: { width: '100%' },
    },
    iconOnly: {
      true: {},
      false: {},
    },
    size: {
      sm: {},
      md: {},
      lg: {},
    },
  },

  compoundVariants: [
    // Icon-only horizontal: wrapper is square so the button (width: 100%) is square too
    {
      variants: { iconOnly: true, size: 'sm', orientation: 'horizontal' },
      style: { width: '20px', flex: 'none' },
    },
    {
      variants: { iconOnly: true, size: 'md', orientation: 'horizontal' },
      style: { width: '24px', flex: 'none' },
    },
    {
      variants: { iconOnly: true, size: 'lg', orientation: 'horizontal' },
      style: { width: '32px', flex: 'none' },
    },
  ],

  defaultVariants: {
    fullWidth: false,
    orientation: 'horizontal',
    iconOnly: false,
    size: 'md',
  },
});

export type SegmentedItemWrapperVariants = RecipeVariants<
  typeof segmentedItemWrapperRecipe
>;

// Force the direct child of the wrapper (button OR the Tooltip trigger div)
// to fill the wrapper. This propagates layout down into the button even when
// the Tooltip introduces an `inline-block; width: fit-content` element in
// between. Inside that trigger, the button reads `width: 100%` from its own
// base style.
globalStyle(`${segmentedItemWrapperBase} > *`, {
  display: 'inline-flex',
  alignItems: 'stretch',
  width: '100%',
  minWidth: 0,
});

// --- Item (button) ---

export const segmentedItemBaseStyle = style({
  // Reset
  margin: 0,
  border: 'none',
  fontFamily: 'inherit',
  outline: 'none',
  userSelect: 'none',
  whiteSpace: 'nowrap',
  background: 'transparent',
  appearance: 'none',
  WebkitAppearance: 'none',
  width: '100%',

  // Layout
  position: 'relative',
  zIndex: 1,
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
  fontWeight: vars.typography.fontWeight.medium,
  lineHeight: vars.typography.lineHeight.tight,
  borderRadius: `calc(${vars.borderRadius.md} - 2px)`,
  transition: `color ${vars.transitions.fast}, background ${vars.transitions.fast}`,
  cursor: 'pointer',

  selectors: {
    '&:focus-visible': {
      boxShadow: vars.shadows.focus,
      zIndex: 2,
    },
    '&:disabled': {
      cursor: 'not-allowed',
      opacity: 0.5,
    },
  },
});

export const segmentedItemRecipe = recipe({
  base: {},

  variants: {
    size: {
      sm: {
        height: '20px',
        padding: `0 ${vars.spacing.sm}`,
        fontSize: vars.typography.fontSize.xs,
        gap: '4px',
      },
      md: {
        height: '24px',
        padding: `0 ${vars.spacing.md}`,
        fontSize: vars.typography.fontSize.sm,
        gap: '6px',
      },
      lg: {
        height: '32px',
        padding: `0 ${vars.spacing.lg}`,
        fontSize: vars.typography.fontSize.md,
        gap: '8px',
      },
    },
    iconOnly: {
      true: { padding: 0 },
      false: {},
    },
    orientation: {
      horizontal: {},
      vertical: {
        justifyContent: 'flex-start',
      },
    },
  },

  compoundVariants: [
    // Icon-only vertical: center the icon
    {
      variants: { iconOnly: true, orientation: 'vertical' },
      style: { justifyContent: 'center' },
    },
  ],

  defaultVariants: {
    size: 'md',
    iconOnly: false,
    orientation: 'horizontal',
  },
});

export type SegmentedItemVariants = RecipeVariants<typeof segmentedItemRecipe>;

// --- Variant-driven item color states ---

// Subtle: transparent default, hover surface, selected lifts
export const itemSubtleStyle = style({
  color: vars.colors.text.secondary,
  selectors: {
    '&:hover:not(:disabled):not([aria-pressed="true"])': {
      color: vars.colors.text.primary,
      background: vars.colors.surface.hover,
    },
    '&[aria-pressed="true"]': {
      color: vars.colors.text.primary,
    },
  },
});

// Solid: muted default, selected gets white text on accent
export const itemSolidStyle = style({
  color: vars.colors.text.secondary,
  selectors: {
    '&:hover:not(:disabled):not([aria-pressed="true"])': {
      color: vars.colors.text.primary,
      background: vars.colors.surface.hover,
    },
    '&[aria-pressed="true"]': {
      color: '#ffffff',
    },
  },
});

// Outline: muted default, selected gets accent text
export const itemOutlineStyle = style({
  color: vars.colors.text.secondary,
  selectors: {
    '&:hover:not(:disabled):not([aria-pressed="true"])': {
      color: vars.colors.text.primary,
    },
    '&[aria-pressed="true"]': {
      color: vars.colors.accent.primary,
    },
  },
});

// --- Icon container ---

export const segmentedItemIconStyle = style({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
});
