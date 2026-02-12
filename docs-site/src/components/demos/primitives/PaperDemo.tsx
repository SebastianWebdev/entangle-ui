import DemoWrapper from '../DemoWrapper';
import { Paper, Text } from '@/components/primitives';
import { Flex } from '@/components/layout';

export default function PaperDemo() {
  return (
    <DemoWrapper>
      <Flex gap={4} wrap="wrap">
        <Paper elevation={0} padding="md" bordered style={{ width: 120 }}>
          <Text size="sm">elevation 0</Text>
        </Paper>
        <Paper elevation={1} padding="md" style={{ width: 120 }}>
          <Text size="sm">elevation 1</Text>
        </Paper>
        <Paper elevation={2} padding="md" style={{ width: 120 }}>
          <Text size="sm">elevation 2</Text>
        </Paper>
        <Paper elevation={3} padding="md" style={{ width: 120 }}>
          <Text size="sm">elevation 3</Text>
        </Paper>
      </Flex>
    </DemoWrapper>
  );
}
