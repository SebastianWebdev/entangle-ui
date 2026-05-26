import { useCallback, useMemo, useRef, useState } from 'react';
import DemoWrapper from '../DemoWrapper';
import {
  NodeGraph,
  createTypeMatchValidator,
  edgesConnectedToPort,
  useNodeGraph,
  type NodeGraphConnectEndInfo,
  type NodeGraphContextMenuInfo,
  type NodeGraphEdge,
  type NodeGraphEdgeStyleCtx,
  type NodeGraphGroup,
  type NodeGraphHandle,
  type NodeGraphNode,
  type NodeGraphPortRef,
  type NodeGraphPortShape,
  type Point2D,
} from '@/components/editor/NodeGraph';
import { Button } from '@/components/primitives/Button';
import { Collapsible } from '@/components/primitives/Collapsible';
import { Input } from '@/components/primitives/Input';
import { ContextMenu, Menu } from '@/components/navigation';
import { CopyIcon, SearchIcon, TrashIcon } from '@/components/Icons';

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

// ─── Spawn menu ──────────────────────────────────────────────────────────
//
// A flat node-spawn palette — no nested submenus. A search field in the
// header filters templates live, and the matches sit under one collapsible
// section per category. Built entirely from library parts:
//   • <Input>      — the search header (filters by title / subtitle / keywords)
//   • <Collapsible> — one expandable section per category
//   • <Menu.Item>  — the rows, so a click lands the node and dismisses the
//                    host menu, and the arrow/Enter keys navigate the results
// The same panel drops into both the right-click <ContextMenu.Content> and the
// drag-to-create popup, so there is a single spawn surface.

const SPAWN_CATEGORY_ORDER = Object.keys(CATEGORY_THEME) as Category[];

// The dot beside a row echoes the node's primary wire colour — its first
// output pin (or first pin), falling back to `any`.
function representativeType(template: NodeTemplate): DataType {
  const right = template.pins.find(p => p.side === 'right');
  return (right ?? template.pins[0])?.dataType ?? 'any';
}

function SpawnMenu({
  onPick,
}: {
  onPick: (template: NodeTemplate) => void;
}): React.ReactElement {
  const [query, setQuery] = useState('');
  const q = query.trim().toLowerCase();

  const sections = useMemo(
    () =>
      SPAWN_CATEGORY_ORDER.map(category => ({
        category,
        templates: TEMPLATES.filter(t => {
          if (t.category !== category) return false;
          if (!q) return true;
          return `${t.title} ${t.subtitle ?? ''} ${t.keywords ?? ''}`
            .toLowerCase()
            .includes(q);
        }),
      })).filter(section => section.templates.length > 0),
    [q]
  );

  return (
    <div
      style={{ width: 264, display: 'flex', flexDirection: 'column', gap: 6 }}
    >
      <Input
        size="sm"
        autoFocus
        value={query}
        onChange={setQuery}
        placeholder="Search nodes…"
        startIcon={<SearchIcon size="sm" />}
        // Typing filters the list; let the printable keys stay in the input
        // instead of triggering the host menu's type-ahead. Arrow/Enter/Escape
        // still bubble so the menu can drive navigation and dismissal.
        onKeyDown={e => {
          if (e.key.length === 1) e.stopPropagation();
        }}
      />
      <div
        style={{
          maxHeight: 320,
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
        }}
      >
        {sections.length === 0 ? (
          <div
            style={{
              padding: '10px 8px',
              fontSize: 12,
              textAlign: 'center',
              color: 'var(--etui-color-text-muted)',
            }}
          >
            No nodes match “{query}”.
          </div>
        ) : (
          sections.map(({ category, templates }) => (
            <SpawnSection
              key={category}
              category={category}
              templates={templates}
              // An active query expands every matching section so hits show.
              forceOpen={q.length > 0}
              onPick={onPick}
            />
          ))
        )}
      </div>
    </div>
  );
}

