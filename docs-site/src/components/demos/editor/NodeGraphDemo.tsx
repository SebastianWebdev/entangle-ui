import { useCallback, useMemo, useRef, useState } from 'react';
import DemoWrapper from '../DemoWrapper';
import {
  NodeGraph,
  createTypeMatchValidator,
  useNodeGraph,
  type NodeGraphContextMenuInfo,
  type NodeGraphEdge,
  type NodeGraphEdgeStyleCtx,
  type NodeGraphGroup,
  type NodeGraphHandle,
  type NodeGraphNode,
  type NodeGraphPortShape,
  type Point2D,
} from '@/components/editor/NodeGraph';
import { Button } from '@/components/primitives/Button';
import { ContextMenu, Menu } from '@/components/navigation';
import { CopyIcon, TrashIcon } from '@/components/Icons';

// ─── Type palette (UE5 Blueprint) ──────────────────────────────────────────

const TYPE_COLOR: Record<string, string> = {
  exec: '#f8f8f8',
  float: '#9ee65a',
  int: '#1ec3a8',
  bool: '#c0182d',
  vector: '#f5c518',
  rotator: '#9c7df0',
  transform: '#ff7e25',
  object: '#3aa4ff',
  actor: '#5d8dff',
  string: '#ff3ad5',
  any: '#c8c8c8',
};

type DataType = keyof typeof TYPE_COLOR;

interface BlueprintPin {
  id: string;
  label: string;
  side: 'left' | 'right';
  dataType: DataType;
}

type Category =
  | 'event'
  | 'flow'
  | 'pure'
  | 'macro'
  | 'cast'
  | 'variable'
  | 'output'
  | 'utility';

interface BlueprintNodeData {
  templateId: string;
  title: string;
  subtitle?: string;
  category: Category;
  pins: BlueprintPin[];
  /** Optional inline content shown under the pins (e.g. literal value). */
  body?: string;
}

const CATEGORY_THEME: Record<
  Category,
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
  utility: {
    gradient: 'linear-gradient(90deg, #2f6868 0%, #1c4747 100%)',
    accent: '#62d5d5',
    icon: '⚙',
  },
};

// ─── Node templates ────────────────────────────────────────────────────────

interface NodeTemplate {
  id: string;
  title: string;
  subtitle?: string;
  category: Category;
  pins: BlueprintPin[];
  body?: string;
  keywords?: string;
}

function exec(id: string, label: string, side: 'left' | 'right'): BlueprintPin {
  return { id, label, side, dataType: 'exec' };
}
function data(
  id: string,
  label: string,
  side: 'left' | 'right',
  dt: DataType
): BlueprintPin {
  return { id, label, side, dataType: dt };
}

