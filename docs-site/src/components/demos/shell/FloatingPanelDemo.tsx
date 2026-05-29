import { useState } from 'react';
import DemoWrapper from '../DemoWrapper';
import { FloatingPanel, FloatingManager } from '@/components/shell';
import { Text, Button } from '@/components/primitives';
import { Stack } from '@/components/layout';

function Stage({
  height = 300,
  children,
}: {
  height?: number;
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        position: 'relative',
        height,
        border: '1px solid #333',
        borderRadius: 4,
        overflow: 'hidden',
      }}
    >
      <FloatingManager>{children}</FloatingManager>
    </div>
  );
}

export default function FloatingPanelDemo() {
  return (
    <DemoWrapper height="360px">
      <Stage>
        <FloatingPanel
          title="Inspector"
          defaultPosition={{ x: 20, y: 20 }}
          defaultSize={{ width: 220, height: 180 }}
        >
          <div style={{ padding: 8 }}>
            <Text size="sm">Drag me around!</Text>
          </div>
        </FloatingPanel>
      </Stage>
    </DemoWrapper>
  );
}

export function FloatingPanelManager() {
  return (
    <DemoWrapper height="400px">
      <Stage height={340}>
        <FloatingPanel
          title="Inspector"
          panelId="inspector"
          defaultPosition={{ x: 16, y: 16 }}
          defaultSize={{ width: 180, height: 130 }}
        >
          <div style={{ padding: 8 }}>
            <Text size="sm">Click to bring forward.</Text>
          </div>
        </FloatingPanel>
        <FloatingPanel
          title="Outliner"
          panelId="outliner"
          defaultPosition={{ x: 120, y: 70 }}
          defaultSize={{ width: 180, height: 130 }}
        >
          <div style={{ padding: 8 }}>
            <Text size="sm">Overlapping panel.</Text>
          </div>
        </FloatingPanel>
        <FloatingPanel
          title="Console"
          panelId="console"
          defaultPosition={{ x: 224, y: 124 }}
          defaultSize={{ width: 180, height: 130 }}
        >
          <div style={{ padding: 8 }}>
            <Text size="sm">Whichever you click stacks on top.</Text>
          </div>
        </FloatingPanel>
      </Stage>
    </DemoWrapper>
  );
}

export function FloatingPanelDragResize() {
  return (
    <DemoWrapper height="360px">
      <Stage>
        <FloatingPanel
          title="Resizable Panel"
          defaultPosition={{ x: 24, y: 24 }}
          defaultSize={{ width: 240, height: 180 }}
          minWidth={180}
          minHeight={120}
          maxWidth={400}
          maxHeight={280}
          resizable
        >
          <div style={{ padding: 8 }}>
            <Text size="sm">
              Drag the header to move. Drag the bottom-right corner to resize.
            </Text>
          </div>
        </FloatingPanel>
      </Stage>
    </DemoWrapper>
  );
}

export function FloatingPanelControlled() {
  const [position, setPosition] = useState({ x: 30, y: 30 });
  const [size, setSize] = useState({ width: 240, height: 160 });
  const [collapsed, setCollapsed] = useState(false);

  return (
    <DemoWrapper height="380px">
      <Stack gap={3}>
        <Text size="sm" color="secondary">
          Position: {Math.round(position.x)}, {Math.round(position.y)} · Size:{' '}
          {Math.round(size.width)}×{Math.round(size.height)} ·{' '}
          {collapsed ? 'collapsed' : 'expanded'}
        </Text>
        <Stage height={300}>
          <FloatingPanel
            title="Controlled Panel"
            position={position}
            onPositionChange={setPosition}
            size={size}
            onSizeChange={setSize}
            collapsed={collapsed}
            onCollapsedChange={setCollapsed}
          >
            <div style={{ padding: 8 }}>
              <Text size="sm">
                Drag and resize me — the readout above updates live.
              </Text>
            </div>
          </FloatingPanel>
        </Stage>
      </Stack>
    </DemoWrapper>
  );
}

export function FloatingPanelUncontrolled() {
  return (
    <DemoWrapper height="360px">
      <Stage>
        <FloatingPanel
          title="Uncontrolled Panel"
          defaultPosition={{ x: 28, y: 28 }}
          defaultSize={{ width: 240, height: 170 }}
          defaultCollapsed={false}
        >
          <div style={{ padding: 8 }}>
            <Text size="sm">
              Manages its own position, size, and collapsed state.
            </Text>
          </div>
        </FloatingPanel>
      </Stage>
    </DemoWrapper>
  );
}

export function FloatingPanelCollapseClose() {
  const [visible, setVisible] = useState(true);

  return (
    <DemoWrapper height="360px">
      <Stage>
        {visible ? (
          <FloatingPanel
            title="Closable Panel"
            defaultPosition={{ x: 28, y: 28 }}
            defaultSize={{ width: 240, height: 170 }}
            closable
            onClose={() => setVisible(false)}
          >
            <div style={{ padding: 8 }}>
              <Text size="sm">
                Use the chevron to collapse, or the X to close.
              </Text>
            </div>
          </FloatingPanel>
        ) : (
          <div style={{ padding: 16 }}>
            <Button variant="filled" onClick={() => setVisible(true)}>
              Reopen panel
            </Button>
          </div>
        )}
      </Stage>
    </DemoWrapper>
  );
}

export function FloatingPanelScrollable() {
  return (
    <DemoWrapper height="360px">
      <Stage>
        <FloatingPanel
          title="Scrollable Content"
          defaultPosition={{ x: 28, y: 24 }}
          defaultSize={{ width: 240, height: 200 }}
        >
          <div style={{ padding: 8 }}>
            <Stack gap={2}>
              {Array.from({ length: 16 }, (_, i) => (
                <Text key={i} size="sm">
                  Property row {i + 1}
                </Text>
              ))}
            </Stack>
          </div>
        </FloatingPanel>
      </Stage>
    </DemoWrapper>
  );
}
