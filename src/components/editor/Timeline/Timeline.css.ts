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

/** Row holding the header column + the track-area body. */
export const timelineMainRowStyle = style({
  display: 'flex',
  flexDirection: 'row',
  flex: 1,
  minHeight: 0,
});

/** Left header column — fixed width, one row per visible track. */
export const timelineHeaderColumnStyle = style({
  flexShrink: 0,
  display: 'flex',
  flexDirection: 'column',
  borderRight: `1px solid ${vars.colors.border.default}`,
  background: vars.colors.background.primary,
  overflow: 'hidden',
  userSelect: 'none',
});

/** Spacer aligning the header column with the ruler band. */
export const timelineHeaderSpacerStyle = style({
  flexShrink: 0,
  borderBottom: `1px solid ${vars.colors.border.default}`,
});

export const timelineHeaderRowStyle = style({
  boxSizing: 'border-box',
  flexShrink: 0,
  display: 'flex',
  alignItems: 'center',
  gap: vars.spacing.xs,
  padding: `0 ${vars.spacing.sm}`,
  borderBottom: `1px solid ${vars.colors.border.default}`,
  fontSize: vars.typography.fontSize.xs,
  color: vars.colors.text.secondary,
  overflow: 'hidden',
  selectors: {
    '&[data-selected]': {
      color: vars.colors.text.primary,
      background: vars.colors.surface.hover,
    },
    '&[data-locked]': {
      opacity: 0.5,
    },
  },
});

export const timelineHeaderSwatchStyle = style({
  flexShrink: 0,
  width: 8,
  height: 8,
  borderRadius: 2,
  background: vars.colors.accent.secondary,
});

export const timelineHeaderLabelStyle = style({
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
});

/** Toolbar strip above the main row. */
export const timelineToolbarStyle = style({
  flexShrink: 0,
  display: 'flex',
  alignItems: 'center',
  gap: vars.spacing.sm,
  padding: `${vars.spacing.xs} ${vars.spacing.sm}`,
  borderBottom: `1px solid ${vars.colors.border.default}`,
});

/** Footer / status strip below the main row. */
export const timelineFooterStyle = style({
  flexShrink: 0,
  display: 'flex',
  alignItems: 'center',
  gap: vars.spacing.sm,
  padding: `${vars.spacing.xs} ${vars.spacing.sm}`,
  borderTop: `1px solid ${vars.colors.border.default}`,
  fontSize: vars.typography.fontSize.xs,
  color: vars.colors.text.muted,
});
