import { style, createVar } from '@vanilla-extract/css';
import { recipe } from '@vanilla-extract/recipes';
import { vars } from '@/theme/contract.css';

// ─── Viewport ─────────────────────────────────────────────────

export const viewportCanvasStyle = style({
  width: '100%',
  height: '100%',
  background: vars.colors.background.primary,
  position: 'relative',
  overflow: 'hidden',
});

export const viewportGridStyle = style({
  position: 'absolute',
  inset: 0,
  backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px)`,
  backgroundSize: '40px 40px',
  backgroundPosition: 'center center',
});

export const viewportAxisXStyle = style({
  position: 'absolute',
  top: '50%',
  left: 0,
  right: 0,
  height: 1,
  background: 'rgba(255, 80, 80, 0.25)',
});

export const viewportAxisZStyle = style({
  position: 'absolute',
  left: '50%',
  top: 0,
  bottom: 0,
  width: 1,
  background: 'rgba(80, 80, 255, 0.25)',
});

export const viewportOverlayStyle = style({
  position: 'absolute',
  bottom: 12,
  left: 12,
  display: 'flex',
  gap: 8,
  alignItems: 'center',
});

export const viewportBadgeStyle = style({
  padding: '3px 8px',
  background: 'rgba(20, 20, 20, 0.8)',
  border: '1px solid rgba(255, 255, 255, 0.06)',
  borderRadius: 4,
  fontSize: 10,
  color: vars.colors.text.muted,
  fontFamily: vars.typography.fontFamily.mono,
  userSelect: 'none',
});

export const viewportTopBarStyle = style({
  position: 'absolute',
  top: 8,
  left: 8,
  display: 'flex',
  gap: 4,
});

export const viewportModeBtnRecipe = recipe({
  base: {
    padding: '3px 10px',
    fontSize: 10,
    borderRadius: 3,
    cursor: 'pointer',
    fontFamily: 'inherit',
    ':hover': {
      borderColor: 'rgba(0, 122, 204, 0.5)',
      color: 'rgba(255, 255, 255, 0.8)',
    },
  },
  variants: {
    active: {
      true: {
        border: '1px solid rgba(0,122,204,0.6)',
        background: 'rgba(0,122,204,0.2)',
        color: '#6cb6ff',
      },
      false: {
        border: '1px solid rgba(255,255,255,0.08)',
        background: 'rgba(20,20,20,0.8)',
        color: 'rgba(255,255,255,0.5)',
      },
    },
  },
  defaultVariants: {
    active: false,
  },
});

// ─── Cube wireframe ───────────────────────────────────────────

export const cubeWireframeStyle = style({
  position: 'absolute',
  top: '50%',
  left: '50%',
  width: 120,
  height: 120,
  transform: 'translate(-50%, -50%) rotateX(-25deg) rotateY(35deg)',
  transformStyle: 'preserve-3d',
});

export const cubeFaceTransformVar = createVar();

export const cubeFaceRecipe = recipe({
  base: {
    position: 'absolute',
    width: 120,
    height: 120,
    transform: cubeFaceTransformVar,
  },
  variants: {
    highlight: {
      true: {
        border: '1.5px solid rgba(0, 122, 204, 0.8)',
        background: 'rgba(0, 122, 204, 0.06)',
        boxShadow: '0 0 20px rgba(0, 122, 204, 0.15)',
      },
      false: {
        border: '1.5px solid rgba(255, 255, 255, 0.15)',
        background: 'rgba(255, 255, 255, 0.01)',
        boxShadow: 'none',
      },
    },
  },
  defaultVariants: {
    highlight: false,
  },
});

export const selectionDotsStyle = style({
  position: 'absolute',
  top: '50%',
  left: '50%',
  width: 130,
  height: 130,
  transform: 'translate(-50%, -50%) rotateX(-25deg) rotateY(35deg)',
  transformStyle: 'preserve-3d',
});

export const selectionCornerXVar = createVar();
export const selectionCornerYVar = createVar();
export const selectionCornerZVar = createVar();

export const selectionCornerStyle = style({
  position: 'absolute',
  width: 6,
  height: 6,
  background: '#007acc',
  border: '1px solid #fff',
  borderRadius: 1,
  transform: `translate3d(${selectionCornerXVar}, ${selectionCornerYVar}, ${selectionCornerZVar})`,
});

// ─── Console ──────────────────────────────────────────────────

export const consoleEntryRecipe = recipe({
  base: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 6,
    padding: '3px 10px',
    fontSize: 11,
    fontFamily: vars.typography.fontFamily.mono,
    borderBottom: '1px solid rgba(255, 255, 255, 0.03)',
    ':hover': {
      background: 'rgba(255, 255, 255, 0.02)',
    },
  },
  variants: {
    type: {
      info: { color: vars.colors.text.muted },
      warn: { color: vars.colors.accent.warning },
      error: { color: vars.colors.accent.error },
      success: { color: vars.colors.accent.success },
    },
  },
  defaultVariants: {
    type: 'info',
  },
});

export const timeStampStyle = style({
  color: vars.colors.text.disabled,
  flexShrink: 0,
});
