import type { Meta, StoryObj } from '@storybook/react';
import { Stat } from './Stat';

const meta: Meta<typeof Stat> = {
  title: 'Feedback/Stat',
  component: Stat,
  parameters: { layout: 'centered' },
  argTypes: {
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
  },
};
export default meta;

type Story = StoryObj<typeof Stat>;

export const Default: Story = {
  args: {
    label: 'Monthly revenue',
    value: '$12,400',
    delta: { value: '+8.2%', direction: 'up' },
    helper: 'vs. last month',
  },
};

export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 32 }}>
      {(['sm', 'md', 'lg'] as const).map(size => (
        <Stat
          key={size}
          size={size}
          label={`Size ${size}`}
          value="42,184"
          delta={{ value: '+12%', direction: 'up' }}
        />
      ))}
    </div>
  ),
};

export const SemanticsPositive: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 32 }}>
      <Stat
        label="Signups (up = good)"
        value="312"
        delta={{ value: '+18', direction: 'up', semantics: 'positive' }}
      />
      <Stat
        label="Signups (down = bad)"
        value="312"
        delta={{ value: '-4', direction: 'down', semantics: 'positive' }}
      />
    </div>
  ),
};

export const SemanticsNegative: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 32 }}>
      <Stat
        label="Errors (up = bad)"
        value="32"
        delta={{ value: '+4', direction: 'up', semantics: 'negative' }}
      />
      <Stat
        label="Errors (down = good)"
        value="32"
        delta={{ value: '-12', direction: 'down', semantics: 'negative' }}
      />
    </div>
  ),
};
