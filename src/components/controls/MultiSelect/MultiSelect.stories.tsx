import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { MultiSelect } from './MultiSelect';
import type { MultiSelectOption } from './MultiSelect.types';

const FRAMEWORKS: MultiSelectOption[] = [
  { value: 'react', label: 'React' },
  { value: 'vue', label: 'Vue' },
  { value: 'svelte', label: 'Svelte' },
  { value: 'angular', label: 'Angular' },
  { value: 'solid', label: 'SolidJS' },
  { value: 'qwik', label: 'Qwik' },
];

const meta: Meta<typeof MultiSelect> = {
  title: 'Controls/MultiSelect',
  component: MultiSelect,
  argTypes: {
    size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] },
    variant: {
      control: 'inline-radio',
      options: ['default', 'ghost', 'filled'],
    },
    searchable: { control: 'boolean' },
    clearable: { control: 'boolean' },
    closeOnSelect: { control: 'boolean' },
    disabled: { control: 'boolean' },
  },
};

export default meta;

type Story = StoryObj<typeof MultiSelect>;

export const Default: Story = {
  args: {
    label: 'Frameworks',
    options: FRAMEWORKS,
    placeholder: 'Pick frameworks',
  },
};

export const Searchable: Story = {
  args: {
    label: 'Frameworks',
    options: FRAMEWORKS,
    searchable: true,
    clearable: true,
  },
};

export const WithMax: Story = {
  args: {
    label: 'Pick up to 2',
    options: FRAMEWORKS,
    max: 2,
    helperText: 'Maximum 2 frameworks',
  },
};

export const Controlled: Story = {
  render: function ControlledStory(args) {
    const [value, setValue] = useState<string[]>(['react']);
    return (
      <div style={{ width: 320 }}>
        <MultiSelect {...args} value={value} onChange={setValue} />
        <div style={{ marginTop: 8, fontFamily: 'monospace', fontSize: 12 }}>
          {value.length === 0 ? '(none)' : value.join(', ')}
        </div>
      </div>
    );
  },
  args: {
    label: 'Frameworks',
    options: FRAMEWORKS,
    clearable: true,
  },
};

export const Grouped: Story = {
  args: {
    label: 'Fruits',
    options: [
      {
        label: 'Citrus',
        options: [
          { value: 'lemon', label: 'Lemon' },
          { value: 'lime', label: 'Lime' },
          { value: 'orange', label: 'Orange' },
        ],
      },
      {
        label: 'Berries',
        options: [
          { value: 'strawberry', label: 'Strawberry' },
          { value: 'blueberry', label: 'Blueberry' },
          { value: 'raspberry', label: 'Raspberry' },
        ],
      },
    ],
    searchable: true,
  },
};

export const ManyChips: Story = {
  args: {
    label: 'Lots of selections',
    options: FRAMEWORKS,
    defaultValue: ['react', 'vue', 'svelte', 'angular'],
    maxInlineChips: 2,
  },
};
