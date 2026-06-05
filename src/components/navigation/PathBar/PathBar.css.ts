import { style } from '@vanilla-extract/css';

import { vars } from '@/theme/contract.css';

/**
 * Trigger for a segment's sibling dropdown. Kept visually quiet so it reads as
 * a secondary affordance next to the crumb label, brightening on hover/focus
 * and whenever its menu is open (`aria-expanded`).
 */
export const pathBarSiblingTriggerStyle = style({
  marginLeft: `calc(-1 * ${vars.spacing.xs})`,
  color: vars.colors.text.muted,
  opacity: 0.7,
  transition: `opacity ${vars.transitions.fast}, color ${vars.transitions.fast}`,

  selectors: {
    '&:hover, &:focus-visible, &[aria-expanded="true"]': {
      opacity: 1,
      color: vars.colors.text.primary,
    },
  },
});
