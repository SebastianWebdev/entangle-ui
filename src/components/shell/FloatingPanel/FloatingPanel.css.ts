import { style, createVar } from '@vanilla-extract/css';
import { vars } from '@/theme/contract.css';

// --- Dynamic vars for position and size ---
export const posXVar = createVar();
export const posYVar = createVar();
export const panelWidthVar = createVar();
export const panelHeightVar = createVar();
export const panelZIndexVar = createVar();

export const panel = style({
  position: 'fixed',
  display: 'flex',
  flexDirection: 'column',
  background: vars.colors.background.secondary,
  border: `1px solid ${vars.colors.border.default}`,
  borderRadius: vars.borderRadius.md,
  boxShadow: vars.shadows.lg,
  overflow: 'hidden',
  left: posXVar,
  top: posYVar,
  width: panelWidthVar,
  height: panelHeightVar,
  zIndex: panelZIndexVar,
  selectors: {
    '&:focus-visible': {
      outline: `1px solid ${vars.colors.border.focus}`,
    },
  },
});

export const header = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  height: '28px',
  padding: `0 ${vars.spacing.md}`,
  background: vars.colors.background.tertiary,
  cursor: 'grab',
  userSelect: 'none',
  flexShrink: 0,
  selectors: {
    '&:active': {
      cursor: 'grabbing',
    },
  },
});

export const title = style({
  fontSize: vars.typography.fontSize.md,
  fontFamily: vars.typography.fontFamily.sans,
  color: vars.colors.text.primary,
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
});

export const headerActions = style({
  display: 'flex',
  alignItems: 'center',
  gap: vars.spacing.xs,
  marginLeft: vars.spacing.md,
});

export const headerButton = style({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '18px',
  height: '18px',
  borderRadius: vars.borderRadius.sm,
  color: vars.colors.text.secondary,
  cursor: 'pointer',
  fontSize: vars.typography.fontSize.md,
  lineHeight: '1',
  selectors: {
    '&:hover': {
      background: vars.colors.surface.whiteOverlay,
      color: vars.colors.text.primary,
    },
  },
});

export const collapsibleVisible = style({
  display: 'flex',
  flex: 1,
  minHeight: 0,
});

export const collapsibleHidden = style({
  display: 'none',
});

export const resizeHandle = style({
  position: 'absolute',
  right: 0,
  bottom: 0,
  width: '12px',
  height: '12px',
  cursor: 'se-resize',
  '::after': {
    content: '""',
    position: 'absolute',
    right: '2px',
    bottom: '2px',
    width: '6px',
    height: '6px',
    borderRight: `2px solid ${vars.colors.text.muted}`,
    borderBottom: `2px solid ${vars.colors.text.muted}`,
  },
});
