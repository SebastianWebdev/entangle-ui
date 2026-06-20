import { useEffect, useState } from 'react';
import DemoWrapper from '../DemoWrapper';
import { useEventCallback } from '@/hooks/useEventCallback';
import { Button } from '@/components/primitives/Button';
import { Stack } from '@/components/layout/Stack';
import { Flex } from '@/components/layout/Flex';
import { Text } from '@/components/primitives/Text';

export default function UseEventCallbackDemo() {
  const [multiplier, setMultiplier] = useState(2);
  const [accumulated, setAccumulated] = useState(0);
  const [running, setRunning] = useState(false);

  // Stable identity, but always reads the latest multiplier.
  const onTick = useEventCallback(() => {
    setAccumulated(value => value + multiplier);
  });

  useEffect(() => {
    if (!running) return;
    const id = setInterval(onTick, 800);
    return () => clearInterval(id);
    // onTick is stable, so the interval subscribes once — changing the
    // multiplier below never tears it down and re-creates it.
  }, [running, onTick]);

  return (
    <DemoWrapper>
      <Stack spacing={3}>
        <Text size="sm" color="secondary">
          The interval subscribes once. Change the multiplier while it runs —
          each tick adds the latest value without re-subscribing.
        </Text>
        <Flex gap={2} align="center">
          <Button onClick={() => setRunning(prev => !prev)}>
            {running ? 'Stop' : 'Start'}
          </Button>
          <Button
            variant="ghost"
            onClick={() => setMultiplier(prev => prev + 1)}
          >
            multiplier + 1
          </Button>
          <Button variant="ghost" onClick={() => setAccumulated(0)}>
            Reset
          </Button>
        </Flex>
        <Text size="sm">
          multiplier: {multiplier} · accumulated: {accumulated}
        </Text>
      </Stack>
    </DemoWrapper>
  );
}
