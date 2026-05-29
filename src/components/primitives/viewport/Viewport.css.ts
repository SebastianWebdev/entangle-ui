import { style, createVar } from '@vanilla-extract/css';
import { recipe } from '@vanilla-extract/recipes';
import { vars } from '@/theme/contract.css';

export const viewportHeightVar = createVar();

export const viewportRootRecipe = recipe({
  base: {
    position: 'relative',
    width: '100%',
    overflow: 'hidden',
    outline: 'none',
    background: vars.colors.background.primary,
    color: vars.colors.text.primary,
    touchAction: 'none',
    userSelect: 'none',
    cursor: 'default',
    selectors: {
      '&:focus-visible': {
        boxShadow: vars.shadows.focus,
      },
    },
  },
  variants: {
    responsive: {
      true: { height: '100%' },
      false: { height: viewportHeightVar },
    },
    disabled: {
      true: { opacity: 0.5, pointerEvents: 'none' },
      false: {},
    },
    panning: {
      true: { cursor: 'grabbing' },
      false: {},
    },
  },
  defaultVariants: {
    responsive: false,
    disabled: false,
    panning: false,
  },
});

export const layerCanvasStyle = style({
  position: 'absolute',
  inset: 0,
  display: 'block',
  width: '100%',
  height: '100%',
  pointerEvents: 'none',
});

export const worldLayerStyle = style({
  position: 'absolute',
  top: 0,
  left: 0,
  width: 0,
  height: 0,
  transformOrigin: '0 0',
  // NB: do NOT add `will-change: transform` here. This wrapper carries the
  // viewport `scale()`; promoting it to a persistent compositor layer makes
  // the browser rasterize its contents once at the base scale and then
  // GPU-upscale the texture on zoom-in → blurry nodes/text until something
  // forces a repaint. Re-rasterizing per paint (the default) keeps content
  // crisp at every zoom level, which matters far more than pan-layer
  // stability here.
  // Children opt in to pointer events; the wrapper itself never blocks input.
  pointerEvents: 'none',
});

export const overlayLayerStyle = style({
  position: 'absolute',
  inset: 0,
  // Children opt in to pointer events; the wrapper itself never blocks input.
  pointerEvents: 'none',
});

export const marqueeRectStyle = style({
  position: 'absolute',
  pointerEvents: 'none',
  border: `1px solid ${vars.colors.accent.primary}`,
  background: vars.colors.accent.primary,
  opacity: 0.18,
  borderRadius: vars.borderRadius.sm,
});

export const ariaLiveRegionStyle = style({
  position: 'absolute',
  width: '1px',
  height: '1px',
  overflow: 'hidden',
  clip: 'rect(0, 0, 0, 0)',
  whiteSpace: 'nowrap',
});
