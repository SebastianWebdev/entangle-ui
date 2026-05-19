import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { TagInput } from './TagInput';

const meta: Meta<typeof TagInput> = {
  title: 'Controls/TagInput',
  component: TagInput,
  argTypes: {
    size: {
      control: 'inline-radio',
      options: ['sm', 'md', 'lg'],
    },
    variant: {
      control: 'inline-radio',
      options: ['default', 'ghost', 'filled'],
    },
    addOnBlur: { control: 'boolean' },
    allowDuplicates: { control: 'boolean' },
    error: { control: 'boolean' },
    disabled: { control: 'boolean' },
    readOnly: { control: 'boolean' },
  },
};

export default meta;

type Story = StoryObj<typeof TagInput>;

export const Default: Story = {
  args: {
    label: 'Keywords',
    placeholder: 'Add a keyword and press Enter',
  },
};

export const WithInitialTags: Story = {
  args: {
    label: 'Stack',
    defaultValue: ['react', 'typescript', 'vanilla-extract'],
  },
};

export const Controlled: Story = {
  render: function ControlledStory(args) {
    const [tags, setTags] = useState<string[]>(['initial']);
    return (
      <div style={{ width: 360 }}>
        <TagInput {...args} value={tags} onChange={setTags} />
        <div style={{ marginTop: 8, fontFamily: 'monospace', fontSize: 12 }}>
          {tags.length === 0 ? '(empty)' : tags.join(', ')}
        </div>
      </div>
    );
  },
  args: {
    label: 'Tags',
    placeholder: 'Type and press Enter',
  },
};

export const WithMax: Story = {
  args: {
    label: 'Up to 3 tags',
    max: 3,
    defaultValue: ['one', 'two'],
    helperText: 'Adds up to 3 tags',
  },
};

export const AddOnBlur: Story = {
  args: {
    label: 'Auto-commit on blur',
    addOnBlur: true,
    helperText: 'Type something then click outside',
  },
};

export const WithValidation: Story = {
  render: function ValidationStory(args) {
    const [error, setError] = useState<string | undefined>();
    return (
      <div style={{ width: 360 }}>
        <TagInput
          {...args}
          error={error !== undefined}
          errorMessage={error}
          validate={value =>
            /^[a-z0-9-]+$/.test(value) || 'lowercase, digits, hyphens'
          }
          onValidate={(_, reason) => {
            setError(typeof reason === 'string' ? reason : 'invalid');
            window.setTimeout(() => {
              setError(undefined);
            }, 1500);
          }}
        />
      </div>
    );
  },
  args: {
    label: 'Slug parts',
    placeholder: 'lowercase only',
  },
};

export const Sizes: Story = {
  render: () => (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        width: 360,
      }}
    >
      <TagInput size="sm" label="sm" defaultValue={['small']} />
      <TagInput size="md" label="md" defaultValue={['medium']} />
      <TagInput size="lg" label="lg" defaultValue={['large']} />
    </div>
  ),
};

export const ReadOnly: Story = {
  args: {
    label: 'Read only',
    readOnly: true,
    defaultValue: ['locked', 'frozen'],
  },
};
