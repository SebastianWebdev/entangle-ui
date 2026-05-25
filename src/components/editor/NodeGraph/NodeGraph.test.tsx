import React, { useRef, useEffect } from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';
import { renderWithTheme } from '@/tests/testUtils';
import { NodeGraph } from './NodeGraph';
import type {
  NodeGraphConnectEndInfo,
  NodeGraphContextMenuInfo,
  NodeGraphGroup,
  NodeGraphHandle,
  NodeGraphNode,
  NodeGraphEdge,
  NodeGraphSelection,
} from './NodeGraph.types';

import '@/theme/darkTheme.css';

// ─── PointerEvent polyfill (jsdom lacks PointerEvent) ───

class MockPointerEvent extends MouseEvent {
  readonly pointerId: number;
  readonly width: number;
  readonly height: number;
  readonly pressure: number;
  readonly tiltX: number;
  readonly tiltY: number;
  readonly pointerType: string;
  readonly isPrimary: boolean;

  constructor(type: string, params: PointerEventInit & MouseEventInit = {}) {
    super(type, { bubbles: true, ...params });
    this.pointerId = params.pointerId ?? 0;
    this.width = params.width ?? 1;
    this.height = params.height ?? 1;
    this.pressure = params.pressure ?? 0;
    this.tiltX = params.tiltX ?? 0;
    this.tiltY = params.tiltY ?? 0;
    this.pointerType = params.pointerType ?? 'mouse';
    this.isPrimary = params.isPrimary ?? true;
  }
}

globalThis.PointerEvent = MockPointerEvent as unknown as typeof PointerEvent;

// ─── Canvas mock ───

type MockCtx = Record<string, ReturnType<typeof vi.fn> | string | number>;

function createMockCanvasContext(): MockCtx {
  return {
    fillRect: vi.fn(),
    clearRect: vi.fn(),
    strokeRect: vi.fn(),
    beginPath: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    stroke: vi.fn(),
    fill: vi.fn(),
    arc: vi.fn(),
    closePath: vi.fn(),
    rect: vi.fn(),
    clip: vi.fn(),
    scale: vi.fn(),
    setTransform: vi.fn(),
    save: vi.fn(),
    restore: vi.fn(),
    bezierCurveTo: vi.fn(),
    fillText: vi.fn(),
    setLineDash: vi.fn(),
    strokeStyle: '#000',
    fillStyle: '#000',
    lineWidth: 1,
    lineCap: 'butt',
    font: '10px sans-serif',
    textBaseline: 'alphabetic',
    globalAlpha: 1,
  };
}

let mockCtx: MockCtx;

beforeEach(() => {
  mockCtx = createMockCanvasContext();
  HTMLCanvasElement.prototype.getContext = vi.fn(
    () => mockCtx
  ) as unknown as typeof HTMLCanvasElement.prototype.getContext;

  HTMLElement.prototype.setPointerCapture = vi.fn();
  HTMLElement.prototype.releasePointerCapture = vi.fn();
  HTMLElement.prototype.hasPointerCapture = vi.fn(() => true);

  vi.spyOn(window, 'requestAnimationFrame').mockImplementation(cb => {
    cb(0);
    return 0;
  });
});

// ─── Helpers ───

const baseNodes: NodeGraphNode[] = [
  { id: 'n1', position: { x: 100, y: 100 }, width: 80, height: 40 },
  { id: 'n2', position: { x: 300, y: 100 }, width: 80, height: 40 },
];

const baseEdges: NodeGraphEdge[] = [
  {
    id: 'e1',
    source: { node: 'n1', port: 'out' },
    target: { node: 'n2', port: 'in' },
  },
];

/**
 * Default renderNode used by tests — renders a minimal body with two ports
 * (`in` on the left, `out` on the right). Mirrors the simple two-port
 * topology the old tests assumed when nodes had a `ports` field.
 */
function renderTestNode(): React.ReactNode {
  return (
    <div data-testid="node-body">
      <NodeGraph.Port id="in" side="left" />
      <NodeGraph.Port id="out" side="right" />
    </div>
  );
}

// ─── Rendering ───

