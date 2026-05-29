'use client';

import React, { useMemo, useSyncExternalStore } from 'react';

import { Minimap } from '@/components/editor/Minimap';
import { ViewportMinimap } from '@/components/editor/Minimap/ViewportMinimap';
import { cx } from '@/utils/cx';

import { minimapSlotStyle } from './NodeGraph.css';
import {
  useNodeGraphData,
  useNodeGraphSelection,
  useNodeGraphStore,
} from './NodeGraphContext';
import { computeNodesBounds, getNodeBox } from './nodeGraphMath';

import type { NodeGraphMinimapSlotProps } from './NodeGraph.types';
import type {
  MinimapCustomItem,
  MinimapDrawInfo,
  MinimapItem,
  MinimapRectItem,
} from '@/components/editor/Minimap';
import type { WorldRect } from '@/components/primitives/viewport';

/**
 * Live renderer for `<NodeGraph.Minimap>`. Mounted inside the `<Viewport>`
 * subtree by the main `NodeGraph` component when the user supplies a
 * minimap slot child.
 */
/**
 * Draw a two-tone "header strip + body" mini-node into the minimap canvas,
 * converting the node's world rect to minimap pixels via the draw helpers.
 */
function drawMiniNode(
  ctx: CanvasRenderingContext2D,
  info: MinimapDrawInfo,
  rect: WorldRect,
  bodyColor: string | undefined,
  headerColor: string
): void {
  const tl = info.worldToMinimap({ x: rect.x, y: rect.y });
  const br = info.worldToMinimap({
    x: rect.x + rect.width,
    y: rect.y + rect.height,
  });
  const x = Math.min(tl.x, br.x);
  const y = Math.min(tl.y, br.y);
  const w = Math.abs(br.x - tl.x);
  const h = Math.abs(br.y - tl.y);
  ctx.fillStyle = bodyColor ?? 'rgba(180, 190, 210, 0.5)';
  ctx.fillRect(x, y, w, h);
  const headerH = Math.min(h, Math.max(2, h * 0.32));
  ctx.fillStyle = headerColor;
  ctx.fillRect(x, y, w, headerH);
}

export function NodeGraphMinimapInner({
  placement = 'bottom-right',
  margin = 12,
  width = 200,
  title,
  className,
  selectedColor,
  nodeStyle,
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
    return data.nodes.map<MinimapItem>(node => {
      const box = getNodeBox(
        node,
        store.getMeasuredSize(node.id),
        data.defaultNodeSize
      );
      const isSelected = selection.nodes.includes(node.id);
      const style = nodeStyle?.(node);
      // Selection tint wins over the per-node body colour so the highlight
      // stays visible.
      const bodyColor =
        isSelected && selectedColor ? selectedColor : style?.color;
      const headerColor = style?.headerColor;

      if (headerColor) {
        const rect: WorldRect = {
          x: box.x,
          y: box.y,
          width: box.width,
          height: box.height,
        };
        const item: MinimapCustomItem = {
          id: node.id,
          type: 'custom',
          bounds: rect,
          draw: (ctx, info) => {
            drawMiniNode(ctx, info, rect, bodyColor, headerColor);
          },
        };
        return item;
      }

      const item: MinimapRectItem = {
        id: node.id,
        type: 'rect',
        x: box.x,
        y: box.y,
        width: box.width,
        height: box.height,
      };
      if (bodyColor) item.color = bodyColor;
      return item;
    });
    // `measuredSizesVersion` is an intentional invalidation key: the body reads
    // `store.getMeasuredSize(...)` — mutable state React can't track — so the
    // memo must recompute whenever a node's measured size changes. The linter
    // flags it as unused because it isn't referenced directly.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    data.nodes,
    data.defaultNodeSize,
    selection.nodes,
    selectedColor,
    nodeStyle,
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
    // See note above: `measuredSizesVersion` keys the cache off mutable measured
    // sizes that `computeNodesBounds` reads via `store.getMeasuredSize`.
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
