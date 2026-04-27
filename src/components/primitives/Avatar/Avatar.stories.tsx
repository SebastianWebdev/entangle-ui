import type { Meta, StoryObj } from '@storybook/react';
import { Avatar } from './Avatar';
import { AvatarGroup } from './AvatarGroup';
import { Stack } from '@/components/layout/Stack';
import { Flex } from '@/components/layout/Flex';

const SAMPLE_IMAGE =
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=facearea&facepad=4&w=160&h=160&q=80';

const meta: Meta<typeof Avatar> = {
  title: 'Primitives/Avatar',
  component: Avatar,
  parameters: { layout: 'centered' },
  argTypes: {
    size: {
      control: 'select',
      options: ['xs', 'sm', 'md', 'lg', 'xl', 'xxl'],
    },
    shape: {
      control: 'select',
      options: ['circle', 'square', 'rounded'],
    },
    color: {
      control: 'select',
      options: [
        'auto',
        'neutral',
        'primary',
        'success',
        'warning',
        'error',
        'info',
      ],
    },
    status: {
      control: 'select',
      options: [undefined, 'online', 'away', 'busy', 'offline'],
    },
  },
};
export default meta;

type Story = StoryObj<typeof Avatar>;

export const Default: Story = {
  args: {
    src: SAMPLE_IMAGE,
    name: 'Sebastian Kowalski',
  },
};

export const Sizes: Story = {
  render: () => (
    <Flex gap={3} align="center">
      <Avatar size="xs" src={SAMPLE_IMAGE} name="Alice" />
      <Avatar size="sm" src={SAMPLE_IMAGE} name="Alice" />
      <Avatar size="md" src={SAMPLE_IMAGE} name="Alice" />
      <Avatar size="lg" src={SAMPLE_IMAGE} name="Alice" />
      <Avatar size="xl" src={SAMPLE_IMAGE} name="Alice" />
      <Avatar size="xxl" src={SAMPLE_IMAGE} name="Alice" />
    </Flex>
  ),
};

export const Shapes: Story = {
  render: () => (
    <Flex gap={3} align="center">
      <Avatar shape="circle" size="xl" src={SAMPLE_IMAGE} name="Alice" />
      <Avatar shape="square" size="xl" src={SAMPLE_IMAGE} name="Alice" />
      <Avatar shape="rounded" size="xl" src={SAMPLE_IMAGE} name="Alice" />
    </Flex>
  ),
};

export const Initials: Story = {
  render: () => (
    <Flex gap={3} align="center">
      <Avatar size="xl" name="Alice Wong" />
      <Avatar size="xl" name="Bob Marley" />
      <Avatar size="xl" name="Carol Danvers" />
      <Avatar size="xl" name="Dave Grohl" />
      <Avatar size="xl" name="Eve Polastri" />
      <Avatar size="xl" name="Frank Ocean" />
      <Avatar size="xl" name="Grace Hopper" />
    </Flex>
  ),
};

export const IconFallback: Story = {
  render: () => (
    <Flex gap={3} align="center">
      <Avatar size="md" />
      <Avatar size="lg" />
      <Avatar size="xl" />
      <Avatar size="xxl" />
    </Flex>
  ),
};

export const Statuses: Story = {
  render: () => (
    <Flex gap={3} align="center">
      <Avatar size="xl" name="Alice" status="online" />
      <Avatar size="xl" name="Bob" status="away" />
      <Avatar size="xl" name="Carol" status="busy" />
      <Avatar size="xl" name="Dave" status="offline" />
    </Flex>
  ),
};

export const BrokenImage: Story = {
  render: () => (
    <Flex gap={3} align="center">
      <Avatar
        size="xl"
        src="https://example.invalid/missing.png"
        name="Alice Wong"
      />
      <Avatar
        size="xl"
        src="https://example.invalid/missing.png"
        alt="No name fallback"
      />
    </Flex>
  ),
};

export const Clickable: Story = {
  render: () => (
    <Flex gap={3} align="center">
      <Avatar
        size="xl"
        src={SAMPLE_IMAGE}
        name="Sebastian Kowalski"
        onClick={() => console.log('Avatar clicked')}
      />
      <Avatar
        size="xl"
        name="Click Me"
        onClick={() => console.log('Avatar clicked')}
      />
    </Flex>
  ),
};

export const Group: Story = {
  render: () => (
    <AvatarGroup max={4}>
      <Avatar src={SAMPLE_IMAGE} name="Alice Wong" />
      <Avatar name="Bob Marley" />
      <Avatar name="Carol Danvers" />
      <Avatar name="Dave Grohl" />
      <Avatar name="Eve Polastri" />
    </AvatarGroup>
  ),
};

export const GroupOverflow: Story = {
  render: () => (
    <AvatarGroup max={4}>
      <Avatar src={SAMPLE_IMAGE} name="Alice Wong" />
      <Avatar name="Bob Marley" />
      <Avatar name="Carol Danvers" />
      <Avatar name="Dave Grohl" />
      <Avatar name="Eve Polastri" />
      <Avatar name="Frank Ocean" />
      <Avatar name="Grace Hopper" />
      <Avatar name="Hank Williams" />
      <Avatar name="Ivy Wong" />
      <Avatar name="Jack Black" />
      <Avatar name="Karen Page" />
      <Avatar name="Liam Neeson" />
    </AvatarGroup>
  ),
};

export const GroupSizes: Story = {
  render: () => (
    <Stack spacing={4}>
      <AvatarGroup size="sm" max={3}>
        <Avatar name="Alice Wong" />
        <Avatar name="Bob Marley" />
        <Avatar name="Carol Danvers" />
        <Avatar name="Dave Grohl" />
      </AvatarGroup>
      <AvatarGroup size="md" max={3}>
        <Avatar name="Alice Wong" />
        <Avatar name="Bob Marley" />
        <Avatar name="Carol Danvers" />
        <Avatar name="Dave Grohl" />
      </AvatarGroup>
      <AvatarGroup size="lg" max={3}>
        <Avatar name="Alice Wong" />
        <Avatar name="Bob Marley" />
        <Avatar name="Carol Danvers" />
        <Avatar name="Dave Grohl" />
      </AvatarGroup>
      <AvatarGroup size="xl" max={3}>
        <Avatar name="Alice Wong" />
        <Avatar name="Bob Marley" />
        <Avatar name="Carol Danvers" />
        <Avatar name="Dave Grohl" />
      </AvatarGroup>
    </Stack>
  ),
};

export const EditorExample: Story = {
  render: () => (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12,
        padding: '8px 12px',
        background: 'var(--etui-color-bg-secondary)',
        border: '1px solid var(--etui-color-border-default)',
        borderRadius: 6,
        width: 360,
      }}
    >
      <span
        style={{
          fontSize: 12,
          color: 'var(--etui-color-text-secondary)',
        }}
      >
        scene-01.usd
      </span>
      <AvatarGroup size="sm" max={3}>
        <Avatar src={SAMPLE_IMAGE} name="Sebastian Kowalski" status="online" />
        <Avatar name="Alice Wong" status="online" />
        <Avatar name="Bob Marley" status="away" />
      </AvatarGroup>
    </div>
  ),
};
