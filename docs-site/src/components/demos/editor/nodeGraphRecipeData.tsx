// Shared data + node body for the NodeGraph recipe demos. Keeping the
// type palette and the compound-based node body in one place means each
// recipe file stays focused on the one feature it documents instead of
// re-deriving a node body. (The "anatomy" and "basics" recipes build their
// bodies inline on purpose — they exist to show that authoring step.)

import {
  NodeGraph,
  type NodeGraphNode,
  type NodeGraphPortShape,
} from '@/components/editor/NodeGraph';

// ─── Type palette ───────────────────────────────────────────────────────────
//
// An opaque `dataType` token per pin drives both the handle colour and the
// connection validator. The values are arbitrary strings as far as the library
// is concerned — this map is purely a consumer convention.

export type DataType =
  | 'exec'
  | 'float'
  | 'int'
  | 'bool'
  | 'vector'
  | 'string'
  | 'object'
  | 'any';

export const TYPE_COLOR: Record<DataType, string> = {
  exec: '#f8f8f8',
  float: '#9ee65a',
  int: '#1ec3a8',
  bool: '#c0182d',
  vector: '#f5c518',
  string: '#ff3ad5',
  object: '#3aa4ff',
  any: '#c8c8c8',
};

/** Exec/flow pins are the UE-style arrow; data pins are rings. */
export function pinShape(dataType: DataType): NodeGraphPortShape {
  return dataType === 'exec' ? 'triangle' : 'circle';
}

// ─── Node data shape ──────────────────────────────────────────────────────

export interface RecipePin {
  id: string;
  label: string;
  side: 'left' | 'right';
  dataType: DataType;
}

export interface RecipeNodeData {
  title: string;
  subtitle?: string;
  /** Border / glow accent when selected. */
  accent?: string;
  pins: RecipePin[];
}

/**
 * A node body built entirely from library compounds — `NodeBody` reads
 * selection / hover from the store internally, `PinList` routes each `Pin`
 * into its side column, and the handle fills itself once wired. The recipe
 * demos that aren't specifically about node authoring reuse this.
 */
export function RecipeNodeBody({
  node,
}: {
  node: NodeGraphNode;
}): React.ReactElement {
  const data = node.data as RecipeNodeData;
  return (
    <NodeGraph.NodeBody accent={data.accent} style={{ width: 200 }}>
      <NodeGraph.NodeHeader title={data.title} subtitle={data.subtitle} />
      <NodeGraph.PinList columnGap={16}>
        {data.pins.map(pin => (
          <NodeGraph.Pin
            key={pin.id}
            id={pin.id}
            side={pin.side}
            dataType={pin.dataType}
            shape={pinShape(pin.dataType)}
            color={TYPE_COLOR[pin.dataType]}
            label={pin.label}
          />
        ))}
      </NodeGraph.PinList>
    </NodeGraph.NodeBody>
  );
}

// ─── Small reusable footer ───────────────────────────────────────────────

export function StatusFooter({
  children,
}: {
  children: React.ReactNode;
}): React.ReactElement {
  return (
    <div
      style={{
        display: 'flex',
        gap: 14,
        flexWrap: 'wrap',
        alignItems: 'center',
        fontSize: 11,
        color: 'var(--etui-color-text-secondary, #9aa0aa)',
        lineHeight: 1.5,
      }}
    >
      {children}
    </div>
  );
}
