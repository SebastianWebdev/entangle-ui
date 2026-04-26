import { useState } from 'react';
import DemoWrapper from '../DemoWrapper';
import { useHotkey } from '@/hooks/useHotkey';
import { Button } from '@/components/primitives/Button';
import { Input } from '@/components/primitives/Input';
import { Stack } from '@/components/layout/Stack';
import { Flex } from '@/components/layout/Flex';
import { Text } from '@/components/primitives/Text';

export default function UseHotkeyDemo() {
  const [count, setCount] = useState(0);

  useHotkey('Ctrl+ArrowUp', () => setCount(prev => prev + 1));
  useHotkey('Ctrl+ArrowDown', () => setCount(prev => prev - 1));

  return (
    <DemoWrapper>
      <Stack spacing={3}>
        <Text size="sm" color="secondary">
          Click the demo to focus the page, then press <strong>Ctrl+↑</strong>{' '}
          or <strong>Ctrl+↓</strong>.
        </Text>
        <Text size="lg">Counter: {count}</Text>
        <Flex gap={2}>
          <Button onClick={() => setCount(prev => prev + 1)}>+</Button>
          <Button onClick={() => setCount(prev => prev - 1)}>−</Button>
          <Button variant="ghost" onClick={() => setCount(0)}>
            Reset
          </Button>
        </Flex>
      </Stack>
    </DemoWrapper>
  );
}

export function UseHotkeyEscape() {
  const [open, setOpen] = useState(true);

  useHotkey('Escape', () => setOpen(false), { enabled: open });

  return (
    <DemoWrapper>
      <Stack spacing={3}>
        {open ? (
          <div
            style={{
              padding: 12,
              borderRadius: 4,
              border: '1px solid var(--etui-color-border-default)',
              background: 'var(--etui-color-background-elevated)',
            }}
          >
            <Text size="sm">Press Escape to close this card.</Text>
          </div>
        ) : (
          <Text size="sm" color="secondary">
            Closed. Click below to reopen.
          </Text>
        )}
        <Button onClick={() => setOpen(true)}>Reopen</Button>
      </Stack>
    </DemoWrapper>
  );
}

export function UseHotkeyInInput() {
  const [allowInInputs, setAllowInInputs] = useState(false);
  const [hits, setHits] = useState(0);

  useHotkey('Ctrl+B', () => setHits(prev => prev + 1), {
    enableInInputs: allowInInputs,
  });

  return (
    <DemoWrapper>
      <Stack spacing={3}>
        <Text size="sm" color="secondary">
          Press <strong>Ctrl+B</strong>. Toggle the option to allow it while
          typing.
        </Text>
        <Flex gap={2}>
          <Button onClick={() => setAllowInInputs(prev => !prev)}>
            enableInInputs: {String(allowInInputs)}
          </Button>
          <Button variant="ghost" onClick={() => setHits(0)}>
            Reset
          </Button>
        </Flex>
        <Input placeholder="Type here, then press Ctrl+B" />
        <Text size="sm">Hits: {hits}</Text>
      </Stack>
    </DemoWrapper>
  );
}

export function UseHotkeyPlatformAware() {
  const [opened, setOpened] = useState(0);

  useHotkey('Cmd+K', () => setOpened(prev => prev + 1));

  return (
    <DemoWrapper>
      <Stack spacing={3}>
        <Text size="sm" color="secondary">
          Press <strong>Cmd+K</strong> on macOS or <strong>Ctrl+K</strong>{' '}
          everywhere else.
        </Text>
        <Text size="md">Command palette opened: {opened}×</Text>
      </Stack>
    </DemoWrapper>
  );
}
