import type { Meta, StoryObj } from '@storybook/react';
import { Spinner } from './Spinner';

const meta: Meta<typeof Spinner> = {
  title: 'Feedback/Spinner',
  component: Spinner,
  parameters: { layout: 'centered' },
  argTypes: {
    variant: { control: 'select', options: ['ring', 'dots', 'pulse'] },
    size: { control: 'select', options: ['xs', 'sm', 'md', 'lg'] },
    color: {
      control: 'select',
      options: ['accent', 'primary', 'secondary', 'muted'],
    },
  },
};
export default meta;
type Story = StoryObj<typeof Spinner>;

export const Default: Story = {};

export const Variants: Story = {
  render: () => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
      <Spinner variant="ring" />
      <Spinner variant="dots" />
      <Spinner variant="pulse" />
    </div>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
      <Spinner size="xs" />
      <Spinner size="sm" />
      <Spinner size="md" />
      <Spinner size="lg" />
    </div>
  ),
};

export const Colors: Story = {
  render: () => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
      <Spinner color="accent" />
      <Spinner color="primary" />
      <Spinner color="secondary" />
      <Spinner color="muted" />
    </div>
  ),
};

export const WithLabel: Story = {
  args: { showLabel: true, label: 'Fetching results...' },
};
