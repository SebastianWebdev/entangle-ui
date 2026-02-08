import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Checkbox } from './Checkbox';
import { CheckboxGroup } from './CheckboxGroup';

const meta: Meta<typeof CheckboxGroup> = {
  title: 'Primitives/CheckboxGroup',
  component: CheckboxGroup,
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    direction: {
      control: 'select',
      options: ['row', 'column'],
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
    disabled: { control: 'boolean' },
    error: { control: 'boolean' },
    label: { control: 'text' },
    helperText: { control: 'text' },
    errorMessage: { control: 'text' },
  },
};

export default meta;
type Story = StoryObj<typeof CheckboxGroup>;

export const Default: Story = {
  render: () => {
    const [value, setValue] = useState<string[]>([]);
    return (
      <CheckboxGroup label="Preferences" value={value} onChange={setValue}>
        <Checkbox value="shadows" label="Enable shadows" />
        <Checkbox value="reflections" label="Enable reflections" />
        <Checkbox value="ao" label="Ambient occlusion" />
      </CheckboxGroup>
    );
  },
};

export const Disabled: Story = {
  render: () => (
    <CheckboxGroup label="Disabled Group" disabled>
      <Checkbox value="a" label="Option A" />
      <Checkbox value="b" label="Option B" />
    </CheckboxGroup>
  ),
};

export const WithError: Story = {
  render: () => (
    <CheckboxGroup
      label="Required Group"
      error
      errorMessage="Please select at least one option"
      required
    >
      <Checkbox value="a" label="Option A" />
      <Checkbox value="b" label="Option B" />
    </CheckboxGroup>
  ),
};

export const RowDirection: Story = {
  render: () => {
    const [value, setValue] = useState<string[]>(['a']);
    return (
      <CheckboxGroup
        label="Horizontal Layout"
        direction="row"
        value={value}
        onChange={setValue}
      >
        <Checkbox value="a" label="A" />
        <Checkbox value="b" label="B" />
        <Checkbox value="c" label="C" />
      </CheckboxGroup>
    );
  },
};
