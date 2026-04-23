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

export function CodeSizes() {
  return (
    <DemoWrapper>
      <Stack gap={3} style={{ maxWidth: 480 }}>
        <Text size="sm">
          Text at <code>sm</code> size with{' '}
          <Code size="xs">Code size="xs"</Code>.
        </Text>
        <Text>
          Default body text with <Code size="sm">Code size="sm"</Code>{' '}
          (default).
        </Text>
        <Text size="lg">
          Larger body text with <Code size="md">Code size="md"</Code>.
        </Text>
      </Stack>
    </DemoWrapper>
  );
}

export function CodeInSentence() {
  return (
    <DemoWrapper>
      <div style={{ maxWidth: 480 }}>
        <Text>
          Install the package with <Code>npm install entangle-ui</Code> and
          import components from the root barrel:{' '}
          <Code>{"import { Button } from 'entangle-ui'"}</Code>. The{' '}
          <Code>Button</Code> primitive accepts a <Code>variant</Code> and a{' '}
          <Code>size</Code> prop.
        </Text>
      </div>
    </DemoWrapper>
  );
}

export function CodeInLink() {
  return (
    <DemoWrapper>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <a
          href="/components/primitives/button"
          style={{ color: 'var(--etui-color-accent-primary)' }}
        >
          See the <Code>Button</Code> docs
        </a>
        <a
          href="/components/primitives/input"
          style={{ color: 'var(--etui-color-accent-primary)' }}
        >
          See the <Code>Input</Code> docs
        </a>
      </div>
    </DemoWrapper>
  );
}

export function CodeNextToBadge() {
  return (
    <DemoWrapper>
      <Text>
        The environment variable <Code>NODE_ENV</Code> defaults to{' '}
        <Code>"development"</Code> when running <Code>npm run dev</Code>.
      </Text>
    </DemoWrapper>
  );
}
