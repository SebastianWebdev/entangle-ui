// src/components/layout/Spacer/Spacer.stories.tsx
import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Spacer } from './Spacer';
import { Stack } from '../Stack/Stack';
import { ThemeProvider } from '@/theme';

/**
 * Storybook configuration for Spacer component
 *
 * Simple spacer component that expands to fill available space in flex layouts.
 */
const meta: Meta<typeof Spacer> = {
  title: 'Layout/Spacer',
  component: Spacer,
  decorators: [
    Story => (
      <ThemeProvider>
        <div
          style={{
            padding: '1rem',
            backgroundColor: 'var(--background-primary)',
            color: 'var(--text-primary)',
          }}
        >
          <Story />
        </div>
      </ThemeProvider>
    ),
  ],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'A flexible spacer component that expands to fill available space or provides fixed spacing in flex layouts.',
      },
    },
  },
  argTypes: {
    size: {
      control: 'text',
      description: 'Fixed size (overrides auto-expanding behavior)',
    },
  },
  args: {
    size: undefined,
  },
};

export default meta;
type Story = StoryObj<typeof Spacer>;

// Helper component for visual examples
const Item: React.FC<{ children: React.ReactNode; color?: string }> = ({
  children,
  color = 'rgba(0, 122, 204, 0.1)',
}) => (
  <div
    style={{
      padding: '0.75rem 1rem',
      backgroundColor: color,
      border: '1px solid rgba(0, 122, 204, 0.3)',
      borderRadius: '4px',
      fontWeight: '500',
    }}
  >
    {children}
  </div>
);

// Basic usage
export const PushApart: Story = {
  render: () => (
    <div
      style={{
        border: '1px dashed rgba(255, 255, 255, 0.3)',
        padding: '1rem',
        width: '300px',
      }}
    >
      <Stack direction="row" expand>
        <Item color="rgba(244, 67, 54, 0.1)">Left</Item>
        <Spacer />
        <Item color="rgba(76, 175, 80, 0.1)">Right</Item>
      </Stack>
    </div>
  ),
};

export const VerticalSpacing: Story = {
  render: () => (
    <div
      style={{
        border: '1px dashed rgba(255, 255, 255, 0.3)',
        padding: '1rem',
        height: '200px',
      }}
    >
      <Stack direction="column" expand>
        <Item color="rgba(244, 67, 54, 0.1)">Top</Item>
        <Spacer />
        <Item color="rgba(76, 175, 80, 0.1)">Bottom</Item>
      </Stack>
    </div>
  ),
};

export const FixedSize: Story = {
  render: () => (
    <Stack direction="column">
      <Item>Before spacer</Item>
      <Spacer size="2rem" />
      <Item>After spacer (2rem gap)</Item>
    </Stack>
  ),
};

export const MultipleSpacers: Story = {
  render: () => (
    <div
      style={{
        border: '1px dashed rgba(255, 255, 255, 0.3)',
        padding: '1rem',
        width: '400px',
      }}
    >
      <Stack direction="row" expand>
        <Item color="rgba(244, 67, 54, 0.1)">Logo</Item>
        <Spacer />
        <Item color="rgba(255, 152, 0, 0.1)">Nav</Item>
        <Spacer />
        <Item color="rgba(76, 175, 80, 0.1)">User</Item>
      </Stack>
    </div>
  ),
};
