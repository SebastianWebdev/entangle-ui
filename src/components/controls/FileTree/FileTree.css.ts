import { style } from '@vanilla-extract/css';
import { recipe } from '@vanilla-extract/recipes';

import { vars } from '@/theme/contract.css';

// Wrapper around the underlying TreeView. Positioned so the root-drop ring can
// be drawn as an inset highlight when files are dragged over empty space.
export const containerStyle = style({
  position: 'relative',
  display: 'flex',
  flexDirection: 'column',
  minHeight: 0,
  borderRadius: vars.borderRadius.sm,
  selectors: {
    '&[data-root-active="true"]': {
      boxShadow: `inset 0 0 0 2px ${vars.colors.accent.primary}`,
      background: `color-mix(in srgb, ${vars.colors.accent.primary} 8%, transparent)`,
    },
  },
});

// Mirrors TreeView's own icon slot (TreeNode.css `iconRecipe`) so the default
// FileTree rendering lines up with the rest of the library's trees.
export const iconStyle = recipe({
  base: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    marginRight: vars.spacing.xs,
  },
  variants: {
    size: {
      sm: { width: '12px', height: '12px' },
      md: { width: '14px', height: '14px' },
      lg: { width: '16px', height: '16px' },
    },
  },
  defaultVariants: {
    size: 'md',
  },
});

// Mirrors TreeView's own label (TreeNode.css `labelRecipe`).
export const labelStyle = recipe({
  base: {
    flex: 1,
    minWidth: 0,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    color: vars.colors.text.primary,
    lineHeight: vars.typography.lineHeight.normal,
  },
  variants: {
    size: {
      sm: { fontSize: vars.typography.fontSize.md },
      md: { fontSize: vars.typography.fontSize.md },
      lg: { fontSize: vars.typography.fontSize.lg },
    },
  },
  defaultVariants: {
    size: 'md',
  },
});
