import { style, createVar } from '@vanilla-extract/css';
import { recipe } from '@vanilla-extract/recipes';
import { vars } from '@/theme/contract.css';

export const canvasContainerHeightVar = createVar();

export const canvasContainerRecipe = recipe({
  base: {
    position: 'relative',
    width: '100%',
    overflow: 'hidden',
  },
  variants: {
    responsive: {
      true: { height: '100%' },
      false: { height: canvasContainerHeightVar },
    },
  },
  defaultVariants: {
    responsive: false,
  },
});

export const canvasRecipe = recipe({
  base: {
    display: 'block',
    width: '100%',
    height: '100%',
    outline: 'none',
    border: 'none',
    selectors: {
      '&:focus-visible': {
        boxShadow: vars.shadows.focus,
      },
    },
  },
  variants: {
    disabled: {
      true: { opacity: 0.5 },
      false: {},
    },
  },
  defaultVariants: {
    disabled: false,
  },
});

export const ariaLiveRegionStyle = style({
  position: 'absolute',
  width: '1px',
  height: '1px',
  overflow: 'hidden',
  clip: 'rect(0, 0, 0, 0)',
  whiteSpace: 'nowrap',
});
