import { useRef, useState } from 'react';
import DemoWrapper from '../DemoWrapper';
import { useResizeObserver } from '@/hooks/useResizeObserver';
import { Stack } from '@/components/layout/Stack';
import { Text } from '@/components/primitives/Text';

export default function UseResizeObserverDemo() {
  const ref = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });

  useResizeObserver(ref, entry => {
    setSize({
      width: Math.round(entry.contentRect.width),
      height: Math.round(entry.contentRect.height),
    });
  });

  return (
    <DemoWrapper>
      <Stack spacing={3}>
        <Text size="sm" color="secondary">
          Drag the bottom-right corner to resize the box and watch the
          dimensions update live.
        </Text>
        <div
          ref={ref}
          style={{
            resize: 'both',
            overflow: 'auto',
            width: 240,
            height: 120,
            minWidth: 120,
            minHeight: 60,
            padding: 12,
            border: '1px solid var(--etui-color-border-default)',
            borderRadius: 4,
            background: 'var(--etui-color-background-elevated)',
            color: 'var(--etui-color-text-primary)',
            fontFamily: 'var(--etui-font-family-mono)',
            fontSize: 'var(--etui-font-size-sm)',
          }}
        >
          {size.width} × {size.height}
        </div>
      </Stack>
    </DemoWrapper>
  );
}
