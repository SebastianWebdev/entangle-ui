import { useState } from 'react';
import DemoWrapper from '../DemoWrapper';
import { Checkbox, CheckboxGroup } from '@/components/primitives';
import { Stack } from '@/components/layout';

export default function CheckboxDemo() {
  const [checked, setChecked] = useState(true);
  return (
    <DemoWrapper>
      <Stack spacing={3}>
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

export function CheckboxControlled() {
  const [checked, setChecked] = useState(false);
  return (
    <DemoWrapper>
      <Stack spacing={2}>
        <Checkbox checked={checked} onChange={setChecked} label="Auto-save" />
        <span style={{ fontSize: 'var(--etui-font-size-sm)', color: '#888' }}>
          Value: {checked ? 'on' : 'off'}
        </span>
      </Stack>
    </DemoWrapper>
  );
}

export function CheckboxSizes() {
  return (
    <DemoWrapper>
      <Stack spacing={3}>
        <Checkbox size="sm" defaultChecked label="Small (14px)" />
        <Checkbox size="md" defaultChecked label="Medium (16px)" />
        <Checkbox size="lg" defaultChecked label="Large (20px)" />
        <CheckboxGroup
          size="lg"
          label="Group with size=lg (children inherit)"
          defaultValue={['diffuse']}
        >
          <Checkbox value="diffuse" label="Diffuse" />
          <Checkbox value="specular" label="Specular" />
          <Checkbox value="shadow" size="sm" label="Shadow (own size=sm)" />
        </CheckboxGroup>
      </Stack>
    </DemoWrapper>
  );
}

export function CheckboxVariants() {
  return (
    <DemoWrapper>
      <Stack spacing={3}>
        <Checkbox variant="default" defaultChecked label="Default variant" />
        <Checkbox variant="filled" defaultChecked label="Filled variant" />
      </Stack>
    </DemoWrapper>
  );
}

export function CheckboxIndeterminate() {
  const ITEMS = ['Diffuse', 'Specular', 'Shadow'] as const;
  const [checked, setChecked] = useState<boolean[]>([true, false, false]);
  const allChecked = checked.every(Boolean);
  const someChecked = checked.some(Boolean);

  return (
    <DemoWrapper>
      <Stack spacing={2}>
        <Checkbox
          checked={allChecked}
          indeterminate={someChecked && !allChecked}
          onChange={next => setChecked(ITEMS.map(() => next))}
          label="Select all"
        />
        <Stack spacing={2} style={{ paddingLeft: 24 }}>
          {ITEMS.map((item, i) => (
            <Checkbox
              key={item}
              checked={checked[i]}
              onChange={next =>
                setChecked(prev => prev.map((c, j) => (j === i ? next : c)))
              }
              label={item}
            />
          ))}
        </Stack>
      </Stack>
    </DemoWrapper>
  );
}

export function CheckboxLabelPosition() {
  return (
    <DemoWrapper>
      <Stack spacing={3}>
        <Checkbox defaultChecked label="Label on right" labelPosition="right" />
        <Checkbox defaultChecked label="Label on left" labelPosition="left" />
      </Stack>
    </DemoWrapper>
  );
}

export function CheckboxHelperError() {
  return (
    <DemoWrapper>
      <Stack spacing={3}>
        <Checkbox
          label="Accept terms"
          helperText="You must accept to continue"
        />
        <Checkbox
          label="Accept terms"
          error
          errorMessage="This field is required"
        />
      </Stack>
    </DemoWrapper>
  );
}

export function CheckboxRequired() {
  return (
    <DemoWrapper>
      <Checkbox label="I agree to the terms" required />
    </DemoWrapper>
  );
}

export function CheckboxDisabled() {
  return (
    <DemoWrapper>
      <Stack spacing={3}>
        <Checkbox disabled label="Disabled unchecked" />
        <Checkbox disabled checked label="Disabled checked" />
      </Stack>
    </DemoWrapper>
  );
}

export function CheckboxFormSubmission() {
  const [selected, setSelected] = useState<string[]>(['shadows']);
  return (
    <DemoWrapper>
      <CheckboxGroup
        label="Features"
        value={selected}
        onChange={setSelected}
        helperText={`Selected: ${selected.join(', ') || 'none'}`}
      >
        <Checkbox name="features" value="shadows" label="Enable shadows" />
        <Checkbox
          name="features"
          value="reflections"
          label="Enable reflections"
        />
        <Checkbox name="features" value="ao" label="Ambient occlusion" />
      </CheckboxGroup>
    </DemoWrapper>
  );
}

export function CheckboxCombined() {
  const [enableShadows, setEnableShadows] = useState(true);
  return (
    <DemoWrapper>
      <Checkbox
        checked={enableShadows}
        onChange={setEnableShadows}
        label="Enable shadows"
        size="sm"
        variant="filled"
        helperText="Adds real-time shadow rendering"
      />
    </DemoWrapper>
  );
}
