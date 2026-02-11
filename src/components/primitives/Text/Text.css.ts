import { recipe, type RecipeVariants } from '@vanilla-extract/recipes';
import { style } from '@vanilla-extract/css';
import { vars } from '@/theme/contract.css';

export const textRecipe = recipe({
  base: {
    margin: 0,
    padding: 0,
  },

  variants: {
    variant: {
      display: {
        fontSize: vars.typography.fontSize.xl,
        fontWeight: vars.typography.fontWeight.semibold,
        lineHeight: vars.typography.lineHeight.tight,
        fontFamily: vars.typography.fontFamily.sans,
      },
      heading: {
        fontSize: vars.typography.fontSize.lg,
        fontWeight: vars.typography.fontWeight.medium,
        lineHeight: vars.typography.lineHeight.tight,
        fontFamily: vars.typography.fontFamily.sans,
      },
      subheading: {
        fontSize: vars.typography.fontSize.md,
        fontWeight: vars.typography.fontWeight.medium,
        lineHeight: vars.typography.lineHeight.normal,
        fontFamily: vars.typography.fontFamily.sans,
      },
      body: {
        fontSize: vars.typography.fontSize.sm,
        fontWeight: vars.typography.fontWeight.normal,
        lineHeight: vars.typography.lineHeight.normal,
        fontFamily: vars.typography.fontFamily.sans,
      },
      caption: {
        fontSize: vars.typography.fontSize.xs,
        fontWeight: vars.typography.fontWeight.normal,
        lineHeight: vars.typography.lineHeight.tight,
        fontFamily: vars.typography.fontFamily.sans,
      },
      code: {
        fontSize: vars.typography.fontSize.sm,
        fontWeight: vars.typography.fontWeight.normal,
        lineHeight: vars.typography.lineHeight.normal,
        fontFamily: vars.typography.fontFamily.mono,
      },
      inherit: {},
    },

    color: {
      primary: { color: vars.colors.text.primary },
      secondary: { color: vars.colors.text.secondary },
      muted: { color: vars.colors.text.muted },
      disabled: { color: vars.colors.text.disabled },
      accent: { color: vars.colors.accent.primary },
      success: { color: vars.colors.accent.success },
      warning: { color: vars.colors.accent.warning },
      error: { color: vars.colors.accent.error },
    },

    size: {
      xs: { fontSize: vars.typography.fontSize.xs },
      sm: { fontSize: vars.typography.fontSize.sm },
      md: { fontSize: vars.typography.fontSize.md },
      lg: { fontSize: vars.typography.fontSize.lg },
      xl: { fontSize: vars.typography.fontSize.xl },
    },

    weight: {
      normal: { fontWeight: vars.typography.fontWeight.normal },
      medium: { fontWeight: vars.typography.fontWeight.medium },
      semibold: { fontWeight: vars.typography.fontWeight.semibold },
    },

    lineHeight: {
      tight: { lineHeight: vars.typography.lineHeight.tight },
      normal: { lineHeight: vars.typography.lineHeight.normal },
      relaxed: { lineHeight: vars.typography.lineHeight.relaxed },
    },

    align: {
      left: { textAlign: 'left' as const },
      center: { textAlign: 'center' as const },
      right: { textAlign: 'right' as const },
      justify: { textAlign: 'justify' as const },
    },

    nowrap: {
      true: { whiteSpace: 'nowrap' },
      false: {},
    },

    mono: {
      true: { fontFamily: vars.typography.fontFamily.mono },
      false: {},
    },

    truncate: {
      true: {},
      false: {},
    },
  },

  defaultVariants: {
    variant: 'body',
    color: 'primary',
    nowrap: false,
    mono: false,
    truncate: false,
  },
});

export const truncateSingleLineStyle = style({
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
});

export const truncateMultiLineStyle = style({
  display: '-webkit-box',
  WebkitBoxOrient: 'vertical',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
});

export type TextVariants = RecipeVariants<typeof textRecipe>;
