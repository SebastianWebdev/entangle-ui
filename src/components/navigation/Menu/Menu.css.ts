import { style, globalStyle } from '@vanilla-extract/css';

import { vars } from '@/theme/contract.css';

/**
 * Popup surface shared by Menu, submenus and ContextMenu.
 */
export const menuContentStyle = style({
  minWidth: '200px',
  maxWidth: '360px',
  background: vars.colors.background.elevated,
  border: `1px solid ${vars.colors.border.default}`,
  borderRadius: vars.borderRadius.md,
  boxShadow: vars.shadows.md,
  padding: vars.spacing.sm,
  zIndex: vars.zIndex.dropdown,
  outline: 'none',
  opacity: 1,
  transform: 'scale(1)',
  // `--transform-origin` is set by Base UI's positioner and inherited here, so
  // the scale animation grows from the edge nearest the anchor.
  transformOrigin: 'var(--transform-origin)',
  transition: `opacity ${vars.transitions.fast}, transform ${vars.transitions.fast}`,
  selectors: {
    // Base UI flags the enter (`data-starting-style`) and exit
    // (`data-ending-style`) phases; the popup stays mounted across both.
    '&[data-starting-style], &[data-ending-style]': {
      opacity: 0,
      transform: 'scale(0.96)',
    },
  },
});

/**
 * Base row used by Item, RadioItem, CheckboxItem and SubTrigger.
 * Three-slot layout: start (icon/indicator) · label · end (shortcut/action).
 */
export const menuItemStyle = style({
  display: 'flex',
  alignItems: 'center',
  gap: vars.spacing.sm,
  width: '100%',
  // Keep the padding inside the 100% width so the highlight never spills past
  // the popup's right edge (the library ships no global border-box reset).
  boxSizing: 'border-box',
  minHeight: '24px',
  padding: `${vars.spacing.xs} ${vars.spacing.sm}`,
  borderRadius: vars.borderRadius.sm,
  cursor: 'pointer',
  userSelect: 'none',
  outline: 'none',
  color: vars.colors.text.primary,
  fontSize: vars.typography.fontSize.md,
  fontFamily: vars.typography.fontFamily.sans,
});

globalStyle(`${menuItemStyle}[data-highlighted]`, {
  background: vars.colors.surface.hover,
});

globalStyle(`${menuItemStyle}[data-disabled]`, {
  color: vars.colors.text.disabled,
  cursor: 'not-allowed',
  pointerEvents: 'none',
});

/** Left slot: holds an icon, or a radio/checkbox indicator. */
export const itemStartSlotStyle = style({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '16px',
  height: '16px',
  flexShrink: 0,
  color: vars.colors.text.secondary,
});

/** Center slot: the item label. Truncates instead of wrapping. */
export const itemLabelStyle = style({
  flex: 1,
  minWidth: 0,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
});

/** Right slot: keyboard shortcut, action node, or submenu chevron. */
export const itemEndSlotStyle = style({
  display: 'inline-flex',
  alignItems: 'center',
  gap: vars.spacing.xs,
  marginLeft: 'auto',
  paddingLeft: vars.spacing.md,
  flexShrink: 0,
  color: vars.colors.text.muted,
});

export const shortcutStyle = style({
  fontSize: vars.typography.fontSize.xs,
  color: vars.colors.text.muted,
  letterSpacing: '0.03em',
  whiteSpace: 'nowrap',
});

// Caption typography applied directly, mirroring `<Text variant="caption"
// color="muted" weight="semibold">`, so the label needs no extra element.
export const groupLabelStyle = style({
  display: 'block',
  padding: `${vars.spacing.xs} ${vars.spacing.sm}`,
  fontSize: vars.typography.fontSize.xs,
  fontWeight: vars.typography.fontWeight.semibold,
  lineHeight: vars.typography.lineHeight.tight,
  fontFamily: vars.typography.fontFamily.sans,
  color: vars.colors.text.muted,
});

export const separatorStyle = style({
  margin: `${vars.spacing.xs} 0`,
  borderTop: `1px solid ${vars.colors.border.default}`,
  height: 0,
});
