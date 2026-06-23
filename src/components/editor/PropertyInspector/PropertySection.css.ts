import { style, globalStyle } from '@vanilla-extract/css';
import { recipe } from '@vanilla-extract/recipes';

import { vars } from '@/theme/contract.css';

export const sectionRoot = style({
  display: 'flex',
  flexDirection: 'column',
  background: vars.colors.background.secondary,
  border: `1px solid ${vars.colors.border.default}`,
  borderRadius: vars.borderRadius.md,
  overflow: 'hidden',
});

globalStyle(`${sectionRoot} + ${sectionRoot}`, {
  marginTop: vars.spacing.sm,
});

// The header strip carries the background, height, and the expanded separator.
// Interactive controls (the trigger button, the enable toggle, and `actions`)
// are siblings inside it — so the toggle/actions are never nested in a button.
export const sectionHeader = recipe({
  base: {
    display: 'flex',
    alignItems: 'stretch',
    width: '100%',
    background: vars.colors.surface.default,
  },
  variants: {
    size: {
      sm: { height: '24px' },
      md: { height: '28px' },
      lg: { height: '32px' },
    },
    disabled: {
      true: { opacity: 0.5 },
      false: { opacity: 1 },
    },
    expanded: {
      true: {
        borderBottom: `1px solid ${vars.colors.border.default}`,
      },
      false: {
        borderBottom: 'none',
      },
    },
  },
  defaultVariants: {
    size: 'md',
    disabled: false,
    expanded: false,
  },
});

export const sectionTrigger = recipe({
  base: {
    margin: 0,
    border: 'none',
    fontFamily: 'inherit',
    outline: 'none',
    userSelect: 'none',
    flex: 1,
    minWidth: 0,
    textAlign: 'left',
    display: 'flex',
    alignItems: 'center',
    gap: vars.spacing.sm,
    fontWeight: vars.typography.fontWeight.medium,
    background: 'transparent',
    color: vars.colors.text.primary,
    transition: `background ${vars.transitions.fast}`,
    selectors: {
      '&:hover:not(:disabled)': {
        background: vars.colors.surface.hover,
      },
      '&:focus-visible': {
        boxShadow: vars.shadows.focus,
        zIndex: 1,
      },
    },
  },
  variants: {
    size: {
      sm: {
        padding: `0 ${vars.spacing.sm}`,
        fontSize: vars.typography.fontSize.md,
      },
      md: {
        padding: `0 ${vars.spacing.md}`,
        fontSize: vars.typography.fontSize.md,
      },
      lg: {
        padding: `0 ${vars.spacing.lg}`,
        fontSize: vars.typography.fontSize.lg,
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
  },
  defaultVariants: {
    size: 'md',
    disabled: false,
  },
});

export const chevron = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
  transition: `transform ${vars.transitions.fast}`,
  color: vars.colors.text.muted,

  '@media': {
    '(prefers-reduced-motion: reduce)': {
      transition: 'none',
    },
  },
});

export const chevronExpanded = style({
  transform: 'rotate(90deg)',
});

export const iconArea = style({
  display: 'flex',
  alignItems: 'center',
  flexShrink: 0,
});

export const sectionLabel = style({
  flex: 1,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
});

export const headerControls = style({
  display: 'flex',
  alignItems: 'center',
  flexShrink: 0,
  gap: vars.spacing.xs,
  paddingRight: vars.spacing.md,
});

export const contentWrapper = recipe({
  base: {
    display: 'grid',
    transition: `grid-template-rows ${vars.transitions.normal}`,
  },
  variants: {
    expanded: {
      true: {
        gridTemplateRows: '1fr',
      },
      false: {
        gridTemplateRows: '0fr',
      },
    },
  },
  defaultVariants: {
    expanded: false,
  },
});

export const contentInner = style({
  overflow: 'hidden',
  minHeight: 0,
});
