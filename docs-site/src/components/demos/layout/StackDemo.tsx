import DemoWrapper from '../DemoWrapper';
import { Stack } from '@/components/layout';
import { Paper, Text } from '@/components/primitives';

export default function StackDemo() {
  return (
    <DemoWrapper>
      <Stack spacing={3} style={{ maxWidth: 300 }}>
        <Paper padding="sm">
          <Text size="sm">Card 1</Text>
        </Paper>
        <Paper padding="sm">
          <Text size="sm">Card 2</Text>
        </Paper>
        <Paper padding="sm">
          <Text size="sm">Card 3</Text>
        </Paper>
      </Stack>
    </DemoWrapper>
  );
}
