import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Collapsible } from './Collapsible';
import { Text } from '@/components/primitives/Text';
import { Stack } from '@/components/layout/Stack';

const meta: Meta<typeof Collapsible> = {
  title: 'Primitives/Collapsible',
  component: Collapsible,
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
    disabled: { control: 'boolean' },
    defaultOpen: { control: 'boolean' },
    keepMounted: { control: 'boolean' },
  },
};

export default meta;
type Story = StoryObj<typeof Collapsible>;

export const Default: Story = {
  render: () => (
    <div style={{ width: 280 }}>
      <Collapsible trigger="Section Title">
        <Text size="xs" color="secondary">
          This is the collapsible content. It can contain any React nodes.
        </Text>
      </Collapsible>
    </div>
  ),
};

export const DefaultOpen: Story = {
  render: () => (
    <div style={{ width: 280 }}>
      <Collapsible trigger="Expanded by default" defaultOpen>
        <Text size="xs" color="secondary">
          This section starts expanded.
        </Text>
      </Collapsible>
    </div>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div style={{ width: 280 }}>
      <Stack spacing={2}>
        <Collapsible trigger="Small (sm)" size="sm" defaultOpen>
          <Text size="xs" color="secondary">
            Small size content
          </Text>
        </Collapsible>
        <Collapsible trigger="Medium (md)" size="md" defaultOpen>
          <Text size="xs" color="secondary">
            Medium size content
          </Text>
        </Collapsible>
        <Collapsible trigger="Large (lg)" size="lg" defaultOpen>
          <Text size="xs" color="secondary">
            Large size content
          </Text>
        </Collapsible>
      </Stack>
    </div>
  ),
};

export const Controlled: Story = {
  render: () => {
    const [open, setOpen] = useState(false);

    return (
      <div style={{ width: 280 }}>
        <Stack spacing={2}>
          <Text size="xs" color="muted">
            Open: {String(open)}
          </Text>
          <Collapsible
            trigger="Controlled section"
            open={open}
            onChange={setOpen}
          >
            <Text size="xs" color="secondary">
              Controlled content
            </Text>
          </Collapsible>
        </Stack>
      </div>
    );
  },
};

export const CustomIndicator: Story = {
  render: () => (
    <div style={{ width: 280 }}>
      <Collapsible
        trigger="Custom indicator"
        indicator={<span style={{ fontSize: 10 }}>+</span>}
        defaultOpen
      >
        <Text size="xs" color="secondary">
          Using a custom + indicator
        </Text>
      </Collapsible>
    </div>
  ),
};

export const NoIndicator: Story = {
  render: () => (
    <div style={{ width: 280 }}>
      <Collapsible trigger="No indicator" indicator={null} defaultOpen>
        <Text size="xs" color="secondary">
          No chevron indicator shown
        </Text>
      </Collapsible>
    </div>
  ),
};

export const Disabled: Story = {
  render: () => (
    <div style={{ width: 280 }}>
      <Collapsible trigger="Disabled section" disabled>
        <Text size="xs" color="secondary">
          This content is unreachable
        </Text>
      </Collapsible>
    </div>
  ),
};

export const MultipleSections: Story = {
  name: 'Editor Example — Properties Panel',
  render: () => (
    <div
      style={{
        background: '#1a1a2e',
        padding: 4,
        borderRadius: 4,
        width: 260,
      }}
    >
      <Collapsible trigger="Transform" defaultOpen>
        <Stack spacing={1}>
          <Text size="xs" color="muted">
            Position: 0, 0, 0
          </Text>
          <Text size="xs" color="muted">
            Rotation: 0, 0, 0
          </Text>
          <Text size="xs" color="muted">
            Scale: 1, 1, 1
          </Text>
        </Stack>
      </Collapsible>
      <Collapsible trigger="Material">
        <Stack spacing={1}>
          <Text size="xs" color="muted">
            Shader: Standard
          </Text>
          <Text size="xs" color="muted">
            Color: #ffffff
          </Text>
        </Stack>
      </Collapsible>
      <Collapsible trigger="Physics">
        <Stack spacing={1}>
          <Text size="xs" color="muted">
            Mass: 1.0
          </Text>
          <Text size="xs" color="muted">
            Gravity: enabled
          </Text>
        </Stack>
      </Collapsible>
    </div>
  ),
};
