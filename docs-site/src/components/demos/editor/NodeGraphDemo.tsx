import { useCallback, useMemo, useRef, useState } from 'react';
import DemoWrapper from '../DemoWrapper';
import {
  NodeGraph,
  type NodeGraphConnectionValidationInfo,
  type NodeGraphEdge,
  type NodeGraphGroup,
  type NodeGraphHandle,
  type NodeGraphNode,
  type NodeGraphPortRef,
  type NodeGraphRenderCtx,
  type NodeGraphSelection,
} from '@/components/editor/NodeGraph';
import { Button } from '@/components/primitives/Button';

/** Blueprint-style pin colour palette (Unreal Engine 5 reference). */
const TYPE_COLOR: Record<string, string> = {
  exec: '#f5f5f5',
  float: '#9ee65a',
  int: '#1ec3a8',
  bool: '#c0182d',
  vector: '#f5c518',
  rotator: '#9c7df0',
  transform: '#ff7e25',
  object: '#3aa4ff',
  string: '#ff3ad5',
  any: '#c8c8c8',
};

interface BlueprintPort {
  id: string;
  label: string;
  side: 'left' | 'right';
  dataType: keyof typeof TYPE_COLOR;
}

interface BlueprintNode {
  /** Cosmetic title bar text. */
  title: string;
  /** Sub-title beneath the title (e.g. function category). */
  subtitle?: string;
  /** Header colour theme. */
  category:
    | 'event'
    | 'flow'
    | 'pure'
    | 'macro'
    | 'cast'
    | 'variable'
    | 'output';
  /** Ports listed top-to-bottom; left ports are inputs, right are outputs. */
  pins: BlueprintPort[];
}

const CATEGORY_COLORS: Record<
  BlueprintNode['category'],
  { gradient: string; accent: string; icon: string }
> = {
  event: {
    gradient: 'linear-gradient(90deg, #b3251c 0%, #7c1812 100%)',
    accent: '#ff5e54',
    icon: '⚡',
  },
  flow: {
    gradient: 'linear-gradient(90deg, #1d3c8c 0%, #142a64 100%)',
    accent: '#5d8dff',
    icon: '►',
  },
  pure: {
    gradient: 'linear-gradient(90deg, #1f7a3a 0%, #155729 100%)',
    accent: '#5fd97e',
    icon: 'f',
  },
  macro: {
    gradient: 'linear-gradient(90deg, #4a3582 0%, #2f2153 100%)',
    accent: '#a07cf0',
    icon: '✨',
  },
  cast: {
    gradient: 'linear-gradient(90deg, #2b6cb0 0%, #1a4670 100%)',
    accent: '#7eb6ff',
    icon: '↪',
  },
  variable: {
    gradient: 'linear-gradient(90deg, #6b3a13 0%, #432309 100%)',
    accent: '#e8a36b',
    icon: '◆',
  },
  output: {
    gradient: 'linear-gradient(90deg, #b16121 0%, #743f15 100%)',
    accent: '#ffaa5e',
    icon: '→',
  },
};

// ─── Initial graph ─────────────────────────────────────────────────────────

