import { recipe, type RecipeVariants } from '@vanilla-extract/recipes';
import { style, globalStyle } from '@vanilla-extract/css';
import { vars } from '@/theme/contract.css';

// --- Tabs Root ---

export const tabsRootRecipe = recipe({
  base: {
    display: 'flex',
    minWidth: 0,
    minHeight: 0,
  },

  variants: {
    orientation: {
      horizontal: {
        flexDirection: 'column',
      },
      vertical: {
        flexDirection: 'row',
      },
    },
  },

  defaultVariants: {
    orientation: 'horizontal',
  },
});

export type TabsRootVariants = RecipeVariants<typeof tabsRootRecipe>;

// --- Tab List ---

const tabListBase = style({
  display: 'flex',
  alignItems: 'stretch',
  flexShrink: 0,
  minWidth: 0,
  gap: vars.spacing.xs,
  scrollbarWidth: 'none',
});

globalStyle(`${tabListBase}::-webkit-scrollbar`, {
  display: 'none',
});

export const tabListRecipe = recipe({
  base: [tabListBase],

  variants: {
    orientation: {
      horizontal: {
        flexDirection: 'row',
        overflowX: 'auto',
        overflowY: 'visible',
      },
      vertical: {
        flexDirection: 'column',
        overflowX: 'visible',
        overflowY: 'auto',
      },
    },
    variant: {
      underline: {},
      pills: {},
      enclosed: {},
    },
    pillsFrame: {
      true: {},
      false: {},
    },
  },

  compoundVariants: [
    // Underline horizontal
    {
      variants: { variant: 'underline', orientation: 'horizontal' },
      style: {
        borderBottom: `1px solid ${vars.colors.border.default}`,
      },
    },
    // Underline vertical
    {
      variants: { variant: 'underline', orientation: 'vertical' },
      style: {
        borderRight: `1px solid ${vars.colors.border.default}`,
      },
    },
    // Enclosed horizontal
    {
      variants: { variant: 'enclosed', orientation: 'horizontal' },
      style: {
        borderBottom: `1px solid ${vars.colors.border.default}`,
        padding: `0 ${vars.spacing.xs}`,
      },
    },
    // Enclosed vertical
    {
      variants: { variant: 'enclosed', orientation: 'vertical' },
      style: {
        borderRight: `1px solid ${vars.colors.border.default}`,
        padding: `${vars.spacing.xs} 0`,
      },
    },
    // Pills with frame
    {
      variants: { variant: 'pills', pillsFrame: true },
      style: {
        padding: vars.spacing.xs,
        border: `1px solid ${vars.colors.border.default}`,
        borderRadius: vars.borderRadius.md,
        background: vars.colors.background.secondary,
      },
    },
    // Pills without frame
    {
      variants: { variant: 'pills', pillsFrame: false },
      style: {
        padding: 0,
        border: 'none',
        borderRadius: 0,
        background: 'transparent',
      },
    },
  ],

  defaultVariants: {
    orientation: 'horizontal',
    variant: 'underline',
    pillsFrame: true,
  },
});

export type TabListVariants = RecipeVariants<typeof tabListRecipe>;

// --- Tab ---

export const tabBaseStyle = style({
  // Reset
  margin: 0,
  border: 'none',
  fontFamily: 'inherit',
  outline: 'none',
  userSelect: 'none',
  whiteSpace: 'nowrap',
  background: 'transparent',
  borderRadius: vars.borderRadius.sm,

  // Layout
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  position: 'relative',
  flexShrink: 0,
  fontWeight: vars.typography.fontWeight.medium,
  lineHeight: vars.typography.lineHeight.tight,
  minWidth: 0,

  selectors: {
    '&:focus-visible': {
      boxShadow: vars.shadows.focus,
      zIndex: 1,
    },
  },
});

export const tabRecipe = recipe({
  base: {},

  variants: {
    size: {
      sm: {
        height: '24px',
        padding: `0 ${vars.spacing.sm}`,
        fontSize: vars.typography.fontSize.xs,
      },
      md: {
        height: '28px',
        padding: `0 ${vars.spacing.md}`,
        fontSize: vars.typography.fontSize.sm,
      },
      lg: {
        height: '32px',
        padding: `0 ${vars.spacing.lg}`,
        fontSize: vars.typography.fontSize.md,
      },
    },

    disabled: {
      true: {
        opacity: 0.5,
        cursor: 'not-allowed',
      },
      false: {
        cursor: 'pointer',
      },
    },

    fullWidth: {
      true: {
        flex: 1,
      },
      false: {},
    },
  },

  defaultVariants: {
    size: 'md',
    disabled: false,
    fullWidth: false,
  },
});

export type TabVariants = RecipeVariants<typeof tabRecipe>;

