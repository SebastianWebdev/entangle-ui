import { useState } from 'react';
import DemoWrapper from '../DemoWrapper';
import { useDebouncedCallback } from '@/hooks/useDebounced';
import { Button } from '@/components/primitives/Button';
import { Stack } from '@/components/layout/Stack';
import { Flex } from '@/components/layout/Flex';
import { Text } from '@/components/primitives/Text';

export default function UseDebouncedCallbackDemo() {
  const [raw, setRaw] = useState(0);
  const [debouncedHits, setDebouncedHits] = useState(0);

  const onClick = useDebouncedCallback(() => {
    setDebouncedHits(prev => prev + 1);
  }, 400);

  return (
    <DemoWrapper>
      <Stack spacing={3}>
        <Text size="sm" color="secondary">
          Click quickly. The debounced callback only fires 400ms after the last
          click.
        </Text>
        <Flex gap={2}>
          <Button
            onClick={() => {
              setRaw(prev => prev + 1);
              onClick();
            }}
          >
            Click me
          </Button>
          <Button variant="ghost" onClick={onClick.cancel}>
            cancel()
          </Button>
          <Button variant="ghost" onClick={onClick.flush}>
            flush()
          </Button>
        </Flex>
        <Flex gap={3}>
          <Text size="sm">raw clicks: {raw}</Text>
          <Text size="sm">debounced fires: {debouncedHits}</Text>
        </Flex>
      </Stack>
    </DemoWrapper>
  );
}

export function UseDebouncedCallbackLeading() {
  const [raw, setRaw] = useState(0);
  const [hits, setHits] = useState(0);

  const onClick = useDebouncedCallback(
    () => {
      setHits(prev => prev + 1);
    },
    500,
    { leading: true }
  );

  return (
    <DemoWrapper>
      <Stack spacing={3}>
        <Text size="sm" color="secondary">
          With <code>leading: true</code>, the first click fires immediately;
          subsequent clicks inside the 500ms window are batched into one
          trailing call.
        </Text>
        <Button
          onClick={() => {
            setRaw(prev => prev + 1);
            onClick();
          }}
        >
          Click me
        </Button>
        <Flex gap={3}>
          <Text size="sm">raw clicks: {raw}</Text>
          <Text size="sm">fires: {hits}</Text>
        </Flex>
      </Stack>
    </DemoWrapper>
  );
}
