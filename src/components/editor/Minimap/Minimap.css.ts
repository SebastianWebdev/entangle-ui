import { style } from '@vanilla-extract/css';
import { vars } from '@/theme/contract.css';

export const minimapWrapperStyle = style({
  position: 'relative',
  display: 'inline-block',
  background: vars.colors.background.secondary,
  border: `1px solid ${vars.colors.border.default}`,
  borderRadius: vars.borderRadius.sm,
  overflow: 'hidden',
  cursor: 'pointer',
  outline: 'none',
  userSelect: 'none',
  touchAction: 'none',
  selectors: {
    '&:focus-visible': {
      boxShadow: vars.shadows.focus,
    },
    '&[data-dragging]': {
      cursor: 'grabbing',
    },
    '&[data-disabled]': {
      opacity: 0.5,
      cursor: 'not-allowed',
      pointerEvents: 'none',
    },
  },
});

export const minimapCanvasStyle = style({
  display: 'block',
  // All pointer interactions go to the wrapper so capture works regardless of target.
  pointerEvents: 'none',
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
