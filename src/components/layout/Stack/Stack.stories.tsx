// src/components/layout/Stack/Stack.stories.tsx
import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Stack } from './Stack';
import { ThemeProvider } from '@/theme';

/**
 * Storybook configuration for Stack component
 *
 * Simple stacking component for vertical or horizontal layouts with consistent spacing.
 */
const meta: Meta<typeof Stack> = {
  title: 'Layout/Stack',
  component: Stack,
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
          'A flexible stacking component for arranging elements vertically or horizontally with consistent spacing.',
      },
    },
  },
  argTypes: {
    direction: {
      control: 'select',
      options: ['row', 'column'],
      description: 'Stack direction',
    },
    spacing: {
      control: 'select',
      options: [0, 1, 2, 3, 4, 5, 6, 7, 8],
      description: 'Spacing between items',
    },
    expand: {
      control: 'boolean',
      description: 'Fill available space in main axis direction',
    },
    justify: {
      control: 'select',
      options: [
        'flex-start',
        'flex-end',
        'center',
        'space-between',
        'space-around',
        'space-evenly',
      ],
      description: 'Main axis alignment',
    },
    align: {
      control: 'select',
      options: ['flex-start', 'flex-end', 'center', 'stretch', 'baseline'],
      description: 'Cross axis alignment',
    },
    wrap: {
      control: 'select',
      options: ['nowrap', 'wrap', 'wrap-reverse'],
      description: 'Wrap behavior',
    },
  },
  args: {
    direction: 'column',
    spacing: 2,
    expand: false,
    justify: 'flex-start',
    align: 'flex-start',
    wrap: 'nowrap',
  },
};

export default meta;
type Story = StoryObj<typeof Stack>;

// Helper component for visual examples
const Item: React.FC<{ children: React.ReactNode; color?: string }> = ({
  children,
  color = 'rgba(0, 122, 204, 0.1)',
}) => (
  <div
    style={{
      padding: '1rem',
      backgroundColor: color,
      border: '1px solid rgba(0, 122, 204, 0.3)',
      borderRadius: '4px',
      textAlign: 'center',
      fontWeight: '500',
    }}
  >
    {children}
  </div>
);

// Basic stories
export const Default: Story = {
  render: () => (
    <Stack spacing={2}>
      <Item>Item 1</Item>
      <Item>Item 2</Item>
      <Item>Item 3</Item>
    </Stack>
  ),
};

export const Interactive: Story = {
  render: args => (
    <Stack {...args}>
      <Item>Item 1</Item>
      <Item>Item 2</Item>
      <Item>Item 3</Item>
    </Stack>
  ),
};

// Direction examples
export const Vertical: Story = {
  render: () => (
    <Stack direction="column" spacing={3}>
      <Item color="rgba(244, 67, 54, 0.1)">First</Item>
      <Item color="rgba(255, 152, 0, 0.1)">Second</Item>
      <Item color="rgba(76, 175, 80, 0.1)">Third</Item>
    </Stack>
  ),
};

export const Horizontal: Story = {
  render: () => (
    <Stack direction="row" spacing={3}>
      <Item color="rgba(244, 67, 54, 0.1)">Left</Item>
      <Item color="rgba(255, 152, 0, 0.1)">Center</Item>
      <Item color="rgba(76, 175, 80, 0.1)">Right</Item>
    </Stack>
  ),
};

// Spacing examples
export const NoSpacing: Story = {
  render: () => (
    <Stack spacing={0}>
      <Item>No spacing</Item>
      <Item>Between items</Item>
      <Item>At all</Item>
    </Stack>
  ),
};

export const LargeSpacing: Story = {
  render: () => (
    <Stack spacing={5}>
      <Item>Large</Item>
      <Item>Spacing</Item>
      <Item>Between</Item>
    </Stack>
  ),
};

// Expand examples
export const ExpandedRow: Story = {
  render: () => (
    <div
      style={{ border: '1px dashed rgba(255, 255, 255, 0.3)', padding: '1rem' }}
    >
      <Stack direction="row" expand spacing={2} justify="space-between">
        <Item>Left</Item>
        <Item>Center</Item>
        <Item>Right</Item>
      </Stack>
    </div>
  ),
};

