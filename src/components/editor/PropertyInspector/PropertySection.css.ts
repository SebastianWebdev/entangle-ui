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

export const sectionTrigger = recipe({
  base: {
    margin: 0,
    border: 'none',
    fontFamily: 'inherit',
    outline: 'none',
    userSelect: 'none',
    width: '100%',
    textAlign: 'left',
    display: 'flex',
    alignItems: 'center',
    gap: vars.spacing.sm,
    fontWeight: vars.typography.fontWeight.medium,
    background: vars.colors.surface.default,
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
        height: '24px',
        padding: `0 ${vars.spacing.sm}`,
        fontSize: vars.typography.fontSize.md,
      },
      md: {
        height: '28px',
        padding: `0 ${vars.spacing.md}`,
        fontSize: vars.typography.fontSize.md,
      },
      lg: {
        height: '32px',
        padding: `0 ${vars.spacing.lg}`,
        fontSize: vars.typography.fontSize.lg,
      },
    },
    disabled: {
      true: {
        cursor: 'not-allowed',
        opacity: 0.5,
      },
      false: {
        cursor: 'pointer',
        opacity: 1,
      },
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

export const chevron = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
  transition: `transform ${vars.transitions.fast}`,
  color: vars.colors.text.muted,
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

export const actionsArea = style({
  display: 'flex',
  alignItems: 'center',
  marginLeft: 'auto',
  gap: vars.spacing.xs,
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
