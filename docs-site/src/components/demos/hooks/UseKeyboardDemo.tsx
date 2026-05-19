import DemoWrapper from '../DemoWrapper';
import { useKeyboard } from '@/hooks/useKeyboard';
import { Stack } from '@/components/layout/Stack';
import { Flex } from '@/components/layout/Flex';
import { Text } from '@/components/primitives/Text';

const MODIFIERS = ['control', 'shift', 'alt', 'meta'] as const;

const chipStyle = (active: boolean): React.CSSProperties => ({
  padding: '4px 10px',
  borderRadius: 999,
  fontFamily: 'var(--etui-font-family-mono)',
  fontSize: 12,
  background: active
    ? 'var(--etui-color-action-primary)'
    : 'var(--etui-color-surface-default)',
  color: active
    ? 'var(--etui-color-text-onAction)'
    : 'var(--etui-color-text-secondary)',
  border: '1px solid var(--etui-color-border-default)',
});

export default function UseKeyboardDemo() {
  const { pressedKeys, modifiers } = useKeyboard();

  return (
    <DemoWrapper>
      <Stack spacing={3}>
        <Text size="sm" color="secondary">
          Click here to focus the page, then hold any keys. Modifier flags and
          the list of currently pressed keys update live.
        </Text>
        <Flex gap={2} wrap="wrap">
          {MODIFIERS.map(name => (
            <span key={name} style={chipStyle(modifiers[name])}>
              {name}
            </span>
          ))}
        </Flex>
        <Text size="sm">
          pressedKeys:{' '}
          <code style={{ fontFamily: 'var(--etui-font-family-mono)' }}>
            [{pressedKeys.map(k => `"${k}"`).join(', ')}]
          </code>
        </Text>
      </Stack>
    </DemoWrapper>
  );
}

export function UseKeyboardModifierGate() {
  const { modifiers } = useKeyboard();

  const mode = modifiers.shift
    ? 'precision'
    : modifiers.control || modifiers.meta
      ? 'snap'
      : 'free';

  return (
    <DemoWrapper>
      <Stack spacing={3}>
        <Text size="sm" color="secondary">
          Hold <strong>Shift</strong> for precision, <strong>Ctrl</strong> /{' '}
          <strong>Cmd</strong> to snap, otherwise free.
        </Text>
        <Text size="lg">
          drag mode:{' '}
          <strong style={{ fontFamily: 'var(--etui-font-family-mono)' }}>
            {mode}
          </strong>
        </Text>
      </Stack>
    </DemoWrapper>
  );
}
