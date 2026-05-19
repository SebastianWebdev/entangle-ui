import type { Meta, StoryObj } from '@storybook/react';
import { Card } from './Card';

const meta: Meta<typeof Card> = {
  title: 'Layout/Card',
  component: Card,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'A bounded surface for a single semantic unit. Supports outlined, filled, and elevated variants; can be made interactive by passing onClick. Compose with Card.Header, Card.Media, Card.Body, Card.Footer.',
      },
    },
  },
  argTypes: {
    variant: { control: 'select', options: ['outlined', 'filled', 'elevated'] },
    selected: { control: 'boolean' },
    disabled: { control: 'boolean' },
  },
};
export default meta;

type Story = StoryObj<typeof Card>;

export const Default: Story = {
  render: args => (
    <div style={{ width: 320 }}>
      <Card {...args}>
        <Card.Header title="Asset preview" subtitle="Updated 2 hours ago" />
        <Card.Body>
          A short description of the asset, with a couple of supporting
          sentences to fill the layout.
        </Card.Body>
        <Card.Footer>
          <button type="button">Open</button>
        </Card.Footer>
      </Card>
    </div>
  ),
};

export const AllVariants: Story = {
  render: () => (
    <div
      style={{
        display: 'grid',
        gap: 16,
        gridTemplateColumns: 'repeat(3, 240px)',
      }}
    >
      {(['outlined', 'filled', 'elevated'] as const).map(variant => (
        <Card key={variant} variant={variant}>
          <Card.Header title={variant} subtitle="Variant" />
          <Card.Body>Same layout, different surface treatment.</Card.Body>
        </Card>
      ))}
    </div>
  ),
};

export const Interactive: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 16 }}>
      <Card onClick={() => alert('clicked')} variant="elevated">
        <Card.Header title="Clickable card" subtitle="Press Enter or Space" />
        <Card.Body>The whole card is a button.</Card.Body>
      </Card>
      <Card onClick={() => {}} selected variant="elevated">
        <Card.Header title="Selected card" subtitle="In a grid selection" />
        <Card.Body>Selected state uses the accent color.</Card.Body>
      </Card>
    </div>
  ),
};

export const WithMedia: Story = {
  render: () => (
    <div style={{ width: 320 }}>
      <Card variant="elevated">
        <Card.Media
          src="https://picsum.photos/640/360"
          alt="Random preview"
          aspectRatio={16 / 9}
        />
        <Card.Header title="Photo card" subtitle="With a 16:9 image" />
        <Card.Body>Media renders edge-to-edge above the header.</Card.Body>
        <Card.Footer align="space-between">
          <span>Free</span>
          <button type="button">Save</button>
        </Card.Footer>
      </Card>
    </div>
  ),
};

export const Disabled: Story = {
  args: {
    disabled: true,
    onClick: () => {},
  },
  render: args => (
    <div style={{ width: 320 }}>
      <Card {...args}>
        <Card.Header title="Disabled card" subtitle="Pointer events off" />
        <Card.Body>Body text is dimmed.</Card.Body>
      </Card>
    </div>
  ),
};