const INITIAL_NODES: NodeGraphNode[] = [
  // — Input —
  {
    id: 'event',
    position: { x: -560, y: -160 },
    width: 220,
    height: 110,
    data: {
      title: 'Event BeginPlay',
      subtitle: 'Lifecycle',
      category: 'event',
      pins: [{ id: 'exec', side: 'right', label: '', dataType: 'exec' }],
    } satisfies BlueprintNode,
    ports: [{ id: 'exec', side: 'right', dataType: 'exec' }],
  },
  // — Pipeline —
  {
    id: 'gettarget',
    position: { x: -260, y: -200 },
    width: 220,
    height: 160,
    data: {
      title: 'Get Target Actor',
      subtitle: 'Pawn · Pure',
      category: 'pure',
      pins: [
        { id: 'self', side: 'left', label: 'Self', dataType: 'object' },
        { id: 'actor', side: 'right', label: 'Actor', dataType: 'object' },
        { id: 'tag', side: 'right', label: 'Tag', dataType: 'string' },
      ],
    } satisfies BlueprintNode,
    ports: [
      { id: 'self', side: 'left', dataType: 'object' },
      { id: 'actor', side: 'right', dataType: 'object' },
      { id: 'tag', side: 'right', dataType: 'string' },
    ],
  },
  {
    id: 'cast',
    position: { x: 40, y: -160 },
    width: 240,
    height: 160,
    data: {
      title: 'Cast to BP_Enemy',
      subtitle: 'Conversion',
      category: 'cast',
      pins: [
        { id: 'exec', side: 'left', label: '', dataType: 'exec' },
        { id: 'object', side: 'left', label: 'Object', dataType: 'object' },
        { id: 'success', side: 'right', label: '', dataType: 'exec' },
        { id: 'casted', side: 'right', label: 'As Enemy', dataType: 'object' },
      ],
    } satisfies BlueprintNode,
    ports: [
      { id: 'exec', side: 'left', offset: 0.18, dataType: 'exec' },
      { id: 'object', side: 'left', offset: 0.6, dataType: 'object' },
      { id: 'success', side: 'right', offset: 0.18, dataType: 'exec' },
      { id: 'casted', side: 'right', offset: 0.6, dataType: 'object' },
    ],
  },
  {
    id: 'gethealth',
    position: { x: 340, y: -80 },
    width: 220,
    height: 120,
    data: {
      title: 'Get Health',
      subtitle: 'Component · Pure',
      category: 'pure',
      pins: [
        { id: 'target', side: 'left', label: 'Target', dataType: 'object' },
        { id: 'health', side: 'right', label: 'Health', dataType: 'float' },
      ],
    } satisfies BlueprintNode,
    ports: [
      { id: 'target', side: 'left', dataType: 'object' },
      { id: 'health', side: 'right', dataType: 'float' },
    ],
  },
  {
    id: 'compare',
    position: { x: 620, y: -60 },
    width: 200,
    height: 110,
    data: {
      title: 'Less Equal (float)',
      subtitle: 'Math · Pure',
      category: 'pure',
      pins: [
        { id: 'a', side: 'left', label: 'A', dataType: 'float' },
        { id: 'b', side: 'left', label: 'B', dataType: 'float' },
        { id: 'result', side: 'right', label: 'Result', dataType: 'bool' },
      ],
    } satisfies BlueprintNode,
    ports: [
      { id: 'a', side: 'left', offset: 0.35, dataType: 'float' },
      { id: 'b', side: 'left', offset: 0.7, dataType: 'float' },
      { id: 'result', side: 'right', dataType: 'bool' },
    ],
  },
  {
    id: 'threshold',
    position: { x: 340, y: 100 },
    width: 200,
    height: 90,
    data: {
      title: 'Low HP Threshold',
      subtitle: 'Variable · float',
      category: 'variable',
      pins: [{ id: 'out', side: 'right', label: '0.25', dataType: 'float' }],
    } satisfies BlueprintNode,
    ports: [{ id: 'out', side: 'right', dataType: 'float' }],
  },
  {
    id: 'branch',
    position: { x: 880, y: -120 },
    width: 220,
    height: 150,
    data: {
      title: 'Branch',
      subtitle: 'Flow Control',
      category: 'flow',
      pins: [
        { id: 'exec', side: 'left', label: '', dataType: 'exec' },
        { id: 'condition', side: 'left', label: 'Condition', dataType: 'bool' },
        { id: 'true', side: 'right', label: 'True', dataType: 'exec' },
        { id: 'false', side: 'right', label: 'False', dataType: 'exec' },
      ],
    } satisfies BlueprintNode,
    ports: [
      { id: 'exec', side: 'left', offset: 0.2, dataType: 'exec' },
      { id: 'condition', side: 'left', offset: 0.7, dataType: 'bool' },
      { id: 'true', side: 'right', offset: 0.3, dataType: 'exec' },
      { id: 'false', side: 'right', offset: 0.75, dataType: 'exec' },
    ],
  },
  // — Outputs —
  {
    id: 'alert',
    position: { x: 1200, y: -200 },
    width: 240,
    height: 130,
    data: {
      title: 'Trigger Alert',
      subtitle: 'Custom Macro',
      category: 'macro',
      pins: [
        { id: 'exec', side: 'left', label: '', dataType: 'exec' },
        { id: 'actor', side: 'left', label: 'Source', dataType: 'object' },
        { id: 'done', side: 'right', label: '', dataType: 'exec' },
      ],
    } satisfies BlueprintNode,
    ports: [
      { id: 'exec', side: 'left', offset: 0.25, dataType: 'exec' },
      { id: 'actor', side: 'left', offset: 0.7, dataType: 'object' },
      { id: 'done', side: 'right', dataType: 'exec' },
    ],
  },
  {
    id: 'idle',
    position: { x: 1200, y: 60 },
    width: 220,
    height: 110,
    data: {
      title: 'Resume Idle',
      subtitle: 'Output',
      category: 'output',
      pins: [{ id: 'exec', side: 'left', label: '', dataType: 'exec' }],
    } satisfies BlueprintNode,
    ports: [{ id: 'exec', side: 'left', dataType: 'exec' }],
  },
];

