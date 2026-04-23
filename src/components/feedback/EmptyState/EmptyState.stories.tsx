import type { Meta, StoryObj } from '@storybook/react';
import { EmptyState } from './EmptyState';
import { Button } from '@/components/primitives/Button';

const meta: Meta<typeof EmptyState> = {
  title: 'Feedback/EmptyState',
  component: EmptyState,
  parameters: { layout: 'centered' },
  argTypes: {
    variant: { control: 'select', options: ['default', 'compact'] },
    loading: { control: 'boolean' },
  },
};
export default meta;
type Story = StoryObj<typeof EmptyState>;

const SearchGlyph = () => (
  <svg
    width="48"
    height="48"
    viewBox="0 0 48 48"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    aria-hidden
  >
    <circle cx="22" cy="22" r="10" />
    <path d="M30 30 L40 40" strokeLinecap="round" />
  </svg>
);

export const Default: Story = {
  args: {
    icon: <SearchGlyph />,
    title: 'No results',
    description: 'Try adjusting your search or filters.',
  },
};

export const WithAction: Story = {
  args: {
    icon: <SearchGlyph />,
    title: 'No results',
    description: 'Try adjusting your search or filters.',
    action: <Button variant="filled">Reset filters</Button>,
  },
};

export const Compact: Story = {
  args: {
    variant: 'compact',
    icon: <SearchGlyph />,
    title: 'Nothing here yet',
    description: 'Add your first item to get started.',
  },
};

export const LoadingState: Story = {
  args: {
    loading: true,
    title: 'Loading conversation...',
    description: 'Fetching recent messages.',
  },
};
