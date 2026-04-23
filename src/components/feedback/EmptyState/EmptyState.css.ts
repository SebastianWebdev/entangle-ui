import { style } from '@vanilla-extract/css';
import { recipe } from '@vanilla-extract/recipes';
import { vars } from '@/theme/contract.css';

export const emptyStateRecipe = recipe({
  base: {
    display: 'flex',
    fontFamily: vars.typography.fontFamily.sans,
    color: vars.colors.text.primary,
  },
  variants: {
    variant: {
      default: {
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: vars.spacing.md,
        padding: vars.spacing.xxl,
        textAlign: 'center',
      },
      compact: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: vars.spacing.md,
        padding: `${vars.spacing.sm} ${vars.spacing.md}`,
        textAlign: 'left',
      },
    },
  },
  defaultVariants: { variant: 'default' },
});

export const emptyStateIconStyle = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: vars.colors.text.muted,
});

export const emptyStateTitleStyle = style({
  margin: 0,
  fontSize: vars.typography.fontSize.lg,
  fontWeight: vars.typography.fontWeight.semibold,
  lineHeight: vars.typography.lineHeight.tight,
  color: vars.colors.text.primary,
});

export const emptyStateDescriptionStyle = style({
  margin: 0,
  fontSize: vars.typography.fontSize.sm,
  lineHeight: vars.typography.lineHeight.normal,
  color: vars.colors.text.muted,
  maxWidth: '48ch',
});

export const emptyStateTextColumnStyle = style({
  display: 'flex',
  flexDirection: 'column',
  gap: vars.spacing.xs,
  alignItems: 'center',
});

export const emptyStateTextColumnCompactStyle = style({
  display: 'flex',
  flexDirection: 'column',
  gap: vars.spacing.xs,
  alignItems: 'flex-start',
  flex: 1,
});

export const emptyStateActionStyle = style({
  marginTop: vars.spacing.md,
  display: 'inline-flex',
  gap: vars.spacing.sm,
});