const INITIAL_EDGES: NodeGraphEdge[] = [
  // Exec backbone
  {
    id: 'e-event-cast',
    source: { node: 'event', port: 'exec' },
    target: { node: 'cast', port: 'exec' },
  },
  {
    id: 'e-cast-branch',
    source: { node: 'cast', port: 'success' },
    target: { node: 'branch', port: 'exec' },
  },
  {
    id: 'e-branch-alert',
    source: { node: 'branch', port: 'true' },
    target: { node: 'alert', port: 'exec' },
  },
  {
    id: 'e-branch-idle',
    source: { node: 'branch', port: 'false' },
    target: { node: 'idle', port: 'exec' },
  },
  // Data
  {
    id: 'e-gettarget-cast',
    source: { node: 'gettarget', port: 'actor' },
    target: { node: 'cast', port: 'object' },
  },
  {
    id: 'e-cast-gethealth',
    source: { node: 'cast', port: 'casted' },
    target: { node: 'gethealth', port: 'target' },
  },
  {
    id: 'e-gethealth-compare',
    source: { node: 'gethealth', port: 'health' },
    target: { node: 'compare', port: 'a' },
  },
  {
    id: 'e-threshold-compare',
    source: { node: 'threshold', port: 'out' },
    target: { node: 'compare', port: 'b' },
  },
  {
    id: 'e-compare-branch',
    source: { node: 'compare', port: 'result' },
    target: { node: 'branch', port: 'condition' },
  },
  {
    id: 'e-cast-alert',
    source: { node: 'cast', port: 'casted' },
    target: { node: 'alert', port: 'actor' },
  },
];

const INITIAL_GROUPS: NodeGraphGroup[] = [
  {
    id: 'g-pipeline',
    bounds: { x: -300, y: -260, width: 940, height: 380 },
    label: 'Detect Low-HP Enemy',
    color: 'rgba(74, 153, 255, 0.18)',
  },
  {
    id: 'g-response',
    bounds: { x: 850, y: -200, width: 600, height: 320 },
    label: 'Response Branch',
    color: 'rgba(241, 137, 38, 0.18)',
  },
];

// ─── Node body (UE5 Blueprint style) ───────────────────────────────────────

function PinDot({
  side,
  type,
  outline,
}: {
  side: 'left' | 'right';
  type: string;
  outline?: boolean;
}): React.ReactElement {
  const color = TYPE_COLOR[type] ?? TYPE_COLOR.any;
  return (
    <span
      style={{
        position: 'absolute',
        [side]: -6,
        top: '50%',
        transform: 'translateY(-50%)',
        width: 12,
        height: 12,
        borderRadius: type === 'exec' ? 2 : '50%',
        background: outline ? 'rgba(20, 20, 24, 0.95)' : color,
        border: `2px solid ${color}`,
        boxSizing: 'border-box',
        boxShadow: `0 0 6px ${color}66`,
        pointerEvents: 'none',
      }}
    />
  );
}

