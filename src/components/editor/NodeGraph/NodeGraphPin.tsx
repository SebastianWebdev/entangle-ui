'use client';

import React from 'react';
import { cx } from '@/utils/cx';
import { pinLabelStyle } from './NodeGraph.css';
import { NodeGraphPinRow } from './NodeGraphNodeParts';
import { NodeGraphPort } from './NodeGraphPort';
import type { NodeGraphPortShape, NodeGraphPortSide } from './NodeGraph.types';

export interface NodeGraphPinProps {
  /** Port id — referenced by `NodeGraphEdge.source` / `.target`. */
  id: string;
  /** Which side the pin anchors to. Drives row layout and edge tangent. */
  side: NodeGraphPortSide;
  /** Opaque type token forwarded to `isValidConnection` and edge styling. */
  dataType?: string;
  /** Row label shown next to the handle. */
  label?: React.ReactNode;
  /** Handle colour (any CSS colour). Defaults to the theme focus colour. */
  color?: string;
  /** Built-in handle shape. @default 'circle' */
  shape?: NodeGraphPortShape;
  /**
   * Force the handle filled / hollow. When omitted, the handle fills
   * automatically while the pin is connected to an edge.
   */
  filled?: boolean;
  /** Row height in CSS px. @default 22 */
  height?: number;
  /** Accessible label for the port handle. Falls back to the port default. */
  portLabel?: string;
  /** Class applied to the row wrapper. */
  className?: string;
  /** Inline style applied to the row wrapper. */
  style?: React.CSSProperties;
  /** Class applied to the label span. */
  labelClassName?: string;
  /** Inline style applied to the label span. */
  labelStyle?: React.CSSProperties;
}

/**
 * `<NodeGraph.Pin>` — the one-liner for the common "handle + label" row.
 * Renders a `<NodeGraph.PinRow>` containing a `<NodeGraph.Port>` and a
 * label, ordered so the handle always sits flush against the node edge
 * (port → label on the left/top, label → port on the right). Reach for
 * `<NodeGraph.PinRow>` + `<NodeGraph.Port>` directly only when you need a
 * layout this doesn't cover (multiple controls in a row, inline editors).
 *
 * @example
 * ```tsx
 * <NodeGraph.PinList>
 *   <NodeGraph.Pin id="exec" side="left" shape="triangle" color="#fff" />
 *   <NodeGraph.Pin id="value" side="right" dataType="float" color="#9ee65a" label="Value" />
 * </NodeGraph.PinList>
 * ```
 */
export function NodeGraphPin({
  id,
  side,
  dataType,
  label,
  color,
  shape,
  filled,
  height,
  portLabel,
  className,
  style,
  labelClassName,
  labelStyle,
}: NodeGraphPinProps): React.ReactElement {
  const port = (
    <NodeGraphPort
      id={id}
      side={side}
      {...(dataType !== undefined ? { dataType } : {})}
      {...(color !== undefined ? { color } : {})}
      {...(shape !== undefined ? { shape } : {})}
      {...(filled !== undefined ? { filled } : {})}
      {...(portLabel !== undefined ? { label: portLabel } : {})}
    />
  );
  const labelEl =
    label != null && label !== '' ? (
      <span className={cx(pinLabelStyle, labelClassName)} style={labelStyle}>
        {label}
      </span>
    ) : null;
  // Port leads the row on the left / top so the handle hugs the node edge;
  // on the right the label leads and the handle trails.
  const portFirst = side === 'left' || side === 'top';
  return (
    <NodeGraphPinRow
      side={side}
      {...(height !== undefined ? { height } : {})}
      {...(className !== undefined ? { className } : {})}
      {...(style !== undefined ? { style } : {})}
    >
      {portFirst ? (
        <>
          {port}
          {labelEl}
        </>
      ) : (
        <>
          {labelEl}
          {port}
        </>
      )}
    </NodeGraphPinRow>
  );
}

NodeGraphPin.displayName = 'NodeGraphPin';
