import { createVar, style } from '@vanilla-extract/css';
import { recipe } from '@vanilla-extract/recipes';
import { vars } from '@/theme/contract.css';

export const statDeltaColorVar = createVar();

export const statRoot = recipe({
  base: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: vars.spacing.md,
    color: vars.colors.text.primary,
  },
  variants: {
    size: {
      sm: { fontSize: vars.typography.fontSize.xs },
      md: { fontSize: vars.typography.fontSize.sm },
      lg: { fontSize: vars.typography.fontSize.md },
    },
  },
  defaultVariants: { size: 'md' },
});

export const statIconStyle = style({
  flexShrink: 0,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: vars.colors.text.secondary,
});

export const statContentStyle = style({
  display: 'flex',
  flexDirection: 'column',
  gap: vars.spacing.xs,
  minWidth: 0,
});

export const statLabelStyle = style({
  fontSize: vars.typography.fontSize.xxs,
  fontWeight: vars.typography.fontWeight.medium,
  color: vars.colors.text.muted,
  textTransform: 'uppercase',
  letterSpacing: '0.04em',
  margin: 0,
});

export const statValueRecipe = recipe({
  base: {
    fontWeight: vars.typography.fontWeight.semibold,
    color: vars.colors.text.primary,
    lineHeight: vars.typography.lineHeight.tight,
    margin: 0,
  },
  variants: {
    size: {
      sm: { fontSize: vars.typography.fontSize.lg },
      md: { fontSize: vars.typography.fontSize.xl },
      lg: { fontSize: '32px' },
    },
  },
  defaultVariants: { size: 'md' },
});

export const statDeltaStyle = style({
  display: 'inline-flex',
  alignItems: 'center',
  gap: vars.spacing.xs,
  fontSize: vars.typography.fontSize.xs,
  fontWeight: vars.typography.fontWeight.medium,
  color: statDeltaColorVar,
});

export const statDeltaIconStyle = style({
  display: 'inline-flex',
  width: '12px',
  height: '12px',
});

export const statHelperStyle = style({
  fontSize: vars.typography.fontSize.xs,
  color: vars.colors.text.muted,
  margin: 0,
});
