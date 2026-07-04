import { style } from '@vanilla-extract/css';

import { vars } from '@/theme/contract.css';

/**
 * Per-instance overridable custom properties (stable public names). A consumer
 * can set any of these on the element (or an ancestor) to re-skin a single
 * EditableText without touching the theme; each falls back to a theme token.
 */
const HOVER_BG = `var(--etui-editable-text-hover-bg, ${vars.colors.surface.hover})`;
const EDIT_BG = `var(--etui-editable-text-edit-bg, ${vars.colors.background.tertiary})`;
const EDIT_RING = `var(--etui-editable-text-edit-ring, ${vars.colors.border.focus})`;

/**
 * A small inline padding paired with an equal negative margin: gives the
 * hover/edit highlight breathing room around the text without shifting the
 * text's own position, so the display -> edit swap stays visually seamless.
 */
const insetPadding = '3px';

export const displayStyle = style({
  display: 'inline-block',
  maxWidth: '100%',
  boxSizing: 'border-box',
  paddingInline: insetPadding,
  marginInline: `-${insetPadding}`,
  borderRadius: vars.borderRadius.sm,
  outline: 'none',
  cursor: 'text',
  transition: `background-color ${vars.transitions.fast}`,

  selectors: {
    '&:hover': {
      backgroundColor: HOVER_BG,
    },
    '&:focus-visible': {
      boxShadow: vars.shadows.focus,
    },
  },
});

export const displayReadOnlyStyle = style({
  cursor: 'default',
  selectors: {
    '&:hover': {
      backgroundColor: 'transparent',
    },
  },
});

export const displayDisabledStyle = style({
  cursor: 'not-allowed',
  selectors: {
    '&:hover': {
      backgroundColor: 'transparent',
    },
  },
});

/**
 * Auto-width edit container: a single-cell grid where a hidden sizer span and
 * the input share the same cell. The sizer holds the draft text (same
 * typography) so the grid — and therefore the input — grows to fit the content
 * with no JS measurement.
 */
export const editWrapStyle = style({
  display: 'inline-grid',
  maxWidth: '100%',
  boxSizing: 'border-box',
  paddingInline: insetPadding,
  marginInline: `-${insetPadding}`,
  borderRadius: vars.borderRadius.sm,
  backgroundColor: EDIT_BG,
  boxShadow: `inset 0 0 0 1px ${EDIT_RING}`,
});

const sharedCell = style({
  gridArea: '1 / 1',
  minWidth: '1ch',
  // Keep the sizer and input on the same box model so their widths match.
  padding: 0,
  margin: 0,
  border: 0,
  whiteSpace: 'pre',
  font: 'inherit',
});

export const sizerStyle = style([
  sharedCell,
  {
    visibility: 'hidden',
    pointerEvents: 'none',
    userSelect: 'none',
  },
]);

export const inputStyle = style([
  sharedCell,
  {
    width: '100%',
    background: 'transparent',
    outline: 'none',
    color: 'inherit',
    appearance: 'none',
    '::placeholder': {
      color: vars.colors.text.muted,
    },
  },
]);
