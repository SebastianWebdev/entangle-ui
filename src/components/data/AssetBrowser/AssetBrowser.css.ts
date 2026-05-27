import { createVar, style } from '@vanilla-extract/css';
import { recipe } from '@vanilla-extract/recipes';
import { vars } from '@/theme/contract.css';

// Dynamic values driven from JS (thumbnail scale, grid geometry, marquee rect).
export const cellWidthVar = createVar();
export const cellHeightVar = createVar();
export const thumbSizeVar = createVar();
export const gridGapVar = createVar();
export const columnsVar = createVar();
export const totalHeightVar = createVar();
export const offsetYVar = createVar();
export const marqueeXVar = createVar();
export const marqueeYVar = createVar();
export const marqueeWVar = createVar();
export const marqueeHVar = createVar();

export const root = style({
  position: 'relative',
  display: 'flex',
  flexDirection: 'column',
  boxSizing: 'border-box',
  width: '100%',
  height: '100%',
  minHeight: 0,
  border: `1px solid ${vars.colors.border.default}`,
  borderRadius: vars.borderRadius.md,
  background: vars.colors.background.primary,
  color: vars.colors.text.primary,
  overflow: 'hidden',
  fontFamily: vars.typography.fontFamily.sans,
  fontSize: vars.typography.fontSize.sm,
  selectors: {
    '&:focus': { outline: 'none' },
  },
});

export const toolbar = style({
  display: 'flex',
  alignItems: 'center',
  gap: vars.spacing.md,
  padding: `${vars.spacing.sm} ${vars.spacing.md}`,
  borderBottom: `1px solid ${vars.colors.border.default}`,
  flex: '0 0 auto',
});

export const toolbarSpacer = style({ flex: '1 1 auto' });

export const searchField = style({ flex: '1 1 220px', maxWidth: '360px' });

export const breadcrumbsBar = style({
  display: 'flex',
  alignItems: 'center',
  padding: `${vars.spacing.xs} ${vars.spacing.md}`,
  borderBottom: `1px solid ${vars.colors.border.default}`,
  flex: '0 0 auto',
  minHeight: '28px',
});

export const body = style({
  display: 'flex',
  flex: '1 1 auto',
  minHeight: 0,
});

export const sidebar = style({
  flex: '0 0 auto',
  width: '220px',
  borderRight: `1px solid ${vars.colors.border.default}`,
  overflow: 'auto',
  background: vars.colors.background.secondary,
});

export const main = style({
  position: 'relative',
  flex: '1 1 auto',
  minWidth: 0,
  display: 'flex',
  flexDirection: 'column',
});

export const statusBar = style({
  display: 'flex',
  alignItems: 'center',
  gap: vars.spacing.md,
  padding: `${vars.spacing.xs} ${vars.spacing.md}`,
  borderTop: `1px solid ${vars.colors.border.default}`,
  color: vars.colors.text.muted,
  fontSize: vars.typography.fontSize.xs,
  flex: '0 0 auto',
});

export const statusSpacer = style({ flex: '1 1 auto' });

export const emptyWrap = style({
  display: 'flex',
  flex: '1 1 auto',
  alignItems: 'center',
  justifyContent: 'center',
  padding: vars.spacing.xxl,
});

// ── Grid view ────────────────────────────────────────────────────────────

export const gridScroller = style({
  position: 'relative',
  flex: '1 1 auto',
  minHeight: 0,
  overflow: 'auto',
  padding: vars.spacing.md,
});

export const gridSizer = style({
  position: 'relative',
  width: '100%',
  height: totalHeightVar,
});

export const gridWindow = style({
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  transform: `translateY(${offsetYVar})`,
  display: 'grid',
  gridTemplateColumns: `repeat(${columnsVar}, ${cellWidthVar})`,
  gap: gridGapVar,
  justifyContent: 'start',
});

export const gridFlow = style({
  display: 'grid',
  gridTemplateColumns: `repeat(auto-fill, ${cellWidthVar})`,
  gap: gridGapVar,
  justifyContent: 'start',
});

// ── Grid item ──────────────────────────────────────────────────────────────

export const cellRecipe = recipe({
  base: {
    boxSizing: 'border-box',
    width: cellWidthVar,
    height: cellHeightVar,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: vars.spacing.xs,
    padding: vars.spacing.xs,
    border: '1px solid transparent',
    borderRadius: vars.borderRadius.md,
    cursor: 'default',
    userSelect: 'none',
    transition: `background ${vars.transitions.fast}, border-color ${vars.transitions.fast}`,
    selectors: {
      '&:hover': { background: vars.colors.surface.hover },
      '&:focus-visible': {
        outline: 'none',
        borderColor: vars.colors.border.focus,
        boxShadow: vars.shadows.focus,
      },
    },
  },
  variants: {
    selected: {
      true: {
        background: vars.colors.surface.active,
        borderColor: vars.colors.border.focus,
      },
      false: {},
    },
    dropTarget: {
      true: {
        borderColor: vars.colors.accent.primary,
        background: vars.colors.surface.active,
      },
      false: {},
    },
    disabled: {
      true: { opacity: 0.45, pointerEvents: 'none' },
      false: {},
    },
  },
  defaultVariants: { selected: false, dropTarget: false, disabled: false },
});

export const thumb = style({
  position: 'relative',
  width: thumbSizeVar,
  height: thumbSizeVar,
  flex: '0 0 auto',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: vars.borderRadius.sm,
  background: vars.colors.background.inset,
  overflow: 'hidden',
  color: vars.colors.text.muted,
});

export const thumbImage = style({
  width: '100%',
  height: '100%',
  objectFit: 'cover',
  display: 'block',
});

export const cellLabel = style({
  width: '100%',
  textAlign: 'center',
  fontSize: vars.typography.fontSize.xs,
  color: vars.colors.text.primary,
  lineHeight: vars.typography.lineHeight.tight,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  display: '-webkit-box',
  WebkitLineClamp: 2,
  WebkitBoxOrient: 'vertical',
  wordBreak: 'break-word',
});

// ── Marquee + drop overlay ───────────────────────────────────────────────

export const marquee = style({
  position: 'absolute',
  left: marqueeXVar,
  top: marqueeYVar,
  width: marqueeWVar,
  height: marqueeHVar,
  border: `1px solid ${vars.colors.accent.primary}`,
  background: vars.colors.surface.whiteOverlay,
  borderRadius: vars.borderRadius.sm,
  pointerEvents: 'none',
  zIndex: 2,
});

export const importOverlay = style({
  position: 'absolute',
  inset: 0,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: vars.spacing.sm,
  border: `2px dashed ${vars.colors.accent.primary}`,
  borderRadius: vars.borderRadius.md,
  background: vars.colors.backdrop,
  color: vars.colors.text.primary,
  pointerEvents: 'none',
  zIndex: 5,
});

export const listScroller = style({
  flex: '1 1 auto',
  minHeight: 0,
  display: 'flex',
  flexDirection: 'column',
});

export const nameCell = style({
  display: 'inline-flex',
  alignItems: 'center',
  gap: vars.spacing.sm,
  minWidth: 0,
});

export const emptyText = style({
  color: vars.colors.text.muted,
  fontSize: vars.typography.fontSize.sm,
});

export const srOnly = style({
  position: 'absolute',
  width: '1px',
  height: '1px',
  padding: 0,
  margin: '-1px',
  overflow: 'hidden',
  clip: 'rect(0, 0, 0, 0)',
  whiteSpace: 'nowrap',
  border: 0,
});
