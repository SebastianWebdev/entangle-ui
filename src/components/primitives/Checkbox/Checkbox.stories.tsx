import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Checkbox } from './Checkbox';
import { CheckboxGroup } from './CheckboxGroup';
import { Stack } from '@/components/layout';

const meta: Meta<typeof Checkbox> = {
  title: 'Primitives/Checkbox',
  component: Checkbox,
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
    variant: {
      control: 'select',
      options: ['default', 'filled'],
    },
    labelPosition: {
      control: 'select',
      options: ['left', 'right'],
    },
    checked: { control: 'boolean' },
    indeterminate: { control: 'boolean' },
    disabled: { control: 'boolean' },
    error: { control: 'boolean' },
    label: { control: 'text' },
    helperText: { control: 'text' },
    errorMessage: { control: 'text' },
  },
};

export default meta;
type Story = StoryObj<typeof Checkbox>;

export const Default: Story = {
  args: {
    label: 'Enable auto-save',
  },
};

export const Sizes: Story = {
  render: () => (
    <Stack direction="column" spacing={2}>
      <Checkbox size="sm" label="Small checkbox" />
      <Checkbox size="md" label="Medium checkbox (default)" />
      <Checkbox size="lg" label="Large checkbox" />
    </Stack>
  ),
};

export const States: Story = {
  render: () => (
    <Stack direction="column" spacing={2}>
      <Checkbox label="Unchecked" />
      <Checkbox checked label="Checked" />
      <Checkbox indeterminate label="Indeterminate" />
      <Checkbox disabled label="Disabled unchecked" />
      <Checkbox checked disabled label="Disabled checked" />
      <Checkbox error label="Error state" />
      <Checkbox checked error label="Error checked" />
    </Stack>
  ),
};

export const LabelPositions: Story = {
  render: () => (
    <Stack direction="column" spacing={2}>
      <Checkbox label="Label on right (default)" labelPosition="right" />
      <Checkbox label="Label on left" labelPosition="left" />
    </Stack>
  ),
};

export const Variants: Story = {
  render: () => (
    <Stack direction="column" spacing={2}>
      <Checkbox variant="default" label="Default variant (unchecked)" />
      <Checkbox variant="default" checked label="Default variant (checked)" />
      <Checkbox variant="filled" label="Filled variant (unchecked)" />
      <Checkbox variant="filled" checked label="Filled variant (checked)" />
    </Stack>
  ),
};

export const WithHelperText: Story = {
  render: () => (
    <Stack direction="column" spacing={3}>
      <Checkbox
        label="Accept terms"
        helperText="You must accept terms to continue"
      />
      <Checkbox
        label="Accept terms"
        error
        errorMessage="This field is required"
      />
    </Stack>
  ),
};

export const CheckboxGroupVertical: Story = {
  name: 'CheckboxGroup — Vertical',
  render: () => {
    const [value, setValue] = useState<string[]>(['diffuse']);
    return (
      <CheckboxGroup label="Render Passes" value={value} onChange={setValue}>
        <Checkbox value="diffuse" label="Diffuse" />
        <Checkbox value="specular" label="Specular" />
        <Checkbox value="shadow" label="Shadow" />
        <Checkbox value="ao" label="Ambient Occlusion" />
      </CheckboxGroup>
    );
  },
};

export const CheckboxGroupHorizontal: Story = {
  name: 'CheckboxGroup — Horizontal',
  render: () => {
    const [value, setValue] = useState<string[]>([]);
    return (
      <CheckboxGroup
        label="Options"
        direction="row"
        value={value}
        onChange={setValue}
      >
        <Checkbox value="a" label="Option A" />
        <Checkbox value="b" label="Option B" />
        <Checkbox value="c" label="Option C" />
      </CheckboxGroup>
    );
  },
};

export const SelectAllPattern: Story = {
  name: 'Select All Pattern',
  render: () => {
    const allItems = ['diffuse', 'specular', 'shadow', 'ao'];
    const [selected, setSelected] = useState<string[]>(['diffuse', 'specular']);

    const allChecked = selected.length === allItems.length;
    const someChecked = selected.length > 0 && !allChecked;

    const handleSelectAll = () => {
      setSelected(allChecked ? [] : [...allItems]);
    };

    return (
      <Stack direction="column" spacing={1}>
        <Checkbox
          checked={allChecked}
          indeterminate={someChecked}
          label="Select All"
          onChange={handleSelectAll}
          size="md"
        />
        <div style={{ paddingLeft: 20 }}>
          <CheckboxGroup value={selected} onChange={setSelected}>
            <Checkbox value="diffuse" label="Diffuse" />
            <Checkbox value="specular" label="Specular" />
            <Checkbox value="shadow" label="Shadow" />
            <Checkbox value="ao" label="Ambient Occlusion" />
          </CheckboxGroup>
        </div>
      </Stack>
    );
  },
};

export const FormIntegration: Story = {
  name: 'Form Integration',
  render: () => {
    const [renderPasses, setRenderPasses] = useState<string[]>(['diffuse']);
    const [outputOptions, setOutputOptions] = useState<string[]>([]);

    return (
      <Stack direction="column" spacing={4}>
        <CheckboxGroup
          label="Render Passes"
          value={renderPasses}
          onChange={setRenderPasses}
          helperText="Select passes to include in output"
        >
          <Checkbox value="diffuse" label="Diffuse" />
          <Checkbox value="specular" label="Specular" />
          <Checkbox value="shadow" label="Shadow" />
        </CheckboxGroup>

        <CheckboxGroup
          label="Output Options"
          value={outputOptions}
          onChange={setOutputOptions}
          required
          error={outputOptions.length === 0}
          errorMessage="Select at least one output format"
        >
          <Checkbox value="png" label="PNG" />
          <Checkbox value="exr" label="EXR" />
          <Checkbox value="jpeg" label="JPEG" />
        </CheckboxGroup>
      </Stack>
    );
  },
};
