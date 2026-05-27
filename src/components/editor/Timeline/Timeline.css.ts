import { style } from '@vanilla-extract/css';
import { vars } from '@/theme/contract.css';

/** Outer container — column stack of optional toolbar, body, optional footer. */
export const timelineShellStyle = style({
  display: 'flex',
  flexDirection: 'column',
  width: '100%',
  background: vars.colors.background.secondary,
  border: `1px solid ${vars.colors.border.default}`,
  borderRadius: vars.borderRadius.sm,
  overflow: 'hidden',
  color: vars.colors.text.primary,
});

/** The interactive track area — hosts the canvas + free overlay layer. */
export const timelineBodyStyle = style({
  position: 'relative',
  flex: 1,
  minHeight: 0,
  outline: 'none',
  userSelect: 'none',
  touchAction: 'none',
  cursor: 'default',
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

export const timelineCanvasStyle = style({
  position: 'absolute',
  inset: 0,
  display: 'block',
  width: '100%',
  height: '100%',
  pointerEvents: 'none',
});

/** Layer above the canvas for slot/overlay children. */
export const timelineOverlayLayerStyle = style({
  position: 'absolute',
  inset: 0,
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
