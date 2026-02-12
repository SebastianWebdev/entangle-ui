import DemoWrapper from '../DemoWrapper';
import { PanelSurface } from '@/components/layout';
import { Text, Button } from '@/components/primitives';

export default function PanelSurfaceDemo() {
  return (
    <DemoWrapper>
      <div style={{ maxWidth: 350 }}>
        <PanelSurface>
          <PanelSurface.Header>
            <Text size="sm" weight="semibold">
              Panel Title
            </Text>
          </PanelSurface.Header>
          <PanelSurface.Body padding={12}>
            <Text size="sm">
              Panel body content goes here. This can contain any components.
            </Text>
          </PanelSurface.Body>
          <PanelSurface.Footer>
            <Button size="sm" variant="filled">
              Save
            </Button>
          </PanelSurface.Footer>
        </PanelSurface>
      </div>
    </DemoWrapper>
  );
}