describe('NodeGraph — Rendering', () => {
  it('renders without crashing with default props', () => {
    renderWithTheme(<NodeGraph testId="nodegraph" />);
    expect(screen.getByTestId('nodegraph')).toBeInTheDocument();
  });

  it('renders nodes from defaultNodes', () => {
    renderWithTheme(
      <NodeGraph
        testId="nodegraph"
        defaultNodes={baseNodes}
        renderNode={renderTestNode}
      />
    );
    expect(document.querySelector('[data-node-id="n1"]')).toBeInTheDocument();
    expect(document.querySelector('[data-node-id="n2"]')).toBeInTheDocument();
  });

  it('renders ports on each node', () => {
    renderWithTheme(
      <NodeGraph
        testId="nodegraph"
        defaultNodes={baseNodes}
        renderNode={renderTestNode}
      />
    );
    expect(
      document.querySelectorAll('[data-node-id="n1"][data-port-id]')
    ).toHaveLength(2);
  });

  it('renders custom node content via renderNode', () => {
    renderWithTheme(
      <NodeGraph
        testId="nodegraph"
        defaultNodes={baseNodes}
        renderNode={node => <div data-testid={`custom-${node.id}`}>Custom</div>}
      />
    );
    expect(screen.getByTestId('custom-n1')).toBeInTheDocument();
    expect(screen.getByTestId('custom-n2')).toBeInTheDocument();
  });

  it('applies the supplied aria-label to the underlying viewport', () => {
    renderWithTheme(<NodeGraph testId="nodegraph" ariaLabel="My pipeline" />);
    expect(
      document.querySelector('[aria-label="My pipeline"]')
    ).toBeInTheDocument();
  });

  it('renders the minimap slot when provided', () => {
    renderWithTheme(
      <NodeGraph
        testId="nodegraph"
        defaultNodes={baseNodes}
        renderNode={renderTestNode}
      >
        <NodeGraph.Minimap />
      </NodeGraph>
    );
    // <Minimap> renders a body div with role="region".
    expect(
      document.querySelector('[role="region"][aria-label="Minimap"]')
    ).toBeInTheDocument();
  });
});

// ─── Port slot ───

describe('NodeGraph — <NodeGraph.Port>', () => {
  it('renders one DOM element per slot with the correct data attrs', () => {
    renderWithTheme(
      <NodeGraph
        testId="nodegraph"
        defaultNodes={baseNodes}
        renderNode={() => (
          <div data-testid="body">
            <NodeGraph.Port id="exec" side="left" dataType="exec" />
            <NodeGraph.Port id="value" side="right" dataType="float" />
          </div>
        )}
      />
    );
    const ports = document.querySelectorAll('[data-port-id]');
    // Two slots × two nodes = four port elements total.
    expect(ports).toHaveLength(4);
    const exec = document.querySelector(
      '[data-node-id="n1"][data-port-id="exec"]'
    );
    expect(exec).toHaveAttribute('data-port-side', 'left');
    expect(exec).toHaveAttribute('data-port-data-type', 'exec');
  });

  it('throws when rendered outside renderNode', () => {
    // The slot reads NodeGraphNodeContext from React context — using it
    // outside <NodeGraph> would mean the context is missing.
    const original = console.error;
    console.error = vi.fn();
    expect(() =>
      renderWithTheme(<NodeGraph.Port id="x" side="left" />)
    ).toThrow(/<NodeGraph.Port>/);
    console.error = original;
  });

  it('renders consumer-supplied children as the visual', () => {
    renderWithTheme(
      <NodeGraph
        testId="nodegraph"
        defaultNodes={baseNodes}
        renderNode={() => (
          <NodeGraph.Port id="exec" side="left" dataType="exec">
            <span data-testid="pin-visual">●</span>
          </NodeGraph.Port>
        )}
      />
    );
    expect(screen.getAllByTestId('pin-visual')).toHaveLength(2);
  });
});

// ─── Controlled state ───

