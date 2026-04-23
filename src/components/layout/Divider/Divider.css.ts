import { style } from '@vanilla-extract/css';
import { recipe } from '@vanilla-extract/recipes';
import { vars } from '@/theme/contract.css';

export const dividerRecipe = recipe({
  base: {
    border: 0,
    boxSizing: 'border-box',
    flexShrink: 0,
  },
  variants: {
    orientation: {
      horizontal: {
        width: '100%',
        height: '1px',
      },
      vertical: {
        width: '1px',
        height: 'auto',
        alignSelf: 'stretch',
      },
    },
    variant: {
      solid: {
        background: vars.colors.border.default,
      },
      dashed: {
        background: 'transparent',
        borderTopWidth: '1px',
        borderTopStyle: 'dashed',
        borderTopColor: vars.colors.border.default,
      },
      dotted: {
        background: 'transparent',
        borderTopWidth: '1px',
        borderTopStyle: 'dotted',
        borderTopColor: vars.colors.border.default,
      },
    },
  },
  compoundVariants: [
    {
      variants: { orientation: 'vertical', variant: 'dashed' },
      style: {
        background: 'transparent',
        borderTop: 0,
        borderLeftWidth: '1px',
        borderLeftStyle: 'dashed',
        borderLeftColor: vars.colors.border.default,
      },
    },
    {
      variants: { orientation: 'vertical', variant: 'dotted' },
      style: {
        background: 'transparent',
        borderTop: 0,
        borderLeftWidth: '1px',
        borderLeftStyle: 'dotted',
        borderLeftColor: vars.colors.border.default,
      },
    },
  ],
  defaultVariants: {
    orientation: 'horizontal',
    variant: 'solid',
  },
});

export const dividerWithLabelRecipe = recipe({
  base: {
    display: 'flex',
    alignItems: 'center',
    gap: vars.spacing.md,
    width: '100%',
    color: vars.colors.text.muted,
    fontFamily: vars.typography.fontFamily.sans,
    fontSize: vars.typography.fontSize.xxs,
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    fontWeight: vars.typography.fontWeight.semibold,

    selectors: {
      '&::before, &::after': {
        content: '""',
        flex: 1,
        height: '1px',
        background: vars.colors.border.default,
      },
    },
  },
  variants: {
    variant: {
      solid: {},
      dashed: {
        selectors: {
          '&::before, &::after': {
            background: 'transparent',
            borderTop: `1px dashed ${vars.colors.border.default}`,
          },
        },
      },
      dotted: {
        selectors: {
          '&::before, &::after': {
            background: 'transparent',
            borderTop: `1px dotted ${vars.colors.border.default}`,
          },
        },
      },
    },
  },
  defaultVariants: { variant: 'solid' },
});

export const dividerLabelTextStyle = style({
  flexShrink: 0,
});
