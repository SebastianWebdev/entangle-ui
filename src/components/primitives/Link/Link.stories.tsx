import type { Meta, StoryObj } from '@storybook/react';
import { Link } from './Link';
import { Stack } from '@/components/layout';

const meta: Meta<typeof Link> = {
  title: 'Primitives/Link',
  component: Link,
  parameters: { layout: 'centered' },
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'subtle', 'inline'],
    },
    underline: {
      control: 'select',
      options: ['always', 'hover', 'never'],
    },
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
    external: { control: 'boolean' },
    disabled: { control: 'boolean' },
    href: { control: 'text' },
    children: { control: 'text' },
  },
};

export default meta;
type Story = StoryObj<typeof Link>;

export const Default: Story = {
  args: {
    href: '/docs',
    children: 'Read the docs',
  },
};

export const Variants: Story = {
  render: () => (
    <Stack direction="column" spacing={2}>
      <Link href="/foo" variant="default">
        Default link
      </Link>
      <Link href="/foo" variant="subtle">
        Subtle link
      </Link>
      <span>
        Wrap an{' '}
        <Link href="/foo" variant="inline">
          inline link
        </Link>{' '}
        inside a sentence — it inherits color from its surroundings.
      </span>
    </Stack>
  ),
};

export const Underline: Story = {
  render: () => (
    <Stack direction="column" spacing={2}>
      <Link href="/foo" underline="always">
        Always underlined
      </Link>
      <Link href="/foo" underline="hover">
        Underlined on hover
      </Link>
      <Link href="/foo" underline="never">
        Never underlined
      </Link>
    </Stack>
  ),
};

export const Sizes: Story = {
  render: () => (
    <Stack direction="column" spacing={2}>
      <Link href="/foo" size="sm">
        Small link
      </Link>
      <Link href="/foo" size="md">
        Medium link (default)
      </Link>
      <Link href="/foo" size="lg">
        Large link
      </Link>
    </Stack>
  ),
};

export const External: Story = {
  render: () => (
    <Stack direction="column" spacing={2}>
      <Link href="https://example.com">Auto-detected from https://</Link>
      <Link href="/internal" external>
        Forced external on a relative URL
      </Link>
      <Link href="https://example.com" external={false}>
        Disabled external (same tab)
      </Link>
    </Stack>
  ),
};

export const Disabled: Story = {
  render: () => (
    <Stack direction="column" spacing={2}>
      <Link href="/foo" disabled>
        Disabled link
      </Link>
      <Link href="https://example.com" disabled>
        Disabled external link
      </Link>
    </Stack>
  ),
};

export const Polymorphic: Story = {
  name: 'Polymorphic (`as`)',
  render: () => (
    <Stack direction="column" spacing={2}>
      <Link as="button" onClick={() => alert('clicked')}>
        Rendered as a button
      </Link>
      <span style={{ fontSize: 11, opacity: 0.6 }}>
        Use this with router libraries:{' '}
        <code>{`<Link as={RouterLink} to="/foo" />`}</code>
      </span>
    </Stack>
  ),
};

export const InProse: Story = {
  name: 'Inline in prose',
  render: () => (
    <p style={{ maxWidth: 480, lineHeight: 1.6 }}>
      Read the{' '}
      <Link href="/guide" variant="inline">
        getting-started guide
      </Link>{' '}
      first, then explore the{' '}
      <Link href="https://example.com" variant="inline">
        external API reference
      </Link>{' '}
      to dig deeper. Inline links inherit color from their parent text.
    </p>
  ),
};

export const EditorExample: Story = {
  name: 'Editor status bar',
  render: () => (
    <div
      style={{
        display: 'flex',
        gap: 16,
        alignItems: 'center',
        padding: '4px 8px',
        background: 'var(--etui-color-background-elevated)',
        borderRadius: 4,
        fontSize: 11,
      }}
    >
      <span>main</span>
      <Link href="/changes" size="sm" variant="subtle">
        12 unstaged changes
      </Link>
      <Link href="https://docs.example.com" size="sm" variant="subtle">
        Docs
      </Link>
    </div>
  ),
};