describe('NodeGraph — Controlled state', () => {
  it('reflects the controlled `nodes` prop', () => {
    renderWithTheme(
      <NodeGraph
        testId="nodegraph"
        nodes={baseNodes}
        renderNode={renderTestNode}
      />
    );
    expect(
      document.querySelectorAll('[data-node-id]:not([data-port-id])')
    ).toHaveLength(2);
  });

  it('does not mutate internal state when controlled', () => {
    const onNodesChange = vi.fn();
    const { rerender } = renderWithTheme(
      <NodeGraph
        testId="nodegraph"
        nodes={baseNodes}
        renderNode={renderTestNode}
        onNodesChange={onNodesChange}
      />
    );
    const firstNode = baseNodes[0];
    if (!firstNode) throw new Error('baseNodes[0] must exist');
    rerender(
      <NodeGraph
        testId="nodegraph"
        nodes={[firstNode]}
        onNodesChange={onNodesChange}
      />
    );
    expect(
      document.querySelectorAll('[data-node-id]:not([data-port-id])')
    ).toHaveLength(1);
  });
});

// ─── Selection ───

describe('NodeGraph — Selection', () => {
  it('selects a node on plain pointer click', () => {
    const onSelectionChange = vi.fn();
    renderWithTheme(
      <NodeGraph
        testId="nodegraph"
        defaultNodes={baseNodes}
        renderNode={renderTestNode}
        onSelectionChange={onSelectionChange}
      />
    );
    const node = document.querySelector('[data-node-id="n1"]') as HTMLElement;
    fireEvent.pointerDown(node, { pointerId: 1, button: 0 });
    fireEvent.pointerUp(node, { pointerId: 1, button: 0 });
    expect(onSelectionChange).toHaveBeenCalledWith(
      expect.objectContaining({ nodes: ['n1'] })
    );
  });

  it('toggles selection on additive click', () => {
    let captured: NodeGraphSelection | null = null;
    const onSelectionChange = (sel: NodeGraphSelection): void => {
      captured = sel;
    };
    renderWithTheme(
      <NodeGraph
        testId="nodegraph"
        defaultNodes={baseNodes}
        renderNode={renderTestNode}
        defaultSelection={{ nodes: ['n1'], edges: [], groups: [] }}
        onSelectionChange={onSelectionChange}
      />
    );
    const node2 = document.querySelector('[data-node-id="n2"]') as HTMLElement;
    fireEvent.pointerDown(node2, {
      pointerId: 1,
      button: 0,
      shiftKey: true,
    });
    fireEvent.pointerUp(node2, {
      pointerId: 1,
      button: 0,
      shiftKey: true,
    });
    const sel = captured as unknown as NodeGraphSelection | null;
    expect(sel).not.toBeNull();
    expect(sel?.nodes).toContain('n1');
    expect(sel?.nodes).toContain('n2');
  });

  it('respects selectable: false on the node', () => {
    const onSelectionChange = vi.fn();
    const firstNode = baseNodes[0];
    if (!firstNode) throw new Error('baseNodes[0] must exist');
    const nodes: NodeGraphNode[] = [
      { ...firstNode, selectable: false, draggable: false },
    ];
    renderWithTheme(
      <NodeGraph
        testId="nodegraph"
        defaultNodes={nodes}
        onSelectionChange={onSelectionChange}
      />
    );
    const node = document.querySelector('[data-node-id="n1"]') as HTMLElement;
    fireEvent.pointerDown(node, { pointerId: 1, button: 0 });
    fireEvent.pointerUp(node, { pointerId: 1, button: 0 });
    expect(onSelectionChange).not.toHaveBeenCalled();
  });
});

// ─── Keyboard navigation ───

