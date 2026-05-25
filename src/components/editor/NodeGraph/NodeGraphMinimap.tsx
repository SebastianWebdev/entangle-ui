'use client';

import React, { useMemo, useSyncExternalStore } from 'react';
import { ViewportMinimap } from '@/components/editor/Minimap/ViewportMinimap';
import { Minimap } from '@/components/editor/Minimap';
import {
  useNodeGraphData,
  useNodeGraphSelection,
  useNodeGraphStore,
} from './NodeGraphContext';
import type { NodeGraphMinimapSlotProps } from './NodeGraph.types';
import { computeNodesBounds, getNodeBox } from './nodeGraphMath';
import type { MinimapItem, MinimapRectItem } from '@/components/editor/Minimap';
import { minimapSlotStyle } from './NodeGraph.css';
import { cx } from '@/utils/cx';

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
}: NodeGraphMinimapSlotProps): React.ReactElement {
  const data = useNodeGraphData();
  const selection = useNodeGraphSelection();
  const store = useNodeGraphStore();
  // Subscribe to measured-size updates so the minimap rect for each node
  // grows/shrinks as its DOM body changes height (auto-sized nodes). The
  // version snapshot doubles as a `useMemo` dep below, so the item /
  // bounds caches invalidate on every real size change.
  const measuredSizesVersion = useSyncExternalStore(
    store.subscribeMeasuredSizes,
    store.getMeasuredSizesVersion
  );

  const items = useMemo<MinimapItem[]>(() => {
    return data.nodes.map<MinimapRectItem>(node => {
      const box = getNodeBox(
        node,
        store.getMeasuredSize(node.id),
        data.defaultNodeSize
      );
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
  }, [
    data.nodes,
    data.defaultNodeSize,
    selection.nodes,
    selectedColor,
    store,
    measuredSizesVersion,
  ]);

  const worldBounds = useMemo(() => {
    const bounds = computeNodesBounds(
      data.nodes,
      store.getMeasuredSize,
      data.defaultNodeSize
    );
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
  }, [data.nodes, data.defaultNodeSize, store, measuredSizesVersion]);

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

export { NodeGraphMinimap, NodeGraphBackground } from './NodeGraphSlots';
