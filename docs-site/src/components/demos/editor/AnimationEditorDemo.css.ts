import { style, createVar } from '@vanilla-extract/css';
import { vars } from '@/theme/contract.css';

// ─── Shell + dock ─────────────────────────────────────────────

export const shellBgStyle = style({
  width: '100%',
  height: '100%',
  background: vars.colors.background.primary,
});

export const dockGridStyle = style({
  width: '100%',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  minHeight: 0,
});

// ─── 3D viewport (the cube stage) ────────────────────────────

export const viewportStyle = style({
  width: '100%',
  height: '100%',
  position: 'relative',
  overflow: 'hidden',
  background: `radial-gradient(120% 100% at 50% 0%, #14222b 0%, #0a0f14 60%, #050709 100%)`,
});

export const viewportGridStyle = style({
  position: 'absolute',
  inset: 0,
  backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.04) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.04) 1px, transparent 1px)`,
  backgroundSize: '40px 40px',
  backgroundPosition: 'center center',
});

export const viewportFloorStyle = style({
  position: 'absolute',
  left: '50%',
  top: '60%',
  width: 320,
  height: 320,
  marginLeft: -160,
  marginTop: -160,
  border: '1px solid rgba(255, 255, 255, 0.08)',
  transform: 'rotateX(70deg)',
  transformStyle: 'preserve-3d',
  pointerEvents: 'none',
});

export const viewportStageStyle = style({
  position: 'absolute',
  inset: 0,
  perspective: '900px',
  perspectiveOrigin: '50% 40%',
  pointerEvents: 'none',
});

export const cubeTxVar = createVar();
export const cubeTyVar = createVar();
export const cubeTzVar = createVar();
export const cubeRxVar = createVar();
export const cubeRyVar = createVar();
export const cubeRzVar = createVar();
export const cubeScaleVar = createVar();

export const cubeRootStyle = style({
  position: 'absolute',
  top: '50%',
  left: '50%',
  width: 0,
  height: 0,
  transform: `translate3d(${cubeTxVar}, ${cubeTyVar}, ${cubeTzVar})`,
  transformStyle: 'preserve-3d',
});

export const cubeOrientStyle = style({
  position: 'absolute',
  width: 0,
  height: 0,
  transform: `rotateX(${cubeRxVar}) rotateY(${cubeRyVar}) rotateZ(${cubeRzVar}) scale(${cubeScaleVar})`,
  transformStyle: 'preserve-3d',
});

export const cubeFaceTransformVar = createVar();
export const cubeFaceTintVar = createVar();

export const cubeFaceStyle = style({
  position: 'absolute',
  width: 100,
  height: 100,
  left: -50,
  top: -50,
  border: '1.5px solid rgba(255, 255, 255, 0.5)',
  background: cubeFaceTintVar,
  boxShadow: 'inset 0 0 30px rgba(0, 122, 204, 0.2)',
  transform: cubeFaceTransformVar,
});

export const viewportOverlayStyle = style({
  position: 'absolute',
  bottom: 12,
  left: 12,
  display: 'flex',
  flexDirection: 'column',
  gap: 4,
  fontFamily: vars.typography.fontFamily.mono,
  fontSize: 10,
  color: vars.colors.text.muted,
  pointerEvents: 'none',
});

export const viewportBadgeStyle = style({
  padding: '3px 8px',
  background: 'rgba(10, 14, 20, 0.7)',
  border: '1px solid rgba(255, 255, 255, 0.08)',
  borderRadius: 4,
  alignSelf: 'flex-start',
});

// ─── Side panels ─────────────────────────────────────────────

export const sidePanelStyle = style({
  width: '100%',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  minHeight: 0,
  background: vars.colors.background.primary,
});

export const sidePanelHeaderStyle = style({
  flexShrink: 0,
  padding: `${vars.spacing.xs} ${vars.spacing.sm}`,
  fontSize: vars.typography.fontSize.xs,
  fontWeight: vars.typography.fontWeight.medium,
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  color: vars.colors.text.muted,
  borderBottom: `1px solid ${vars.colors.border.default}`,
});

export const sidePanelBodyStyle = style({
  flex: 1,
  minHeight: 0,
  overflow: 'auto',
  padding: vars.spacing.xs,
});

// ─── Inspector readouts ──────────────────────────────────────

export const inspectorRowStyle = style({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  gap: vars.spacing.sm,
  padding: `${vars.spacing.xs} ${vars.spacing.sm}`,
  fontSize: vars.typography.fontSize.xs,
});

export const inspectorLabelStyle = style({
  color: vars.colors.text.muted,
});

export const inspectorValueStyle = style({
  fontFamily: vars.typography.fontFamily.mono,
  color: vars.colors.text.primary,
  fontVariantNumeric: 'tabular-nums',
});

export const inspectorAxisRowStyle = style({
  display: 'grid',
  gridTemplateColumns: '16px 1fr 1fr 1fr',
  gap: 4,
  alignItems: 'center',
  padding: `2px ${vars.spacing.sm}`,
  fontSize: vars.typography.fontSize.xs,
});

export const inspectorAxisLabelStyle = style({
  color: vars.colors.text.muted,
  fontWeight: vars.typography.fontWeight.medium,
});

export const inspectorAxisValueStyle = style({
  fontFamily: vars.typography.fontFamily.mono,
  color: vars.colors.text.secondary,
  fontVariantNumeric: 'tabular-nums',
  textAlign: 'right',
  padding: '2px 4px',
  background: vars.colors.background.inset,
  borderRadius: 2,
});

// ─── Bottom timeline panel ──────────────────────────────────

export const timelineWrapStyle = style({
  width: '100%',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  background: vars.colors.background.secondary,
  borderTop: `1px solid ${vars.colors.border.default}`,
});

// ─── Status bar bits ────────────────────────────────────────

export const statusItemStyle = style({
  display: 'flex',
  alignItems: 'center',
  gap: 4,
  fontVariantNumeric: 'tabular-nums',
});
