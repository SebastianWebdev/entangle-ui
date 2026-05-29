import React from 'react';

import { devWarn } from '@/utils/devWarn';

import { NODE_GRAPH_SLOT } from './NodeGraph.types';
import {
  NodeGraphBackground,
  NodeGraphMinimap,
  NodeGraphSpawnPalette,
  NodeGraphToolbar,
} from './NodeGraphSlots';

import type { NodeGraphSlotKind, NodeGraphSlotMarker } from './NodeGraph.types';

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

/**
 * Walk `<NodeGraph>` children, recognise the compound slot subcomponents
 * (`<NodeGraph.Background>`, `<NodeGraph.Minimap>`, `<NodeGraph.Toolbar>`,
 * `<NodeGraph.SpawnPalette>`), and collect their props. Anything else
 * triggers a dev-time warning — the main component never renders raw
 * children, only the recognised slots in the right places of its tree.
 */
export function sortSlots(children: React.ReactNode): SortedSlots {
  // `null as T | null` (rather than `: T | null = null`) keeps the flow type a
  // nullable union: these are only ever assigned inside the `forEach` callback
  // below, and TypeScript can't see closure mutations, so a plain `= null`
  // would narrow them to `null` and make the `!== null` checks below look dead.
  let backgroundProps = null as NodeGraphBackgroundProps | null;
  let minimapProps = null as NodeGraphMinimapProps | null;
  let spawnPaletteProps = null as NodeGraphSpawnPaletteProps | null;
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
      backgroundProps = child.props as NodeGraphBackgroundProps;
    } else if (kind === 'minimap') {
      minimapProps = child.props as NodeGraphMinimapProps;
    } else if (kind === 'toolbar') {
      toolbars.push(child.props as NodeGraphToolbarProps);
    } else if (kind === 'spawn-palette') {
      spawnPaletteProps = child.props as NodeGraphSpawnPaletteProps;
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
