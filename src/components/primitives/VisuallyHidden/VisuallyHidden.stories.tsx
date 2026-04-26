import type { Meta, StoryObj } from '@storybook/react';
import { VisuallyHidden } from './VisuallyHidden';
import { Button } from '../Button';
import { IconButton } from '../IconButton';
import { SearchIcon } from '@/components/Icons/SearchIcon';
import { Stack } from '@/components/layout';

const meta: Meta<typeof VisuallyHidden> = {
  title: 'Primitives/VisuallyHidden',
  component: VisuallyHidden,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Hides content visually while keeping it accessible to screen readers. Use for SR-only labels, additional context next to icons, and skip-to-content links (with `focusable`).',
      },
    },
  },
  argTypes: {
    as: { control: 'select', options: ['span', 'div', 'label', 'p'] },
    focusable: { control: 'boolean' },
  },
};

export default meta;
type Story = StoryObj<typeof VisuallyHidden>;

export const Default: Story = {
  render: () => (
    <p style={{ maxWidth: 480 }}>
      The next words are visually hidden but present in the DOM —{' '}
      <VisuallyHidden>
        invisible to sighted users, audible to screen readers
      </VisuallyHidden>
      . Open devtools to verify they exist.
    </p>
  ),
};

export const WithVisibleSibling: Story = {
  name: 'With visible sibling',
  render: () => (
    <Stack direction="column" spacing={2}>
      <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <span>Email</span>
        <VisuallyHidden>
          We will only use your email to send password reset links.
        </VisuallyHidden>
        <input
          type="email"
          style={{
            border: '1px solid #444',
            background: 'transparent',
            color: 'inherit',
            padding: '4px 8px',
            borderRadius: 4,
          }}
        />
      </label>
    </Stack>
  ),
};

export const Focusable: Story = {
  name: 'Focusable (skip-to-content)',
  render: () => (
    <div style={{ position: 'relative', minHeight: 120, padding: 16 }}>
      <VisuallyHidden focusable>
        <a href="#main-content">Skip to main content</a>
      </VisuallyHidden>
      <p style={{ margin: 0, opacity: 0.7 }}>
        Press <kbd>Tab</kbd> to reveal the skip link.
      </p>
      <div id="main-content" style={{ marginTop: 24 }}>
        Main content begins here.
      </div>
    </div>
  ),
};

export const InCustomCheckbox: Story = {
  name: 'Hiding a native input',
  render: () => (
    <label style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
      <span
        style={{
          width: 16,
          height: 16,
          border: '1px solid #555',
          borderRadius: 2,
          display: 'inline-block',
        }}
      />
      <VisuallyHidden>
        <input type="checkbox" />
      </VisuallyHidden>
      <span>Custom checkbox</span>
    </label>
  ),
};

export const InIconButton: Story = {
  name: 'Label for icon-only button',
  render: () => (
    <Stack direction="row" spacing={3}>
      <IconButton aria-label="Search">
        <SearchIcon />
      </IconButton>
      <Button icon={<SearchIcon />}>
        <VisuallyHidden>Search the catalog</VisuallyHidden>
      </Button>
    </Stack>
  ),
};
