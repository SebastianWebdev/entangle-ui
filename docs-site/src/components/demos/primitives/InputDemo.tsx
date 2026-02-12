import { useState } from 'react';
import DemoWrapper from '../DemoWrapper';
import { Input } from '@/components/primitives';
import { Stack } from '@/components/layout';

export default function InputDemo() {
  const [value, setValue] = useState('Hello world');
  return (
    <DemoWrapper>
      <Stack spacing="md" style={{ maxWidth: 300 }}>
        <Input
          placeholder="Default input"
          value={value}
          onChange={e => setValue(e.target.value)}
        />
        <Input placeholder="Disabled" disabled />
        <Input placeholder="With size sm" size="sm" />
        <Input placeholder="With size lg" size="lg" />
      </Stack>
    </DemoWrapper>
  );
}
