import type { Meta, StoryObj } from '@storybook/react';
import { Code } from './Code';

const meta: Meta<typeof Code> = {
  title: 'Primitives/Code',
  component: Code,
  parameters: { layout: 'centered' },
  argTypes: {
    size: { control: 'select', options: ['xs', 'sm', 'md'] },
  },
};
export default meta;
type Story = StoryObj<typeof Code>;

export const Default: Story = {
  args: { children: 'npm install entangle-ui' },
};

export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <Code size="xs">xs</Code>
      <Code size="sm">sm</Code>
      <Code size="md">md</Code>
    </div>
  ),
};

export const InSentence: Story = {
  render: () => (
    <p style={{ maxWidth: 480 }}>
      Install the package with <Code>npm install entangle-ui</Code> and import
      components from the root barrel.
    </p>
  ),
};