function SpawnSection({
  category,
  templates,
  forceOpen,
  onPick,
}: {
  category: Category;
  templates: NodeTemplate[];
  forceOpen: boolean;
  onPick: (template: NodeTemplate) => void;
}): React.ReactElement {
  const theme = CATEGORY_THEME[category];
  const [open, setOpen] = useState(true);

  return (
    <Collapsible
      size="sm"
      open={forceOpen || open}
      // While searching the section is locked open, so swallow the toggle.
      onChange={forceOpen ? undefined : setOpen}
      trigger={
        <span
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            width: '100%',
          }}
        >
          <span style={{ width: 14, textAlign: 'center', color: theme.accent }}>
            {theme.icon}
          </span>
          <span style={{ fontWeight: 600, textTransform: 'capitalize' }}>
            {category}
          </span>
          <span
            style={{
              marginLeft: 'auto',
              fontSize: 11,
              color: 'var(--etui-color-text-muted)',
            }}
          >
            {templates.length}
          </span>
        </span>
      }
    >
      {templates.map(t => {
        const dt = representativeType(t);
        return (
          <Menu.Item
            key={t.id}
            onClick={() => onPick(t)}
            icon={
              <span
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: pinShape(dt) === 'triangle' ? 1 : '50%',
                  background: TYPE_COLOR[dt] ?? TYPE_COLOR.any,
                  display: 'inline-block',
                }}
              />
            }
          >
            {t.title}
          </Menu.Item>
        );
      })}
    </Collapsible>
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
// `onContextMenu`. We stash that and branch the content on it, so there's no
// DOM walking and the spawn point comes straight from the library:
//   • node / port → Duplicate / Delete actions
//   • group       → <SpawnMenu> + Delete group
//   • empty / edge → <SpawnMenu> (spawn at the captured world point)

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
  // Set when a connection wire is dropped on empty space — drives the
  // "create a node here and wire it up" menu (anchored at the drop point).
  const [dropSpawn, setDropSpawn] = useState<{
    source: NodeGraphPortRef;
    worldPoint: Point2D;
    screenPoint: Point2D;
  } | null>(null);

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

  // Dragging a wire onto empty space opens a create-node menu at the drop
  // point (see `onConnectEnd` below). `worldPoint` / `screenPoint` come
  // straight from the event — no manual coordinate math.
  const handleConnectEnd = useCallback((info: NodeGraphConnectEndInfo) => {
    if (info.cancelled && info.target === null) {
      setDropSpawn({
        source: info.source,
        worldPoint: info.worldPoint,
        screenPoint: info.screenPoint,
      });
    }
  }, []);

  // Spawn the picked template at the drop point and immediately wire it to the
  // socket the drag started from — connecting to the first pin on the new node
  // that can accept the wire (opposite side, matching dataType / `any`).
  const handleDropSpawn = useCallback(
    (template: NodeTemplate, worldPoint: Point2D) => {
      const drop = dropSpawn;
      setDropSpawn(null);
      const id = graph.addNode({
        position: {
          x: Math.round(worldPoint.x / 8) * 8,
          y: Math.round(worldPoint.y / 8) * 8,
        },
        data: makeNodeData(template),
      });
      const srcNode = drop && graph.nodes.find(n => n.id === drop.source.node);
      const srcPin = srcNode
        ? (srcNode.data as BlueprintNodeData).pins.find(
            p => p.id === drop?.source.port
          )
        : undefined;
      if (drop && srcPin) {
        const wantSide = srcPin.side === 'right' ? 'left' : 'right';
        const match = template.pins.find(
          p =>
            p.side === wantSide &&
            (p.dataType === srcPin.dataType ||
              p.dataType === 'any' ||
              srcPin.dataType === 'any')
        );
        if (match) {
          const newRef: NodeGraphPortRef = { node: id, port: match.id };
          // Keep source→target orientation (the output is the source).
          if (srcPin.side === 'right') graph.connect(drop.source, newRef);
          else graph.connect(newRef, drop.source);
        }
      }
      graph.setSelection({ nodes: [id], edges: [], groups: [] });
    },
    [dropSpawn, graph]
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
   * Content for `<ContextMenu.Content>`, branched on the target NodeGraph
   * reported via `onContextMenu`. Composes the shared `Menu.*` primitives —
   * no config object. The world point comes straight from the library, so
   * there's no DOM walking or manual screen→world math.
   */
  const renderMenuContent = useCallback((): React.ReactNode => {
    if (!menuInfo) return null;
    const { target, worldPoint } = menuInfo;

    if (target.kind === 'port') {
      // Right-click a socket → select all wires hanging off it. From there
      // Delete removes them — "detach all" without a dedicated action.
      const portRef = { node: target.node, port: target.port };
      return (
        <Menu.Item
          onClick={() =>
            graph.setSelection({
              nodes: [],
              edges: edgesConnectedToPort(graph.edges, portRef),
              groups: [],
            })
          }
        >
          Select connected edges
        </Menu.Item>
      );
    }

    if (target.kind === 'node') {
      return (
        <>
          <Menu.Item
            icon={<CopyIcon size="sm" />}
            onClick={() => graph.duplicateNodes([target.id])}
          >
            Duplicate node
          </Menu.Item>
          <Menu.Item
            icon={<TrashIcon size="sm" />}
            onClick={() => graph.removeNodes([target.id])}
          >
            Delete node
          </Menu.Item>
        </>
      );
    }

    if (target.kind === 'group') {
      return (
        <>
          <SpawnMenu onPick={t => handleSpawn(t, worldPoint)} />
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
    return <SpawnMenu onPick={t => handleSpawn(t, worldPoint)} />;
  }, [menuInfo, handleSpawn, graph]);

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
            we stash it and `ContextMenu.Content` renders the matching content
            (node actions / the <SpawnMenu> palette / group actions).
          */}
          <ContextMenu>
            <ContextMenu.Trigger>
              <NodeGraph
                ref={ref}
                {...graph.bind}
                onContextMenu={setMenuInfo}
                onConnectEnd={handleConnectEnd}
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
                  nodeStyle={node => {
                    const theme =
                      CATEGORY_THEME[(node.data as BlueprintNodeData).category];
                    // Dark body + a category-coloured header strip, echoing
                    // the real node so the minimap reads at a glance.
                    return {
                      color: 'rgba(38, 42, 54, 0.92)',
                      headerColor: theme.accent,
                    };
                  }}
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
          {/*
            Drop-to-create: when a wire is dropped on empty space, `onConnectEnd`
            stashes the source + drop point, and this controlled menu opens
            anchored at the drop point. Picking a template spawns the node there
            and wires it straight back to the socket the drag came from.
          */}
          {dropSpawn ? (
            <Menu
              open
              modal={false}
              onOpenChange={open => {
                if (!open) setDropSpawn(null);
              }}
            >
              <Menu.Trigger
                render={
                  <span
                    aria-hidden="true"
                    style={{
                      position: 'absolute',
                      left: dropSpawn.screenPoint.x,
                      top: dropSpawn.screenPoint.y,
                      width: 0,
                      height: 0,
                    }}
                  />
                }
              />
              <Menu.Content>
                <SpawnMenu
                  onPick={t => handleDropSpawn(t, dropSpawn.worldPoint)}
                />
              </Menu.Content>
            </Menu>
          ) : null}
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
            <kbd>Drag edge end</kbd> reconnect · drop on empty → detach
          </span>
          <span>
            <kbd>Drag from socket → empty</kbd> create node + auto-connect
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
