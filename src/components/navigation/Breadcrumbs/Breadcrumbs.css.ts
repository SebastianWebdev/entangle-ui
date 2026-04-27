import { style } from '@vanilla-extract/css';
import { recipe } from '@vanilla-extract/recipes';
import { vars } from '@/theme/contract.css';

export const breadcrumbsRootRecipe = recipe({
  base: {
    display: 'block',
    minWidth: 0,
    fontFamily: vars.typography.fontFamily.sans,
    lineHeight: vars.typography.lineHeight.tight,
  },
  variants: {
    size: {
      sm: {
        fontSize: vars.typography.fontSize.xs,
      },
      md: {
        fontSize: vars.typography.fontSize.sm,
      },
      lg: {
        fontSize: vars.typography.fontSize.md,
      },
    },
  },
  defaultVariants: {
    size: 'sm',
  },
});

export const breadcrumbsListRecipe = recipe({
  base: {
    display: 'flex',
    alignItems: 'center',
    flexWrap: 'nowrap',
    minWidth: 0,
    margin: 0,
    padding: 0,
    listStyle: 'none',
  },
  variants: {
    size: {
      sm: {
        columnGap: vars.spacing.xs,
      },
      md: {
        columnGap: vars.spacing.sm,
      },
      lg: {
        columnGap: vars.spacing.sm,
      },
    },
  },
  defaultVariants: {
    size: 'sm',
  },
});

export const breadcrumbItemStyle = style({
  display: 'inline-flex',
  alignItems: 'center',
  minWidth: 0,
  flexShrink: 0,
});

export const breadcrumbContentBaseStyle = style({
  display: 'inline-flex',
  alignItems: 'center',
  minWidth: 0,
  maxWidth: '100%',
  gap: vars.spacing.sm,
  padding: 0,
  margin: 0,
  border: 'none',
  borderRadius: vars.borderRadius.sm,
  background: 'transparent',
  color: 'inherit',
  font: 'inherit',
  lineHeight: 'inherit',
  textDecoration: 'none',
  whiteSpace: 'nowrap',
  outline: 'none',
  transition: `color ${vars.transitions.fast}`,

  selectors: {
    '&:focus-visible': {
      boxShadow: vars.shadows.focus,
    },
  },
});

export const breadcrumbContentRecipe = recipe({
  base: [breadcrumbContentBaseStyle],
  variants: {
    state: {
      link: {
        color: vars.colors.text.secondary,
        cursor: 'pointer',

        selectors: {
          '&:hover': {
            color: vars.colors.text.primary,
            textDecoration: 'underline',
          },
        },
      },
      current: {
        color: vars.colors.text.primary,
        cursor: 'default',
      },
      disabled: {
        color: vars.colors.text.muted,
        cursor: 'default',
      },
    },
  },
  defaultVariants: {
    state: 'disabled',
  },
});

export const breadcrumbIconStyle = style({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
  color: 'currentColor',
});

export const breadcrumbLabelStyle = style({
  minWidth: 0,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
});

export const breadcrumbSeparatorStyle = style({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
  color: vars.colors.text.muted,
});

export const breadcrumbEllipsisStyle = style({
  display: 'inline-flex',
  alignItems: 'center',
  minWidth: 0,
  flexShrink: 0,
});

export const breadcrumbEllipsisButtonStyle = style({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  minWidth: 0,
  padding: 0,
  margin: 0,
  border: 'none',
  borderRadius: vars.borderRadius.sm,
  background: 'transparent',
  color: vars.colors.text.secondary,
  font: 'inherit',
  lineHeight: 'inherit',
  cursor: 'pointer',
  outline: 'none',
  transition: `color ${vars.transitions.fast}`,

  selectors: {
    '&:hover': {
      color: vars.colors.text.primary,
    },
    '&:focus-visible': {
      boxShadow: vars.shadows.focus,
    },
  },
});

export const breadcrumbEllipsisTextStyle = style({
  color: vars.colors.text.muted,
});
