'use client';

import React from 'react';

import type { NodeGraphPortShape } from './NodeGraph.types';

export interface NodeGraphPortVisualProps {
  /**
   * Handle shape. @default 'circle'
   */
  shape?: NodeGraphPortShape;
  /**
   * Stroke / fill colour. Defaults to `currentColor` so the parent
   * `<NodeGraph.Port>` can route its colour prop and interaction-state
   * colours (source / candidate / invalid) into the shape via the CSS
   * `color` cascade. Pass an explicit colour when using the visual
   * standalone (outside a port slot).
   */
  color?: string;
  /**
   * Filled (`true`) paints the interior; hollow (`false`) draws an outline
   * only — the standard "wired vs unwired pin" convention.
   * @default false
   */
  filled?: boolean;
  /**
   * Box size in CSS pixels. @default 14
   */
  size?: number;
  className?: string;
  style?: React.CSSProperties;
}

// All shapes are authored in a 16×16 user space and scaled to `size`, so a
// single stroke width reads consistently across shapes.
const VIEW = 16;
const STROKE = 2;

function shapeElement(
  shape: NodeGraphPortShape,
  stroke: string,
  fill: string
): React.ReactElement {
  const common = {
    stroke,
    fill,
    strokeWidth: STROKE,
    strokeLinejoin: 'round' as const,
  };
  switch (shape) {
    case 'square':
      return <rect x={3} y={3} width={10} height={10} rx={1.5} {...common} />;
    case 'diamond':
      return <polygon points="8,2 14,8 8,14 2,8" {...common} />;
    case 'triangle':
      // Right-pointing exec/flow arrow (UE Blueprint convention).
      return <polygon points="3,2.5 13.5,8 3,13.5" {...common} />;
    case 'circle':
    default:
      return <circle cx={8} cy={8} r={5} {...common} />;
  }
}

/**
 * Presentational handle shape for a node-graph port. Rendered by
 * `<NodeGraph.Port>` when no `children` are supplied, and exported so
 * consumers can reuse the exact handle look inside fully custom port
 * visuals (e.g. a coloured ring beside a typed label).
 *
 * The shape paints with `currentColor` unless `color` is set, which lets
 * the port slot drive the colour from its `color` prop and override it on
 * the connection-drag states without this component knowing about them.
 */
export function NodeGraphPortVisual({
  shape = 'circle',
  color,
  filled = false,
  size = 14,
  className,
  style,
}: NodeGraphPortVisualProps): React.ReactElement {
  const stroke = color ?? 'currentColor';
  const fill = filled ? (color ?? 'currentColor') : 'none';
  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${VIEW} ${VIEW}`}
      className={className}
      style={{ display: 'block', overflow: 'visible', ...style }}
      aria-hidden="true"
      focusable="false"
    >
      {shapeElement(shape, stroke, fill)}
    </svg>
  );
}

NodeGraphPortVisual.displayName = 'NodeGraphPortVisual';
