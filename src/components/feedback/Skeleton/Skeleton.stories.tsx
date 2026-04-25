import type { Meta, StoryObj } from '@storybook/react';
import { Skeleton } from './Skeleton';
import { SkeletonGroup } from './SkeletonGroup';
import { Stack } from '@/components/layout/Stack';
import { Flex } from '@/components/layout/Flex';
import {
  PropertyPanel,
  PropertySection,
} from '@/components/editor/PropertyInspector';

const meta: Meta<typeof Skeleton> = {
  title: 'Feedback/Skeleton',
  component: Skeleton,
  parameters: { layout: 'centered' },
  argTypes: {
    shape: { control: 'select', options: ['rect', 'circle', 'line'] },
    animation: { control: 'select', options: ['pulse', 'wave', 'none'] },
    width: { control: 'text' },
    height: { control: 'text' },
  },
};
export default meta;
type Story = StoryObj<typeof Skeleton>;

export const Default: Story = {
  args: { width: 240, height: 16 },
};

export const Shapes: Story = {
  render: () => (
    <Flex gap={5} align="center">
      <Stack spacing={2} align="center">
        <Skeleton shape="rect" width={120} height={48} />
        <span style={{ fontSize: 11, opacity: 0.6 }}>rect</span>
      </Stack>
      <Stack spacing={2} align="center">
        <Skeleton shape="circle" width={48} />
        <span style={{ fontSize: 11, opacity: 0.6 }}>circle</span>
      </Stack>
      <Stack spacing={2} align="center" style={{ width: 160 }}>
        <Skeleton shape="line" width="100%" />
        <span style={{ fontSize: 11, opacity: 0.6 }}>line</span>
      </Stack>
    </Flex>
  ),
};

export const Sizes: Story = {
  render: () => (
    <Stack spacing={3} style={{ width: 320 }}>
      <Skeleton width={64} height={16} />
      <Skeleton width={160} height={16} />
      <Skeleton width="100%" height={16} />
      <Skeleton width="60%" height={16} />
    </Stack>
  ),
};

export const Animations: Story = {
  render: () => (
    <Flex gap={5} align="center">
      <Stack spacing={2} align="center">
        <Skeleton width={120} height={48} animation="pulse" />
        <span style={{ fontSize: 11, opacity: 0.6 }}>pulse</span>
      </Stack>
      <Stack spacing={2} align="center">
        <Skeleton width={120} height={48} animation="wave" />
        <span style={{ fontSize: 11, opacity: 0.6 }}>wave</span>
      </Stack>
      <Stack spacing={2} align="center">
        <Skeleton width={120} height={48} animation="none" />
        <span style={{ fontSize: 11, opacity: 0.6 }}>none</span>
      </Stack>
    </Flex>
  ),
};

export const LineParagraph: Story = {
  render: () => (
    <Stack spacing={2} style={{ width: 360 }}>
      <Skeleton shape="line" width="60%" />
      <Skeleton shape="line" width="100%" />
      <Skeleton shape="line" width="90%" />
      <Skeleton shape="line" width="75%" />
      <Skeleton shape="line" width="40%" />
    </Stack>
  ),
};

export const Card: Story = {
  render: () => (
    <Flex
      gap={3}
      align="flex-start"
      style={{
        width: 360,
        padding: 12,
        borderRadius: 6,
        background: 'var(--etui-color-bg-elevated)',
      }}
    >
      <Skeleton shape="circle" width={40} />
      <Stack spacing={2} style={{ flex: 1 }}>
        <Skeleton shape="line" width="70%" />
        <Skeleton shape="line" width="100%" />
        <Skeleton shape="line" width="50%" />
        <Skeleton width="100%" height={80} />
      </Stack>
    </Flex>
  ),
};

export const List: Story = {
  render: () => (
    <SkeletonGroup
      count={5}
      spacing={2}
      itemProps={{ shape: 'line', width: '100%' }}
      style={{ width: 360 }}
    />
  ),
};

export const Grid: Story = {
  render: () => (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 80px)',
        gap: 12,
      }}
    >
      {Array.from({ length: 12 }, (_, i) => (
        <Skeleton key={i} width={80} height={80} animation="none" />
      ))}
    </div>
  ),
};

export const EditorExample: Story = {
  render: () => (
    <div style={{ width: 280 }}>
      <PropertyPanel size="sm">
        <PropertySection title="Transform" defaultExpanded>
          <Stack spacing={2} style={{ padding: 8 }}>
            <Skeleton shape="line" width="100%" />
            <Skeleton shape="line" width="80%" />
            <Skeleton shape="line" width="65%" />
          </Stack>
        </PropertySection>
        <PropertySection title="Material" defaultExpanded>
          <Stack spacing={2} style={{ padding: 8 }}>
            <Skeleton shape="line" width="90%" />
            <Skeleton shape="line" width="55%" />
          </Stack>
        </PropertySection>
      </PropertyPanel>
    </div>
  ),
};
