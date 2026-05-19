import DemoWrapper from '../DemoWrapper';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { Stack } from '@/components/layout/Stack';
import { Flex } from '@/components/layout/Flex';
import { Text } from '@/components/primitives/Text';

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

export default function UseMediaQueryDemo() {
  const isWide = useMediaQuery('(min-width: 768px)');
  const prefersDark = useMediaQuery('(prefers-color-scheme: dark)');
  const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');

  return (
    <DemoWrapper>
      <Stack spacing={3}>
        <Text size="sm" color="secondary">
          Reactive matches for arbitrary media queries — resize the window or
          toggle your OS preferences to see flags flip.
        </Text>
        <Flex gap={2} wrap="wrap">
          <span style={chipStyle(isWide)}>min-width: 768px</span>
          <span style={chipStyle(prefersDark)}>prefers-color-scheme: dark</span>
          <span style={chipStyle(reducedMotion)}>prefers-reduced-motion</span>
        </Flex>
      </Stack>
    </DemoWrapper>
  );
}

export function UseMediaQueryConditionalRender() {
  const isWide = useMediaQuery('(min-width: 768px)');

  return (
    <DemoWrapper>
      <Stack spacing={3}>
        <Text size="sm" color="secondary">
          Render different components based on viewport width.
        </Text>
        {isWide ? (
          <div
            style={{
              padding: 16,
              borderRadius: 4,
              background: 'var(--etui-color-background-elevated)',
              border: '1px solid var(--etui-color-border-default)',
            }}
          >
            <Text size="md">Desktop layout</Text>
          </div>
        ) : (
          <div
            style={{
              padding: 16,
              borderRadius: 4,
              background: 'var(--etui-color-surface-default)',
              border: '1px solid var(--etui-color-border-default)',
            }}
          >
            <Text size="md">Mobile layout</Text>
          </div>
        )}
      </Stack>
    </DemoWrapper>
  );
}
