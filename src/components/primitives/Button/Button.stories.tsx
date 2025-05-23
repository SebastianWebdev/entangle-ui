// src/primitives/Button/Button.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { Button } from './Button';
import { ThemeProvider } from '../../../theme';

// Example icons for stories
const PlayIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M8 5v14l11-7z" />
  </svg>
);

const DownloadIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7,10 12,15 17,10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </svg>
);

const meta: Meta<typeof Button> = {
  title: 'Primitives/Button',
  component: Button,
  decorators: [
    Story => (
      <ThemeProvider>
        <div
          style={{
            padding: '1rem',
            backgroundColor: 'var(--background-primary)',
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
          'A versatile button component built on our BaseButton primitive.',
      },
    },
  },
  argTypes: {
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'Button size variant',
    },
    variant: {
      control: 'select',
      options: ['default', 'ghost', 'filled'],
      description: 'Button visual style',
    },
    disabled: {
      control: 'boolean',
      description: 'Whether the button is disabled',
    },
    loading: {
      control: 'boolean',
      description: 'Whether the button shows loading state',
    },
    fullWidth: {
      control: 'boolean',
      description: 'Whether the button takes full width',
    },
    children: {
      control: 'text',
      description: 'Button content',
    },
  },
  args: {
    children: 'Button',
    size: 'md',
    variant: 'default',
    disabled: false,
    loading: false,
    fullWidth: false,
  },
};

export default meta;
type Story = StoryObj<typeof Button>;

// Basic stories
export const Default: Story = {};

export const Ghost: Story = {
  args: {
    variant: 'ghost',
  },
};

export const Filled: Story = {
  args: {
    variant: 'filled',
  },
};

// Size variants
export const Small: Story = {
  args: {
    size: 'sm',
    children: 'Small Button',
  },
};

export const Large: Story = {
  args: {
    size: 'lg',
    children: 'Large Button',
  },
};

// States
export const Disabled: Story = {
  args: {
    disabled: true,
  },
};

export const Loading: Story = {
  args: {
    loading: true,
    children: 'Loading...',
  },
};

// With icons
export const WithIcon: Story = {
  args: {
    icon: <PlayIcon />,
    children: 'Play',
  },
};

export const IconOnly: Story = {
  args: {
    icon: <DownloadIcon />,
    children: '',
  },
};

// Full width
export const FullWidth: Story = {
  args: {
    fullWidth: true,
    children: 'Full Width Button',
  },
  parameters: {
    layout: 'padded',
  },
};

// Showcase all variants
export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
      <Button variant="default">Default</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="filled">Filled</Button>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'All button variants displayed together.',
      },
    },
  },
};

// Showcase all sizes
export const AllSizes: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
      <Button size="sm">Small</Button>
      <Button size="md">Medium</Button>
      <Button size="lg">Large</Button>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'All button sizes displayed together.',
      },
    },
  },
};

// Interactive example
export const Interactive: Story = {
  render: () => {
    const handleClick = () => {
      alert('Button clicked!');
    };

    return (
      <div
        style={{
          display: 'flex',
          gap: '1rem',
          flexDirection: 'column',
          alignItems: 'flex-start',
        }}
      >
        <Button onClick={handleClick}>Click me!</Button>
        <Button variant="filled" icon={<PlayIcon />} onClick={handleClick}>
          Play Video
        </Button>
        <Button variant="ghost" onClick={handleClick}>
          Cancel
        </Button>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Interactive buttons that show alerts when clicked.',
      },
    },
  },
};