describe('NodeGraph — Keyboard', () => {
  it('selects all nodes on Cmd/Ctrl+A', () => {
    const onSelectionChange = vi.fn();
    renderWithTheme(
      <NodeGraph
        testId="nodegraph"
        defaultNodes={baseNodes}
        renderNode={renderTestNode}
        onSelectionChange={onSelectionChange}
      />
    );
    const root = screen.getByTestId('nodegraph');
    // `code: 'KeyA'` matches the physical A key independent of layout;
    // jsdom doesn't infer it from `key`, so pass it explicitly.
    fireEvent.keyDown(root, { key: 'a', code: 'KeyA', metaKey: true });
    expect(onSelectionChange).toHaveBeenCalledWith({
      nodes: ['n1', 'n2'],
      edges: [],
      groups: [],
    });
  });

  it('clears selection on Escape', () => {
    const onSelectionChange = vi.fn();
    renderWithTheme(
      <NodeGraph
        testId="nodegraph"
        defaultNodes={baseNodes}
        renderNode={renderTestNode}
        defaultSelection={{ nodes: ['n1'], edges: [], groups: [] }}
        onSelectionChange={onSelectionChange}
      />
    );
    const root = screen.getByTestId('nodegraph');
    fireEvent.keyDown(root, { key: 'Escape', code: 'Escape' });
    expect(onSelectionChange).toHaveBeenCalledWith({
      nodes: [],
      edges: [],
      groups: [],
    });
  });

  it('emits onDelete with the current selection', () => {
    const onDelete = vi.fn();
    renderWithTheme(
      <NodeGraph
        testId="nodegraph"
        defaultNodes={baseNodes}
        renderNode={renderTestNode}
        defaultSelection={{ nodes: ['n1'], edges: [], groups: [] }}
        onDelete={onDelete}
      />
    );
    const root = screen.getByTestId('nodegraph');
    fireEvent.keyDown(root, { key: 'Delete', code: 'Delete' });
    expect(onDelete).toHaveBeenCalledWith({
      nodes: ['n1'],
      edges: [],
      groups: [],
    });
  });

  it('cascades delete by default (no onDelete): drops nodes, orphan edges, selection', () => {
    const onNodesChange = vi.fn();
    const onEdgesChange = vi.fn();
    const onSelectionChange = vi.fn();
    renderWithTheme(
      <NodeGraph
        testId="nodegraph"
        defaultNodes={baseNodes}
        defaultEdges={baseEdges}
        renderNode={renderTestNode}
        defaultSelection={{ nodes: ['n1'], edges: [], groups: [] }}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onSelectionChange={onSelectionChange}
      />
    );
    const root = screen.getByTestId('nodegraph');
    fireEvent.keyDown(root, { key: 'Delete', code: 'Delete' });
    // n1 removed, e1 (n1→n2) is now orphan → dropped, selection cleared.
    expect(onNodesChange).toHaveBeenCalledWith([
      expect.objectContaining({ id: 'n2' }),
    ]);
    expect(onEdgesChange).toHaveBeenCalledWith([]);
    expect(onSelectionChange).toHaveBeenCalledWith({
      nodes: [],
      edges: [],
      groups: [],
    });
  });

  it('nudges selected nodes with arrow keys', () => {
    let captured: NodeGraphNode[] | null = null;
    const onNodesChange = (next: NodeGraphNode[]): void => {
      captured = next;
    };
    renderWithTheme(
      <NodeGraph
        testId="nodegraph"
        defaultNodes={baseNodes}
        renderNode={renderTestNode}
        defaultSelection={{ nodes: ['n1'], edges: [], groups: [] }}
        onNodesChange={onNodesChange}
        snapToGrid={10}
      />
    );
    const root = screen.getByTestId('nodegraph');
    fireEvent.keyDown(root, { key: 'ArrowRight', code: 'ArrowRight' });
    expect(captured).not.toBeNull();
    const updated = captured as unknown as NodeGraphNode[] | null;
    expect(updated?.find(n => n.id === 'n1')?.position.x).toBe(110);
  });

  it('skips keyboard handling when focus is inside an input', () => {
    const onSelectionChange = vi.fn();
    renderWithTheme(
      <NodeGraph
        testId="nodegraph"
        defaultNodes={baseNodes}
        onSelectionChange={onSelectionChange}
        renderNode={() => <input data-testid="node-input" />}
      />
    );
    const inputs = screen.getAllByTestId('node-input');
    const input = inputs[0];
    if (!input) throw new Error('node-input expected');
    fireEvent.keyDown(input, { key: 'a', code: 'KeyA', metaKey: true });
    expect(onSelectionChange).not.toHaveBeenCalled();
  });
});

// ─── Context menu ───

