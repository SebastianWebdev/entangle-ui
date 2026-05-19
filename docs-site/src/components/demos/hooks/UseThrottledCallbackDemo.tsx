import { useState } from 'react';
import DemoWrapper from '../DemoWrapper';
import { useThrottledCallback } from '@/hooks/useThrottledCallback';
import { Stack } from '@/components/layout/Stack';
import { Flex } from '@/components/layout/Flex';
import { Text } from '@/components/primitives/Text';

const surfaceStyle: React.CSSProperties = {
  height: 120,
  borderRadius: 4,
  border: '1px solid var(--etui-color-border-default)',
  background: 'var(--etui-color-surface-default)',
  cursor: 'crosshair',
  position: 'relative',
  overflow: 'hidden',
};

export default function UseThrottledCallbackDemo() {
  const [raw, setRaw] = useState(0);
  const [throttled, setThrottled] = useState(0);
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);

  const onMove = useThrottledCallback(
    (x: number, y: number) => {
      setThrottled(prev => prev + 1);
      setPos({ x, y });
    },
    100
  );

  return (
    <DemoWrapper>
      <Stack spacing={3}>
        <Text size="sm" color="secondary">
          Move the pointer over the surface. The throttled handler fires at
          most once per 100ms.
        </Text>
        <div
          style={surfaceStyle}
          onPointerMove={event => {
            setRaw(prev => prev + 1);
            const rect = event.currentTarget.getBoundingClientRect();
            onMove(event.clientX - rect.left, event.clientY - rect.top);
          }}
        >
          {pos && (
            <div
              style={{
                position: 'absolute',
                left: pos.x - 6,
                top: pos.y - 6,
                width: 12,
                height: 12,
                borderRadius: '50%',
                background: 'var(--etui-color-action-primary)',
                pointerEvents: 'none',
              }}
            />
          )}
        </div>
        <Flex gap={3}>
          <Text size="sm">raw events: {raw}</Text>
          <Text size="sm">throttled fires: {throttled}</Text>
        </Flex>
      </Stack>
    </DemoWrapper>
  );
}

export function UseThrottledCallbackLeadingOnly() {
  const [hits, setHits] = useState(0);

  const onClick = useThrottledCallback(
    () => {
      setHits(prev => prev + 1);
    },
    600,
    { trailing: false }
  );

  return (
    <DemoWrapper>
      <Stack spacing={3}>
        <Text size="sm" color="secondary">
          With <code>trailing: false</code>, clicks inside the throttle window
          are discarded — only the leading click counts.
        </Text>
        <button
          type="button"
          onClick={onClick}
          style={{
            padding: '8px 16px',
            borderRadius: 4,
            border: '1px solid var(--etui-color-border-default)',
            background: 'var(--etui-color-action-primary)',
            color: 'var(--etui-color-text-onAction)',
            cursor: 'pointer',
            alignSelf: 'flex-start',
          }}
        >
          Click rapidly
        </button>
        <Text size="sm">fires: {hits}</Text>
      </Stack>
    </DemoWrapper>
  );
}
