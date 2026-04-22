import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { TextArea } from './TextArea';

const meta: Meta<typeof TextArea> = {
  title: 'Primitives/TextArea',
  component: TextArea,
  parameters: { layout: 'centered' },
  argTypes: {
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
    resize: {
      control: 'select',
      options: ['none', 'vertical', 'horizontal', 'both'],
    },
    disabled: { control: 'boolean' },
    error: { control: 'boolean' },
    monospace: { control: 'boolean' },
    showCount: { control: 'boolean' },
  },
};
export default meta;
type Story = StoryObj<typeof TextArea>;

export const Default: Story = {
  args: { placeholder: 'Type something...' },
};

export const WithLabel: Story = {
  args: { label: 'Description', helperText: 'Brief description', rows: 4 },
};

export const ErrorState: Story = {
  args: {
    label: 'Description',
    error: true,
    errorMessage: 'This field is required',
  },
};

export const Sizes: Story = {
  render: () => (
    <div
      style={{ display: 'flex', flexDirection: 'column', gap: 12, width: 320 }}
    >
      <TextArea size="sm" placeholder="sm" />
      <TextArea size="md" placeholder="md" />
      <TextArea size="lg" placeholder="lg" />
    </div>
  ),
};

export const AutoResize: Story = {
  render: () => {
    const [value, setValue] = useState('');
    return (
      <div style={{ width: 320 }}>
        <TextArea
          label="Notes"
          placeholder="Type several lines..."
          value={value}
          onChange={setValue}
          minRows={2}
          maxRows={6}
        />
      </div>
    );
  },
};

export const Monospace: Story = {
  args: {
    monospace: true,
    defaultValue: 'const x = 1;\nconst y = 2;',
    rows: 4,
  },
};

export const WithCharCount: Story = {
  args: {
    label: 'Tweet',
    maxLength: 280,
    showCount: true,
    defaultValue: 'Hello world',
  },
};
