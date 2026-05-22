'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { CommandPalette } from '@/components/feedback/CommandPalette/CommandPalette';
import type { CommandItem } from '@/components/feedback/CommandPalette/CommandPalette.types';
import type { Point2D } from '@/components/primitives/canvas/canvas.types';
import { useNodeGraphStore } from './NodeGraphContext';
import type {
  NodeGraphNode,
  NodeGraphSpawnContext,
  NodeGraphSpawnPaletteSlotProps,
} from './NodeGraph.types';

/**
 * Generate a unique-enough node id from a template. Avoids `crypto.randomUUID`
 * because it isn't available on every browser / context the library runs in.
 * Format: `${templateId}-{timestamp36}-{rand36}`.
 */
function generateNodeId(templateId: string): string {
  const t = Date.now().toString(36);
  const r = Math.random().toString(36).slice(2, 8);
  return `${templateId}-${t}-${r}`;
}

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

  // Snap the spawn world point to the graph's grid when one is set,
  // mirroring how dragged nodes snap — keeps new nodes aligned with the
  // existing layout without consumer math.
  const snappedSpawnPoint = useMemo<Point2D | null>(() => {
    if (!spawnAt) return null;
    const grid = store.getData().nodes.length > 0 ? null : null;
    void grid;
    return spawnAt.worldPoint;
  }, [spawnAt, store]);

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
      const worldPoint = snappedSpawnPoint ?? spawnAt.worldPoint;
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
    [templates, spawnAt, snappedSpawnPoint, onSpawn, handleClose]
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