export const ExpandedColumn: Story = {
  render: () => (
    <div
      style={{
        border: '1px dashed rgba(255, 255, 255, 0.3)',
        padding: '1rem',
        height: '300px',
      }}
    >
      <Stack direction="column" expand spacing={2} justify="space-between">
        <Item>Top</Item>
        <Item>Middle</Item>
        <Item>Bottom</Item>
      </Stack>
    </div>
  ),
};

// Alignment examples
export const CenteredContent: Story = {
  render: () => (
    <div
      style={{ height: '200px', border: '1px dashed rgba(255, 255, 255, 0.3)' }}
    >
      <Stack expand justify="center" align="center" spacing={2}>
        <Item>🎯</Item>
        <Item>Centered Content</Item>
        <Item>🎯</Item>
      </Stack>
    </div>
  ),
};

export const SpaceBetween: Story = {
  render: () => (
    <Stack direction="row" expand justify="space-between" align="center">
      <Item>Logo</Item>
      <Item>Navigation</Item>
      <Item>Profile</Item>
    </Stack>
  ),
};

// Responsive example
export const Responsive: Story = {
  render: () => (
    <Stack
      direction="column"
      md="row"
      spacing={2}
      expand
      justify="space-between"
    >
      <Item>Stacks vertically on mobile</Item>
      <Item>Becomes horizontal on desktop</Item>
      <Item>Resize window to see change</Item>
    </Stack>
  ),
};

// Wrap example
export const WithWrap: Story = {
  render: () => (
    <div
      style={{
        width: '300px',
        border: '1px dashed rgba(255, 255, 255, 0.3)',
        padding: '1rem',
      }}
    >
      <Stack direction="row" wrap="wrap" spacing={2}>
        <Item>Item 1</Item>
        <Item>Item 2</Item>
        <Item>Item 3</Item>
        <Item>Item 4</Item>
        <Item>Item 5</Item>
      </Stack>
    </div>
  ),
};

// Real-world examples
export const FormActions: Story = {
  render: () => (
    <Stack direction="row" expand justify="flex-end" spacing={2}>
      <Item color="rgba(96, 125, 139, 0.1)">Cancel</Item>
      <Item color="rgba(76, 175, 80, 0.1)">Save</Item>
    </Stack>
  ),
};

export const CardList: Story = {
  render: () => (
    <Stack spacing={3}>
      <Item color="rgba(63, 81, 181, 0.1)">
        <div>
          <strong>Project Alpha</strong>
          <div
            style={{ fontSize: '0.875rem', opacity: 0.8, marginTop: '0.25rem' }}
          >
            React application with TypeScript
          </div>
        </div>
      </Item>
      <Item color="rgba(156, 39, 176, 0.1)">
        <div>
          <strong>Project Beta</strong>
          <div
            style={{ fontSize: '0.875rem', opacity: 0.8, marginTop: '0.25rem' }}
          >
            Next.js website with modern design
          </div>
        </div>
      </Item>
      <Item color="rgba(255, 152, 0, 0.1)">
        <div>
          <strong>Project Gamma</strong>
          <div
            style={{ fontSize: '0.875rem', opacity: 0.8, marginTop: '0.25rem' }}
          >
            Mobile app with React Native
          </div>
        </div>
      </Item>
    </Stack>
  ),
};

export const Navigation: Story = {
  render: () => (
    <Stack
      direction="row"
      expand
      justify="space-between"
      align="center"
      spacing={3}
    >
      <Item color="rgba(244, 67, 54, 0.1)">
        <strong>🏠 Brand</strong>
      </Item>

      <Stack direction="row" spacing={2}>
        <Item color="rgba(255, 255, 255, 0.05)">Home</Item>
        <Item color="rgba(255, 255, 255, 0.05)">About</Item>
        <Item color="rgba(255, 255, 255, 0.05)">Contact</Item>
      </Stack>

      <Item color="rgba(76, 175, 80, 0.1)">
        <strong>👤 User</strong>
      </Item>
    </Stack>
  ),
};
