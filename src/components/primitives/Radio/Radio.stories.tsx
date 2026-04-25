import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Radio } from './Radio';
import { RadioGroup } from './RadioGroup';
import { Stack } from '@/components/layout';
import { PropertyPanel, PropertyRow } from '@/components/editor';

const meta: Meta<typeof Radio> = {
  title: 'Primitives/Radio',
  component: Radio,
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
    labelPosition: {
      control: 'select',
      options: ['left', 'right'],
    },
    checked: { control: 'boolean' },
    disabled: { control: 'boolean' },
    error: { control: 'boolean' },
    label: { control: 'text' },
    helperText: { control: 'text' },
    errorMessage: { control: 'text' },
    value: { control: 'text' },
  },
  args: {
    value: 'option',
  },
};

export default meta;
type Story = StoryObj<typeof Radio>;

export const Default: Story = {
  args: {
    value: 'local',
    label: 'Local space',
  },
};

export const Sizes: Story = {
  render: () => (
    <Stack direction="row" spacing={4}>
      <Radio value="sm" size="sm" label="Small" />
      <Radio value="md" size="md" label="Medium (default)" />
      <Radio value="lg" size="lg" label="Large" />
    </Stack>
  ),
};

export const States: Story = {
  render: () => (
    <Stack direction="column" spacing={2}>
      <Radio value="off" label="Off (unchecked)" />
      <Radio value="on" defaultChecked label="On (checked)" />
      <Radio value="dis-off" disabled label="Disabled — off" />
      <Radio value="dis-on" disabled defaultChecked label="Disabled — on" />
      <Radio value="error" error label="Error state" />
    </Stack>
  ),
};

export const LabelPositions: Story = {
  render: () => (
    <Stack direction="column" spacing={2}>
      <Radio value="r" label="Label on right (default)" labelPosition="right" />
      <Radio value="l" label="Label on left" labelPosition="left" />
    </Stack>
  ),
};

export const WithHelperText: Story = {
  render: () => (
    <Stack direction="column" spacing={3}>
      <Radio
        value="opt"
        label="Anti-aliasing"
        helperText="Improves edge quality at a small perf cost"
      />
      <Radio
        value="opt"
        error
        errorMessage="This option requires a license"
        label="HDR output"
      />
    </Stack>
  ),
};

export const Group: Story = {
  name: 'RadioGroup — Vertical',
  render: () => (
    <RadioGroup label="Coordinate space" defaultValue="local">
      <Radio value="local" label="Local" />
      <Radio value="world" label="World" />
      <Radio value="parent" label="Parent" />
      <Radio value="screen" label="Screen" />
    </RadioGroup>
  ),
};

export const GroupHorizontal: Story = {
  name: 'RadioGroup — Horizontal',
  render: () => (
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
  ),
};

export const GroupControlled: Story = {
  name: 'RadioGroup — Controlled',
  render: () => {
    const [value, setValue] = useState<string>('local');
    return (
      <Stack direction="column" spacing={2}>
        <RadioGroup
          label="Coordinate space"
          value={value}
          onChange={next => {
            console.log('onChange:', next);
            setValue(next);
          }}
        >
          <Radio value="local" label="Local" />
          <Radio value="world" label="World" />
          <Radio value="parent" label="Parent" />
        </RadioGroup>
        <div style={{ fontSize: 12, opacity: 0.7 }}>Selected: {value}</div>
      </Stack>
    );
  },
};

export const GroupDisabled: Story = {
  name: 'RadioGroup — Disabled',
  render: () => (
    <RadioGroup label="Coordinate space" defaultValue="local" disabled>
      <Radio value="local" label="Local" />
      <Radio value="world" label="World" />
      <Radio value="parent" label="Parent" />
    </RadioGroup>
  ),
};

export const GroupRequired: Story = {
  name: 'RadioGroup — Required & Error',
  render: () => (
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
  ),
};

export const EditorExample: Story = {
  name: 'Editor — Property Panel',
  render: () => {
    const [space, setSpace] = useState<string>('local');
    return (
      <div style={{ width: 320 }}>
        <PropertyPanel>
          <PropertyRow label="Coordinate space">
            <RadioGroup
              orientation="horizontal"
              size="sm"
              value={space}
              onChange={setSpace}
            >
              <Radio value="local" label="Local" />
              <Radio value="world" label="World" />
              <Radio value="parent" label="Parent" />
            </RadioGroup>
          </PropertyRow>
        </PropertyPanel>
      </div>
    );
  },
};
