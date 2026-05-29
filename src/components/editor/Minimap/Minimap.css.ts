import { style } from '@vanilla-extract/css';

import { vars } from '@/theme/contract.css';

/** Outer container: stacks optional outside-title + body + outside-footer. */
export const minimapShellStyle = style({
  display: 'inline-flex',
  flexDirection: 'column',
  alignItems: 'stretch',
});

/** The actual canvas body — fixed dimensions, hosts the canvas + inside chrome + free overlay. */
export const minimapBodyStyle = style({
  position: 'relative',
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
  pointerEvents: 'none',
});

/** Layer above the canvas where slot children (title-inside, corners, etc.) live. */
export const minimapOverlayLayerStyle = style({
  position: 'absolute',
  inset: 0,
  pointerEvents: 'none',
});

export const titleOutsideStyle = style({
  fontSize: vars.typography.fontSize.sm,
  color: vars.colors.text.primary,
  fontWeight: vars.typography.fontWeight.medium,
  lineHeight: vars.typography.lineHeight.tight,
  paddingBottom: vars.spacing.xs,
});

export const titleInsideStyle = style({
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  padding: `${vars.spacing.xs} ${vars.spacing.sm}`,
  fontSize: vars.typography.fontSize.xs,
  color: vars.colors.text.primary,
  fontWeight: vars.typography.fontWeight.medium,
  lineHeight: vars.typography.lineHeight.tight,
  background:
    'linear-gradient(to bottom, rgba(0, 0, 0, 0.55), rgba(0, 0, 0, 0))',
  pointerEvents: 'auto',
});

export const footerOutsideStyle = style({
  fontSize: vars.typography.fontSize.xs,
  color: vars.colors.text.muted,
  lineHeight: vars.typography.lineHeight.tight,
  paddingTop: vars.spacing.xs,
});

export const footerInsideStyle = style({
  position: 'absolute',
  bottom: 0,
  left: 0,
  right: 0,
  padding: `${vars.spacing.xs} ${vars.spacing.sm}`,
  fontSize: vars.typography.fontSize.xxs,
  color: vars.colors.text.muted,
  lineHeight: vars.typography.lineHeight.tight,
  background: 'linear-gradient(to top, rgba(0, 0, 0, 0.55), rgba(0, 0, 0, 0))',
  pointerEvents: 'auto',
});

const cornerBase = {
  position: 'absolute' as const,
  padding: `${vars.spacing.xs} ${vars.spacing.sm}`,
  fontSize: vars.typography.fontSize.xxs,
  color: vars.colors.text.secondary,
  background: 'rgba(0, 0, 0, 0.45)',
  borderRadius: vars.borderRadius.sm,
  pointerEvents: 'auto' as const,
  lineHeight: vars.typography.lineHeight.tight,
};

export const cornerTopLeftStyle = style({
  ...cornerBase,
  top: 4,
  left: 4,
});
export const cornerTopRightStyle = style({
  ...cornerBase,
  top: 4,
  right: 4,
});
export const cornerBottomLeftStyle = style({
  ...cornerBase,
  bottom: 4,
  left: 4,
});
export const cornerBottomRightStyle = style({
  ...cornerBase,
  bottom: 4,
  right: 4,
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