const TEMPLATES: NodeTemplate[] = [
  // Events
  {
    id: 'event-beginplay',
    title: 'Event BeginPlay',
    subtitle: 'Lifecycle',
    category: 'event',
    pins: [exec('exec', '', 'right')],
    keywords: 'begin play start init event',
  },
  {
    id: 'event-tick',
    title: 'Event Tick',
    subtitle: 'Lifecycle',
    category: 'event',
    pins: [
      exec('exec', '', 'right'),
      data('dt', 'Delta Seconds', 'right', 'float'),
    ],
    keywords: 'tick frame update event',
  },
  {
    id: 'event-onhit',
    title: 'On Hit',
    subtitle: 'Collision',
    category: 'event',
    pins: [
      exec('exec', '', 'right'),
      data('other', 'Other Actor', 'right', 'actor'),
      data('impulse', 'Impulse', 'right', 'vector'),
    ],
    keywords: 'hit collision impact event',
  },
  {
    id: 'event-ondestroyed',
    title: 'On Destroyed',
    subtitle: 'Lifecycle',
    category: 'event',
    pins: [
      exec('exec', '', 'right'),
      data('actor', 'Destroyed Actor', 'right', 'actor'),
    ],
    keywords: 'destroy death event',
  },
  {
    id: 'event-input',
    title: 'Input Action Jump',
    subtitle: 'Input',
    category: 'event',
    pins: [
      exec('pressed', 'Pressed', 'right'),
      exec('released', 'Released', 'right'),
    ],
    keywords: 'input button press jump action event',
  },

  // Flow control
  {
    id: 'flow-branch',
    title: 'Branch',
    subtitle: 'Flow Control',
    category: 'flow',
    pins: [
      exec('exec', '', 'left'),
      data('cond', 'Condition', 'left', 'bool'),
      exec('true', 'True', 'right'),
      exec('false', 'False', 'right'),
    ],
    keywords: 'branch if condition flow',
  },
  {
    id: 'flow-sequence',
    title: 'Sequence',
    subtitle: 'Flow Control',
    category: 'flow',
    pins: [
      exec('exec', '', 'left'),
      exec('then0', 'Then 0', 'right'),
      exec('then1', 'Then 1', 'right'),
      exec('then2', 'Then 2', 'right'),
    ],
    keywords: 'sequence then ordered flow',
  },
  {
    id: 'flow-forloop',
    title: 'For Loop',
    subtitle: 'Flow Control',
    category: 'flow',
    pins: [
      exec('exec', '', 'left'),
      data('first', 'First Index', 'left', 'int'),
      data('last', 'Last Index', 'left', 'int'),
      exec('body', 'Loop Body', 'right'),
      data('index', 'Index', 'right', 'int'),
      exec('done', 'Completed', 'right'),
    ],
    keywords: 'for loop iterate index flow',
  },
  {
    id: 'flow-foreach',
    title: 'For Each Loop',
    subtitle: 'Array Flow',
    category: 'flow',
    pins: [
      exec('exec', '', 'left'),
      data('array', 'Array', 'left', 'any'),
      exec('body', 'Loop Body', 'right'),
      data('element', 'Element', 'right', 'any'),
      data('idx', 'Index', 'right', 'int'),
      exec('done', 'Completed', 'right'),
    ],
    keywords: 'foreach iterate array loop flow',
  },
  {
    id: 'flow-switch-int',
    title: 'Switch on Int',
    subtitle: 'Flow Control',
    category: 'flow',
    pins: [
      exec('exec', '', 'left'),
      data('selection', 'Selection', 'left', 'int'),
      exec('case0', '0', 'right'),
      exec('case1', '1', 'right'),
      exec('case2', '2', 'right'),
      exec('default', 'Default', 'right'),
    ],
    keywords: 'switch case int flow',
  },

  // Variables / literals
  {
    id: 'var-float',
    title: 'Float',
    subtitle: 'Literal · float',
    category: 'variable',
    pins: [data('out', '1.0', 'right', 'float')],
    body: '1.000',
    keywords: 'float literal value constant variable',
  },
  {
    id: 'var-int',
    title: 'Integer',
    subtitle: 'Literal · int',
    category: 'variable',
    pins: [data('out', '0', 'right', 'int')],
    body: '0',
    keywords: 'int integer literal value constant variable',
  },
  {
    id: 'var-bool',
    title: 'Boolean',
    subtitle: 'Literal · bool',
    category: 'variable',
    pins: [data('out', 'true', 'right', 'bool')],
    body: 'true',
    keywords: 'bool boolean literal value constant',
  },
  {
    id: 'var-string',
    title: 'String',
    subtitle: 'Literal · string',
    category: 'variable',
    pins: [data('out', '"…"', 'right', 'string')],
    body: '"Hello"',
    keywords: 'string literal value constant',
  },
  {
    id: 'var-vector',
    title: 'Vector',
    subtitle: 'Literal · vector',
    category: 'variable',
    pins: [data('out', '(x, y, z)', 'right', 'vector')],
    body: '(0, 0, 0)',
    keywords: 'vector literal value constant',
  },
  {
    id: 'var-break-vector',
    title: 'Break Vector',
    subtitle: 'Vector → x/y/z',
    category: 'pure',
    pins: [
      data('vec', 'Vector', 'left', 'vector'),
      data('x', 'X', 'right', 'float'),
      data('y', 'Y', 'right', 'float'),
      data('z', 'Z', 'right', 'float'),
    ],
    keywords: 'break vector split components',
  },
  {
    id: 'var-make-vector',
    title: 'Make Vector',
    subtitle: 'x/y/z → Vector',
    category: 'pure',
    pins: [
      data('x', 'X', 'left', 'float'),
      data('y', 'Y', 'left', 'float'),
      data('z', 'Z', 'left', 'float'),
      data('out', 'Return Value', 'right', 'vector'),
    ],
    keywords: 'make vector construct components pure',
  },

  // Pure math
  {
    id: 'math-add',
    title: 'Add (float)',
    subtitle: 'Pure',
    category: 'pure',
    pins: [
      data('a', 'A', 'left', 'float'),
      data('b', 'B', 'left', 'float'),
      data('out', 'Result', 'right', 'float'),
    ],
    keywords: 'add plus sum pure math float',
  },
  {
    id: 'math-mul',
    title: 'Multiply (float)',
    subtitle: 'Pure',
    category: 'pure',
    pins: [
      data('a', 'A', 'left', 'float'),
      data('b', 'B', 'left', 'float'),
      data('out', 'Result', 'right', 'float'),
    ],
    keywords: 'multiply times product pure math',
  },
  {
    id: 'math-less',
    title: 'A < B',
    subtitle: 'Pure',
    category: 'pure',
    pins: [
      data('a', 'A', 'left', 'float'),
      data('b', 'B', 'left', 'float'),
      data('out', 'Result', 'right', 'bool'),
    ],
    keywords: 'less than comparison pure math',
  },

  // Actor / utility
  {
    id: 'get-actor-location',
    title: 'Get Actor Location',
    subtitle: 'Actor (pure)',
    category: 'pure',
    pins: [
      data('target', 'Target', 'left', 'actor'),
      data('out', 'Return Value', 'right', 'vector'),
    ],
    keywords: 'get actor location position vector pure',
  },
  {
    id: 'set-actor-location',
    title: 'Set Actor Location',
    subtitle: 'Actor',
    category: 'utility',
    pins: [
      exec('exec', '', 'left'),
      data('target', 'Target', 'left', 'actor'),
      data('loc', 'New Location', 'left', 'vector'),
      exec('done', '', 'right'),
      data('result', 'Success', 'right', 'bool'),
    ],
    keywords: 'set actor location move teleport utility',
  },
  {
    id: 'util-delay',
    title: 'Delay',
    subtitle: 'Utility',
    category: 'utility',
    pins: [
      exec('exec', '', 'left'),
      data('duration', 'Duration', 'left', 'float'),
      exec('done', 'Completed', 'right'),
    ],
    keywords: 'delay wait sleep timer utility',
  },
  {
    id: 'util-print-string',
    title: 'Print String',
    subtitle: 'Debug',
    category: 'utility',
    pins: [
      exec('exec', '', 'left'),
      data('text', 'In String', 'left', 'string'),
      exec('done', '', 'right'),
    ],
    keywords: 'print string log debug utility',
  },
  {
    id: 'cast-pawn',
    title: 'Cast to Pawn',
    subtitle: 'Conversion',
    category: 'cast',
    pins: [
      exec('exec', '', 'left'),
      data('object', 'Object', 'left', 'object'),
      exec('success', '', 'right'),
      exec('failed', 'Cast Failed', 'right'),
      data('as', 'As Pawn', 'right', 'actor'),
    ],
    keywords: 'cast pawn conversion type check',
  },
];

