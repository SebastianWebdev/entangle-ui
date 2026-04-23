import { style } from '@vanilla-extract/css';
import { recipe } from '@vanilla-extract/recipes';
import { vars } from '@/theme/contract.css';

export const pageHeaderRecipe = recipe({
  base: {
    display: 'flex',
    alignItems: 'center',
    fontFamily: vars.typography.fontFamily.sans,
    color: vars.colors.text.primary,
    gap: vars.spacing.md,
    boxSizing: 'border-box',
    width: '100%',
  },
  variants: {
    size: {
      sm: { padding: `${vars.spacing.sm} ${vars.spacing.md}` },
      md: { padding: `${vars.spacing.md} ${vars.spacing.lg}` },
      lg: { padding: `${vars.spacing.lg} ${vars.spacing.xl}` },
    },
    bordered: {
      true: {
        borderBottom: `1px solid ${vars.colors.border.default}`,
      },
      false: {},
    },
  },
  defaultVariants: { size: 'md', bordered: true },
});

export const pageHeaderIconStyle = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: vars.colors.text.secondary,
  flexShrink: 0,
});

export const pageHeaderTitleColumnStyle = style({
  display: 'flex',
  flexDirection: 'column',
  gap: vars.spacing.xs,
  minWidth: 0,
  flex: 1,
});

export const pageHeaderTitleRecipe = recipe({
  base: {
    margin: 0,
    lineHeight: vars.typography.lineHeight.tight,
    fontWeight: vars.typography.fontWeight.semibold,
    color: vars.colors.text.primary,
  },
  variants: {
    size: {
      sm: { fontSize: vars.typography.fontSize.md },
      md: { fontSize: vars.typography.fontSize.lg },
      lg: { fontSize: vars.typography.fontSize.xl },
    },
  },
  defaultVariants: { size: 'md' },
});

export const pageHeaderSubtitleStyle = style({
  margin: 0,
  fontSize: vars.typography.fontSize.sm,
  color: vars.colors.text.muted,
  lineHeight: vars.typography.lineHeight.normal,
});

export const pageHeaderBreadcrumbsStyle = style({
  display: 'flex',
  alignItems: 'center',
  gap: vars.spacing.xs,
  fontSize: vars.typography.fontSize.xs,
  color: vars.colors.text.muted,
});

export const pageHeaderActionsStyle = style({
  marginLeft: 'auto',
  display: 'inline-flex',
  alignItems: 'center',
  gap: vars.spacing.sm,
  flexShrink: 0,
});
