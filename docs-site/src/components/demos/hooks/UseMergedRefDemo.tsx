import { useRef, useState } from 'react';
import type { Ref } from 'react';
import DemoWrapper from '../DemoWrapper';
import { useMergedRef } from '@/hooks/useMergedRef';
import { Button } from '@/components/primitives/Button';
import { Stack } from '@/components/layout/Stack';
import { Text } from '@/components/primitives/Text';

interface PanelProps {
  ref?: Ref<HTMLDivElement>;
}

function Panel({ ref: externalRef }: PanelProps) {
  const internalRef = useRef<HTMLDivElement>(null);
  const setRef = useMergedRef<HTMLDivElement>(internalRef, externalRef);
  const [width, setWidth] = useState<number | null>(null);

  return (
    <Stack spacing={2}>
      <div
        ref={setRef}
        style={{
          padding: 16,
          border: '1px solid var(--etui-color-border-default)',
          borderRadius: 4,
          background: 'var(--etui-color-background-elevated)',
        }}
      >
        Panel — internal ref width: {width ?? '—'}px
      </div>
      <Button
        onClick={() => {
          setWidth(internalRef.current?.offsetWidth ?? null);
        }}
      >
        Read width via internal ref
      </Button>
    </Stack>
  );
}

export default function UseMergedRefDemo() {
  const externalRef = useRef<HTMLDivElement>(null);
  const [externalWidth, setExternalWidth] = useState<number | null>(null);

  return (
    <DemoWrapper>
      <Stack spacing={3}>
        <Text size="sm" color="secondary">
          The same DOM node is reachable via the component's internal ref and
          the parent's external ref.
        </Text>
        <Panel ref={externalRef} />
        <Button
          variant="outline"
          onClick={() => {
            setExternalWidth(externalRef.current?.offsetWidth ?? null);
          }}
        >
          Read width via external ref ({externalWidth ?? '—'}px)
        </Button>
      </Stack>
    </DemoWrapper>
  );
}
