import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Combobox } from './Combobox';
import type { ComboboxOption } from './Combobox.types';

const COUNTRIES: ComboboxOption[] = [
  { value: 'us', label: 'United States', description: 'USA' },
  { value: 'gb', label: 'United Kingdom', description: 'GBR' },
  { value: 'fr', label: 'France', description: 'FRA' },
  { value: 'de', label: 'Germany', description: 'DEU' },
  { value: 'jp', label: 'Japan', description: 'JPN' },
  { value: 'br', label: 'Brazil', description: 'BRA' },
  { value: 'au', label: 'Australia', description: 'AUS' },
];

const meta: Meta<typeof Combobox> = {
  title: 'Controls/Combobox',
  component: Combobox,
  argTypes: {
    size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] },
    variant: {
      control: 'inline-radio',
      options: ['default', 'ghost', 'filled'],
    },
    freeSolo: { control: 'boolean' },
    creatable: { control: 'boolean' },
    clearable: { control: 'boolean' },
    loading: { control: 'boolean' },
    openOnFocus: { control: 'boolean' },
  },
};

export default meta;

type Story = StoryObj<typeof Combobox>;

export const Default: Story = {
  args: {
    label: 'Country',
    options: COUNTRIES,
    placeholder: 'Search countries...',
    clearable: true,
  },
};

export const Controlled: Story = {
  render: function ControlledStory(args) {
    const [value, setValue] = useState<string | null>('fr');
    return (
      <div style={{ width: 320 }}>
        <Combobox {...args} value={value} onChange={setValue} />
        <div style={{ marginTop: 8, fontFamily: 'monospace', fontSize: 12 }}>
          value: {value ?? '(none)'}
        </div>
      </div>
    );
  },
  args: {
    label: 'Country',
    options: COUNTRIES,
    clearable: true,
  },
};

export const FreeSolo: Story = {
  args: {
    label: 'Tag',
    options: COUNTRIES,
    freeSolo: true,
    helperText: 'Type any value or pick from the list',
  },
};

export const Creatable: Story = {
  render: function CreatableStory(args) {
    const [value, setValue] = useState<string | null>(null);
    const [extraOptions, setExtraOptions] = useState<ComboboxOption[]>([]);
    return (
      <div style={{ width: 320 }}>
        <Combobox
          {...args}
          options={[...COUNTRIES, ...extraOptions]}
          value={value}
          onChange={setValue}
          onCreate={input => {
            const created: ComboboxOption = { value: input, label: input };
            setExtraOptions(prev => [...prev, created]);
            setValue(input);
          }}
        />
        <div style={{ marginTop: 8, fontFamily: 'monospace', fontSize: 12 }}>
          value: {value ?? '(none)'}
        </div>
      </div>
    );
  },
  args: {
    label: 'Country (creatable)',
    creatable: true,
  },
};

export const Loading: Story = {
  args: {
    label: 'Country',
    options: [],
    loading: true,
    openOnFocus: true,
  },
};

export const OpenOnFocus: Story = {
  args: {
    label: 'Country',
    options: COUNTRIES,
    openOnFocus: true,
    placeholder: 'Click to browse',
  },
};
