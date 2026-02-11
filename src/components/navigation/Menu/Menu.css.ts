import { style, globalStyle } from '@vanilla-extract/css';
import { vars } from '@/theme/contract.css';

export const menuContentStyle = style({
  minWidth: '200px',
  background: vars.colors.background.elevated,
  border: `1px solid ${vars.colors.border.default}`,
  borderRadius: vars.borderRadius.md,
  boxShadow: vars.shadows.md,
  padding: vars.spacing.sm,
  zIndex: vars.zIndex.dropdown,
  outline: 'none',
});

const interactiveItemBase = style({
  display: 'flex',
  alignItems: 'center',
  padding: vars.spacing.sm,
  borderRadius: vars.borderRadius.sm,
  cursor: 'pointer',
  userSelect: 'none',
  outline: 'none',
  color: vars.colors.text.primary,
});

globalStyle(`${interactiveItemBase}[data-highlighted]`, {
  background: vars.colors.surface.hover,
});

export const menuItemStyle = interactiveItemBase;

export const menuItemDisabledStyle = style({
  color: vars.colors.text.disabled,
  cursor: 'not-allowed',
  pointerEvents: 'none',
});

export const radioItemStyle = interactiveItemBase;

export const checkboxItemStyle = interactiveItemBase;

export const menuItemContentStyle = style({
  display: 'flex',
  alignItems: 'center',
  gap: vars.spacing.sm,
  flex: 1,
  minHeight: '20px',
});

export const iconContainerStyle = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '16px',
  height: '16px',
  flexShrink: 0,
});

export const iconVisibleStyle = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  visibility: 'visible',
});

export const iconHiddenStyle = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  visibility: 'hidden',
});

export const chevronIconStyle = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginLeft: vars.spacing.sm,
  transform: 'rotate(90deg)',
  color: vars.colors.text.muted,
});

export const separatorStyle = style({
  margin: `${vars.spacing.xs} 0`,
  borderTop: `1px solid ${vars.colors.border.default}`,
});
