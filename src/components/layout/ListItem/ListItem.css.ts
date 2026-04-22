import { style } from '@vanilla-extract/css';
import { recipe } from '@vanilla-extract/recipes';
import { vars } from '@/theme/contract.css';

export const listItemRecipe = recipe({
  base: {
    display: 'flex',
    alignItems: 'center',
    gap: vars.spacing.md,
    padding: `0 ${vars.spacing.md}`,
    background: vars.colors.surface.row,
    color: vars.colors.text.primary,
    fontFamily: vars.typography.fontFamily.sans,
    fontSize: vars.typography.fontSize.md,
    lineHeight: vars.typography.lineHeight.tight,
    borderRadius: vars.borderRadius.sm,
    boxSizing: 'border-box',
    width: '100%',
    transition: `background-color ${vars.transitions.fast}`,
    outline: 'none',

    selectors: {
      '&:hover:not([data-disabled="true"])': {
        background: vars.colors.surface.rowHover,
      },
      '&:focus-visible': {
        boxShadow: vars.shadows.focus,
      },
    },
  },
  variants: {
    density: {
      compact: { height: '24px', fontSize: vars.typography.fontSize.sm },
      comfortable: { height: '32px' },
    },
    clickable: {
      true: { cursor: 'pointer', userSelect: 'none' },
      false: {},
    },
    selected: {
      true: {
        background: `color-mix(in srgb, ${vars.colors.accent.primary} 12%, transparent)`,
        selectors: {
          '&:hover:not([data-disabled="true"])': {
            background: `color-mix(in srgb, ${vars.colors.accent.primary} 16%, transparent)`,
          },
        },
      },
      false: {},
    },
    active: {
      true: {
        background: `color-mix(in srgb, ${vars.colors.accent.primary} 20%, transparent)`,
      },
      false: {},
    },
    disabled: {
      true: {
        opacity: 0.5,
        pointerEvents: 'none',
        cursor: 'not-allowed',
      },
      false: {},
    },
  },
  defaultVariants: {
    density: 'comfortable',
    clickable: false,
    selected: false,
    active: false,
    disabled: false,
  },
});

export const listItemLeadingStyle = style({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: vars.colors.text.secondary,
  flexShrink: 0,
});

export const listItemContentStyle = style({
  flex: 1,
  minWidth: 0,
  overflow: 'hidden',
  whiteSpace: 'nowrap',
  textOverflow: 'ellipsis',
});

export const listItemTrailingStyle = style({
  display: 'inline-flex',
  alignItems: 'center',
  gap: vars.spacing.sm,
  color: vars.colors.text.muted,
  flexShrink: 0,
});
