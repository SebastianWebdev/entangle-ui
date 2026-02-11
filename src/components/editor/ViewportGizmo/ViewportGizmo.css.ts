import { style, createVar } from '@vanilla-extract/css';
import { recipe } from '@vanilla-extract/recipes';
import { vars } from '@/theme/contract.css';

export const gizmoDiameterVar = createVar();

export const gizmoWrapperRecipe = recipe({
  base: {
    display: 'inline-flex',
    position: 'relative',
    width: gizmoDiameterVar,
    height: gizmoDiameterVar,
    flexShrink: 0,
  },
  variants: {
    background: {
      transparent: {},
      subtle: {
        borderRadius: '50%',
        overflow: 'hidden',
      },
      solid: {
        borderRadius: '50%',
        overflow: 'hidden',
        border: `1px solid ${vars.colors.border.default}`,
        background: vars.colors.background.secondary,
      },
    },
    disabled: {
      true: { opacity: 0.5 },
      false: {},
    },
  },
  defaultVariants: {
    background: 'subtle',
    disabled: false,
  },
});

export const gizmoCanvasStyle = recipe({
  base: {
    width: '100%',
    height: '100%',
    display: 'block',
    outline: 'none',
    selectors: {
      '&:focus-visible': {
        boxShadow: vars.shadows.focus,
      },
    },
  },
  variants: {
    disabled: {
      true: { pointerEvents: 'none' },
      false: {},
    },
  },
  defaultVariants: {
    disabled: false,
  },
});

export const ariaLiveRegionStyle = style({
  position: 'absolute',
  width: 1,
  height: 1,
  padding: 0,
  margin: -1,
  overflow: 'hidden',
  clip: 'rect(0, 0, 0, 0)',
  whiteSpace: 'nowrap',
  borderWidth: 0,
});
