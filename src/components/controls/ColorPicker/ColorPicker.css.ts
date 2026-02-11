import { style } from '@vanilla-extract/css';
import { recipe } from '@vanilla-extract/recipes';
import { vars } from '@/theme/contract.css';

// --- ColorPicker body ---
export const pickerBodyStyle = style({
  display: 'flex',
  flexDirection: 'column',
  gap: vars.spacing.lg,
});

// --- Trigger row ---
export const triggerRowStyle = style({
  display: 'flex',
  alignItems: 'center',
  gap: vars.spacing.sm,
});

// --- Label ---
export const labelStyle = style({
  fontSize: vars.typography.fontSize.xs,
  color: vars.colors.text.secondary,
});

// ================================================
// ColorArea
// ================================================

export const colorAreaStyle = style({
  position: 'relative',
  width: '100%',
  aspectRatio: '4 / 3',
  borderRadius: vars.borderRadius.sm,
  cursor: 'crosshair',
  userSelect: 'none',
  touchAction: 'none',
  overflow: 'hidden',
});

export const saturationGradientStyle = style({
  position: 'absolute',
  inset: 0,
  background: 'linear-gradient(to right, #ffffff, transparent)',
});

export const valueGradientStyle = style({
  position: 'absolute',
  inset: 0,
  background: 'linear-gradient(to top, #000000, transparent)',
});

export const colorAreaThumbStyle = style({
  position: 'absolute',
  width: '12px',
  height: '12px',
  borderRadius: '50%',
  border: '2px solid white',
  boxShadow: vars.shadows.thumb,
  transform: 'translate(-50%, -50%)',
  pointerEvents: 'none',
});

// ================================================
// HueSlider
// ================================================

export const hueTrackStyle = style({
  position: 'relative',
  width: '100%',
  height: '4px',
  borderRadius: vars.borderRadius.sm,
  background:
    'linear-gradient(to right, hsl(0,100%,50%), hsl(60,100%,50%), hsl(120,100%,50%), hsl(180,100%,50%), hsl(240,100%,50%), hsl(300,100%,50%), hsl(360,100%,50%))',
  cursor: 'pointer',
  userSelect: 'none',
  touchAction: 'none',
});

export const hueThumbStyle = style({
  position: 'absolute',
  top: '50%',
  width: '10px',
  height: '10px',
  borderRadius: '50%',
  border: '2px solid white',
  boxShadow: vars.shadows.sm,
  transform: 'translate(-50%, -50%)',
  pointerEvents: 'none',
});

// ================================================
// AlphaSlider
// ================================================

export const alphaTrackStyle = style({
  position: 'relative',
  width: '100%',
  height: '4px',
  borderRadius: vars.borderRadius.sm,
  cursor: 'pointer',
  userSelect: 'none',
  touchAction: 'none',
  backgroundImage:
    'linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(-45deg, #ccc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ccc 75%), linear-gradient(-45deg, transparent 75%, #ccc 75%)',
  backgroundSize: '8px 8px',
  backgroundPosition: '0 0, 0 4px, 4px -4px, -4px 0px',
});

export const alphaGradientStyle = style({
  position: 'absolute',
  inset: 0,
  borderRadius: 'inherit',
});

export const alphaThumbStyle = style({
  position: 'absolute',
  top: '50%',
  width: '10px',
  height: '10px',
  borderRadius: '50%',
  border: '2px solid white',
  boxShadow: vars.shadows.sm,
  transform: 'translate(-50%, -50%)',
  pointerEvents: 'none',
});

// ================================================
// ColorSwatch
// ================================================

export const swatchRecipe = recipe({
  base: {
    margin: 0,
    padding: 0,
    border: `1px solid ${vars.colors.border.default}`,
    fontFamily: 'inherit',
    outline: 'none',
    flexShrink: 0,
    backgroundImage:
      'linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(-45deg, #ccc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ccc 75%), linear-gradient(-45deg, transparent 75%, #ccc 75%)',
    backgroundSize: '8px 8px',
    backgroundPosition: '0 0, 0 4px, 4px -4px, -4px 0px',
    transition: `border-color ${vars.transitions.fast}`,
    selectors: {
      '&:hover:not(:disabled)': {
        borderColor: vars.colors.border.focus,
      },
      '&:focus-visible': {
        boxShadow: vars.shadows.focus,
      },
    },
  },
  variants: {
    size: {
      sm: { width: '20px', height: '20px' },
      md: { width: '24px', height: '24px' },
      lg: { width: '32px', height: '32px' },
    },
    shape: {
      square: { borderRadius: vars.borderRadius.sm },
      circle: { borderRadius: '50%' },
    },
    disabled: {
      true: { opacity: 0.5, cursor: 'not-allowed' },
      false: { cursor: 'pointer' },
    },
  },
  defaultVariants: {
    size: 'md',
    shape: 'square',
    disabled: false,
  },
});

export const swatchColorStyle = style({
  display: 'block',
  width: '100%',
  height: '100%',
  borderRadius: 'inherit',
});

// ================================================
// ColorPresets
// ================================================

export const presetsGridStyle = style({
  display: 'grid',
  gridTemplateColumns: 'repeat(8, 1fr)',
  gap: '3px',
  overflow: 'hidden',
  padding: '4px',
});

