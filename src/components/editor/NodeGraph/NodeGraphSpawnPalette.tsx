'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { CommandPalette } from '@/components/feedback/CommandPalette/CommandPalette';
import type { CommandItem } from '@/components/feedback/CommandPalette/CommandPalette.types';
import type { Point2D } from '@/components/primitives/canvas/canvas.types';
import { useNodeGraphStore } from './NodeGraphContext';
import { generateNodeId } from './nodeGraphIds';
import type {
  NodeGraphNode,
  NodeGraphSpawnContext,
  NodeGraphSpawnPaletteSlotProps,
} from './NodeGraph.types';

/**
 * Live renderer for `<NodeGraph.SpawnPalette>`. Mounted by the parent
 * when the slot is present in `<NodeGraph>` children. Subscribes to the
 * store's spawn-request channel — the main `NodeGraph` component fires
 * the request when the user right-clicks empty space or a group, so
 * the consumer doesn't need to wire context-menu state through React.
 *
 * Selection on a template:
 *   1. Calls `template.build(worldPoint)` to get the node body
 *   2. Assigns a unique id
 *   3. Hands the full node to `onSpawn(node, ctx)` — typically appends
 *      to the consumer's `nodes` state
 *   4. Closes the palette
 */
export function NodeGraphSpawnPaletteInner({
  templates,
  onSpawn,
  placeholder = 'Search nodes…',
  recentKey,
  width = 400,
  maxHeight = 360,
}: NodeGraphSpawnPaletteSlotProps): React.ReactElement {
  const store = useNodeGraphStore();
  const [open, setOpen] = useState(false);
  const [spawnAt, setSpawnAt] = useState<{
    worldPoint: Point2D;
    screenPoint: Point2D;
  } | null>(null);

  // Listen for "user wants to spawn a node here" pings from the main
  // NodeGraph component (fired from its handleContextMenu for empty /
  // group targets). Multiple subscribers is fine — the store fans out.
  useEffect(() => {
    return store.subscribeSpawnRequest(info => {
      setSpawnAt(info);
      setOpen(true);
    });
  }, [store]);

  const items = useMemo<CommandItem[]>(() => {
    return templates.map(t => ({
      id: t.id,
      label: t.title,
      ...(t.subtitle !== undefined ? { description: t.subtitle } : {}),
      ...(t.group !== undefined ? { group: t.group } : {}),
      ...(t.keywords !== undefined ? { keywords: [...t.keywords] } : {}),
      ...(t.icon !== undefined ? { icon: t.icon } : {}),
    }));
  }, [templates]);

  const handleClose = useCallback(() => {
    setOpen(false);
    setSpawnAt(null);
  }, []);

  const handleSelect = useCallback(
    (item: CommandItem): void => {
      const template = templates.find(t => t.id === item.id);
      if (!template || !spawnAt) return;
      const worldPoint = spawnAt.worldPoint;
      const draft = template.build(worldPoint);
      const node: NodeGraphNode = {
        ...draft,
        id: generateNodeId(template.id),
      };
      const ctx: NodeGraphSpawnContext = {
        worldPoint,
        screenPoint: spawnAt.screenPoint,
      };
      onSpawn(node, ctx);
      handleClose();
    },
    [templates, spawnAt, onSpawn, handleClose]
  );

  return (
    <CommandPalette
      open={open}
      onClose={handleClose}
      items={items}
      onSelect={handleSelect}
      placeholder={placeholder}
      {...(recentKey !== undefined ? { recentKey } : {})}
      width={width}
      maxHeight={maxHeight}
    />
  );
}
