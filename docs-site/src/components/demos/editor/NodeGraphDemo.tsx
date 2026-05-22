import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import DemoWrapper from '../DemoWrapper';
import {
  NodeGraph,
  type NodeGraphConnectionValidationInfo,
  type NodeGraphEdgeStyleCtx,
  type NodeGraphContextMenuInfo,
  type NodeGraphEdge,
  type NodeGraphGroup,
  type NodeGraphHandle,
  type NodeGraphNode,
  type NodeGraphPortRef,
  type NodeGraphRenderCtx,
  type NodeGraphSelection,
} from '@/components/editor/NodeGraph';
import { Button } from '@/components/primitives/Button';

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
//
// With the slot-based port API the consumer just builds a `NodeGraphNode`
// with its data payload — width/height auto-measure from the rendered DOM,
// and port positions are tracked from `<NodeGraph.Port>` slots inside the
// node body. No more pin/port duality.

function instantiateTemplate(
  template: NodeTemplate,
  position: { x: number; y: number },
  idSeed: number
): NodeGraphNode {
  const data: BlueprintNodeData = {
    templateId: template.id,
    title: template.title,
    subtitle: template.subtitle,
    category: template.category,
    pins: template.pins,
    body: template.body,
  };
  return { id: `${template.id}-${idSeed}`, position, data };
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

// ─── UE-style pin visual (used as children of <NodeGraph.Port>) ────────────

interface PinVisualProps {
  dataType: DataType;
  side: 'left' | 'right';
  connected: boolean;
}

/**
 * The visual rendered inside each `<NodeGraph.Port>` slot. Coloured ring
 * for data pins, exec-arrow triangle for exec pins. The library wraps this
 * in a 12 × 12-ish handle and tracks pointer events / position — so the
 * visual is the same DOM element the user clicks and the edge anchors to.
 */
function PinVisual({
  dataType,
  side,
  connected,
}: PinVisualProps): React.ReactElement {
  const color = TYPE_COLOR[dataType] ?? TYPE_COLOR.any;
  const isExec = dataType === 'exec';
  const size = isExec ? 14 : 12;

  if (isExec) {
    const points = side === 'left' ? '2,2 12,7 2,12' : '2,2 12,7 2,12';
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 14 14"
        style={{ display: 'block' }}
        aria-hidden="true"
      >
        <polygon
          points={points}
          fill={connected ? color : 'transparent'}
          stroke={color}
          strokeWidth={1.5}
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  return (
    <span
      style={{
        display: 'block',
        width: size,
        height: size,
        borderRadius: '50%',
        background: connected ? color : 'transparent',
        border: `2px solid ${color}`,
        boxSizing: 'border-box',
      }}
      aria-hidden="true"
    />
  );
}

// ─── Node body ─────────────────────────────────────────────────────────────

const HEADER_HEIGHT = 28;
const PIN_ROW_HEIGHT = 22;
const BODY_VERT_PADDING = 8;

/**
 * Pin row — label + port slot. The `<NodeGraph.Port>` slot is the actual
 * connection endpoint. Library measures its position, registers it as the
 * anchor for any edge that references this pin, and wires pointer events.
 *
 * Left pins put the port at the start of the row (against the node's left
 * edge); right pins put it at the end. The slot sits inline-flex inside
 * the row — its center is the precise point where edges connect.
 */
function PinRow({
  pin,
  connected,
}: {
  pin: BlueprintPin;
  connected: boolean;
}): React.ReactElement {
  const port = (
    <NodeGraph.Port
      id={pin.id}
      side={pin.side}
      dataType={pin.dataType}
      label={pin.label || `${pin.side} ${pin.id}`}
    >
      <PinVisual
        dataType={pin.dataType}
        side={pin.side}
        connected={connected}
      />
    </NodeGraph.Port>
  );
  const label = (
    <span
      style={{
        fontSize: 11,
        color: connected
          ? 'rgba(235, 235, 245, 0.95)'
          : 'rgba(200, 200, 215, 0.78)',
        minWidth: 0,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
      }}
    >
      {pin.label || (pin.dataType === 'exec' ? '►' : ' ')}
    </span>
  );
  return (
    <div
      style={{
        height: PIN_ROW_HEIGHT,
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        justifyContent: pin.side === 'left' ? 'flex-start' : 'flex-end',
        // Pins sit inside the node body with their own breathing room
        // (UE5-style "well"). The library doesn't impose any positioning
        // — `<NodeGraph.Port>` is just an inline element measured wherever
        // the consumer drops it, and edges anchor at its center.
      }}
    >
      {pin.side === 'left' ? (
        <>
          {port}
          {label}
        </>
      ) : (
        <>
          {label}
          {port}
        </>
      )}
    </div>
  );
}

function BlueprintNodeBody({
  node,
  ctx,
  connectedSet,
}: {
  node: NodeGraphNode;
  ctx: NodeGraphRenderCtx;
  connectedSet: Set<string>;
}): React.ReactElement {
  const blueprint = node.data as BlueprintNodeData;
  const theme = CATEGORY_THEME[blueprint.category];
  const left = blueprint.pins.filter(p => p.side === 'left');
  const right = blueprint.pins.filter(p => p.side === 'right');
  const rows = Math.max(left.length, right.length);

  return (
    <div
      style={{
        width: 220,
        background:
          'linear-gradient(180deg, rgba(28, 30, 38, 0.85) 0%, rgba(18, 20, 26, 0.92) 100%)',
        backdropFilter: 'blur(4px)',
        WebkitBackdropFilter: 'blur(4px)',
        borderRadius: 8,
        border: ctx.selected
          ? `2px solid ${theme.accent}`
          : '1px solid rgba(255, 255, 255, 0.08)',
        boxShadow: ctx.selected
          ? `0 0 0 1px ${theme.accent}, 0 12px 32px rgba(0, 0, 0, 0.5)`
          : '0 6px 16px rgba(0, 0, 0, 0.35)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        color: 'rgba(240, 240, 245, 0.95)',
        fontFamily: '"Segoe UI", system-ui, -apple-system, sans-serif',
        fontSize: 12,
        transition: 'border-color 120ms, box-shadow 120ms',
      }}
    >
      {/* Header */}
      <div
        style={{
          height: HEADER_HEIGHT,
          background: theme.gradient,
          padding: '0 10px',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          borderBottom: '1px solid rgba(0, 0, 0, 0.4)',
          flexShrink: 0,
        }}
      >
        <span
          style={{
            width: 18,
            height: 18,
            borderRadius: 3,
            background: 'rgba(0, 0, 0, 0.4)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 12,
            fontWeight: 700,
            color: theme.accent,
            flexShrink: 0,
          }}
        >
          {theme.icon}
        </span>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div
            style={{
              fontSize: 12,
              fontWeight: 600,
              lineHeight: 1.1,
              textShadow: '0 1px 0 rgba(0,0,0,0.6)',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {blueprint.title}
          </div>
          {blueprint.subtitle ? (
            <div
              style={{
                fontSize: 9.5,
                opacity: 0.7,
                lineHeight: 1.1,
                marginTop: 1,
              }}
            >
              {blueprint.subtitle}
            </div>
          ) : null}
        </div>
      </div>

      {/* Pin rows — left + right column, one row per pin */}
      <div
        style={{
          padding: `${BODY_VERT_PADDING}px 8px`,
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          columnGap: 16,
          minHeight: rows * PIN_ROW_HEIGHT,
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {left.map(pin => (
            <PinRow
              key={pin.id}
              pin={pin}
              connected={connectedSet.has(`${node.id}.${pin.id}`)}
            />
          ))}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {right.map(pin => (
            <PinRow
              key={pin.id}
              pin={pin}
              connected={connectedSet.has(`${node.id}.${pin.id}`)}
            />
          ))}
        </div>
      </div>

      {blueprint.body ? (
        <div
          style={{
            padding: '4px 12px 8px',
            fontFamily: '"JetBrains Mono", ui-monospace, monospace',
            fontSize: 11,
            color: 'rgba(220, 220, 235, 0.85)',
            background: 'rgba(0, 0, 0, 0.25)',
            borderTop: '1px solid rgba(255, 255, 255, 0.05)',
          }}
        >
          {blueprint.body}
        </div>
      ) : null}
    </div>
  );
}


// ─── Demo ──────────────────────────────────────────────────────────────────

export default function NodeGraphDemo(): React.ReactElement {
  const initial = useMemo(makeInitial, []);
  const [nodes, setNodes] = useState<NodeGraphNode[]>(initial.nodes);
  const [edges, setEdges] = useState<NodeGraphEdge[]>(initial.edges);
  const [groups, setGroups] = useState<NodeGraphGroup[]>(initial.groups);
  const [selection, setSelection] = useState<NodeGraphSelection>({
    nodes: [],
    edges: [],
    groups: [],
  });
  const ref = useRef<NodeGraphHandle>(null);
  const idSeedRef = useRef(1000);

  // Index of which `node.port` keys currently have an edge — drives the
  // "filled vs hollow" pin visual. Cheap to recompute on edges change.
  const connectedPortSet = useMemo(() => {
    const s = new Set<string>();
    for (const edge of edges) {
      s.add(`${edge.source.node}.${edge.source.port}`);
      s.add(`${edge.target.node}.${edge.target.port}`);
    }
    return s;
  }, [edges]);

  // `isValidConnection` now reads source/target dataType directly from the
  // validation info (registered by `<NodeGraph.Port>` slots) — no
  // consumer-side port index needed.
  const isValidConnection = useCallback(
    (
      _source: NodeGraphPortRef,
      _target: NodeGraphPortRef,
      info: NodeGraphConnectionValidationInfo
    ): boolean => {
      if (info.sameNode) return false;
      if (info.sideCombo !== 'right->left' && info.sideCombo !== 'left->right')
        return false;
      const src = info.sourceDataType;
      const tgt = info.targetDataType;
      if (!src || !tgt) return true;
      if (src === tgt) return true;
      if (src === 'any' || tgt === 'any') return true;
      return false;
    },
    []
  );

  const renderNode = useCallback(
    (node: NodeGraphNode, ctx: NodeGraphRenderCtx) => (
      <BlueprintNodeBody
        node={node}
        ctx={ctx}
        connectedSet={connectedPortSet}
      />
    ),
    [connectedPortSet]
  );

  // Edge styling derived from the source pin's data type — the library
  // resolves source/target port metadata from the store and hands it to
  // us, so we don't need a parallel pin index just to look up colours.
  const edgeStyle = useCallback(
    (_edge: NodeGraphEdge, ctx: NodeGraphEdgeStyleCtx) => {
      const t = ctx.sourcePort?.dataType ?? 'any';
      return { color: TYPE_COLOR[t] ?? TYPE_COLOR.any };
    },
    []
  );

  // Cascade delete (filter nodes/edges/groups + drop orphan edges +
  // clear selection) is handled by the library when `onDelete` is not
  // provided — see `applyCascadeDelete` exported from `entangle-ui`.

  // Adapt our local `NodeTemplate` array into the library's
  // `NodeGraphTemplate` shape. Each template's `build` callback returns
  // a node body (without id — library generates one) at the requested
  // world point.
  const spawnTemplates = useMemo<NodeGraphTemplate[]>(
    () =>
      TEMPLATES.map(t => ({
        id: t.id,
        title: t.title,
        ...(t.subtitle !== undefined ? { subtitle: t.subtitle } : {}),
        group: t.category,
        keywords: t.keywords ? t.keywords.split(/\s+/) : undefined,
        icon: CATEGORY_THEME[t.category]?.icon,
        build: (worldPoint: Point2D) => {
          // Library handles id assignment; we still produce the node
          // body via the existing `instantiateTemplate` helper so the
          // pin metadata stays consistent with prefab nodes.
          const seed = idSeedRef.current++;
          const draft = instantiateTemplate(
            t,
            {
              x: Math.round(worldPoint.x / 8) * 8,
              y: Math.round(worldPoint.y / 8) * 8,
            },
            seed
          );
          // Drop the id — library replaces it with a unique one.
          const { id: _id, ...rest } = draft;
          void _id;
          return rest;
        },
      })),
    []
  );

  const handleSpawn = useCallback(
    (node: NodeGraphNode) => {
      setNodes(prev => [...prev, node]);
      setSelection({ nodes: [node.id], edges: [], groups: [] });
    },
    []
  );

  const addGroupAt = useCallback((worldX: number, worldY: number) => {
    const seed = idSeedRef.current++;
    const next: NodeGraphGroup = {
      id: `group-${seed}`,
      bounds: { x: worldX - 160, y: worldY - 100, width: 320, height: 200 },
      label: 'New Group',
      color: 'rgba(120, 180, 255, 0.16)',
    };
    setGroups(prev => [...prev, next]);
    setSelection({ nodes: [], edges: [], groups: [next.id] });
  }, []);

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
            {nodes.length} nodes · {edges.length} edges · {groups.length} groups
            {selection.nodes.length + selection.groups.length > 0
              ? ` · ${selection.nodes.length + selection.groups.length} selected`
              : ''}
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
            edgeStyle={edgeStyle}
            onGroupsChange={setGroups}
            onSelectionChange={setSelection}
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
            <NodeGraph.SpawnPalette
              templates={spawnTemplates}
              onSpawn={handleSpawn}
              placeholder="Add node…"
              recentKey="nodegraph-demo-recent"
            />
          </NodeGraph>
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
            <kbd>Right-click</kbd> empty space — open search menu, add nodes or
            groups
          </span>
          <span>
            <kbd>Drag</kbd> node — move (connectors follow live)
          </span>
          <span>
            <kbd>Drag pin → pin</kbd> connect (type-matched)
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
