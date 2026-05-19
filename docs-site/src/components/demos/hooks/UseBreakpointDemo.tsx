import DemoWrapper from '../DemoWrapper';
import { useBreakpoint } from '@/hooks/useBreakpoint';
import { Stack } from '@/components/layout/Stack';
import { Flex } from '@/components/layout/Flex';
import { Text } from '@/components/primitives/Text';

const BREAKPOINTS = ['xs', 'sm', 'md', 'lg', 'xl'] as const;

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

export default function UseBreakpointDemo() {
  const bp = useBreakpoint();

  return (
    <DemoWrapper>
      <Stack spacing={3}>
        <Text size="sm" color="secondary">
          Resize the window — the current breakpoint and the matching flags
          update live.
        </Text>
        <Text size="lg">
          current:{' '}
          <strong style={{ fontFamily: 'var(--etui-font-family-mono)' }}>
            {bp.current}
          </strong>
        </Text>
        <Flex gap={2} wrap="wrap">
          {BREAKPOINTS.map(name => (
            <span key={name} style={chipStyle(bp[name])}>
              {name}: {String(bp[name])}
            </span>
          ))}
        </Flex>
      </Stack>
    </DemoWrapper>
  );
}

export function UseBreakpointResponsiveLayout() {
  const { md } = useBreakpoint();

  return (
    <DemoWrapper>
      <Stack spacing={3}>
        <Text size="sm" color="secondary">
          Layout swaps at the <code>md</code> breakpoint (768px).
        </Text>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: md ? '160px 1fr' : '1fr',
            gap: 12,
          }}
        >
          <div
            style={{
              padding: 12,
              borderRadius: 4,
              background: 'var(--etui-color-surface-default)',
              border: '1px solid var(--etui-color-border-default)',
            }}
          >
            <Text size="sm">{md ? 'Sidebar' : 'Top bar'}</Text>
          </div>
          <div
            style={{
              padding: 12,
              borderRadius: 4,
              background: 'var(--etui-color-background-elevated)',
              border: '1px solid var(--etui-color-border-default)',
            }}
          >
            <Text size="sm">Main content</Text>
          </div>
        </div>
      </Stack>
    </DemoWrapper>
  );
}
