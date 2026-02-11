import { style, createVar } from '@vanilla-extract/css';
import { recipe } from '@vanilla-extract/recipes';
import { vars } from '@/theme/contract.css';

/* Dynamic CSS variables for runtime values */
export const scrollbarWidthVar = createVar();
export const scrollbarPaddingVar = createVar();
export const fadeMaskSizeVar = createVar();

export const rootStyle = style({
  position: 'relative',
  overflow: 'hidden',
});

export const rootAutoFill = style({
  width: '100%',
  height: '100%',
});

export const viewportRecipe = recipe({
  base: {
    width: '100%',
    height: '100%',
    maxHeight: 'inherit',
    maxWidth: 'inherit',
    scrollbarWidth: 'none',
    msOverflowStyle: 'none',
    selectors: {
      '&::-webkit-scrollbar': {
        display: 'none',
      },
      '&:focus': {
        outline: 'none',
      },
      '&:focus-visible': {
        boxShadow: vars.shadows.focus,
      },
    },
  },
  variants: {
    direction: {
      vertical: {
        overflowX: 'hidden',
        overflowY: 'scroll',
      },
      horizontal: {
        overflowX: 'scroll',
        overflowY: 'hidden',
      },
      both: {
        overflowX: 'scroll',
        overflowY: 'scroll',
      },
    },
  },
});

export const scrollbarVertical = style({
  position: 'absolute',
  zIndex: 1,
  right: scrollbarPaddingVar,
  top: scrollbarPaddingVar,
  bottom: scrollbarPaddingVar,
  width: scrollbarWidthVar,
  borderRadius: scrollbarWidthVar,
  transition: `opacity ${vars.transitions.fast}`,
});

export const scrollbarHorizontal = style({
  position: 'absolute',
  zIndex: 1,
  bottom: scrollbarPaddingVar,
  left: scrollbarPaddingVar,
  right: scrollbarPaddingVar,
  height: scrollbarWidthVar,
  borderRadius: scrollbarWidthVar,
  transition: `opacity ${vars.transitions.fast}`,
});

export const scrollbarVisible = style({
  opacity: 1,
  pointerEvents: 'auto',
});

export const scrollbarHidden = style({
  opacity: 0,
  pointerEvents: 'none',
});

export const thumbBase = style({
  position: 'absolute',
  borderRadius: 'inherit',
  background: vars.colors.text.disabled,
  transition: `background ${vars.transitions.fast}`,
  cursor: 'pointer',
  selectors: {
    '&:hover': {
      background: vars.colors.text.muted,
    },
  },
});

export const thumbVertical = style({
  width: '100%',
  left: 0,
});

export const thumbHorizontal = style({
  height: '100%',
  top: 0,
});

export const thumbDragging = style({
  background: vars.colors.text.secondary,
});

export const fadeMaskBase = style({
  position: 'absolute',
  zIndex: 1,
  pointerEvents: 'none',
  transition: `opacity ${vars.transitions.fast}`,
});

export const fadeMaskVisible = style({
  opacity: 1,
});

export const fadeMaskHiddenStyle = style({
  opacity: 0,
});

export const fadeMaskTop = style({
  top: 0,
  left: 0,
  right: 0,
  height: fadeMaskSizeVar,
  background: `linear-gradient(to bottom, ${vars.colors.background.primary}, transparent)`,
});

export const fadeMaskBottom = style({
  bottom: 0,
  left: 0,
  right: 0,
  height: fadeMaskSizeVar,
  background: `linear-gradient(to top, ${vars.colors.background.primary}, transparent)`,
});

export const fadeMaskLeft = style({
  top: 0,
  left: 0,
  bottom: 0,
  width: fadeMaskSizeVar,
  background: `linear-gradient(to right, ${vars.colors.background.primary}, transparent)`,
});

export const fadeMaskRight = style({
  top: 0,
  right: 0,
  bottom: 0,
  width: fadeMaskSizeVar,
  background: `linear-gradient(to left, ${vars.colors.background.primary}, transparent)`,
});
