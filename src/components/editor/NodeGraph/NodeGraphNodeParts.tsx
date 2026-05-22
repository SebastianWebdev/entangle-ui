'use client';

import React from 'react';
import { cx } from '@/utils/cx';
import {
  nodeBodyRecipe,
  nodeHeaderStyle,
  nodeHeaderIconStyle,
  nodeHeaderTextStyle,
  nodeHeaderTitleStyle,
  nodeHeaderSubtitleStyle,
  pinListStyle,
  pinListColumnStyle,
  pinRowRecipe,
} from './NodeGraph.css';
import { useNodeGraphStore } from './NodeGraphContext';
import { useNodeGraphNodeContext } from './NodeGraphNodeContext';
import { useStoreSlice } from './useStoreSlice';
import type { NodeGraphPortSide } from './NodeGraph.types';

/**
 * Default node body wrapper — a themed panel with the standard
 * selected/hovered visual states the library provides out of the box.
 * Drop it inside your `renderNode` and you get a node that looks at
 * home next to the rest of the library; override `className` / `style`
 * to take over.
 *
 * Selection / hover / drag state is read from the store via the
 * per-node context so the body re-themes itself without the consumer
 * threading state in from `renderNode`'s `ctx`. Pass `selected` /
 * `hovered` explicitly to drive the visual from outside (e.g. running
 * a node-state machine in your own React tree).
 */
export interface NodeGraphNodeBodyProps {
  /** Override the accent colour (default border / shadow when selected). */
  accent?: string;
  /** Override the auto-derived `selected` state. */
  selected?: boolean;
  /** Override the auto-derived `hovered` state. */
  hovered?: boolean;
  /** Visual variant — affects default chrome density. */
  variant?: 'panel' | 'flat' | 'minimal';
  /** Extra classes applied to the body wrapper. */
  className?: string;
  /** Inline style override (lower priority than CSS classes). */
  style?: React.CSSProperties;
  /** Body content — typically `<NodeGraph.NodeHeader>` + `<NodeGraph.PinList>`. */
  children?: React.ReactNode;
}

export function NodeGraphNodeBody({
  accent,
  selected: selectedProp,
  hovered: hoveredProp,
  variant = 'panel',
  className,
  style,
  children,
}: NodeGraphNodeBodyProps): React.ReactElement {
  const { nodeId } = useNodeGraphNodeContext();
  const store = useNodeGraphStore();

  const autoSelected = useStoreSlice(
    store.subscribeSelection,
    store.getSelection,
    sel => sel.nodes.includes(nodeId)
  );
  const autoHovered = useStoreSlice(
    store.subscribeHover,
    store.getHover,
    hover => hover.hoveredNodeId === nodeId
  );

  const selected = selectedProp ?? autoSelected;
  const hovered = hoveredProp ?? autoHovered;

  // Accent drives both the selected border and a soft glow. CSS vars
  // let recipe variants pick up the consumer's value without us
  // pre-baking a token contract for every possible colour.
  const accentStyle = accent
    ? ({ ['--etui-ng-accent' as string]: accent } as React.CSSProperties)
    : undefined;

  return (
    <div
      className={cx(
        nodeBodyRecipe({ selected, hovered, variant }),
        className
      )}
      style={{ ...accentStyle, ...style }}
    >
      {children}
    </div>
  );
}

/**
 * Header bar for a node — gradient strip + optional icon, title and
 * subtitle. Pass `children` to take full control of the header layout.
 */
export interface NodeGraphNodeHeaderProps {
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  /** Small leading icon (typically 14-18 px). */
  icon?: React.ReactNode;
  /** Override the header background — defaults to theme accent gradient. */
  background?: string;
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}

export function NodeGraphNodeHeader({
  title,
  subtitle,
  icon,
  background,
  className,
  style,
  children,
}: NodeGraphNodeHeaderProps): React.ReactElement {
  const styleOverride: React.CSSProperties = {
    ...(background ? { background } : null),
    ...style,
  };
  return (
    <div className={cx(nodeHeaderStyle, className)} style={styleOverride}>
      {children ?? (
        <>
          {icon != null ? <span className={nodeHeaderIconStyle}>{icon}</span> : null}
          <div className={nodeHeaderTextStyle}>
            {title != null ? (
              <div className={nodeHeaderTitleStyle}>{title}</div>
            ) : null}
            {subtitle != null ? (
              <div className={nodeHeaderSubtitleStyle}>{subtitle}</div>
            ) : null}
          </div>
        </>
      )}
    </div>
  );
}

/**
 * Two-column pin container — children are routed into the left or right
 * column based on each `<NodeGraph.PinRow side>`. Anything that isn't a
 * `<NodeGraph.PinRow>` falls through into a center "loose" slot below
 * the columns (so you can drop inline editors / body content next to
 * your pin rows without breaking layout).
 */
export interface NodeGraphPinListProps {
  className?: string;
  style?: React.CSSProperties;
  /** Gap between left and right columns, in CSS px. Default 16. */
  columnGap?: number;
  children?: React.ReactNode;
}

export function NodeGraphPinList({
  className,
  style,
  columnGap = 16,
  children,
}: NodeGraphPinListProps): React.ReactElement {
  const left: React.ReactNode[] = [];
  const right: React.ReactNode[] = [];
  const loose: React.ReactNode[] = [];

  React.Children.forEach(children, child => {
    if (!React.isValidElement(child)) {
      loose.push(child);
      return;
    }
    const side =
      (child.props as { side?: NodeGraphPortSide } | undefined)?.side ?? null;
    if (side === 'left') left.push(child);
    else if (side === 'right') right.push(child);
    else loose.push(child);
  });

  return (
    <div
      className={cx(pinListStyle, className)}
      style={{ columnGap, ...style }}
    >
      <div className={pinListColumnStyle}>{left}</div>
      <div className={pinListColumnStyle}>{right}</div>
      {loose.length > 0 ? (
        <div style={{ gridColumn: '1 / -1' }}>{loose}</div>
      ) : null}
    </div>
  );
}

/**
 * Single pin row — typically holds a `<NodeGraph.Port>` plus a label.
 * Side determines which end of the row the port sits at: `left` puts
 * the port first (left edge), `right` puts it last (right edge).
 *
 * The row is layout-only — pin position math comes from the slot's DOM
 * measurement, not from where in the row it lives. You can rearrange
 * the order inside the row without breaking edges.
 */
export interface NodeGraphPinRowProps {
  /** Which side this pin anchors to. Drives the layout / justification. */
  side: NodeGraphPortSide;
  /** Optional row height (CSS px). Default 22. */
  height?: number;
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}

export function NodeGraphPinRow({
  side,
  height = 22,
  className,
  style,
  children,
}: NodeGraphPinRowProps): React.ReactElement {
  return (
    <div
      className={cx(pinRowRecipe({ side }), className)}
      style={{ height, ...style }}
      data-pin-side={side}
    >
      {children}
    </div>
  );
}
