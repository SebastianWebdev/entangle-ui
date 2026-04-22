import DemoWrapper from '../DemoWrapper';
import { Code, Text } from '@/components/primitives';
import { Stack } from '@/components/layout';

export default function CodeDemo() {
  return (
    <DemoWrapper>
      <Stack gap={3} style={{ maxWidth: 480 }}>
        <Text>
          Run <Code>npm install entangle-ui</Code> to add the package.
        </Text>
        <Text>
          Import components from the root barrel:{' '}
          <Code>{"import { Button } from 'entangle-ui'"}</Code>.
        </Text>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Code size="xs">xs</Code>
          <Code size="sm">sm</Code>
          <Code size="md">md</Code>
        </div>
      </Stack>
    </DemoWrapper>
  );
}
