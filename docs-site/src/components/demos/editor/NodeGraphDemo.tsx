import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import DemoWrapper from '../DemoWrapper';
import {
  NodeGraph,
  type NodeGraphConnectionValidationInfo,
  type NodeGraphContextMenuInfo,
  type NodeGraphEdge,
  type NodeGraphGroup,
  type NodeGraphHandle,
  type NodeGraphNode,
  type NodeGraphPort,
  type NodeGraphPortRef,
  type NodeGraphPortRenderCtx,
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
  width?: number;
  height?: number;
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
    keywords: 'string text literal value constant',
  },
  {
    id: 'var-make-vector',
    title: 'Make Vector',
    subtitle: 'Pure',
    category: 'pure',
    pins: [
      data('x', 'X', 'left', 'float'),
      data('y', 'Y', 'left', 'float'),
      data('z', 'Z', 'left', 'float'),
      data('out', 'Vector', 'right', 'vector'),
    ],
    keywords: 'make vector construct xyz pure',
  },
  {
    id: 'var-break-vector',
    title: 'Break Vector',
    subtitle: 'Pure',
    category: 'pure',
    pins: [
      data('vec', 'Vector', 'left', 'vector'),
      data('x', 'X', 'right', 'float'),
      data('y', 'Y', 'right', 'float'),
      data('z', 'Z', 'right', 'float'),
    ],
    keywords: 'break vector decompose xyz pure',
  },

  // Math
  {
    id: 'math-add-float',
    title: 'Add (float)',
    subtitle: 'Math · Pure',
    category: 'pure',
    pins: [
      data('a', 'A', 'left', 'float'),
      data('b', 'B', 'left', 'float'),
      data('out', '', 'right', 'float'),
    ],
    keywords: 'add plus + float math pure',
  },
  {
    id: 'math-subtract-float',
    title: 'Subtract (float)',
    subtitle: 'Math · Pure',
    category: 'pure',
    pins: [
      data('a', 'A', 'left', 'float'),
      data('b', 'B', 'left', 'float'),
      data('out', '', 'right', 'float'),
    ],
    keywords: 'subtract minus - float math pure',
  },
  {
    id: 'math-multiply-float',
    title: 'Multiply (float)',
    subtitle: 'Math · Pure',
    category: 'pure',
    pins: [
      data('a', 'A', 'left', 'float'),
      data('b', 'B', 'left', 'float'),
      data('out', '', 'right', 'float'),
    ],
    keywords: 'multiply times * float math pure',
  },
  {
    id: 'math-less',
    title: 'Less (float)',
    subtitle: 'Math · Pure',
    category: 'pure',
    pins: [
      data('a', 'A', 'left', 'float'),
      data('b', 'B', 'left', 'float'),
      data('out', '', 'right', 'bool'),
    ],
    keywords: 'less compare < float math pure',
  },
  {
    id: 'math-clamp',
    title: 'Clamp (float)',
    subtitle: 'Math · Pure',
    category: 'pure',
    pins: [
      data('value', 'Value', 'left', 'float'),
      data('min', 'Min', 'left', 'float'),
      data('max', 'Max', 'left', 'float'),
      data('out', '', 'right', 'float'),
    ],
    keywords: 'clamp min max float math pure',
  },

  // Component / actor
  {
    id: 'get-actor-location',
    title: 'Get Actor Location',
    subtitle: 'Actor · Pure',
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

// ─── Geometry: pin offsets driven by template ──────────────────────────────

const HEADER_HEIGHT = 28;
const PIN_ROW_HEIGHT = 22;
const BODY_VERT_PADDING = 8;

/**
 * Default node size grown to fit the pin rows. Width is fixed-ish; the
 * height depends on the maximum of left vs. right pin counts.
 */
function templateSize(t: NodeTemplate): { width: number; height: number } {
  const leftCount = t.pins.filter(p => p.side === 'left').length;
  const rightCount = t.pins.filter(p => p.side === 'right').length;
  const rows = Math.max(leftCount, rightCount, 1);
  const extra = t.body ? PIN_ROW_HEIGHT : 0;
  const height =
    HEADER_HEIGHT + BODY_VERT_PADDING * 2 + rows * PIN_ROW_HEIGHT + extra;
  return { width: t.width ?? 200, height: t.height ?? height };
}

function computePortOffset(
  index: number,
  total: number,
  size: { width: number; height: number }
): number {
  // Center each pin in its row. Rows start below the header, after a top
  // padding, and are PIN_ROW_HEIGHT tall.
  const centerY =
    HEADER_HEIGHT + BODY_VERT_PADDING + (index + 0.5) * PIN_ROW_HEIGHT;
  return centerY / size.height;
}

function instantiateTemplate(
  template: NodeTemplate,
  position: { x: number; y: number },
  idSeed: number
): NodeGraphNode {
  const size = templateSize(template);
  const leftPins = template.pins.filter(p => p.side === 'left');
  const rightPins = template.pins.filter(p => p.side === 'right');

  const ports: NodeGraphPort[] = template.pins.map(pin => {
    const sidePins = pin.side === 'left' ? leftPins : rightPins;
    const idx = sidePins.indexOf(pin);
    return {
      id: pin.id,
      side: pin.side,
      offset: computePortOffset(idx, sidePins.length, size),
      dataType: pin.dataType,
      label: pin.label,
    };
  });

  const data: BlueprintNodeData = {
    templateId: template.id,
    title: template.title,
    subtitle: template.subtitle,
    category: template.category,
    pins: template.pins,
    body: template.body,
  };

  return {
    id: `${template.id}-${idSeed}`,
    position,
    width: size.width,
    height: size.height,
    ports,
    data,
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

// ─── Pin / port renderer (UE5 style) ───────────────────────────────────────

function PortVisual({
  port,
  ctx,
  connected,
}: {
  port: NodeGraphPort;
  ctx: NodeGraphPortRenderCtx;
  connected: boolean;
}): React.ReactElement {
  const type = (port.dataType ?? 'any') as DataType;
  const color = TYPE_COLOR[type] ?? TYPE_COLOR.any;
  const isExec = type === 'exec';
  const active = ctx.isSource || ctx.isCandidate || ctx.isHovered;
  const fillColor = ctx.isInvalid
    ? 'rgba(220, 38, 38, 0.95)'
    : connected || active
      ? color
      : 'transparent';
  const strokeColor = ctx.isInvalid ? 'rgba(220, 38, 38, 0.95)' : color;
  const scale = active ? 1.15 : 1;
  const size = isExec ? 16 : 14;

  if (isExec) {
    // Exec triangle pointing in the flow direction.
    const points =
      port.side === 'left' || port.side === 'right'
        ? '2,2 14,8 2,14'
        : '2,2 8,14 14,2';
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 16 16"
        style={{
          display: 'block',
          transform: `scale(${scale})`,
          transition: 'transform 80ms',
          filter: active ? `drop-shadow(0 0 4px ${color})` : undefined,
        }}
        aria-hidden="true"
      >
        <polygon
          points={points}
          fill={fillColor}
          stroke={strokeColor}
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
        background: fillColor,
        border: `2px solid ${strokeColor}`,
        boxSizing: 'border-box',
        transform: `scale(${scale})`,
        transition: 'transform 80ms',
        boxShadow: active ? `0 0 6px ${color}` : undefined,
      }}
      aria-hidden="true"
    />
  );
}

// ─── Node body (UE5 layout, slightly transparent) ──────────────────────────

function BlueprintNodeBody({
  node,
  ctx,
  connectedSet,
}: {
  node: NodeGraphNode;
  ctx: NodeGraphRenderCtx;
  connectedSet: Set<string>;
}): React.ReactElement {
  const data = node.data as BlueprintNodeData;
  const theme = CATEGORY_THEME[data.category];
  const left = data.pins.filter(p => p.side === 'left');
  const right = data.pins.filter(p => p.side === 'right');

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
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
            {data.title}
          </div>
          {data.subtitle ? (
            <div
              style={{
                fontSize: 9.5,
                opacity: 0.7,
                lineHeight: 1.1,
                marginTop: 1,
              }}
            >
              {data.subtitle}
            </div>
          ) : null}
        </div>
      </div>

      {/* Pin label rows — two columns, one row per pin */}
      <div
        style={{
          flex: 1,
          padding: `${BODY_VERT_PADDING}px 14px`,
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          columnGap: 16,
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {left.map(pin => {
            const isConnected = connectedSet.has(`${node.id}.${pin.id}`);
            return (
              <div
                key={pin.id}
                style={{
                  height: PIN_ROW_HEIGHT,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  fontSize: 11,
                  color: isConnected
                    ? 'rgba(235, 235, 245, 0.95)'
                    : 'rgba(200, 200, 215, 0.78)',
                }}
              >
                <span
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: '50%',
                    background: TYPE_COLOR[pin.dataType] ?? TYPE_COLOR.any,
                    flexShrink: 0,
                  }}
                />
                {pin.label || (pin.dataType === 'exec' ? '►' : ' ')}
              </div>
            );
          })}
        </div>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-end',
          }}
        >
          {right.map(pin => {
            const isConnected = connectedSet.has(`${node.id}.${pin.id}`);
            return (
              <div
                key={pin.id}
                style={{
                  height: PIN_ROW_HEIGHT,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  fontSize: 11,
                  color: isConnected
                    ? 'rgba(235, 235, 245, 0.95)'
                    : 'rgba(200, 200, 215, 0.78)',
                  textAlign: 'right',
                }}
              >
                {pin.label || (pin.dataType === 'exec' ? '►' : ' ')}
                <span
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: '50%',
                    background: TYPE_COLOR[pin.dataType] ?? TYPE_COLOR.any,
                    flexShrink: 0,
                  }}
                />
              </div>
            );
          })}
        </div>
      </div>

      {data.body ? (
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
          {data.body}
        </div>
      ) : null}
    </div>
  );
}