// ─── Node instantiation ────────────────────────────────────────────────────

function makeNodeData(template: NodeTemplate): BlueprintNodeData {
  return {
    templateId: template.id,
    title: template.title,
    subtitle: template.subtitle,
    category: template.category,
    pins: template.pins,
    body: template.body,
  };
}

function instantiateTemplate(
  template: NodeTemplate,
  position: { x: number; y: number },
  idSeed: number
): NodeGraphNode {
  return {
    id: `${template.id}-${idSeed}`,
    position,
    data: makeNodeData(template),
  };
}

// ─── Initial graph ─────────────────────────────────────────────────────────

function makeInitial(): {
  nodes: NodeGraphNode[];
  edges: NodeGraphEdge[];
  groups: NodeGraphGroup[];
} {
  const tByName = (id: string): NodeTemplate => {
    const t = TEMPLATES.find(x => x.id === id);
    if (!t) throw new Error(`unknown template: ${id}`);
    return t;
  };
  let seed = 1;
  const node = (id: string, x: number, y: number): NodeGraphNode =>
    instantiateTemplate(tByName(id), { x, y }, seed++);

  const ev = node('event-beginplay', -560, -120);
  const cast = node('cast-pawn', -240, -160);
  const getLoc = node('get-actor-location', 80, -180);
  const breakVec = node('var-break-vector', 380, -200);
  const threshold = node('var-float', 80, 100);
  const less = node('math-less', 700, -120);
  const branch = node('flow-branch', 980, -180);
  const print = node('util-print-string', 1280, -240);
  const debugText = node('var-string', 980, -40);
  const delay = node('util-delay', 1280, 80);
  const setLoc = node('set-actor-location', 1580, -40);
  const makeVec = node('var-make-vector', 1280, 220);
  ev.id = 'ev';
  cast.id = 'cast';
  getLoc.id = 'getloc';
  breakVec.id = 'breakvec';
  threshold.id = 'thr';
  less.id = 'less';
  branch.id = 'branch';
  print.id = 'print';
  debugText.id = 'dbg';
  delay.id = 'delay';
  setLoc.id = 'setloc';
  makeVec.id = 'makevec';

  const nodes = [
    ev,
    cast,
    getLoc,
    breakVec,
    threshold,
    less,
    branch,
    print,
    debugText,
    delay,
    setLoc,
    makeVec,
  ];

  const edges: NodeGraphEdge[] = [
    {
      id: 'e1',
      source: { node: 'ev', port: 'exec' },
      target: { node: 'cast', port: 'exec' },
    },
    {
      id: 'e2',
      source: { node: 'cast', port: 'as' },
      target: { node: 'getloc', port: 'target' },
    },
    {
      id: 'e3',
      source: { node: 'getloc', port: 'out' },
      target: { node: 'breakvec', port: 'vec' },
    },
    {
      id: 'e4',
      source: { node: 'breakvec', port: 'z' },
      target: { node: 'less', port: 'a' },
    },
    {
      id: 'e5',
      source: { node: 'thr', port: 'out' },
      target: { node: 'less', port: 'b' },
    },
    {
      id: 'e6',
      source: { node: 'cast', port: 'success' },
      target: { node: 'branch', port: 'exec' },
    },
    {
      id: 'e7',
      source: { node: 'less', port: 'out' },
      target: { node: 'branch', port: 'cond' },
    },
    {
      id: 'e8',
      source: { node: 'branch', port: 'true' },
      target: { node: 'print', port: 'exec' },
    },
    {
      id: 'e9',
      source: { node: 'dbg', port: 'out' },
      target: { node: 'print', port: 'text' },
    },
    {
      id: 'e10',
      source: { node: 'branch', port: 'false' },
      target: { node: 'delay', port: 'exec' },
    },
    {
      id: 'e11',
      source: { node: 'delay', port: 'done' },
      target: { node: 'setloc', port: 'exec' },
    },
    {
      id: 'e12',
      source: { node: 'makevec', port: 'out' },
      target: { node: 'setloc', port: 'loc' },
    },
    {
      id: 'e13',
      source: { node: 'cast', port: 'as' },
      target: { node: 'setloc', port: 'target' },
    },
  ];

  const groups: NodeGraphGroup[] = [
    {
      id: 'g-analyse',
      bounds: { x: -300, y: -260, width: 1080, height: 460 },
      label: 'Analyse Actor Location',
      color: 'rgba(74, 153, 255, 0.16)',
    },
    {
      id: 'g-react',
      bounds: { x: 940, y: -310, width: 760, height: 430 },
      label: 'React',
      color: 'rgba(241, 137, 38, 0.16)',
    },
  ];

  return { nodes, edges, groups };
}

