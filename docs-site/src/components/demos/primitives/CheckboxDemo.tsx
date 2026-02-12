import { useState } from 'react';
import DemoWrapper from '../DemoWrapper';
import { Checkbox } from '@/components/primitives';
import { Stack } from '@/components/layout';

export default function CheckboxDemo() {
  const [checked, setChecked] = useState(true);
  return (
    <DemoWrapper>
      <Stack spacing="md">
        <Checkbox
          checked={checked}
          onChange={() => setChecked(!checked)}
          label="Checked (controlled)"
        />
        <Checkbox defaultChecked={false} label="Unchecked" />
        <Checkbox disabled label="Disabled" />
        <Checkbox checked disabled label="Checked disabled" />
      </Stack>
    </DemoWrapper>
  );
}