export const presetButtonRecipe = recipe({
  base: {
    margin: 0,
    padding: 0,
    fontFamily: 'inherit',
    outline: 'none',
    cursor: 'pointer',
    background: 'transparent',
    width: '100%',
    aspectRatio: '1',
    borderRadius: vars.borderRadius.sm,
    transition: `transform ${vars.transitions.fast}, border-color ${vars.transitions.fast}`,
    selectors: {
      '&:hover': {
        transform: 'scale(1.15)',
        zIndex: 1,
      },
      '&:focus-visible': {
        boxShadow: vars.shadows.focus,
      },
    },
  },
  variants: {
    selected: {
      true: {
        border: `2px solid ${vars.colors.text.primary}`,
      },
      false: {
        border: '1px solid transparent',
      },
    },
  },
  defaultVariants: {
    selected: false,
  },
});

export const presetColorStyle = style({
  display: 'block',
  width: '100%',
  height: '100%',
  borderRadius: 'inherit',
});

// ================================================
// ColorInputs
// ================================================

export const inputsRowStyle = style({
  display: 'flex',
  alignItems: 'flex-start',
  gap: vars.spacing.md,
});

export const modeToggleStyle = style({
  margin: 0,
  padding: '2px 6px',
  border: `1px solid ${vars.colors.border.default}`,
  background: 'transparent',
  fontFamily: 'inherit',
  outline: 'none',
  cursor: 'pointer',
  flexShrink: 0,
  borderRadius: vars.borderRadius.sm,
  fontSize: vars.typography.fontSize.xs,
  color: vars.colors.text.muted,
  transition: `background ${vars.transitions.fast}, color ${vars.transitions.fast}`,
  selectors: {
    '&:hover': {
      background: vars.colors.surface.hover,
      color: vars.colors.text.primary,
    },
    '&:focus-visible': {
      boxShadow: vars.shadows.focus,
    },
  },
});

export const smallInputStyle = style({
  margin: 0,
  border: `1px solid ${vars.colors.border.default}`,
  outline: 'none',
  fontFamily: 'inherit',
  background: vars.colors.surface.default,
  color: vars.colors.text.primary,
  fontSize: vars.typography.fontSize.xs,
  padding: '2px 4px',
  borderRadius: vars.borderRadius.sm,
  width: '100%',
  minWidth: 0,
  textAlign: 'center' as const,
  selectors: {
    '&:focus': {
      borderColor: vars.colors.border.focus,
    },
  },
});

export const inputLabelStyle = style({
  fontSize: vars.typography.fontSize.xxs,
  color: vars.colors.text.disabled,
  textAlign: 'center' as const,
  display: 'block',
  marginTop: '1px',
});

export const inputColStyle = style({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  flex: 1,
  minWidth: 0,
});

// ================================================
// ColorPalette
// ================================================

export const paletteContainerStyle = style({
  display: 'flex',
  flexDirection: 'column',
  gap: vars.spacing.xs,
  maxHeight: '200px',
  overflowY: 'auto',
  overflowX: 'hidden',
  padding: '4px',
  selectors: {
    '&::-webkit-scrollbar': {
      width: '4px',
    },
    '&::-webkit-scrollbar-track': {
      background: 'transparent',
    },
    '&::-webkit-scrollbar-thumb': {
      background: vars.colors.surface.hover,
      borderRadius: '2px',
    },
  },
});

export const paletteRowStyle = style({
  display: 'flex',
  alignItems: 'center',
  gap: '1px',
});

export const paletteRowLabelStyle = style({
  fontSize: vars.typography.fontSize.xs,
  color: vars.colors.text.muted,
  width: '18px',
  flexShrink: 0,
  textAlign: 'center' as const,
  overflow: 'hidden',
  userSelect: 'none',
});

export const paletteShadeRecipe = recipe({
  base: {
    margin: 0,
    padding: 0,
    fontFamily: 'inherit',
    outline: 'none',
    cursor: 'pointer',
    background: 'transparent',
    flex: 1,
    aspectRatio: '1',
    minWidth: 0,
    borderRadius: '1px',
    transition: `transform ${vars.transitions.fast}, border-color ${vars.transitions.fast}`,
    selectors: {
      '&:hover': {
        transform: 'scale(1.3)',
        zIndex: 1,
        position: 'relative',
      },
      '&:focus-visible': {
        boxShadow: vars.shadows.focus,
      },
    },
  },
  variants: {
    selected: {
      true: {
        border: `2px solid ${vars.colors.text.primary}`,
      },
      false: {
        border: '1px solid transparent',
      },
    },
  },
  defaultVariants: {
    selected: false,
  },
});

export const paletteShadeColorStyle = style({
  display: 'block',
  width: '100%',
  height: '100%',
  borderRadius: 'inherit',
});

// ================================================
// EyeDropper
// ================================================

export const eyeDropperRecipe = recipe({
  base: {
    margin: 0,
    padding: 0,
    border: `1px solid ${vars.colors.border.default}`,
    background: 'transparent',
    outline: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: vars.borderRadius.sm,
    color: vars.colors.text.muted,
    transition: `background ${vars.transitions.fast}, color ${vars.transitions.fast}, border-color ${vars.transitions.fast}`,
    selectors: {
      '&:hover': {
        background: vars.colors.surface.hover,
        color: vars.colors.text.primary,
      },
      '&:focus-visible': {
        boxShadow: vars.shadows.focus,
      },
    },
  },
  variants: {
    size: {
      sm: { width: '20px', height: '20px' },
      md: { width: '24px', height: '24px' },
      lg: { width: '28px', height: '28px' },
    },
    disabled: {
      true: {
        opacity: 0.5,
        cursor: 'not-allowed',
        pointerEvents: 'none' as const,
      },
      false: {},
    },
  },
  defaultVariants: {
    size: 'md',
    disabled: false,
  },
});
