import { style } from '@vanilla-extract/css';

import { vars } from '@/theme/contract.css';

// --- Overridable, component-scoped custom properties ------------------------
// Each falls back to a theme token, so the dial re-skins either per-instance
// (set the --etui-angle-input-* var in `style`) or globally (theme tokens).

const TRACK_BG = `var(--etui-angle-input-track-bg, ${vars.colors.surface.default})`;
const TRACK_BORDER = `var(--etui-angle-input-track-border, ${vars.colors.border.default})`;
const NEEDLE_COLOR = `var(--etui-angle-input-needle-color, ${vars.colors.accent.primary})`;
const HANDLE_COLOR = `var(--etui-angle-input-handle-color, ${vars.colors.accent.primary})`;
const HANDLE_RING = `var(--etui-angle-input-handle-ring, ${vars.colors.surface.default})`;
const CENTER_COLOR = `var(--etui-angle-input-center-color, ${vars.colors.text.muted})`;

// --- Root -------------------------------------------------------------------

export const rootStyle = style({
  display: 'inline-flex',
  flexDirection: 'column',
  gap: vars.spacing.xs,
});

export const rootDisabledStyle = style({
  opacity: 0.5,
  pointerEvents: 'none',
});

export const labelStyle = style({
  fontSize: vars.typography.fontSize.xs,
  color: vars.colors.text.secondary,
});

// Wrapper around dial + numeric input. `flexDirection` is set inline from
// `inputPlacement`.
export const controlStyle = style({
  display: 'flex',
  alignItems: 'center',
  gap: vars.spacing.sm,
});

// --- Dial -------------------------------------------------------------------

export const dialStyle = style({
  position: 'relative',
  flexShrink: 0,
  borderRadius: '50%',
  background: TRACK_BG,
  border: `1px solid ${TRACK_BORDER}`,
  cursor: 'grab',
  outline: 'none',
  touchAction: 'none',
  userSelect: 'none',
  selectors: {
    '&:focus-visible': {
      boxShadow: vars.shadows.focus,
      borderColor: vars.colors.accent.primary,
    },
    '&:active': {
      cursor: 'grabbing',
    },
  },
});

export const dialReadOnlyStyle = style({
  cursor: 'default',
  selectors: {
    '&:active': {
      cursor: 'default',
    },
  },
});

// Rotates the needle + handle around the dial center. `rotate(<angle>)` is set
// inline; transform-origin defaults to the element center.
export const rotorStyle = style({
  position: 'absolute',
  inset: 0,
  pointerEvents: 'none',
});

// Needle from the dial center up to the rim. `top: 0` reaches the rim,
// `bottom: 50%` anchors the lower end at the center.
export const needleStyle = style({
  position: 'absolute',
  left: '50%',
  top: 0,
  bottom: '50%',
  width: '2px',
  transform: 'translateX(-50%)',
  background: NEEDLE_COLOR,
  borderRadius: '1px',
});

// Handle dot centered on the rim so it straddles the dial border. `width` /
// `height` are set inline.
export const handleStyle = style({
  position: 'absolute',
  left: '50%',
  top: 0,
  transform: 'translate(-50%, -50%)',
  borderRadius: '50%',
  background: HANDLE_COLOR,
  border: `2px solid ${HANDLE_RING}`,
  boxShadow: vars.shadows.thumb,
});

export const centerStyle = style({
  position: 'absolute',
  left: '50%',
  top: '50%',
  width: '3px',
  height: '3px',
  transform: 'translate(-50%, -50%)',
  borderRadius: '50%',
  background: CENTER_COLOR,
});

// --- Numeric input ----------------------------------------------------------

// Fixed, narrow column so the input reads as a compact companion to the dial.
// `width` is set inline from `size`.
export const inputWrapperStyle = style({
  flexShrink: 0,
});

// Read-only value readout shown in place of the numeric input.
export const valueTextStyle = style({
  flexShrink: 0,
  fontSize: vars.typography.fontSize.xs,
  fontVariantNumeric: 'tabular-nums',
  color: vars.colors.text.secondary,
  userSelect: 'none',
});