describe('NodeGraph — Context menu', () => {
  it('emits onContextMenu with target=node for a right-click on a node', () => {
    let captured: NodeGraphContextMenuInfo | null = null;
    const onContextMenu = (info: NodeGraphContextMenuInfo): void => {
      captured = info;
    };
    renderWithTheme(
      <NodeGraph
        testId="nodegraph"
        defaultNodes={baseNodes}
        renderNode={renderTestNode}
        onContextMenu={onContextMenu}
      />
    );
    const node = document.querySelector('[data-node-id="n1"]') as HTMLElement;
    fireEvent.contextMenu(node);
    expect(captured).not.toBeNull();
    const arg = captured as unknown as NodeGraphContextMenuInfo | null;
    expect(arg?.target.kind).toBe('node');
    if (arg?.target.kind === 'node') {
      expect(arg.target.id).toBe('n1');
    }
  });

  it('emits onContextMenu with target=port for a right-click on a port', () => {
    let captured: NodeGraphContextMenuInfo | null = null;
    const onContextMenu = (info: NodeGraphContextMenuInfo): void => {
      captured = info;
    };
    renderWithTheme(
      <NodeGraph
        testId="nodegraph"
        defaultNodes={baseNodes}
        renderNode={renderTestNode}
        onContextMenu={onContextMenu}
      />
    );
    const port = document.querySelector(
      '[data-node-id="n1"][data-port-id="out"]'
    ) as HTMLElement;
    fireEvent.contextMenu(port);
    expect(captured).not.toBeNull();
    const arg = captured as unknown as NodeGraphContextMenuInfo | null;
    expect(arg?.target.kind).toBe('port');
    if (arg?.target.kind === 'port') {
      expect(arg.target.node).toBe('n1');
      expect(arg.target.port).toBe('out');
    }
  });
});

// ─── Imperative handle ───

describe('NodeGraph — Imperative handle', () => {
  it('exposes fitToContent, focusNode, getTransform, etc.', () => {
    const slot: { current: NodeGraphHandle | null } = { current: null };
    const Capture = (): React.ReactElement => {
      const ref = useRef<NodeGraphHandle>(null);
      useEffect(() => {
        slot.current = ref.current;
      }, []);
      return (
        <NodeGraph
          ref={ref}
          testId="nodegraph"
          defaultNodes={baseNodes}
          renderNode={renderTestNode}
          defaultEdges={baseEdges}
        />
      );
    };
    renderWithTheme(<Capture />);
    expect(slot.current).not.toBeNull();
    expect(typeof slot.current?.fitToContent).toBe('function');
    expect(typeof slot.current?.fitToSelection).toBe('function');
    expect(typeof slot.current?.focusNode).toBe('function');
    expect(typeof slot.current?.centerOn).toBe('function');
    expect(typeof slot.current?.getTransform).toBe('function');
    expect(typeof slot.current?.getSize).toBe('function');
    expect(typeof slot.current?.worldToScreen).toBe('function');
    expect(typeof slot.current?.screenToWorld).toBe('function');
    expect(typeof slot.current?.invalidate).toBe('function');
  });

  it('worldToScreen and screenToWorld round-trip correctly', () => {
    const slot: { current: NodeGraphHandle | null } = { current: null };
    const Capture = (): React.ReactElement => {
      const ref = useRef<NodeGraphHandle>(null);
      useEffect(() => {
        slot.current = ref.current;
      }, []);
      return <NodeGraph ref={ref} testId="nodegraph" />;
    };
    renderWithTheme(<Capture />);
    expect(slot.current).not.toBeNull();
    const captured = slot.current;
    if (!captured) throw new Error('handle expected');
    const point = { x: 42, y: -17 };
    const screenPoint = captured.worldToScreen(point);
    const back = captured.screenToWorld(screenPoint);
    expect(back.x).toBeCloseTo(point.x);
    expect(back.y).toBeCloseTo(point.y);
  });
});

// ─── Connection drag ───