// --- Tab variant styles (applied based on variant + active + orientation) ---

// Underline variant
export const tabUnderlineStyle = style({
  transition: `all ${vars.transitions.fast}`,
  selectors: {
    '&:hover:not(:disabled)': {
      color: vars.colors.text.primary,
      background: vars.colors.surface.hover,
    },
  },
});

export const tabUnderlineActiveStyle = style({
  color: vars.colors.text.primary,
  background: vars.colors.surface.active,
});

export const tabUnderlineInactiveStyle = style({
  color: vars.colors.text.secondary,
});

export const tabUnderlineActiveHorizontalStyle = style({
  marginBottom: '-1px',
  selectors: {
    '&::after': {
      content: '""',
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: '-1px',
      height: '2px',
      borderRadius: vars.borderRadius.sm,
      background: vars.colors.accent.primary,
      opacity: 1,
      transition: `opacity ${vars.transitions.fast}`,
    },
  },
});

export const tabUnderlineActiveVerticalStyle = style({
  marginRight: '-1px',
  selectors: {
    '&::after': {
      content: '""',
      position: 'absolute',
      top: 0,
      bottom: 0,
      right: '-1px',
      width: '2px',
      borderRadius: vars.borderRadius.sm,
      background: vars.colors.accent.primary,
      opacity: 1,
      transition: `opacity ${vars.transitions.fast}`,
    },
  },
});

export const tabUnderlineInactiveIndicatorStyle = style({
  selectors: {
    '&::after': {
      content: '""',
      position: 'absolute',
      borderRadius: vars.borderRadius.sm,
      background: vars.colors.accent.primary,
      opacity: 0,
      transition: `opacity ${vars.transitions.fast}`,
    },
  },
});

// Pills variant
export const tabPillsStyle = style({
  borderRadius: vars.borderRadius.md,
  border: '1px solid transparent',
  transition: `all ${vars.transitions.fast}`,
});

export const tabPillsActiveStyle = style({
  color: vars.colors.text.primary,
  background: vars.colors.surface.active,
  borderColor: vars.colors.border.default,
  selectors: {
    '&:hover:not(:disabled)': {
      background: vars.colors.surface.active,
    },
  },
});

export const tabPillsInactiveStyle = style({
  color: vars.colors.text.secondary,
  background: vars.colors.background.secondary,
  selectors: {
    '&:hover:not(:disabled)': {
      background: vars.colors.surface.hover,
    },
  },
});

// Enclosed variant
export const tabEnclosedStyle = style({
  transition: `all ${vars.transitions.fast}`,
  selectors: {
    '&:hover:not(:disabled)': {
      color: vars.colors.text.primary,
    },
  },
});

export const tabEnclosedActiveHorizontalStyle = style({
  color: vars.colors.text.primary,
  border: `1px solid ${vars.colors.border.default}`,
  background: vars.colors.background.primary,
  borderBottomColor: vars.colors.background.primary,
  borderRadius: `${vars.borderRadius.md} ${vars.borderRadius.md} 0 0`,
  marginBottom: '-1px',
  selectors: {
    '&:hover:not(:disabled)': {
      background: vars.colors.background.primary,
    },
  },
});

export const tabEnclosedActiveVerticalStyle = style({
  color: vars.colors.text.primary,
  border: `1px solid ${vars.colors.border.default}`,
  background: vars.colors.background.primary,
  borderRightColor: vars.colors.background.primary,
  borderRadius: `${vars.borderRadius.md} 0 0 ${vars.borderRadius.md}`,
  marginRight: '-1px',
  selectors: {
    '&:hover:not(:disabled)': {
      background: vars.colors.background.primary,
    },
  },
});

export const tabEnclosedInactiveStyle = style({
  color: vars.colors.text.secondary,
  background: vars.colors.surface.default,
  border: '1px solid transparent',
  selectors: {
    '&:hover:not(:disabled)': {
      background: vars.colors.surface.hover,
    },
  },
});

// --- Tab Icon ---

export const tabIconStyle = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
});

// --- Close Button ---

export const tabCloseButtonStyle = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
  cursor: 'pointer',
  color: vars.colors.text.muted,
  borderRadius: vars.borderRadius.sm,
  padding: '2px',
  marginLeft: vars.spacing.sm,
  transition: `all ${vars.transitions.fast}`,

  selectors: {
    '&:hover': {
      color: vars.colors.text.primary,
      background: vars.colors.surface.hover,
    },
  },
});

globalStyle(`${tabCloseButtonStyle} svg`, {
  color: 'currentColor',
});

// --- Tab Panel ---

export const tabPanelStyle = style({
  display: 'flex',
  flex: '1 1 auto',
  flexDirection: 'column',
  minWidth: 0,
  minHeight: 0,
  overflow: 'hidden',
  outline: 'none',
});
