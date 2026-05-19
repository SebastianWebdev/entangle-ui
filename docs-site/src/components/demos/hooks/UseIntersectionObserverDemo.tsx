import DemoWrapper from '../DemoWrapper';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';
import { Stack } from '@/components/layout/Stack';
import { Text } from '@/components/primitives/Text';

export default function UseIntersectionObserverDemo() {
  const { ref, isIntersecting } = useIntersectionObserver<HTMLDivElement>({
    threshold: 0.5,
  });

  return (
    <DemoWrapper>
      <Stack spacing={3}>
        <Text size="sm" color="secondary">
          Scroll the inner panel — the target highlights once it's at least
          50% visible inside the scroll root.
        </Text>
        <div
          style={{
            height: 200,
            overflow: 'auto',
            padding: 12,
            borderRadius: 4,
            border: '1px solid var(--etui-color-border-default)',
            background: 'var(--etui-color-surface-default)',
          }}
        >
          <div style={{ height: 240 }} />
          <div
            ref={ref}
            style={{
              padding: 16,
              borderRadius: 4,
              textAlign: 'center',
              background: isIntersecting
                ? 'var(--etui-color-action-primary)'
                : 'var(--etui-color-background-elevated)',
              color: isIntersecting
                ? 'var(--etui-color-text-onAction)'
                : 'var(--etui-color-text-primary)',
              transition: 'background 120ms ease',
            }}
          >
            {isIntersecting ? 'Visible' : 'Scroll to me'}
          </div>
          <div style={{ height: 240 }} />
        </div>
        <Text size="sm">
          isIntersecting:{' '}
          <code style={{ fontFamily: 'var(--etui-font-family-mono)' }}>
            {String(isIntersecting)}
          </code>
        </Text>
      </Stack>
    </DemoWrapper>
  );
}

export function UseIntersectionObserverLazyImage() {
  const { ref, isIntersecting } = useIntersectionObserver<HTMLDivElement>({
    rootMargin: '0px 0px 100px 0px',
  });

  return (
    <DemoWrapper>
      <Stack spacing={3}>
        <Text size="sm" color="secondary">
          With a positive bottom <code>rootMargin</code>, the target reports
          as intersecting slightly before it actually enters the viewport —
          handy for lazy loading.
        </Text>
        <div
          style={{
            height: 180,
            overflow: 'auto',
            padding: 12,
            borderRadius: 4,
            border: '1px solid var(--etui-color-border-default)',
          }}
        >
          <div style={{ height: 200 }} />
          <div
            ref={ref}
            style={{
              padding: 24,
              borderRadius: 4,
              background: 'var(--etui-color-background-elevated)',
              border: '1px solid var(--etui-color-border-default)',
            }}
          >
            <Text size="sm">
              {isIntersecting
                ? 'Hello — preloaded before fully visible.'
                : 'Keep scrolling…'}
            </Text>
          </div>
          <div style={{ height: 200 }} />
        </div>
      </Stack>
    </DemoWrapper>
  );
}
