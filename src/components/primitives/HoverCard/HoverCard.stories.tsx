import type { Meta, StoryObj } from '@storybook/react';
import { HoverCard } from './HoverCard';

const meta: Meta<typeof HoverCard> = {
  title: 'Primitives/HoverCard',
  component: HoverCard,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Hover-driven floating panel for previews. Opens on hover or focus, with configurable open/close delays, and a safe polygon that lets the cursor move from trigger onto the content without closing.',
      },
    },
  },
  argTypes: {
    placement: {
      control: 'select',
      options: [
        'top',
        'top-start',
        'top-end',
        'bottom',
        'bottom-start',
        'bottom-end',
        'left',
        'right',
      ],
    },
    openDelay: { control: { type: 'number', min: 0, max: 2000, step: 50 } },
    closeDelay: { control: { type: 'number', min: 0, max: 2000, step: 50 } },
    disableSafePolygon: { control: 'boolean' },
    disabled: { control: 'boolean' },
  },
};
export default meta;

type Story = StoryObj<typeof HoverCard>;

export const Default: Story = {
  render: args => (
    <HoverCard {...args}>
      <HoverCard.Trigger>
        <button type="button">Hover me</button>
      </HoverCard.Trigger>
      <HoverCard.Content width={280}>
        <strong>@octocat</strong>
        <p
          style={{
            margin: '4px 0 0',
            color: 'var(--etui-color-text-secondary)',
          }}
        >
          The mascot of GitHub. Followed by 1.2k people.
        </p>
      </HoverCard.Content>
    </HoverCard>
  ),
};

export const SlowOpen: Story = {
  args: { openDelay: 800, closeDelay: 200 },
  render: args => (
    <HoverCard {...args}>
      <HoverCard.Trigger>
        <button type="button">Hover (800ms delay)</button>
      </HoverCard.Trigger>
      <HoverCard.Content>Loaded after 800ms</HoverCard.Content>
    </HoverCard>
  ),
};

export const InteractiveContent: Story = {
  render: () => (
    <HoverCard openDelay={150} closeDelay={300}>
      <HoverCard.Trigger>
        <button type="button">Profile preview</button>
      </HoverCard.Trigger>
      <HoverCard.Content width={300}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <strong>Sebastian</strong>
          <p style={{ margin: 0 }}>Hover and move into the card to interact.</p>
          <button type="button" style={{ alignSelf: 'flex-start' }}>
            Follow
          </button>
        </div>
      </HoverCard.Content>
    </HoverCard>
  ),
};

export const Disabled: Story = {
  args: { disabled: true },
  render: args => (
    <HoverCard {...args}>
      <HoverCard.Trigger>
        <button type="button">Disabled (won't open)</button>
      </HoverCard.Trigger>
      <HoverCard.Content>Should never appear.</HoverCard.Content>
    </HoverCard>
  ),
};
