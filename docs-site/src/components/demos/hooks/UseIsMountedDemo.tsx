import { useEffect, useState } from 'react';
import DemoWrapper from '../DemoWrapper';
import { useIsMounted } from '@/hooks/useIsMounted';
import { Button } from '@/components/primitives/Button';
import { Stack } from '@/components/layout/Stack';
import { Text } from '@/components/primitives/Text';

function DelayedResult() {
  const isMounted = useIsMounted();
  const [status, setStatus] = useState('Working… (resolves in 2s)');

  useEffect(() => {
    // A bare promise can't be cancelled — guard the state write instead of
    // relying on cleanup. (Prefer AbortController when the source supports it.)
    void new Promise<void>(resolve => setTimeout(resolve, 2000)).then(() => {
      if (isMounted()) setStatus('Resolved ✓');
    });
  }, [isMounted]);

  return <Text size="sm">{status}</Text>;
}

export default function UseIsMountedDemo() {
  const [mounted, setMounted] = useState(true);

  return (
    <DemoWrapper>
      <Stack spacing={3}>
        <Text size="sm" color="secondary">
          Unmount the child before the 2s promise resolves — the guarded
          setState becomes a no-op instead of warning about an update on an
          unmounted component.
        </Text>
        <Button onClick={() => setMounted(prev => !prev)}>
          {mounted ? 'Unmount child' : 'Mount child'}
        </Button>
        {mounted ? (
          <DelayedResult />
        ) : (
          <Text size="sm" color="secondary">
            Child unmounted.
          </Text>
        )}
      </Stack>
    </DemoWrapper>
  );
}