describe('NodeGraph — Connections', () => {
  it('emits a new edge when the connection drag drops on a valid port', () => {
    let capturedEdges: NodeGraphEdge[] | null = null;
    let capturedEnd: NodeGraphConnectEndInfo | null = null;
    const onEdgesChange = (next: NodeGraphEdge[]): void => {
      capturedEdges = next;
    };
    const onConnectEnd = (info: NodeGraphConnectEndInfo): void => {
      capturedEnd = info;
    };
    renderWithTheme(
      <NodeGraph
        testId="nodegraph"
        defaultNodes={baseNodes}
        renderNode={renderTestNode}
        onEdgesChange={onEdgesChange}
        onConnectEnd={onConnectEnd}
      />
    );
    const sourcePort = document.querySelector(
      '[data-node-id="n1"][data-port-id="out"]'
    ) as HTMLElement;
    const targetPort = document.querySelector(
      '[data-node-id="n2"][data-port-id="in"]'
    ) as HTMLElement;

    fireEvent.pointerDown(sourcePort, {
      pointerId: 5,
      button: 0,
      clientX: 200,
      clientY: 120,
    });

    // The connection drag uses document.elementFromPoint to find the drop
    // candidate — jsdom lacks it, so install a stub for the duration of the
    // test.
    document.elementFromPoint = vi.fn(
      () => targetPort
    ) as unknown as typeof document.elementFromPoint;

    fireEvent(
      document,
      new MockPointerEvent('pointerup', {
        pointerId: 5,
        button: 0,
        clientX: 380,
        clientY: 120,
      })
    );

    const next = capturedEdges as unknown as NodeGraphEdge[] | null;
    expect(next).not.toBeNull();
    expect(next).toHaveLength(1);
    expect(next?.[0]?.source).toEqual({ node: 'n1', port: 'out' });
    expect(next?.[0]?.target).toEqual({ node: 'n2', port: 'in' });
    const endInfo = capturedEnd as unknown as NodeGraphConnectEndInfo | null;
    expect(endInfo).not.toBeNull();
    expect(endInfo?.cancelled).toBe(false);
  });

  it('cancels the drop when isValidConnection returns false', () => {
    let capturedEdges: NodeGraphEdge[] | null = null;
    let capturedEnd: NodeGraphConnectEndInfo | null = null;
    const onEdgesChange = (next: NodeGraphEdge[]): void => {
      capturedEdges = next;
    };
    const onConnectEnd = (info: NodeGraphConnectEndInfo): void => {
      capturedEnd = info;
    };
    renderWithTheme(
      <NodeGraph
        testId="nodegraph"
        defaultNodes={baseNodes}
        renderNode={renderTestNode}
        onEdgesChange={onEdgesChange}
        onConnectEnd={onConnectEnd}
        isValidConnection={() => false}
      />
    );
    const sourcePort = document.querySelector(
      '[data-node-id="n1"][data-port-id="out"]'
    ) as HTMLElement;
    const targetPort = document.querySelector(
      '[data-node-id="n2"][data-port-id="in"]'
    ) as HTMLElement;

    fireEvent.pointerDown(sourcePort, {
      pointerId: 5,
      button: 0,
      clientX: 200,
      clientY: 120,
    });

    document.elementFromPoint = vi.fn(
      () => targetPort
    ) as unknown as typeof document.elementFromPoint;

    fireEvent(
      document,
      new MockPointerEvent('pointerup', {
        pointerId: 5,
        button: 0,
        clientX: 380,
        clientY: 120,
      })
    );

    expect(capturedEdges).toBeNull();
    const endInfo = capturedEnd as unknown as NodeGraphConnectEndInfo | null;
    expect(endInfo).not.toBeNull();
    expect(endInfo?.cancelled).toBe(true);
  });
});

// ─── Slot detection ───

describe('NodeGraph — Slots', () => {
  it('detects <NodeGraph.Minimap /> via the Symbol marker even after React.memo', () => {
    const MemoMinimap = React.memo(NodeGraph.Minimap);
    // We have to copy the Symbol over for the marker to survive memoization.
    Object.assign(MemoMinimap, {
      [Symbol.for('etui.nodegraph.slot')]: 'minimap',
    });
    renderWithTheme(
      <NodeGraph
        testId="nodegraph"
        defaultNodes={baseNodes}
        renderNode={renderTestNode}
      >
        <MemoMinimap />
      </NodeGraph>
    );
    expect(
      document.querySelector('[role="region"][aria-label="Minimap"]')
    ).toBeInTheDocument();
  });
});

