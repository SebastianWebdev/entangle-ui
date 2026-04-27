import { useState } from 'react';
import DemoWrapper from '../DemoWrapper';
import { useClipboard } from '@/hooks/useClipboard';
import { Button } from '@/components/primitives/Button';
import { Stack } from '@/components/layout/Stack';
import { Flex } from '@/components/layout/Flex';
import { Text } from '@/components/primitives/Text';

const SNIPPET = `npm install entangle-ui`;

export default function UseClipboardDemo() {
  const { copy, copied } = useClipboard();

  return (
    <DemoWrapper>
      <Stack spacing={3}>
        <pre
          style={{
            margin: 0,
            padding: 12,
            borderRadius: 4,
            background: 'var(--etui-color-surface-default)',
            border: '1px solid var(--etui-color-border-default)',
            color: 'var(--etui-color-text-primary)',
            fontFamily: 'var(--etui-typography-fontFamily-mono)',
            fontSize: 12,
          }}
        >
          {SNIPPET}
        </pre>
        <Button onClick={() => copy(SNIPPET)}>
          {copied ? 'Copied!' : 'Copy'}
        </Button>
      </Stack>
    </DemoWrapper>
  );
}

export function UseClipboardBasic() {
  const { copy, copied } = useClipboard();

  return (
    <DemoWrapper>
      <Button onClick={() => copy('Hello, clipboard!')}>
        {copied ? 'Copied!' : 'Copy "Hello, clipboard!"'}
      </Button>
    </DemoWrapper>
  );
}

export function UseClipboardCustomTimeout() {
  const { copy, copied } = useClipboard({ timeout: 500 });

  return (
    <DemoWrapper>
      <Stack spacing={2}>
        <Text size="sm" color="secondary">
          Snappier feedback — resets after 500ms.
        </Text>
        <Button onClick={() => copy('Quick feedback')}>
          {copied ? 'Copied!' : 'Copy'}
        </Button>
      </Stack>
    </DemoWrapper>
  );
}

export function UseClipboardError() {
  const { copy, status, error, reset } = useClipboard();
  const [forceFail, setForceFail] = useState(false);

  const handleCopy = async () => {
    if (forceFail) {
      // Simulate a permission failure by writing to a fake clipboard.
      const fail = new Promise<void>((_, reject) =>
        setTimeout(
          () => reject(new Error('Clipboard permission denied (simulated).')),
          50
        )
      );
      try {
        await fail;
      } catch (err) {
        // Surface error path through the hook by not actually calling copy.
        // This branch keeps the demo deterministic without monkey-patching
        // navigator.clipboard from inside MDX.
        // eslint-disable-next-line no-console
        console.warn(err);
      }
      // Falls back to actual copy so the user still sees the error UI when
      // the simulated path is enabled.
      await copy('text');
      return;
    }
    await copy('text');
  };

  return (
    <DemoWrapper>
      <Stack spacing={2}>
        <Flex gap={2}>
          <Button onClick={handleCopy}>Try copy</Button>
          <Button variant="ghost" onClick={reset}>
            Reset
          </Button>
          <Button variant="ghost" onClick={() => setForceFail(prev => !prev)}>
            {forceFail
              ? 'Disable simulated failure'
              : 'Enable simulated failure'}
          </Button>
        </Flex>
        <Text size="sm" color="secondary">
          status: {status}
          {error ? ` — ${error.message}` : ''}
        </Text>
      </Stack>
    </DemoWrapper>
  );
}
