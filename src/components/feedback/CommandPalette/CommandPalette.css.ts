import { keyframes, style } from '@vanilla-extract/css';
import { vars } from '@/theme/contract.css';

const overlayFadeIn = keyframes({
  from: { opacity: 0 },
  to: { opacity: 1 },
});

const panelIn = keyframes({
  from: { opacity: 0, transform: 'translate(-50%, -8px) scale(0.98)' },
  to: { opacity: 1, transform: 'translate(-50%, 0) scale(1)' },
});

export const overlayStyle = style({
  position: 'fixed',
  inset: 0,
  background: vars.colors.backdrop,
  backdropFilter: 'blur(2px)',
  zIndex: vars.zIndex.modal,
  animation: `${overlayFadeIn} 150ms ease-out forwards`,

  '@media': {
    '(prefers-reduced-motion: reduce)': {
      animation: 'none',
    },
  },
});

export const panelStyle = style({
  position: 'fixed',
  top: '15vh',
  left: '50%',
  transform: 'translateX(-50%)',
  zIndex: vars.zIndex.modal,
  display: 'flex',
  flexDirection: 'column',
  background: vars.colors.background.elevated,
  border: `1px solid ${vars.colors.border.default}`,
  borderRadius: vars.borderRadius.lg,
  boxShadow: vars.shadows.xl,
  fontFamily: vars.typography.fontFamily.sans,
  maxWidth: 'calc(100vw - 32px)',
  outline: 'none',
  overflow: 'hidden',
  animation: `${panelIn} 180ms ease-out forwards`,

  '@media': {
    '(prefers-reduced-motion: reduce)': {
      animation: 'none',
    },
  },
});

export const inputWrapperStyle = style({
  display: 'flex',
  alignItems: 'center',
  gap: vars.spacing.sm,
  padding: `${vars.spacing.md} ${vars.spacing.lg}`,
  borderBottom: `1px solid ${vars.colors.border.default}`,
});

export const searchIconStyle = style({
  display: 'inline-flex',
  width: '16px',
  height: '16px',
  color: vars.colors.text.secondary,
  flexShrink: 0,
});

export const inputStyle = style({
  flex: 1,
  minWidth: 0,
  padding: 0,
  border: 'none',
  outline: 'none',
  background: 'transparent',
  fontFamily: 'inherit',
  fontSize: vars.typography.fontSize.md,
  color: vars.colors.text.primary,

  '::placeholder': {
    color: vars.colors.text.muted,
  },
});

export const listStyle = style({
  margin: 0,
  padding: vars.spacing.xs,
  listStyle: 'none',
  overflowY: 'auto',
  outline: 'none',
});

export const groupHeaderStyle = style({
  padding: `${vars.spacing.sm} ${vars.spacing.md} ${vars.spacing.xs}`,
  fontSize: vars.typography.fontSize.xs,
  fontWeight: vars.typography.fontWeight.medium,
  letterSpacing: '0.04em',
  textTransform: 'uppercase',
  color: vars.colors.text.muted,
});

export const itemStyle = style({
  display: 'flex',
  alignItems: 'center',
  gap: vars.spacing.md,
  width: '100%',
  padding: `${vars.spacing.sm} ${vars.spacing.md}`,
  border: 'none',
  background: 'transparent',
  borderRadius: vars.borderRadius.md,
  textAlign: 'left',
  fontSize: vars.typography.fontSize.sm,
  fontFamily: 'inherit',
  color: vars.colors.text.primary,
  cursor: 'pointer',
  transition: `background ${vars.transitions.fast}`,

  selectors: {
    '&[data-disabled="true"]': {
      cursor: 'not-allowed',
      opacity: 0.5,
    },
  },
});

export const itemSelectedStyle = style({
  background: vars.colors.surface.hover,
});

export const itemIconStyle = style({
  display: 'inline-flex',
  alignItems: 'center',
  width: '16px',
  height: '16px',
  color: vars.colors.text.secondary,
  flexShrink: 0,
});

export const itemTextStyle = style({
  flex: 1,
  minWidth: 0,
  display: 'flex',
  flexDirection: 'column',
  gap: '2px',
});

export const itemLabelStyle = style({
  fontSize: vars.typography.fontSize.sm,
  fontWeight: vars.typography.fontWeight.medium,
  color: vars.colors.text.primary,
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
});

export const itemDescriptionStyle = style({
  fontSize: vars.typography.fontSize.xs,
  color: vars.colors.text.secondary,
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
});

export const itemShortcutStyle = style({
  flexShrink: 0,
  display: 'inline-flex',
  alignItems: 'center',
  gap: vars.spacing.xs,
});

export const emptyStyle = style({
  padding: vars.spacing.lg,
  textAlign: 'center',
  fontSize: vars.typography.fontSize.sm,
  color: vars.colors.text.secondary,
});
