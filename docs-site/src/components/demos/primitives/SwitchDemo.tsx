import { useState } from 'react';
import DemoWrapper from '../DemoWrapper';
import { Switch } from '@/components/primitives';
import { Stack } from '@/components/layout';

export default function SwitchDemo() {
  const [on, setOn] = useState(true);
  return (
    <DemoWrapper>
      <Stack spacing={3}>
        <Switch checked={on} onChange={setOn} label={on ? 'On' : 'Off'} />
        <Switch size="sm" label="Small" />
        <Switch disabled label="Disabled" />
      </Stack>
    </DemoWrapper>
  );
}
