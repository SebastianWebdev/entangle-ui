import { useRef, useState } from 'react';
import DemoWrapper from '../DemoWrapper';
import { useFocusTrap } from '@/hooks/useFocusTrap';
import { Button } from '@/components/primitives/Button';
import { Input } from '@/components/primitives/Input';
import { Stack } from '@/components/layout/Stack';
import { Text } from '@/components/primitives/Text';

export default function UseFocusTrapDemo() {
  const [enabled, setEnabled] = useState(true);
  const ref = useRef<HTMLDivElement>(null);
  const handleKeyDown = useFocusTrap({ containerRef: ref, enabled });

  return (
    <DemoWrapper>
      <Stack spacing={3}>
        <Text size="sm" color="secondary">
          Tab inside the bordered region — focus wraps when the trap is enabled.
        </Text>
        <Button onClick={() => setEnabled(prev => !prev)}>
          {enabled ? 'Disable trap' : 'Enable trap'}
        </Button>
        <div
          ref={ref}
          onKeyDown={handleKeyDown}
          style={{
            border: '1px solid var(--etui-color-border-default)',
            borderRadius: 4,
            padding: 12,
          }}
        >
          <Stack spacing={2}>
            <Input placeholder="First field" />
            <Input placeholder="Middle field" />
            <Button>Last action</Button>
          </Stack>
        </div>
        <Button variant="ghost">Outside button (escapes when trap off)</Button>
      </Stack>
    </DemoWrapper>
  );
}
