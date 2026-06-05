import { style } from '@vanilla-extract/css';
import { recipe } from '@vanilla-extract/recipes';

import { vars } from '@/theme/contract.css';

// Shared alpha checkerboard used behind any partially-transparent gradient.
const checkerboard = {
  backgroundImage:
    'linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(-45deg, #ccc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ccc 75%), linear-gradient(-45deg, transparent 75%, #ccc 75%)',
  backgroundSize: '10px 10px',
  backgroundPosition: '0 0, 0 5px, 5px -5px, -5px 0px',
} as const;

// --- Root ---

export const rootStyle = style({
  display: 'flex',
  flexDirection: 'column',
  gap: vars.spacing.md,
});

export const rootDisabledStyle = style({
  opacity: 0.5,
  pointerEvents: 'none',
});

// --- Live preview swatch ---

export const previewStyle = style({
  position: 'relative',
  width: '100%',
  height: '48px',
  borderRadius: vars.borderRadius.sm,
  border: `1px solid ${vars.colors.border.default}`,
  overflow: 'hidden',
  ...checkerboard,
});

export const previewFillStyle = style({
  position: 'absolute',
  inset: 0,
});

// --- Stops track ---

export const trackRowStyle = style({
  position: 'relative',
  padding: '6px 0',
});

export const trackStyle = style({
  position: 'relative',
  width: '100%',
  height: '10px',
  borderRadius: vars.borderRadius.sm,
  border: `1px solid ${vars.colors.border.default}`,
  cursor: 'copy',
  userSelect: 'none',
  touchAction: 'none',
  ...checkerboard,
});

export const trackFillStyle = style({
  position: 'absolute',
  inset: 0,
  borderRadius: 'inherit',
  // Let clicks fall through to the track so "click empty ramp to add a stop"
  // works — otherwise this overlay is always the pointer target.
  pointerEvents: 'none',
});

// --- Stop handle ---

export const stopHandleRecipe = recipe({
  base: {
    position: 'absolute',
    top: '50%',
    width: '14px',
    height: '14px',
    padding: 0,
    margin: 0,
    transform: 'translate(-50%, -50%)',
    borderRadius: '50%',
    border: `2px solid ${vars.colors.surface.default}`,
    boxShadow: vars.shadows.thumb,
    cursor: 'grab',
    outline: 'none',
    touchAction: 'none',
    selectors: {
      '&:focus-visible': {
        boxShadow: vars.shadows.focus,
      },
      '&:active': {
        cursor: 'grabbing',
      },
    },
  },
  variants: {
    selected: {
      true: {
        borderColor: vars.colors.accent.primary,
        zIndex: 2,
      },
      false: {
        zIndex: 1,
      },
    },
  },
  defaultVariants: {
    selected: false,
  },
});

// Inner color chip of a stop handle (round, fills the bordered circle).
export const stopHandleColorStyle = style({
  display: 'block',
  width: '100%',
  height: '100%',
  borderRadius: '50%',
});

// --- Stops ramp + angle row ---

// The ramp and the angle dial share one row, angle on the right.
export const stopsRowStyle = style({
  display: 'flex',
  alignItems: 'center',
  gap: vars.spacing.lg,
});

// The ramp takes the remaining width; min-width:0 lets it shrink next to the
// angle dial.
export const stopsFillStyle = style({
  flex: 1,
  minWidth: 0,
});

// --- Selected-stop action row ---

export const stopActionsRowStyle = style({
  display: 'flex',
  alignItems: 'center',
  gap: vars.spacing.sm,
});

// --- CSS output row ---

export const cssOutputRowStyle = style({
  display: 'flex',
  alignItems: 'center',
  gap: vars.spacing.sm,
});

export const cssOutputCodeStyle = style({
  flex: 1,
  minWidth: 0,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  fontFamily: vars.typography.fontFamily.mono,
  fontSize: vars.typography.fontSize.xs,
  color: vars.colors.text.secondary,
  background: vars.colors.surface.default,
  border: `1px solid ${vars.colors.border.default}`,
  borderRadius: vars.borderRadius.sm,
  padding: '4px 6px',
});

// --- Inline color editor wrapper ---

export const inlineColorEditorStyle = style({
  borderTop: `1px solid ${vars.colors.border.default}`,
  paddingTop: vars.spacing.md,
});
