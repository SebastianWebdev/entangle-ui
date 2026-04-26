import { useState } from 'react';
import type React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { SegmentedControl } from './SegmentedControl';
import { SegmentedControlItem } from './SegmentedControlItem';
import { Stack } from '@/components/layout';
import { Text } from '@/components/primitives';
import { ListIcon } from '@/components/Icons/ListIcon';
import { GridIcon } from '@/components/Icons/GridIcon';
import { CodeIcon } from '@/components/Icons/CodeIcon';
import { EyeIcon } from '@/components/Icons/EyeIcon';
import { CircleIcon } from '@/components/Icons/CircleIcon';
import { TangentLinearIcon } from '@/components/Icons/TangentLinearIcon';
import { TangentAlignedIcon } from '@/components/Icons/TangentAlignedIcon';
import { TangentMirroredIcon } from '@/components/Icons/TangentMirroredIcon';

const meta: Meta<typeof SegmentedControl> = {
  title: 'Navigation/SegmentedControl',
  component: SegmentedControl,
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['subtle', 'solid', 'outline'],
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
    orientation: {
      control: 'select',
      options: ['horizontal', 'vertical'],
    },
    fullWidth: { control: 'boolean' },
    disabled: { control: 'boolean' },
  },
};

export default meta;
type Story = StoryObj<typeof SegmentedControl>;

const Label = ({ children }: { children: React.ReactNode }) => (
  <div style={{ marginBottom: 8 }}>
    <Text size="xs" color="muted">
      {children}
    </Text>
  </div>
);

export const Default: Story = {
  render: args => (
    <SegmentedControl defaultValue="week" {...args}>
      <SegmentedControlItem value="day">Day</SegmentedControlItem>
      <SegmentedControlItem value="week">Week</SegmentedControlItem>
      <SegmentedControlItem value="month">Month</SegmentedControlItem>
    </SegmentedControl>
  ),
};

export const Variants: Story = {
  render: () => (
    <Stack direction="column" spacing={4}>
      {(['subtle', 'solid', 'outline'] as const).map(variant => (
        <div key={variant}>
          <Label>{variant}</Label>
          <SegmentedControl defaultValue="b" variant={variant}>
            <SegmentedControlItem value="a">First</SegmentedControlItem>
            <SegmentedControlItem value="b">Second</SegmentedControlItem>
            <SegmentedControlItem value="c">Third</SegmentedControlItem>
          </SegmentedControl>
        </div>
      ))}
    </Stack>
  ),
};

export const Sizes: Story = {
  render: () => (
    <Stack direction="column" spacing={4}>
      {(['sm', 'md', 'lg'] as const).map(size => (
        <div key={size}>
          <Label>{size}</Label>
          <SegmentedControl defaultValue="b" size={size}>
            <SegmentedControlItem value="a">Day</SegmentedControlItem>
            <SegmentedControlItem value="b">Week</SegmentedControlItem>
            <SegmentedControlItem value="c">Month</SegmentedControlItem>
          </SegmentedControl>
        </div>
      ))}
    </Stack>
  ),
};

export const Vertical: Story = {
  render: () => (
    <SegmentedControl defaultValue="b" orientation="vertical">
      <SegmentedControlItem value="a">Top</SegmentedControlItem>
      <SegmentedControlItem value="b">Middle</SegmentedControlItem>
      <SegmentedControlItem value="c">Bottom</SegmentedControlItem>
    </SegmentedControl>
  ),
};

export const WithIcons: Story = {
  render: () => (
    <SegmentedControl defaultValue="grid">
      <SegmentedControlItem value="list" icon={<ListIcon />}>
        List
      </SegmentedControlItem>
      <SegmentedControlItem value="grid" icon={<GridIcon />}>
        Grid
      </SegmentedControlItem>
      <SegmentedControlItem value="card" icon={<CodeIcon />}>
        Card
      </SegmentedControlItem>
    </SegmentedControl>
  ),
};

export const IconOnly: Story = {
  render: () => (
    <SegmentedControl defaultValue="center" aria-label="Text alignment">
      <SegmentedControlItem
        value="left"
        icon={<TangentLinearIcon />}
        tooltip="Align left"
      />
      <SegmentedControlItem
        value="center"
        icon={<TangentAlignedIcon />}
        tooltip="Align center"
      />
      <SegmentedControlItem
        value="right"
        icon={<TangentMirroredIcon />}
        tooltip="Align right"
      />
    </SegmentedControl>
  ),
};

export const Disabled: Story = {
  render: () => (
    <SegmentedControl defaultValue="b" disabled>
      <SegmentedControlItem value="a">Day</SegmentedControlItem>
      <SegmentedControlItem value="b">Week</SegmentedControlItem>
      <SegmentedControlItem value="c">Month</SegmentedControlItem>
    </SegmentedControl>
  ),
};

export const DisabledItem: Story = {
  render: () => (
    <SegmentedControl defaultValue="a">
      <SegmentedControlItem value="a">Day</SegmentedControlItem>
      <SegmentedControlItem value="b" disabled>
        Week
      </SegmentedControlItem>
      <SegmentedControlItem value="c">Month</SegmentedControlItem>
    </SegmentedControl>
  ),
};

export const FullWidth: Story = {
  render: () => (
    <div style={{ width: 480 }}>
      <SegmentedControl defaultValue="b" fullWidth>
        <SegmentedControlItem value="a">First</SegmentedControlItem>
        <SegmentedControlItem value="b">Second</SegmentedControlItem>
        <SegmentedControlItem value="c">Third</SegmentedControlItem>
        <SegmentedControlItem value="d">Fourth</SegmentedControlItem>
      </SegmentedControl>
    </div>
  ),
};

export const EditorExample: Story = {
  name: 'Editor — Viewport Shading',
  render: () => (
    <Stack direction="column" spacing={3}>
      <Label>Viewport shading mode (icon-only with tooltips)</Label>
      <SegmentedControl
        defaultValue="solid"
        size="sm"
        variant="subtle"
        aria-label="Viewport shading"
      >
        <SegmentedControlItem
          value="wireframe"
          icon={<CircleIcon />}
          tooltip="Wireframe"
        />
        <SegmentedControlItem
          value="solid"
          icon={<EyeIcon />}
          tooltip="Solid"
        />
        <SegmentedControlItem
          value="material"
          icon={<GridIcon />}
          tooltip="Material preview"
        />
        <SegmentedControlItem
          value="rendered"
          icon={<CodeIcon />}
          tooltip="Rendered"
        />
      </SegmentedControl>
    </Stack>
  ),
};

export const ControlledWithState: Story = {
  render: () => {
    const Controlled = () => {
      const [value, setValue] = useState('week');
      return (
        <Stack direction="column" spacing={2}>
          <SegmentedControl
            value={value}
            onChange={next => {
              setValue(next);
              console.log('SegmentedControl change:', next);
            }}
          >
            <SegmentedControlItem value="day">Day</SegmentedControlItem>
            <SegmentedControlItem value="week">Week</SegmentedControlItem>
            <SegmentedControlItem value="month">Month</SegmentedControlItem>
          </SegmentedControl>
          <Text size="xs" color="muted">
            Selected: {value}
          </Text>
        </Stack>
      );
    };
    return <Controlled />;
  },
};
