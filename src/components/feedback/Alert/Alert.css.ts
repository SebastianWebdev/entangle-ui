import { style, createVar } from '@vanilla-extract/css';
import { recipe } from '@vanilla-extract/recipes';
import { vars } from '@/theme/contract.css';

/**
 * Per-instance variant color, set by the component via `assignInlineVars`
 * based on the `variant` prop. The recipe styles below reference it so the
 * appearance axis can stay variant-agnostic.
 */
export const alertColorVar = createVar();

/**
 * Solid-appearance text color.
 *
 * Hard-coded white (`#ffffff`) by default; consumers can override via
 * `--alert-on-solid` if they need something different. White-on-accent gives
 * the highest contrast across the dark-first palette and matches the spec.
 */
export const alertOnSolidVar = createVar();

export const alertRecipe = recipe({
  base: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: vars.spacing.md,
    padding: vars.spacing.md,
    borderRadius: vars.borderRadius.md,
    fontFamily: vars.typography.fontFamily.sans,
    fontSize: vars.typography.fontSize.md,
    lineHeight: vars.typography.lineHeight.normal,
    boxSizing: 'border-box',
    vars: {
      [alertOnSolidVar]: '#ffffff',
    },
  },
  variants: {
    variant: {
      info: {},
      success: {},
      warning: {},
      error: {},
      neutral: {},
    },
    appearance: {
      subtle: {
        background: `color-mix(in srgb, ${alertColorVar} 12%, transparent)`,
        border: `1px solid color-mix(in srgb, ${alertColorVar} 30%, transparent)`,
        color: vars.colors.text.primary,
      },
      solid: {
        background: alertColorVar,
        border: `1px solid ${alertColorVar}`,
        color: alertOnSolidVar,
      },
      outline: {
        background: 'transparent',
        border: `1px solid ${alertColorVar}`,
        color: vars.colors.text.primary,
      },
    },
  },
  defaultVariants: {
    variant: 'info',
    appearance: 'subtle',
  },
});

/**
 * Icon column — 20px square, top-aligned with the title.
 */
export const alertIconStyle = style({
  display: 'flex',
  alignItems: 'flex-start',
  justifyContent: 'center',
  width: '20px',
  flexShrink: 0,
  color: alertColorVar,
});

export const alertIconSolidStyle = style({
  color: alertOnSolidVar,
});

/**
 * Center slot — flexible content area for title / description / actions.
 *
 * `flex: 1` claims remaining horizontal space; `min-width: 0` lets long
 * content wrap instead of overflowing the alert.
 */
export const alertContentStyle = style({
  display: 'flex',
  flexDirection: 'column',
  flex: 1,
  minWidth: 0,
});

/**
 * Right column — close button slot, 20px wide, top-aligned.
 */
export const alertCloseColumnStyle = style({
  display: 'flex',
  alignItems: 'flex-start',
  justifyContent: 'center',
  width: '20px',
  flexShrink: 0,
});

/**
 * Override the close-button color in solid appearance — defaults to white,
 * matching `alertOnSolidVar`.
 */
export const alertCloseButtonSolidStyle = style({
  color: alertOnSolidVar,
});

/**
 * Title styling.
 *
 * Solid appearance inherits the on-solid color from the root; subtle/outline
 * use the standard primary text token (already applied by the root recipe).
 */
export const alertTitleStyle = style({
  fontSize: vars.typography.fontSize.md,
  fontWeight: vars.typography.fontWeight.semibold,
  lineHeight: vars.typography.lineHeight.tight,
  color: 'inherit',
  marginBottom: vars.spacing.xs,
});

/**
 * Description text. Defaults to the secondary token; switches to the
 * on-solid color when nested inside a solid-appearance alert via the
 * parent attribute selector. This handles both string children (auto-wrapped
 * in `AlertDescription`) and the compound `<Alert.Description>` API uniformly.
 */
export const alertDescriptionStyle = style({
  fontSize: vars.typography.fontSize.md,
  lineHeight: vars.typography.lineHeight.normal,
  color: vars.colors.text.secondary,
  selectors: {
    '[data-appearance="solid"] &': {
      color: alertOnSolidVar,
    },
  },
});

export const alertActionsRecipe = recipe({
  base: {
    display: 'flex',
    flexDirection: 'row',
    gap: vars.spacing.sm,
    marginTop: vars.spacing.md,
  },
  variants: {
    align: {
      left: { justifyContent: 'flex-start' },
      right: { justifyContent: 'flex-end' },
      'space-between': { justifyContent: 'space-between' },
    },
  },
  defaultVariants: {
    align: 'left',
  },
});