// ─── Pin shape ───────────────────────────────────────────────────────────
//
// Exec/flow pins are the UE-style arrow; everything else is a ring. The
// colour comes straight from the data-type palette. The handle fill (wired
// vs unwired) is derived automatically by `<NodeGraph.Pin>` from the edges,
// so there's no consumer-side "connected ports" bookkeeping anymore.

function pinShape(dataType: DataType): NodeGraphPortShape {
  return dataType === 'exec' ? 'triangle' : 'circle';
}

// ─── Node body ─────────────────────────────────────────────────────────────
//
// Built entirely from library parts:
//   • <NodeGraph.NodeBody>   — themed panel + auto selected/hovered visuals
//   • <NodeGraph.NodeHeader> — gradient strip with icon/title/subtitle
//   • <NodeGraph.PinList>    — two-column grid that routes pins by side
//   • <NodeGraph.Pin>        — one-liner handle + label (auto-connected fill)
// The optional `body` literal sits as a "loose" child after the rows.

function BlueprintNodeBody({
  node,
}: {
  node: NodeGraphNode;
}): React.ReactElement {
  const blueprint = node.data as BlueprintNodeData;
  const theme = CATEGORY_THEME[blueprint.category];

  return (
    <NodeGraph.NodeBody accent={theme.accent} style={{ width: 220 }}>
      <NodeGraph.NodeHeader
        background={theme.gradient}
        icon={
          <span style={{ color: theme.accent, fontWeight: 700 }}>
            {theme.icon}
          </span>
        }
        title={blueprint.title}
        subtitle={blueprint.subtitle}
      />
      <NodeGraph.PinList columnGap={16}>
        {blueprint.pins.map(pin => (
          <NodeGraph.Pin
            key={pin.id}
            id={pin.id}
            side={pin.side}
            dataType={pin.dataType}
            shape={pinShape(pin.dataType)}
            color={TYPE_COLOR[pin.dataType] ?? TYPE_COLOR.any}
            label={pin.label}
          />
        ))}
        {blueprint.body ? (
          <div
            style={{
              fontFamily: '"JetBrains Mono", ui-monospace, monospace',
              fontSize: 11,
              color: 'rgba(220, 220, 235, 0.85)',
              background: 'rgba(0, 0, 0, 0.25)',
              borderTop: '1px solid rgba(255, 255, 255, 0.05)',
              padding: '4px 12px',
              marginTop: 4,
            }}
          >
            {blueprint.body}
          </div>
        ) : null}
      </NodeGraph.PinList>
    </NodeGraph.NodeBody>
  );
}

