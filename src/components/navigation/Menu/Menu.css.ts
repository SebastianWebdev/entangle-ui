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

export const groupLabelStyle = style({
  display: 'block',
  padding: `${vars.spacing.xs} ${vars.spacing.sm}`,
});

export const separatorStyle = style({
  margin: `${vars.spacing.xs} 0`,
  borderTop: `1px solid ${vars.colors.border.default}`,
  height: 0,
});
