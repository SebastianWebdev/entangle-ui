import { useState } from 'react';
import DemoWrapper from '../DemoWrapper';
import { useControlledState } from '@/hooks/useControlledState';
import { Button } from '@/components/primitives/Button';
import { Stack } from '@/components/layout/Stack';
import { Text } from '@/components/primitives/Text';

interface ToggleProps {
  value?: boolean;
  defaultValue?: boolean;
  onChange?: (value: boolean) => void;
}

function Toggle({ value, defaultValue, onChange }: ToggleProps) {
  const [on, setOn] = useControlledState<boolean>({
    value,
    defaultValue,
    onChange,
    fallback: false,
  });
  return (
    <Button onClick={() => setOn(prev => !prev)}>{on ? 'On' : 'Off'}</Button>
  );
}

export default function UseControlledStateDemo() {
  const [parentValue, setParentValue] = useState(false);
  return (
    <DemoWrapper>
      <Stack spacing={3}>
        <Text size="sm" color="secondary">
          Controlled by parent — parent state: {String(parentValue)}
        </Text>
        <Toggle value={parentValue} onChange={setParentValue} />
      </Stack>
    </DemoWrapper>
  );
}

export function ControlledExample() {
  const [v, setV] = useState(false);
  return (
    <DemoWrapper>
      <Stack spacing={3}>
        <Text size="sm" color="secondary">
          Parent owns the state: {String(v)}
        </Text>
        <Toggle value={v} onChange={setV} />
      </Stack>
    </DemoWrapper>
  );
}

export function UncontrolledExample() {
  return (
    <DemoWrapper>
      <Stack spacing={3}>
        <Text size="sm" color="secondary">
          Hook owns the state internally
        </Text>
        <Toggle defaultValue={false} />
      </Stack>
    </DemoWrapper>
  );
}
