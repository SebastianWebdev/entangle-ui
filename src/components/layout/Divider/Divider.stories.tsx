import type { Meta, StoryObj } from '@storybook/react';
import { Divider } from './Divider';

const meta: Meta<typeof Divider> = {
  title: 'Layout/Divider',
  component: Divider,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Thin horizontal or vertical rule for separating content. Supports dashed/dotted variants and an optional centered label.',
      },
    },
  },
  argTypes: {
    orientation: { control: 'select', options: ['horizontal', 'vertical'] },
    variant: { control: 'select', options: ['solid', 'dashed', 'dotted'] },
    spacing: {
      control: 'select',
      options: [0, 1, 2, 3, 4, 5, 6, 7],
    },
  },
};
export default meta;
type Story = StoryObj<typeof Divider>;

export const Default: Story = {
  render: () => (
    <div style={{ width: 240 }}>
      <Divider />
    </div>
  ),
};

export const Vertical: Story = {
  render: () => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, height: 32 }}>
      <span>Left</span>
      <Divider orientation="vertical" />
      <span>Right</span>
    </div>
  ),
};

export const Variants: Story = {
  render: () => (
    <div
      style={{ display: 'flex', flexDirection: 'column', gap: 12, width: 240 }}
    >
      <Divider variant="solid" />
      <Divider variant="dashed" />
      <Divider variant="dotted" />
    </div>
  ),
};

export const WithLabel: Story = {
  render: () => (
    <div style={{ width: 280 }}>
      <Divider label="Advanced" />
    </div>
  ),
};

export const InList: Story = {
  render: () => (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 6,
        width: 240,
      }}
    >
      <div>Item A</div>
      <Divider />
      <div>Item B</div>
      <Divider />
      <div>Item C</div>
    </div>
  ),
};
