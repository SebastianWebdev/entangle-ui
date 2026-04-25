import { useState } from 'react';
import DemoWrapper from '../DemoWrapper';
import { Radio, RadioGroup } from '@/components/primitives';
import { Stack } from '@/components/layout';

export default function RadioDemo() {
  const [space, setSpace] = useState<string>('local');
  return (
    <DemoWrapper>
      <Stack spacing={4}>
        <Radio value="standalone" defaultChecked label="Standalone radio" />
        <RadioGroup label="Coordinate space" value={space} onChange={setSpace}>
          <Radio value="local" label="Local" />
          <Radio value="world" label="World" />
          <Radio value="parent" label="Parent" />
        </RadioGroup>
      </Stack>
    </DemoWrapper>
  );
}

export function RadioStandalone() {
  return (
    <DemoWrapper>
      <Radio value="opt" label="Anti-aliasing" defaultChecked />
    </DemoWrapper>
  );
}

export function RadioSizes() {
  return (
    <DemoWrapper>
      <Stack direction="row" spacing={4}>
        <Radio value="sm" size="sm" label="Small" />
        <Radio value="md" size="md" defaultChecked label="Medium" />
        <Radio value="lg" size="lg" label="Large" />
      </Stack>
    </DemoWrapper>
  );
}

export function RadioStates() {
  return (
    <DemoWrapper>
      <Stack spacing={2}>
        <Radio value="off" label="Off (unchecked)" />
        <Radio value="on" defaultChecked label="On (checked)" />
        <Radio value="dis-off" disabled label="Disabled — off" />
        <Radio value="dis-on" disabled defaultChecked label="Disabled — on" />
        <Radio value="error" error label="Error state" />
      </Stack>
    </DemoWrapper>
  );
}

export function RadioGroupVertical() {
  return (
    <DemoWrapper>
      <RadioGroup label="Coordinate space" defaultValue="local">
        <Radio value="local" label="Local" />
        <Radio value="world" label="World" />
        <Radio value="parent" label="Parent" />
        <Radio value="screen" label="Screen" />
      </RadioGroup>
    </DemoWrapper>
  );
}

export function RadioGroupHorizontal() {
  return (
    <DemoWrapper>
      <RadioGroup
        label="Coordinate space"
        orientation="horizontal"
        defaultValue="local"
      >
        <Radio value="local" label="Local" />
        <Radio value="world" label="World" />
        <Radio value="parent" label="Parent" />
        <Radio value="screen" label="Screen" />
      </RadioGroup>
    </DemoWrapper>
  );
}

export function RadioGroupControlled() {
  const [value, setValue] = useState<string>('local');
  return (
    <DemoWrapper>
      <Stack spacing={2}>
        <RadioGroup label="Coordinate space" value={value} onChange={setValue}>
          <Radio value="local" label="Local" />
          <Radio value="world" label="World" />
          <Radio value="parent" label="Parent" />
        </RadioGroup>
        <div style={{ fontSize: 12, opacity: 0.7 }}>Selected: {value}</div>
      </Stack>
    </DemoWrapper>
  );
}

export function RadioGroupRequired() {
  return (
    <DemoWrapper>
      <RadioGroup
        label="Coordinate space"
        required
        error
        errorMessage="Selection required to continue"
      >
        <Radio value="local" label="Local" />
        <Radio value="world" label="World" />
        <Radio value="parent" label="Parent" />
      </RadioGroup>
    </DemoWrapper>
  );
}

export function RadioInPropertyPanel() {
  const [space, setSpace] = useState<string>('local');
  return (
    <DemoWrapper>
      <RadioGroup
        label="Coordinate space"
        orientation="horizontal"
        size="sm"
        value={space}
        onChange={setSpace}
      >
        <Radio value="local" label="Local" />
        <Radio value="world" label="World" />
        <Radio value="parent" label="Parent" />
      </RadioGroup>
    </DemoWrapper>
  );
}
