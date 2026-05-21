'use client';

import React, { useMemo } from 'react';
import { ViewportMinimap } from '@/components/editor/Minimap/ViewportMinimap';
import { Minimap } from '@/components/editor/Minimap';
import { useNodeGraphData, useNodeGraphSelection } from './NodeGraphContext';
import type {
  NodeGraphMinimapSlotProps,
  NodeGraphSlotMarker,
  NodeGraphBackgroundSlotProps,
} from './NodeGraph.types';
import { NODE_GRAPH_SLOT } from './NodeGraph.types';
import { computeNodesBounds, getNodeBox } from './nodeGraphMath';
import type { MinimapItem, MinimapRectItem } from '@/components/editor/Minimap';
import { minimapSlotStyle } from './NodeGraph.css';
import { cx } from '@/utils/cx';

/**
 * Implementation behind `<NodeGraph.Minimap>`. Reads the live node list
 * from the NodeGraph store and feeds it into `<ViewportMinimap>` as rect
 * items — selection state is reflected by highlighting items with an
 * accent colour.
 *
 * The component itself returns `null` when picked out of children by the
 * parent (see `categorizeChildren` in `NodeGraph.tsx`); the real render
 * is delegated to `<NodeGraphMinimapInner>` inside the Viewport tree.
 */
const NodeGraphMinimapImpl: (props: NodeGraphMinimapSlotProps) => null = () =>
  null;

export const NodeGraphMinimap = Object.assign(NodeGraphMinimapImpl, {
  displayName: 'NodeGraph.Minimap',
  [NODE_GRAPH_SLOT]: 'minimap' as const,
}) as unknown as ((props: NodeGraphMinimapSlotProps) => null) &
  NodeGraphSlotMarker & { displayName: string };

interface NodeGraphMinimapInnerProps extends NodeGraphMinimapSlotProps {
  /** Accent colour used to highlight selected nodes inside the minimap. */
  selectedColor?: string;
}

/**
 * Live renderer for `<NodeGraph.Minimap>`. Mounted inside the `<Viewport>`
 * subtree by the main `NodeGraph` component when the user supplies a
 * minimap slot child.
 */
export function NodeGraphMinimapInner({
  placement = 'bottom-right',
  margin = 12,
  width = 200,
  title,
  className,
  selectedColor,
}: NodeGraphMinimapInnerProps): React.ReactElement {
  const data = useNodeGraphData();
  const selection = useNodeGraphSelection();

  const items = useMemo<MinimapItem[]>(() => {
    return data.nodes.map<MinimapRectItem>(node => {
      const box = getNodeBox(node, data.defaultNodeSize);
      const item: MinimapRectItem = {
        id: node.id,
        type: 'rect',
        x: box.x,
        y: box.y,
        width: box.width,
        height: box.height,
      };
      if (selectedColor && selection.nodes.includes(node.id)) {
        item.color = selectedColor;
      }
      return item;
    });
  }, [data.nodes, data.defaultNodeSize, selection.nodes, selectedColor]);

  const worldBounds = useMemo(() => {
    const bounds = computeNodesBounds(data.nodes, data.defaultNodeSize);
    if (bounds.width === 0 && bounds.height === 0) {
      // Provide a sensible default world rect so the minimap renders even
      // when the graph is empty.
      return { x: -200, y: -150, width: 400, height: 300 };
    }
    // Add 10% padding around content for nicer framing.
    const padX = bounds.width * 0.1;
    const padY = bounds.height * 0.1;
    return {
      x: bounds.x - padX,
      y: bounds.y - padY,
      width: bounds.width + padX * 2,
      height: bounds.height + padY * 2,
    };
  }, [data.nodes, data.defaultNodeSize]);

  return (
    <ViewportMinimap
      placement={placement}
      margin={margin}
      width={width}
      items={items}
      worldBounds={worldBounds}
      className={cx(minimapSlotStyle, className)}
    >
      {title ? <Minimap.Title>{title}</Minimap.Title> : null}
    </ViewportMinimap>
  );
}

/**
 * Implementation behind `<NodeGraph.Background>`. Like the minimap, the
 * marker component itself renders nothing — the parent picks it up and
 * mounts the canvas layer in the correct position in the layer stack.
 */
const NodeGraphBackgroundImpl: (
  props: NodeGraphBackgroundSlotProps
) => null = () => null;

export const NodeGraphBackground = Object.assign(NodeGraphBackgroundImpl, {
  displayName: 'NodeGraph.Background',
  [NODE_GRAPH_SLOT]: 'background' as const,
}) as unknown as ((props: NodeGraphBackgroundSlotProps) => null) &
  NodeGraphSlotMarker & { displayName: string };
