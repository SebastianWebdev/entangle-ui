import React from 'react';
import { devWarn } from '@/utils/devWarn';
import {
  NodeGraphBackground,
  NodeGraphMinimap,
  NodeGraphSpawnPalette,
  NodeGraphToolbar,
} from './NodeGraphSlots';
import type { NodeGraphSlotKind, NodeGraphSlotMarker } from './NodeGraph.types';
import { NODE_GRAPH_SLOT } from './NodeGraph.types';

type NodeGraphBackgroundProps = React.ComponentProps<
  typeof NodeGraphBackground
>;
type NodeGraphMinimapProps = React.ComponentProps<typeof NodeGraphMinimap>;
type NodeGraphToolbarProps = React.ComponentProps<typeof NodeGraphToolbar>;
type NodeGraphSpawnPaletteProps = React.ComponentProps<
  typeof NodeGraphSpawnPalette
>;

export interface SortedSlots {
  hasBackground: boolean;
  backgroundProps: NodeGraphBackgroundProps | null;
  hasMinimap: boolean;
  minimapProps: NodeGraphMinimapProps | null;
  /** Multiple toolbars can co-exist (e.g. top-left + top-right). */
  toolbars: ReadonlyArray<NodeGraphToolbarProps>;
  spawnPaletteProps: NodeGraphSpawnPaletteProps | null;
}

function getSlotKind(el: React.ReactElement): NodeGraphSlotKind | null {
  if (typeof el.type !== 'function' && typeof el.type !== 'object') {
    return null;
  }
  const marker = (el.type as Partial<NodeGraphSlotMarker>)[NODE_GRAPH_SLOT];
  return marker ?? null;
}

function readSlotProps<P>(el: React.ReactElement): P {
  return el.props as P;
}

/**
 * Walk `<NodeGraph>` children, recognise the compound slot subcomponents
 * (`<NodeGraph.Background>`, `<NodeGraph.Minimap>`, `<NodeGraph.Toolbar>`,
 * `<NodeGraph.SpawnPalette>`), and collect their props. Anything else
 * triggers a dev-time warning — the main component never renders raw
 * children, only the recognised slots in the right places of its tree.
 */
export function sortSlots(children: React.ReactNode): SortedSlots {
  let backgroundProps: NodeGraphBackgroundProps | null = null;
  let minimapProps: NodeGraphMinimapProps | null = null;
  let spawnPaletteProps: NodeGraphSpawnPaletteProps | null = null;
  const toolbars: NodeGraphToolbarProps[] = [];
  React.Children.forEach(children, child => {
    if (!React.isValidElement(child)) {
      if (child != null && child !== false) {
        devWarn(
          '[NodeGraph] children must be slot subcomponents (<NodeGraph.Background />, <NodeGraph.Minimap />, <NodeGraph.Toolbar />, <NodeGraph.SpawnPalette />).'
        );
      }
      return;
    }
    const kind = getSlotKind(child);
    if (kind === 'background') {
      backgroundProps = readSlotProps<NodeGraphBackgroundProps>(child);
    } else if (kind === 'minimap') {
      minimapProps = readSlotProps<NodeGraphMinimapProps>(child);
    } else if (kind === 'toolbar') {
      toolbars.push(readSlotProps<NodeGraphToolbarProps>(child));
    } else if (kind === 'spawn-palette') {
      spawnPaletteProps = readSlotProps<NodeGraphSpawnPaletteProps>(child);
    } else {
      const dn = (child.type as { displayName?: string } | undefined)
        ?.displayName;
      if (dn?.startsWith('NodeGraph.')) {
        devWarn(
          `[NodeGraph] child "${dn}" looks like a slot subcomponent but lacks the ` +
            'NODE_GRAPH_SLOT marker. If you wrapped it in React.memo or HOCs, copy the ' +
            'marker symbol over to the wrapper.'
        );
      }
    }
  });
  return {
    hasBackground: backgroundProps !== null,
    backgroundProps,
    hasMinimap: minimapProps !== null,
    minimapProps,
    toolbars,
    spawnPaletteProps,
  };
}
