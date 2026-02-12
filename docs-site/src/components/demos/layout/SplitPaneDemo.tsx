import DemoWrapper from '../DemoWrapper';
import { SplitPane, SplitPanePanel } from '@/components/layout';
import { Text } from '@/components/primitives';

export default function SplitPaneDemo() {
  return (
    <DemoWrapper height="200px">
      <div style={{ height: 160 }}>
        <SplitPane
          direction="horizontal"
          panels={[{ minSize: 80 }, { minSize: 80 }]}
        >
          <SplitPanePanel>
            <div style={{ padding: 12, background: '#2d2d2d', height: '100%' }}>
              <Text size="sm">Left Panel</Text>
            </div>
          </SplitPanePanel>
          <SplitPanePanel>
            <div style={{ padding: 12, background: '#252525', height: '100%' }}>
              <Text size="sm">Right Panel</Text>
            </div>
          </SplitPanePanel>
        </SplitPane>
      </div>
    </DemoWrapper>
  );
}