// ─── Context menu ──────────────────────────────────────────────────────────
//
// Right-clicking the NodeGraph routes through the composition `<ContextMenu>`
// (Trigger + Content) — no `config` resolver, no payload. The library handles
// positioning at the pointer, focus, keyboard nav (Esc/arrows/Enter), and
// dismissal. The menu content is built from the shared `Menu.*` primitives.
//
// NodeGraph already hit-tests every right-click and hands back a typed
// `target` (node / port / group / edge / empty) plus the world point via
// `onContextMenu`. We stash that and branch the `Menu.*` content on it, so
// there's no DOM walking and the spawn point comes straight from the library:
//   • node / port → Duplicate / Delete actions
//   • group       → Add Node (categorised submenus) + Delete group
//   • empty / edge → Add Node submenus (spawn at the captured world point)

// ─── Demo ──────────────────────────────────────────────────────────────────

export default function NodeGraphDemo(): React.ReactElement {
  const initial = useMemo(makeInitial, []);
  // One hook owns nodes / edges / groups / selection plus the graph
  // mutations every editor re-implements (add / remove-with-edge-cascade /
  // duplicate / group). `bind` spreads all four controlled props at once.
  const graph = useNodeGraph({
    nodes: initial.nodes,
    edges: initial.edges,
    groups: initial.groups,
  });
  const ref = useRef<NodeGraphHandle>(null);
  // Last right-click info from NodeGraph — drives the context menu content
  // (target kind) and the spawn world point.
  const [menuInfo, setMenuInfo] = useState<NodeGraphContextMenuInfo | null>(
    null
  );

  // Output→input, type-matched, with `'any'` connecting to anything — the
  // policy the helper ships by default. No hand-written validator needed.
  const isValidConnection = useMemo(() => createTypeMatchValidator(), []);

  const renderNode = useCallback(
    (node: NodeGraphNode) => <BlueprintNodeBody node={node} />,
    []
  );

  const edgeStyle = useCallback(
    (_edge: NodeGraphEdge, ctx: NodeGraphEdgeStyleCtx) => {
      const t = ctx.sourcePort?.dataType ?? 'any';
      return { color: TYPE_COLOR[t] ?? TYPE_COLOR.any };
    },
    []
  );

  const handleSpawn = useCallback(
    (template: NodeTemplate, worldPoint: Point2D) => {
      const id = graph.addNode({
        position: {
          x: Math.round(worldPoint.x / 8) * 8,
          y: Math.round(worldPoint.y / 8) * 8,
        },
        data: makeNodeData(template),
      });
      graph.setSelection({ nodes: [id], edges: [], groups: [] });
    },
    [graph]
  );

  const addGroupAt = useCallback(
    (worldX: number, worldY: number) => {
      const id = graph.addGroup(
        { x: worldX - 160, y: worldY - 100, width: 320, height: 200 },
        { label: 'New Group', color: 'rgba(120, 180, 255, 0.16)' }
      );
      graph.setSelection({ nodes: [], edges: [], groups: [id] });
    },
    [graph]
  );

  /**
   * The spawn submenu — a labelled "Add Node" group with one nested submenu
   * per category, each listing the templates in that category. `onClick`
   * closes over the world point captured on right-click, so the node lands
   * where the menu opened.
   */
  const renderSpawnItems = useCallback(
    (worldPoint: Point2D): React.ReactElement => {
      const categories = Array.from(
        new Set(TEMPLATES.map(t => t.category))
      ) as Category[];
      return (
        <Menu.Group label="Add Node">
          {categories.map(category => {
            const templates = TEMPLATES.filter(t => t.category === category);
            const theme = CATEGORY_THEME[category];
            return (
              <Menu.Sub key={category}>
                <Menu.SubTrigger
                  icon={
                    <span style={{ color: theme.accent }}>{theme.icon}</span>
                  }
                >
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </Menu.SubTrigger>
                <Menu.SubContent>
                  {templates.map(t => (
                    <Menu.Item
                      key={t.id}
                      onClick={() => handleSpawn(t, worldPoint)}
                    >
                      {t.title}
                    </Menu.Item>
                  ))}
                </Menu.SubContent>
              </Menu.Sub>
            );
          })}
        </Menu.Group>
      );
    },
    [handleSpawn]
  );

  /**
   * Content for `<ContextMenu.Content>`, branched on the target NodeGraph
   * reported via `onContextMenu`. Composes the shared `Menu.*` primitives —
   * no config object. The world point comes straight from the library, so
   * there's no DOM walking or manual screen→world math.
   */
  const renderMenuContent = useCallback((): React.ReactNode => {
    if (!menuInfo) return null;
    const { target, worldPoint } = menuInfo;

    if (target.kind === 'node' || target.kind === 'port') {
      const nodeId = target.kind === 'node' ? target.id : target.node;
      return (
        <>
          <Menu.Item
            icon={<CopyIcon size="sm" />}
            onClick={() => graph.duplicateNodes([nodeId])}
          >
            Duplicate node
          </Menu.Item>
          <Menu.Item
            icon={<TrashIcon size="sm" />}
            onClick={() => graph.removeNodes([nodeId])}
          >
            Delete node
          </Menu.Item>
        </>
      );
    }

    if (target.kind === 'group') {
      return (
        <>
          {renderSpawnItems(worldPoint)}
          <Menu.Separator />
          <Menu.Item
            icon={<TrashIcon size="sm" />}
            onClick={() => graph.removeGroups([target.id])}
          >
            Delete group
          </Menu.Item>
        </>
      );
    }

    if (target.kind === 'edge') {
      return (
        <Menu.Item
          icon={<TrashIcon size="sm" />}
          onClick={() => graph.removeEdges([target.id])}
        >
          Delete edge
        </Menu.Item>
      );
    }

    // Empty space → spawn menu.
    return renderSpawnItems(worldPoint);
  }, [menuInfo, renderSpawnItems, graph]);

  return (
    <DemoWrapper>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
          height: 620,
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
          <span
            style={{
              fontSize: 11,
              color: 'var(--etui-color-text-muted)',
              marginLeft: 'auto',
            }}
          >
            {graph.nodes.length} nodes · {graph.edges.length} edges ·{' '}
            {graph.groups.length} groups
            {graph.selection.nodes.length + graph.selection.groups.length > 0
              ? ` · ${graph.selection.nodes.length + graph.selection.groups.length} selected`
              : ''}
          </span>
        </div>
        <div style={{ flex: 1, minHeight: 0, position: 'relative' }}>
          {/*
            <ContextMenu> wraps the graph as the right-click trigger area.
            NodeGraph's `onContextMenu` reports the hit target + world point;
            we stash it and `ContextMenu.Content` composes the matching
            `Menu.*` items (node actions / spawn submenu / group actions).
          */}
          <ContextMenu>
            <ContextMenu.Trigger>
              <NodeGraph
                ref={ref}
                {...graph.bind}
                onContextMenu={setMenuInfo}
                edgeStyle={edgeStyle}
                renderNode={renderNode}
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
                <NodeGraph.Toolbar placement="top-left">
                  <NodeGraph.FitContentButton padding={48} />
                  <NodeGraph.FitSelectionButton padding={96} />
                  <NodeGraph.ToolbarSeparator />
                  <NodeGraph.ZoomOutButton />
                  <NodeGraph.ResetZoomButton />
                  <NodeGraph.ZoomInButton />
                  <NodeGraph.ToolbarSeparator />
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      const t = ref.current?.getTransform();
                      const size = ref.current?.getSize();
                      if (!t || !size) return;
                      const world = ref.current!.screenToWorld({
                        x: size.width / 2,
                        y: size.height / 2,
                      });
                      addGroupAt(world.x, world.y);
                    }}
                  >
                    + Group
                  </Button>
                </NodeGraph.Toolbar>
              </NodeGraph>
            </ContextMenu.Trigger>
            <ContextMenu.Content>{renderMenuContent()}</ContextMenu.Content>
          </ContextMenu>
        </div>
        <div
          style={{
            display: 'flex',
            gap: 14,
            flexWrap: 'wrap',
            fontSize: 11,
            color: 'var(--etui-color-text-secondary)',
            lineHeight: 1.5,
          }}
        >
          <span>
            <kbd>Right-click</kbd> empty / group → Add Node · node / port →
            duplicate / delete
          </span>
          <span>
            <kbd>Drag</kbd> node — move (connectors follow live)
          </span>
          <span>
            <kbd>Drag pin → pin</kbd> connect (type-matched)
          </span>
          <span>
            <kbd>Click edge</kbd> select · <kbd>right-click edge</kbd> delete
          </span>
          <span>
            <kbd>Drag group body / handles</kbd> move + resize
          </span>
          <span>
            <kbd>Shift+drag</kbd> additive marquee
          </span>
          <span>
            <kbd>Del</kbd> remove selection (nodes / edges / groups)
          </span>
          <span>
            <kbd>Cmd/Ctrl+A</kbd> select all
          </span>
        </div>
      </div>
    </DemoWrapper>
  );
}
