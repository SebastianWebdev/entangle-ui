import { useState } from 'react';
import DemoWrapper from '../DemoWrapper';
import { Button } from '@/components/primitives';
import { Flex } from '@/components/layout';

export default function ButtonDemo() {
  const [loading, setLoading] = useState(false);
  return (
    <DemoWrapper>
      <Flex gap="md" align="center" wrap="wrap">
        <Button variant="default">Default</Button>
        <Button variant="ghost">Ghost</Button>
        <Button variant="filled">Filled</Button>
        <Button variant="filled" size="sm">
          Small
        </Button>
        <Button variant="filled" size="lg">
          Large
        </Button>
        <Button variant="filled" disabled>
          Disabled
        </Button>
        <Button
          variant="filled"
          loading={loading}
          onClick={() => {
            setLoading(true);
            setTimeout(() => setLoading(false), 2000);
          }}
        >
          {loading ? 'Saving...' : 'Click Me'}
        </Button>
      </Flex>
    </DemoWrapper>
  );
}