function BlueprintNodeBody({
  node,
  ctx,
}: {
  node: NodeGraphNode;
  ctx: NodeGraphRenderCtx;
}): React.ReactElement {
  const data = node.data as BlueprintNode;
  const cat = CATEGORY_COLORS[data.category];
  const leftPins = data.pins.filter(p => p.side === 'left');
  const rightPins = data.pins.filter(p => p.side === 'right');

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        background:
          'linear-gradient(180deg, rgba(35, 38, 46, 0.97) 0%, rgba(22, 24, 30, 0.97) 100%)',
        borderRadius: 6,
        border: ctx.selected
          ? `2px solid ${cat.accent}`
          : '1px solid rgba(255, 255, 255, 0.08)',
        boxShadow: ctx.selected
          ? `0 0 0 1px ${cat.accent}, 0 12px 32px rgba(0, 0, 0, 0.55)`
          : '0 6px 16px rgba(0, 0, 0, 0.4)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        color: 'rgba(240, 240, 245, 0.95)',
        fontFamily: '"Segoe UI", system-ui, -apple-system, sans-serif',
        fontSize: 12,
        position: 'relative',
        transition: 'border-color 120ms, box-shadow 120ms',
      }}
    >
      {/* Title bar */}
      <div
        style={{
          background: cat.gradient,
          padding: '6px 10px',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          borderBottom: '1px solid rgba(0, 0, 0, 0.4)',
        }}
      >
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 18,
            height: 18,
            borderRadius: 3,
            background: 'rgba(0, 0, 0, 0.35)',
            fontSize: 12,
            fontWeight: 700,
            color: cat.accent,
            flexShrink: 0,
          }}
        >
          {cat.icon}
        </span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontSize: 12,
              fontWeight: 600,
              lineHeight: 1.2,
              textShadow: '0 1px 0 rgba(0,0,0,0.5)',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {data.title}
          </div>
          {data.subtitle ? (
            <div
              style={{
                fontSize: 10,
                opacity: 0.75,
                lineHeight: 1.2,
                marginTop: 1,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {data.subtitle}
            </div>
          ) : null}
        </div>
      </div>

      {/* Body — two-column pin rows */}
      <div
        style={{
          flex: 1,
          padding: '8px 14px',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          columnGap: 12,
          rowGap: 4,
          alignContent: 'flex-start',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 4,
          }}
        >
          {leftPins.map(p => (
            <div
              key={p.id}
              style={{
                position: 'relative',
                paddingLeft: 8,
                lineHeight: 1.5,
                color: 'rgba(220, 220, 230, 0.9)',
                fontSize: 11,
              }}
            >
              <PinDot side="left" type={p.dataType} outline />
              <span>{p.label || ' '}</span>
            </div>
          ))}
        </div>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 4,
            alignItems: 'flex-end',
          }}
        >
          {rightPins.map(p => (
            <div
              key={p.id}
              style={{
                position: 'relative',
                paddingRight: 8,
                lineHeight: 1.5,
                color: 'rgba(220, 220, 230, 0.9)',
                fontSize: 11,
                textAlign: 'right',
              }}
            >
              <span>{p.label || ' '}</span>
              <PinDot side="right" type={p.dataType} outline />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Demo component ────────────────────────────────────────────────────────

const isValidConnection = (
  source: NodeGraphPortRef,
  target: NodeGraphPortRef,
  info: NodeGraphConnectionValidationInfo
): boolean => {
  if (info.sameNode) return false;
  if (info.sideCombo !== 'right->left' && info.sideCombo !== 'left->right')
    return false;
  // Type-compatibility: reject if both ports declare a dataType and they
  // disagree. Falls back to permissive when either side is untyped.
  const ports = extractPortTypes(source, target);
  if (!ports) return true;
  if (ports.src === ports.tgt) return true;
  if (ports.src === 'any' || ports.tgt === 'any') return true;
  return false;
};

let lookupCache: {
  nodes: ReadonlyArray<NodeGraphNode>;
  index: Map<string, BlueprintPort>;
} | null = null;

function buildIndex(
  nodes: ReadonlyArray<NodeGraphNode>
): Map<string, BlueprintPort> {
  const map = new Map<string, BlueprintPort>();
  for (const node of nodes) {
    const blueprint = node.data as BlueprintNode;
    for (const pin of blueprint.pins) {
      map.set(`${node.id}.${pin.id}`, pin);
    }
  }
  return map;
}

function getPin(ref: NodeGraphPortRef): BlueprintPort | undefined {
  if (!lookupCache) return undefined;
  return lookupCache.index.get(`${ref.node}.${ref.port}`);
}

function extractPortTypes(
  source: NodeGraphPortRef,
  target: NodeGraphPortRef
): { src: string; tgt: string } | null {
  const sp = getPin(source);
  const tp = getPin(target);
  if (!sp || !tp) return null;
  return { src: sp.dataType, tgt: tp.dataType };
}

export default function NodeGraphDemo(): React.ReactElement {
  const [nodes, setNodes] = useState<NodeGraphNode[]>(INITIAL_NODES);
  const [edges, setEdges] = useState<NodeGraphEdge[]>(INITIAL_EDGES);
  const [groups] = useState<NodeGraphGroup[]>(INITIAL_GROUPS);
  const [selection, setSelection] = useState<NodeGraphSelection>({
    nodes: [],
    edges: [],
    groups: [],
  });
  const ref = useRef<NodeGraphHandle>(null);

  // Keep the type-validation index in sync with the current node list.
  useMemo(() => {
    lookupCache = { nodes, index: buildIndex(nodes) };
  }, [nodes]);

  const renderNode = useCallback(
    (node: NodeGraphNode, ctx: NodeGraphRenderCtx) => (
      <BlueprintNodeBody node={node} ctx={ctx} />
    ),
    []
  );

  const renderEdgeLabel = useCallback((edge: NodeGraphEdge) => {
    const srcPin = getPin(edge.source);
    if (!srcPin) return null;
    const color = TYPE_COLOR[srcPin.dataType] ?? TYPE_COLOR.any;
    // Only label data edges, not exec wires — keeps the canvas readable.
    if (srcPin.dataType === 'exec') return null;
    return (
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 4,
          padding: '1px 6px',
          background: 'rgba(20, 22, 28, 0.92)',
          border: `1px solid ${color}`,
          borderRadius: 999,
          fontSize: 9,
          fontFamily: '"Segoe UI", system-ui, -apple-system, sans-serif',
          color,
          letterSpacing: 0.3,
          textTransform: 'uppercase',
          whiteSpace: 'nowrap',
          pointerEvents: 'none',
        }}
      >
        {srcPin.dataType}
      </span>
    );
  }, []);

  const handleDelete = useCallback((sel: NodeGraphSelection) => {
    setNodes(prev => prev.filter(n => !sel.nodes.includes(n.id)));
    setEdges(prev =>
      prev.filter(
        e =>
          !sel.edges.includes(e.id) &&
          !sel.nodes.includes(e.source.node) &&
          !sel.nodes.includes(e.target.node)
      )
    );
    setSelection({ nodes: [], edges: [], groups: [] });
  }, []);

  return (
    <DemoWrapper>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
          height: 560,
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            flexWrap: 'wrap',
          }}
        >
          <Button
            size="sm"
            variant="ghost"
            onClick={() => ref.current?.fitToContent(48)}
          >
            Fit content
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => ref.current?.fitToSelection(96)}
            disabled={selection.nodes.length === 0}
          >
            Fit selection
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => ref.current?.focusNode('branch')}
          >
            Focus Branch
          </Button>
          <span
            style={{
              fontSize: 11,
              color: 'var(--etui-color-text-muted)',
              marginLeft: 'auto',
            }}
          >
            {selection.nodes.length > 0
              ? `${selection.nodes.length} node${selection.nodes.length === 1 ? '' : 's'} selected`
              : 'no selection'}
          </span>
        </div>
        <div style={{ flex: 1, minHeight: 0, position: 'relative' }}>
          <NodeGraph
            ref={ref}
            nodes={nodes}
            edges={edges}
            groups={groups}
            selection={selection}
            onNodesChange={setNodes}
            onEdgesChange={setEdges}
            onSelectionChange={setSelection}
            onDelete={handleDelete}
            renderNode={renderNode}
            renderEdgeLabel={renderEdgeLabel}
            isValidConnection={isValidConnection}
            snapToGrid={8}
            minZoom={0.2}
            maxZoom={2.5}
            responsive
            ariaLabel="Blueprint-style node graph"
          >
            <NodeGraph.Background variant="dots" gap={20} />
            <NodeGraph.Minimap
              placement="bottom-right"
              width={220}
              title="Graph Overview"
            />
          </NodeGraph>
        </div>
        <div
          style={{
            display: 'flex',
            gap: 16,
            flexWrap: 'wrap',
            fontSize: 11,
            color: 'var(--etui-color-text-secondary)',
            lineHeight: 1.5,
          }}
        >
          <span>
            <kbd>Drag</kbd> node to move
          </span>
          <span>
            <kbd>Drag pin → pin</kbd> connect (matching types only)
          </span>
          <span>
            <kbd>Shift+drag</kbd> additive marquee
          </span>
          <span>
            <kbd>Del</kbd> delete selection
          </span>
          <span>
            <kbd>Cmd/Ctrl+A</kbd> select all
          </span>
          <span>
            <kbd>Middle / Space+drag</kbd> pan
          </span>
          <span>
            <kbd>Wheel</kbd> zoom
          </span>
        </div>
      </div>
    </DemoWrapper>
  );
}
