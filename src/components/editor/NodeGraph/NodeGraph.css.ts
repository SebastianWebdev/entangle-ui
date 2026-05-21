import { style, createVar, globalStyle } from '@vanilla-extract/css';
import { recipe } from '@vanilla-extract/recipes';
import { vars } from '@/theme/contract.css';

export const nodeWidthVar = createVar();
export const nodeHeightVar = createVar();

/**
 * Root wrapper around the underlying `<Viewport>` — purely structural. The
 * cursor / focus / disabled visuals live on the Viewport itself.
 */
export const nodeGraphRootStyle = style({
  position: 'relative',
  width: '100%',
  height: '100%',
});

/**
 * Wrapper for a single node's HTML body. Positioned absolutely inside
 * `ViewportWorld`. Ports are absolutely positioned children of this wrapper.
 */
export const nodeWrapperRecipe = recipe({
  base: {
    position: 'absolute',
    width: nodeWidthVar,
    height: nodeHeightVar,
    boxSizing: 'border-box',
    pointerEvents: 'auto',
    cursor: 'default',
    transition: `box-shadow ${vars.transitions.fast}`,
  },
  variants: {
    draggable: {
      true: { cursor: 'grab' },
      false: {},
    },
    dragging: {
      true: { cursor: 'grabbing', userSelect: 'none' },
      false: {},
    },
    selectable: {
      true: {},
      false: { cursor: 'default' },
    },
  },
  defaultVariants: {
    draggable: true,
    selectable: true,
    dragging: false,
  },
});

/**
 * Default node body when consumer doesn't pass `renderNode`. Acts as a
 * panel surface with a title row and content area.
 */
export const defaultNodeBodyRecipe = recipe({
  base: {
    width: '100%',
    height: '100%',
    background: vars.colors.background.secondary,
    border: `1px solid ${vars.colors.border.default}`,
    borderRadius: vars.borderRadius.md,
    boxShadow: vars.shadows.sm,
    padding: vars.spacing.sm,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'flex-start',
    color: vars.colors.text.primary,
    fontSize: vars.typography.fontSize.sm,
    fontFamily: vars.typography.fontFamily.sans,
    overflow: 'hidden',
    selectors: {
      '&[data-hovered="true"]': {
        borderColor: vars.colors.border.focus,
      },
    },
  },
  variants: {
    selected: {
      true: {
        borderColor: vars.colors.accent.primary,
        boxShadow: `0 0 0 1px ${vars.colors.accent.primary}, ${vars.shadows.md}`,
      },
      false: {},
    },
  },
  defaultVariants: {
    selected: false,
  },
});

/** Port handle — small circle on the node edge. */
export const portStyle = recipe({
  base: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: '50%',
    background: vars.colors.background.tertiary,
    border: `2px solid ${vars.colors.border.focus}`,
    boxSizing: 'border-box',
    pointerEvents: 'auto',
    cursor: 'crosshair',
    transition: `transform ${vars.transitions.fast}, background ${vars.transitions.fast}, border-color ${vars.transitions.fast}`,
    selectors: {
      '&:hover': {
        transform:
          'translate(var(--etui-nodegraph-port-tx, -50%), var(--etui-nodegraph-port-ty, -50%)) scale(1.25)',
        background: vars.colors.accent.primary,
        borderColor: vars.colors.accent.primary,
      },
    },
  },
  variants: {
    side: {
      left: {
        vars: {
          '--etui-nodegraph-port-tx': '-50%',
          '--etui-nodegraph-port-ty': '-50%',
        },
        transform: 'translate(-50%, -50%)',
        left: 0,
      },
      right: {
        vars: {
          '--etui-nodegraph-port-tx': '50%',
          '--etui-nodegraph-port-ty': '-50%',
        },
        transform: 'translate(50%, -50%)',
        right: 0,
      },
      top: {
        vars: {
          '--etui-nodegraph-port-tx': '-50%',
          '--etui-nodegraph-port-ty': '-50%',
        },
        transform: 'translate(-50%, -50%)',
        top: 0,
      },
      bottom: {
        vars: {
          '--etui-nodegraph-port-tx': '-50%',
          '--etui-nodegraph-port-ty': '50%',
        },
        transform: 'translate(-50%, 50%)',
        bottom: 0,
      },
    },
    connecting: {
      true: {
        background: vars.colors.accent.primary,
        borderColor: vars.colors.accent.primary,
      },
      false: {},
    },
    candidate: {
      true: {
        transform:
          'translate(var(--etui-nodegraph-port-tx, -50%), var(--etui-nodegraph-port-ty, -50%)) scale(1.4)',
        background: vars.colors.accent.primary,
      },
      false: {},
    },
    invalid: {
      true: {
        background: vars.colors.accent.error,
        borderColor: vars.colors.accent.error,
      },
      false: {},
    },
  },
  defaultVariants: {
    connecting: false,
    candidate: false,
    invalid: false,
  },
});

/** Edge label wrapper — positioned at the midpoint of an edge. */
export const edgeLabelStyle = style({
  position: 'absolute',
  transform: 'translate(-50%, -50%)',
  padding: `0 ${vars.spacing.xs}`,
  background: vars.colors.background.primary,
  border: `1px solid ${vars.colors.border.default}`,
  borderRadius: vars.borderRadius.sm,
  fontSize: vars.typography.fontSize.xs,
  color: vars.colors.text.secondary,
  pointerEvents: 'auto',
  whiteSpace: 'nowrap',
});

/**
 * Marquee selection rectangle styled in world space. Drawn on top of the
 * canvas layers via a `ViewportOverlay` div positioned in screen coords.
 */
export const marqueeStyle = style({
  position: 'absolute',
  border: `1px solid ${vars.colors.accent.primary}`,
  background: vars.colors.accent.primary,
  opacity: 0.16,
  borderRadius: vars.borderRadius.sm,
  pointerEvents: 'none',
});

/**
 * Slot wrapper used by `<NodeGraph.Minimap>` — pinned absolutely inside the
 * underlying `<Viewport>` overlay layer.
 */
export const minimapSlotStyle = style({
  position: 'absolute',
  pointerEvents: 'auto',
});

// Ensure the underlying ViewportWorld passes through pointer events so nodes
// receive them. The ViewportWorld wrapper has pointer-events: none by default
// to let the background marquee pass through.
globalStyle(`${nodeGraphRootStyle} [data-viewport-world]`, {
  pointerEvents: 'none',
});
