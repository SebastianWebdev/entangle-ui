import { useState } from 'react';
import DemoWrapper from '../DemoWrapper';
import { NumberInput } from '@/components/controls';
import { Stack } from '@/components/layout';

export default function NumberInputDemo() {
  const [val, setVal] = useState(42);

  return (
    <DemoWrapper withKeyboard>
      <Stack spacing={3} style={{ maxWidth: 250 }}>
        <NumberInput value={val} onChange={setVal} label="Value" step={1} />
        <NumberInput
          value={3.14}
          onChange={() => {}}
          label="Read-only"
          readOnly
          precision={2}
        />
      </Stack>
    </DemoWrapper>
  );
}