// ─── Disabled ───

describe('NodeGraph — Disabled state', () => {
  it('skips selection when disabled', () => {
    const onSelectionChange = vi.fn();
    renderWithTheme(
      <NodeGraph
        testId="nodegraph"
        defaultNodes={baseNodes}
        renderNode={renderTestNode}
        disabled
        onSelectionChange={onSelectionChange}
      />
    );
    const node = document.querySelector('[data-node-id="n1"]') as HTMLElement;
    fireEvent.pointerDown(node, { pointerId: 1, button: 0 });
    fireEvent.pointerUp(node, { pointerId: 1, button: 0 });
    expect(onSelectionChange).not.toHaveBeenCalled();
  });
});

// ─── Groups ───

const baseGroup: NodeGraphGroup = {
  id: 'g1',
  bounds: { x: 50, y: 50, width: 200, height: 120 },
  label: 'Group A',
};

describe('NodeGraph — Groups', () => {
  it('renders one overlay per group', () => {
    renderWithTheme(
      <NodeGraph testId="nodegraph" defaultGroups={[baseGroup]} />
    );
    expect(document.querySelector('[data-group-id="g1"]')).toBeInTheDocument();
  });

  it('shows the group label when present', () => {
    renderWithTheme(
      <NodeGraph testId="nodegraph" defaultGroups={[baseGroup]} />
    );
    expect(screen.getByText('Group A')).toBeInTheDocument();
  });

  it('selects a group on a plain click', () => {
    const onSelectionChange = vi.fn();
    renderWithTheme(
      <NodeGraph
        testId="nodegraph"
        defaultGroups={[baseGroup]}
        onSelectionChange={onSelectionChange}
      />
    );
    const group = document.querySelector('[data-group-id="g1"]') as HTMLElement;
    fireEvent.pointerDown(group, { pointerId: 1, button: 0 });
    fireEvent.pointerUp(group, { pointerId: 1, button: 0 });
    expect(onSelectionChange).toHaveBeenCalledWith(
      expect.objectContaining({ groups: ['g1'] })
    );
  });

  it('toggles a group via additive click', () => {
    let captured: NodeGraphSelection | null = null;
    renderWithTheme(
      <NodeGraph
        testId="nodegraph"
        defaultGroups={[baseGroup]}
        defaultSelection={{ nodes: [], edges: [], groups: ['g1'] }}
        onSelectionChange={s => {
          captured = s;
        }}
      />
    );
    const group = document.querySelector('[data-group-id="g1"]') as HTMLElement;
    fireEvent.pointerDown(group, {
      pointerId: 1,
      button: 0,
      shiftKey: true,
    });
    fireEvent.pointerUp(group, {
      pointerId: 1,
      button: 0,
      shiftKey: true,
    });
    const sel = captured as unknown as NodeGraphSelection | null;
    expect(sel?.groups).toEqual([]);
  });

  it('renders 8 resize handles when the group is selected', () => {
    renderWithTheme(
      <NodeGraph
        testId="nodegraph"
        defaultGroups={[baseGroup]}
        defaultSelection={{ nodes: [], edges: [], groups: ['g1'] }}
      />
    );
    expect(document.querySelectorAll('[data-group-handle]')).toHaveLength(8);
  });

  it('does not render resize handles when the group is not selected', () => {
    renderWithTheme(
      <NodeGraph testId="nodegraph" defaultGroups={[baseGroup]} />
    );
    expect(document.querySelectorAll('[data-group-handle]')).toHaveLength(0);
  });

  it('skips group selection when disabled', () => {
    const onSelectionChange = vi.fn();
    renderWithTheme(
      <NodeGraph
        testId="nodegraph"
        defaultGroups={[baseGroup]}
        disabled
        onSelectionChange={onSelectionChange}
      />
    );
    const group = document.querySelector('[data-group-id="g1"]') as HTMLElement;
    fireEvent.pointerDown(group, { pointerId: 1, button: 0 });
    fireEvent.pointerUp(group, { pointerId: 1, button: 0 });
    expect(onSelectionChange).not.toHaveBeenCalled();
  });
});
