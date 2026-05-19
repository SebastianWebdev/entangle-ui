import { useEffect, useState } from 'react';
import DemoWrapper from '../DemoWrapper';
import { useDebouncedValue } from '@/hooks/useDebounced';
import { Stack } from '@/components/layout/Stack';
import { Flex } from '@/components/layout/Flex';
import { Text } from '@/components/primitives/Text';
import { Input } from '@/components/primitives/Input';

export default function UseDebouncedValueDemo() {
  const [text, setText] = useState('');
  const debounced = useDebouncedValue(text, 300);

  return (
    <DemoWrapper>
      <Stack spacing={3}>
        <Text size="sm" color="secondary">
          Type quickly — the debounced value only updates 300ms after you stop.
        </Text>
        <Input
          placeholder="Search…"
          value={text}
          onChange={event => setText(event.currentTarget.value)}
        />
        <Stack spacing={1}>
          <Text size="sm">
            immediate:{' '}
            <code style={{ fontFamily: 'var(--etui-font-family-mono)' }}>
              {text || '""'}
            </code>
          </Text>
          <Text size="sm">
            debounced:{' '}
            <code style={{ fontFamily: 'var(--etui-font-family-mono)' }}>
              {debounced || '""'}
            </code>
          </Text>
        </Stack>
      </Stack>
    </DemoWrapper>
  );
}

export function UseDebouncedValueSearch() {
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebouncedValue(query, 250);
  const [requestCount, setRequestCount] = useState(0);

  useEffect(() => {
    if (debouncedQuery.length === 0) return;
    setRequestCount(prev => prev + 1);
  }, [debouncedQuery]);

  return (
    <DemoWrapper>
      <Stack spacing={3}>
        <Text size="sm" color="secondary">
          The mock query effect only fires when the debounced value changes —
          fast typing collapses into a single request.
        </Text>
        <Input
          placeholder="Type to search…"
          value={query}
          onChange={event => setQuery(event.currentTarget.value)}
        />
        <Flex gap={3}>
          <Text size="sm">requests sent: {requestCount}</Text>
          <Text size="sm">
            last query:{' '}
            <code style={{ fontFamily: 'var(--etui-font-family-mono)' }}>
              {debouncedQuery || '""'}
            </code>
          </Text>
        </Flex>
      </Stack>
    </DemoWrapper>
  );
}
