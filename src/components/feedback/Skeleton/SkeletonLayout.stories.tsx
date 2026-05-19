import type { Meta, StoryObj } from '@storybook/react';
import { SkeletonLayout } from './SkeletonLayout';

const meta: Meta<typeof SkeletonLayout> = {
  title: 'Feedback/SkeletonLayout',
  component: SkeletonLayout,
  parameters: { layout: 'centered' },
  argTypes: {
    variant: {
      control: 'select',
      options: ['card', 'list', 'table', 'grid', 'chat'],
    },
    animation: { control: 'select', options: ['pulse', 'wave', 'none'] },
    count: { control: 'number' },
    columns: { control: 'number' },
    width: { control: 'text' },
  },
};
export default meta;
type Story = StoryObj<typeof SkeletonLayout>;

export const Card: Story = {
  args: { variant: 'card', width: 360 },
};

export const List: Story = {
  args: { variant: 'list', width: 360 },
};

export const Table: Story = {
  args: { variant: 'table', width: 480 },
};

export const Grid: Story = {
  args: { variant: 'grid', width: 360 },
};

export const Chat: Story = {
  args: { variant: 'chat', width: 360 },
};

export const ListLong: Story = {
  args: { variant: 'list', count: 10, width: 360 },
};

export const TableWide: Story = {
  args: { variant: 'table', columns: 6, count: 8, width: 640 },
};

export const GridDense: Story = {
  args: { variant: 'grid', columns: 6, count: 24, width: 480 },
};
