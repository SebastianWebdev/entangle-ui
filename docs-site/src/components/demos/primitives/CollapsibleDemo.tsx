import DemoWrapper from '../DemoWrapper';
import { Collapsible, Text } from '@/components/primitives';
import { Stack } from '@/components/layout';

export default function CollapsibleDemo() {
  return (
    <DemoWrapper>
      <div style={{ maxWidth: 350 }}>
        <Collapsible defaultOpen trigger="Click to toggle">
          <Stack spacing={2}>
            <Text size="sm">
              This content is hidden by default and revealed when the trigger is
              clicked.
            </Text>
            <Text size="sm" color="muted">
              Supports smooth animation.
            </Text>
          </Stack>
        </Collapsible>
      </div>
    </DemoWrapper>
  );
}