// ─── Connection validation ─────────────────────────────────────────────────

function buildPortIndex(
  nodes: ReadonlyArray<NodeGraphNode>
): Map<string, BlueprintPin> {
  const m = new Map<string, BlueprintPin>();
  for (const node of nodes) {
    const d = node.data as BlueprintNodeData | undefined;
    if (!d) continue;
    for (const pin of d.pins) {
      m.set(`${node.id}.${pin.id}`, pin);
    }
  }
  return m;
}

// ─── Add-node context menu ─────────────────────────────────────────────────

interface ContextMenuState {
  screenX: number;
  screenY: number;
  worldX: number;
  worldY: number;
}

function ContextMenu({
  state,
  onSpawn,
  onAddGroup,
  onClose,
}: {
  state: ContextMenuState;
  onSpawn: (template: NodeTemplate) => void;
  onAddGroup: () => void;
  onClose: () => void;
}): React.ReactElement {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const t = setTimeout(() => inputRef.current?.focus(), 16);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onClose();
      }
    };
    const onClick = (e: MouseEvent): void => {
      const t = e.target as Element | null;
      if (!t?.closest('[data-ng-context-menu]')) onClose();
    };
    window.addEventListener('keydown', onKey);
    window.addEventListener('mousedown', onClick);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('mousedown', onClick);
    };
  }, [onClose]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return TEMPLATES;
    return TEMPLATES.filter(t => {
      const haystack =
        `${t.title} ${t.subtitle ?? ''} ${t.category} ${t.keywords ?? ''}`.toLowerCase();
      return haystack.includes(q);
    });
  }, [query]);

  return (
    <div
      data-ng-context-menu
      style={{
        position: 'absolute',
        left: state.screenX,
        top: state.screenY,
        zIndex: 50,
        width: 280,
        maxHeight: 400,
        background: 'rgba(20, 22, 28, 0.97)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: 6,
        boxShadow: '0 12px 32px rgba(0, 0, 0, 0.6)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        backdropFilter: 'blur(6px)',
        fontFamily: '"Segoe UI", system-ui, sans-serif',
      }}
      onPointerDown={e => e.stopPropagation()}
      onContextMenu={e => e.preventDefault()}
    >
      <div
        style={{
          padding: '8px 10px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          flexDirection: 'column',
          gap: 6,
        }}
      >
        <div
          style={{
            fontSize: 10,
            letterSpacing: 0.6,
            textTransform: 'uppercase',
            color: 'rgba(200, 200, 215, 0.6)',
            fontWeight: 600,
          }}
        >
          All Actions for this Blueprint
        </div>
        <input
          ref={inputRef}
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search…"
          style={{
            background: 'rgba(0, 0, 0, 0.4)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: 3,
            padding: '4px 8px',
            color: 'white',
            fontSize: 12,
            outline: 'none',
          }}
        />
      </div>
      <div style={{ overflowY: 'auto', maxHeight: 320 }}>
        <button
          type="button"
          onClick={() => {
            onAddGroup();
            onClose();
          }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            width: '100%',
            background: 'transparent',
            border: 'none',
            color: 'rgba(255, 215, 130, 0.95)',
            padding: '8px 10px',
            cursor: 'pointer',
            textAlign: 'left',
            fontSize: 12,
            borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
          }}
        >
          <span style={{ width: 14, textAlign: 'center' }}>▭</span>
          Add Comment Group
        </button>
        {filtered.length === 0 ? (
          <div
            style={{
              padding: '12px 10px',
              fontSize: 12,
              color: 'rgba(200, 200, 215, 0.6)',
            }}
          >
            No matching actions.
          </div>
        ) : (
          filtered.map(t => {
            const theme = CATEGORY_THEME[t.category];
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => {
                  onSpawn(t);
                  onClose();
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  width: '100%',
                  background: 'transparent',
                  border: 'none',
                  color: 'rgba(235, 235, 245, 0.95)',
                  padding: '6px 10px',
                  cursor: 'pointer',
                  textAlign: 'left',
                  fontSize: 12,
                }}
                onMouseEnter={e =>
                  (e.currentTarget.style.background = 'rgba(255,255,255,0.06)')
                }
                onMouseLeave={e =>
                  (e.currentTarget.style.background = 'transparent')
                }
              >
                <span
                  style={{
                    width: 14,
                    textAlign: 'center',
                    color: theme.accent,
                    fontSize: 11,
                    fontWeight: 700,
                  }}
                >
                  {theme.icon}
                </span>
                <span style={{ minWidth: 0, flex: 1 }}>
                  <div
                    style={{
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {t.title}
                  </div>
                  {t.subtitle ? (
                    <div
                      style={{
                        fontSize: 10,
                        opacity: 0.6,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {t.subtitle}
                    </div>
                  ) : null}
                </span>
              </button>
            );
          })
        )}
      </div>
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
  const [menu, setMenu] = useState<ContextMenuState | null>(null);
  const ref = useRef<NodeGraphHandle>(null);
  const idSeedRef = useRef(1000);

  const portIndex = useMemo(() => buildPortIndex(nodes), [nodes]);
  const connectedPortSet = useMemo(() => {
    const s = new Set<string>();
    for (const edge of edges) {
      s.add(`${edge.source.node}.${edge.source.port}`);
      s.add(`${edge.target.node}.${edge.target.port}`);
    }
    return s;
  }, [edges]);

  const isValidConnection = useCallback(
    (
      source: NodeGraphPortRef,
      target: NodeGraphPortRef,
      info: NodeGraphConnectionValidationInfo
    ): boolean => {
      if (info.sameNode) return false;
      if (info.sideCombo !== 'right->left' && info.sideCombo !== 'left->right')
        return false;
      const sp = portIndex.get(`${source.node}.${source.port}`);
      const tp = portIndex.get(`${target.node}.${target.port}`);
      if (!sp || !tp) return true;
      if (sp.dataType === tp.dataType) return true;
      if (sp.dataType === 'any' || tp.dataType === 'any') return true;
      return false;
    },
    [portIndex]
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

  const renderPort = useCallback(
    (port: NodeGraphPort, node: NodeGraphNode, ctx: NodeGraphPortRenderCtx) => (
      <PortVisual
        port={port}
        ctx={ctx}
        connected={connectedPortSet.has(`${node.id}.${port.id}`)}
      />
    ),
    [connectedPortSet]
  );

  const renderEdgeLabel = useCallback(
    (edge: NodeGraphEdge) => {
      const sp = portIndex.get(`${edge.source.node}.${edge.source.port}`);
      if (!sp || sp.dataType === 'exec') return null;
      const color = TYPE_COLOR[sp.dataType] ?? TYPE_COLOR.any;
      return (
        <span
          style={{
            display: 'inline-flex',
            padding: '1px 6px',
            background: 'rgba(15, 17, 22, 0.95)',
            border: `1px solid ${color}`,
            borderRadius: 999,
            fontSize: 9,
            fontFamily: '"Segoe UI", sans-serif',
            color,
            letterSpacing: 0.4,
            textTransform: 'uppercase',
            whiteSpace: 'nowrap',
            pointerEvents: 'none',
          }}
        >
          {sp.dataType}
        </span>
      );
    },
    [portIndex]
  );

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
    setGroups(prev => prev.filter(g => !sel.groups.includes(g.id)));
    setSelection({ nodes: [], edges: [], groups: [] });
  }, []);

  const spawnFromTemplate = useCallback(
    (template: NodeTemplate, worldX: number, worldY: number) => {
      const seed = idSeedRef.current++;
      const node = instantiateTemplate(
        template,
        { x: Math.round(worldX / 8) * 8, y: Math.round(worldY / 8) * 8 },
        seed
      );
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

  const handleContextMenu = useCallback((info: NodeGraphContextMenuInfo) => {
    // Only show the spawn-search menu when the click is on empty background
    // or on a group body (so users can replace / add new groups there too).
    if (info.target.kind !== 'empty' && info.target.kind !== 'group') return;
    setMenu({
      screenX: info.screenPoint.x,
      screenY: info.screenPoint.y,
      worldX: info.worldPoint.x,
      worldY: info.worldPoint.y,
    });
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
            disabled={
              selection.nodes.length === 0 && selection.groups.length === 0
            }
          >
            Fit selection
          </Button>
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
            + Add group
          </Button>
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
            onGroupsChange={setGroups}
            onSelectionChange={setSelection}
            onDelete={handleDelete}
            onContextMenu={handleContextMenu}
            renderNode={renderNode}
            renderPort={renderPort}
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
          {menu ? (
            <ContextMenu
              state={menu}
              onSpawn={t => spawnFromTemplate(t, menu.worldX, menu.worldY)}
              onAddGroup={() => addGroupAt(menu.worldX, menu.worldY)}
              onClose={() => setMenu(null)}
            />
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
