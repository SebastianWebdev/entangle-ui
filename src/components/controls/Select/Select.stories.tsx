import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Select } from './Select';
import type { SelectOptionItem, SelectOptionGroup } from './Select.types';
import { Stack } from '@/components/layout';

const blendModeOptions: SelectOptionItem[] = [
  { value: 'normal', label: 'Normal' },
  { value: 'multiply', label: 'Multiply' },
  { value: 'screen', label: 'Screen' },
  { value: 'overlay', label: 'Overlay' },
  { value: 'darken', label: 'Darken' },
  { value: 'lighten', label: 'Lighten' },
];

const groupedBlendModes: Array<SelectOptionItem | SelectOptionGroup> = [
  {
    label: 'Basic',
    options: [
      { value: 'normal', label: 'Normal' },
      { value: 'dissolve', label: 'Dissolve' },
    ],
  },
  {
    label: 'Darken',
    options: [
      { value: 'multiply', label: 'Multiply' },
      { value: 'color-burn', label: 'Color Burn' },
      { value: 'linear-burn', label: 'Linear Burn' },
    ],
  },
  {
    label: 'Lighten',
    options: [
      { value: 'screen', label: 'Screen' },
      { value: 'color-dodge', label: 'Color Dodge' },
      { value: 'linear-dodge', label: 'Linear Dodge' },
    ],
  },
];

const withDisabledOptions: SelectOptionItem[] = [
  { value: 'png', label: 'PNG' },
  { value: 'jpg', label: 'JPEG' },
  { value: 'webp', label: 'WebP' },
  { value: 'tiff', label: 'TIFF', disabled: true },
  { value: 'bmp', label: 'BMP', disabled: true },
];

const meta: Meta<typeof Select> = {
  title: 'Controls/Select',
  component: Select,
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
      options: ['default', 'ghost', 'filled'],
    },
    disabled: { control: 'boolean' },
    error: { control: 'boolean' },
    searchable: { control: 'boolean' },
    clearable: { control: 'boolean' },
    placeholder: { control: 'text' },
    label: { control: 'text' },
    helperText: { control: 'text' },
    errorMessage: { control: 'text' },
  },
};

export default meta;
type Story = StoryObj<typeof Select>;

export const Default: Story = {
  args: {
    options: blendModeOptions,
    label: 'Blend Mode',
    placeholder: 'Select blend mode...',
  },
};

export const Sizes: Story = {
  render: () => (
    <Stack direction="column" spacing={3}>
      <Select size="sm" options={blendModeOptions} label="Small" />
      <Select size="md" options={blendModeOptions} label="Medium (default)" />
      <Select size="lg" options={blendModeOptions} label="Large" />
    </Stack>
  ),
};

export const Variants: Story = {
  render: () => (
    <Stack direction="column" spacing={3}>
      <Select
        variant="default"
        options={blendModeOptions}
        label="Default"
        value="normal"
      />
      <Select
        variant="ghost"
        options={blendModeOptions}
        label="Ghost"
        value="normal"
      />
      <Select
        variant="filled"
        options={blendModeOptions}
        label="Filled"
        value="normal"
      />
    </Stack>
  ),
};

export const Searchable: Story = {
  args: {
    options: blendModeOptions,
    label: 'Blend Mode',
    searchable: true,
    searchPlaceholder: 'Filter blend modes...',
  },
};

export const Clearable: Story = {
  render: () => {
    const [value, setValue] = useState<string | null>('multiply');

    return (
      <Select
        options={blendModeOptions}
        label="Blend Mode"
        value={value}
        onChange={setValue}
        clearable
      />
    );
  },
};

export const Grouped: Story = {
  args: {
    options: groupedBlendModes,
    label: 'Blend Mode',
    placeholder: 'Choose a blend mode...',
  },
};

export const WithDisabledOptions: Story = {
  name: 'Disabled Options',
  args: {
    options: withDisabledOptions,
    label: 'Export Format',
    placeholder: 'Select format...',
  },
};

export const States: Story = {
  render: () => (
    <Stack direction="column" spacing={3}>
      <Select
        options={blendModeOptions}
        label="Default"
        placeholder="Select..."
      />
      <Select options={blendModeOptions} label="With value" value="multiply" />
      <Select
        options={blendModeOptions}
        label="Disabled"
        disabled
        value="screen"
      />
      <Select
        options={blendModeOptions}
        label="Error"
        error
        errorMessage="Please select a blend mode"
      />
    </Stack>
  ),
};

export const WithHelperText: Story = {
  render: () => (
    <Stack direction="column" spacing={3}>
      <Select
        options={blendModeOptions}
        label="Blend Mode"
        helperText="Controls how layers are blended together"
      />
      <Select
        options={blendModeOptions}
        label="Blend Mode"
        error
        errorMessage="Blend mode is required for this layer type"
      />
    </Stack>
  ),
};

export const Controlled: Story = {
  render: () => {
    const [value, setValue] = useState<string | null>('normal');

    return (
      <Stack direction="column" spacing={3}>
        <Select
          options={blendModeOptions}
          label="Blend Mode"
          value={value}
          onChange={setValue}
          clearable
        />
        <div style={{ color: '#999', fontSize: 12 }}>
          Current value: {value ?? '(none)'}
        </div>
      </Stack>
    );
  },
};

export const PropertyPanel: Story = {
  name: 'Property Panel Example',
  render: () => {
    const [blendMode, setBlendMode] = useState<string | null>('normal');
    const [format, setFormat] = useState<string | null>('png');

    return (
      <Stack direction="column" spacing={3}>
        <Select
          size="sm"
          variant="filled"
          options={groupedBlendModes}
          label="Blend Mode"
          value={blendMode}
          onChange={setBlendMode}
          searchable
          clearable
        />
        <Select
          size="sm"
          variant="filled"
          options={withDisabledOptions}
          label="Export Format"
          value={format}
          onChange={setFormat}
        />
      </Stack>
    );
  },
};
