import DemoWrapper from '../DemoWrapper';
import { FloatingPanel, FloatingManager } from '@/components/shell';
import { Text } from '@/components/primitives';

export default function FloatingPanelDemo() {
  return (
    <DemoWrapper>
      <div
        style={{
          position: 'relative',
          height: 300,
          border: '1px solid #333',
          borderRadius: 4,
        }}
      >
        <FloatingManager>
          <FloatingPanel
            title="Inspector"
            defaultPosition={{ x: 20, y: 20 }}
            defaultSize={{ width: 220, height: 180 }}
          >
            <div style={{ padding: 8 }}>
              <Text size="sm">Drag me around!</Text>
            </div>
          </FloatingPanel>
        </FloatingManager>
      </div>
    </DemoWrapper>
  );
}
