import { createVar, style } from '@vanilla-extract/css';
import { recipe } from '@vanilla-extract/recipes';
import { vars } from '@/theme/contract.css';

/**
 * Runtime color variable — set per-instance via `assignInlineVars`
 * so `subtle`, `solid`, and `outline` variants can share one recipe
 * while still respecting the resolved color (named token or raw CSS value).
 */
export const badgeColorVar = createVar();
export const badgeContrastVar = createVar();

export const badgeRecipe = recipe({
  base: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: vars.spacing.sm,
    fontFamily: vars.typography.fontFamily.sans,
    fontWeight: vars.typography.fontWeight.semibold,
    borderRadius: vars.borderRadius.sm,
    whiteSpace: 'nowrap',
    lineHeight: 1,
    verticalAlign: 'middle',
    border: '1px solid transparent',
    boxSizing: 'border-box',
  },

  variants: {
    size: {
      xs: {
        height: '14px',
        padding: `0 ${vars.spacing.sm}`,
        fontSize: vars.typography.fontSize.xxs,
      },
      sm: {
        height: '16px',
        padding: `0 ${vars.spacing.sm}`,
        fontSize: vars.typography.fontSize.xxs,
      },
      md: {
        height: '20px',
        padding: `0 ${vars.spacing.md}`,
        fontSize: vars.typography.fontSize.xs,
      },
      lg: {
        height: '24px',
        padding: `0 ${vars.spacing.md}`,
        fontSize: vars.typography.fontSize.sm,
      },
    },

    variant: {
      subtle: {
        background: `color-mix(in srgb, ${badgeColorVar} 15%, transparent)`,
        color: badgeColorVar,
        borderColor: 'transparent',
      },
      solid: {
        background: badgeColorVar,
        color: badgeContrastVar,
        borderColor: badgeColorVar,
      },
      outline: {
        background: 'transparent',
        color: badgeColorVar,
        borderColor: badgeColorVar,
      },
      dot: {
        background: 'transparent',
        color: vars.colors.text.primary,
        borderColor: 'transparent',
        padding: 0,
      },
    },

    uppercase: {
      true: {
        textTransform: 'uppercase',
        letterSpacing: '0.03em',
      },
    },
  },

  defaultVariants: {
    size: 'sm',
    variant: 'subtle',
  },
});

export const badgeIconStyle = style({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
});

export const badgeDotStyle = style({
  display: 'inline-block',
  width: '6px',
  height: '6px',
  borderRadius: '50%',
  background: badgeColorVar,
  flexShrink: 0,
});

export const badgeRemoveButtonStyle = style({
  appearance: 'none',
  background: 'transparent',
  border: 'none',
  color: 'inherit',
  padding: 0,
  marginLeft: vars.spacing.xs,
  cursor: 'pointer',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: vars.borderRadius.sm,
  opacity: 0.7,
  transition: `opacity ${vars.transitions.fast}`,

  ':hover': {
    opacity: 1,
  },
  ':focus-visible': {
    outline: `1px solid ${vars.colors.border.focus}`,
    outlineOffset: '1px',
    opacity: 1,
  },
});
