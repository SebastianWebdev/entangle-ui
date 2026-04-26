import { style } from '@vanilla-extract/css';
import { vars } from '@/theme/contract.css';

const hiddenBase = {
  position: 'absolute',
  width: '1px',
  height: '1px',
  padding: 0,
  margin: '-1px',
  overflow: 'hidden',
  clip: 'rect(0, 0, 0, 0)',
  whiteSpace: 'nowrap',
  border: 0,
} as const;

export const visuallyHiddenStyle = style(hiddenBase);

export const visuallyHiddenFocusableStyle = style({
  ...hiddenBase,
  selectors: {
    '&:focus, &:focus-within, &:active': {
      position: 'static',
      width: 'auto',
      height: 'auto',
      padding: vars.spacing.sm,
      margin: 0,
      overflow: 'visible',
      clip: 'auto',
      whiteSpace: 'normal',
      background: vars.colors.background.elevated,
      color: vars.colors.text.primary,
      border: `1px solid ${vars.colors.border.focus}`,
      borderRadius: vars.borderRadius.sm,
    },
  },
});
