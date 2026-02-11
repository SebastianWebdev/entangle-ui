import { style, createVar } from '@vanilla-extract/css';
import { recipe } from '@vanilla-extract/recipes';
import { vars } from '@/theme/contract.css';

// --- Dynamic vars ---
export const editorWidthVar = createVar();
export const toolbarHeightVar = createVar();
export const canvasHeightVar = createVar();

// --- CurveEditor container ---
export const curveEditorRecipe = recipe({
  base: {
    display: 'flex',
    flexDirection: 'column',
    border: `1px solid ${vars.colors.border.default}`,
    borderRadius: vars.borderRadius.md,
    overflow: 'hidden',
    background: vars.colors.background.secondary,
  },
  variants: {
    disabled: {
      true: { opacity: 0.6 },
      false: {},
    },
    responsive: {
      true: { width: '100%' },
      false: { width: editorWidthVar },
    },
  },
  defaultVariants: {
    disabled: false,
    responsive: false,
  },
});

// --- Bottom bar ---
export const bottomBarStyle = style({
  borderTop: `1px solid ${vars.colors.border.default}`,
  background: vars.colors.surface.default,
  padding: `${vars.spacing.xs} ${vars.spacing.sm}`,
  flexShrink: 0,
});

// --- CurveCanvas container ---
export const canvasContainerRecipe = recipe({
  base: {
    position: 'relative',
    width: '100%',
    overflow: 'hidden',
  },
  variants: {
    responsive: {
      true: { height: '100%' },
      false: { height: canvasHeightVar },
    },
  },
  defaultVariants: {
    responsive: false,
  },
});

// --- Canvas element ---
export const canvasRecipe = recipe({
  base: {
    display: 'block',
    width: '100%',
    height: '100%',
    outline: 'none',
    border: 'none',
    selectors: {
      '&:focus-visible': {
        boxShadow: vars.shadows.focus,
      },
    },
  },
  variants: {
    disabled: {
      true: { opacity: 0.5 },
      false: {},
    },
  },
  defaultVariants: {
    disabled: false,
  },
});

// --- Aria live region (visually hidden) ---
export const ariaLiveRegionStyle = style({
  position: 'absolute',
  width: '1px',
  height: '1px',
  overflow: 'hidden',
  clip: 'rect(0, 0, 0, 0)',
  whiteSpace: 'nowrap',
});

// --- CurveToolbar ---
export const toolbarStyle = style({
  display: 'flex',
  alignItems: 'center',
  gap: vars.spacing.sm,
  padding: `0 ${vars.spacing.sm}`,
  height: toolbarHeightVar,
  background: vars.colors.surface.default,
  borderBottom: `1px solid ${vars.colors.border.default}`,
  flexShrink: 0,
});

export const toolbarSectionStyle = style({
  display: 'flex',
  alignItems: 'center',
  gap: vars.spacing.xs,
});

export const toolbarSeparatorStyle = style({
  width: '1px',
  height: '16px',
  background: vars.colors.border.default,
  margin: `0 ${vars.spacing.xs}`,
});
