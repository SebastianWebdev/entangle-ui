import DemoWrapper from '../DemoWrapper';
import { Text } from '@/components/primitives';
import { Stack } from '@/components/layout';

export default function TextDemo() {
  return (
    <DemoWrapper>
      <Stack spacing={2}>
        <Text size="xl" weight="semibold">
          Extra Large (16px)
        </Text>
        <Text size="lg">Large (14px)</Text>
        <Text size="md">Medium (12px) — default</Text>
        <Text size="sm" color="secondary">
          Small secondary
        </Text>
        <Text size="xs" color="muted">
          Extra small muted
        </Text>
        <Text variant="code">Monospace code text</Text>
      </Stack>
    </DemoWrapper>
  );
}
