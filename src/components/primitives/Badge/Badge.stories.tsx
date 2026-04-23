import type { Meta, StoryObj } from '@storybook/react';
import { Badge } from './Badge';

const meta: Meta<typeof Badge> = {
  title: 'Primitives/Badge',
  component: Badge,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'A small inline status indicator / tag for editor interfaces. Supports subtle, solid, outline, and dot variants; semantic or raw colors; leading icons; and an optional remove button.',
      },
    },
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['subtle', 'solid', 'outline', 'dot'],
    },
    size: {
      control: 'select',
      options: ['xs', 'sm', 'md', 'lg'],
    },
    color: {
      control: 'select',
      options: ['neutral', 'primary', 'info', 'success', 'warning', 'error'],
    },
    uppercase: { control: 'boolean' },
    removable: { control: 'boolean' },
  },
};
export default meta;

type Story = StoryObj<typeof Badge>;

export const Default: Story = {
  args: { children: 'Draft' },
};

const COLORS = [
  'neutral',
  'primary',
  'success',
  'warning',
  'error',
  'info',
] as const;
const VARIANTS = ['subtle', 'solid', 'outline', 'dot'] as const;

export const Variants: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 12 }}>
      {VARIANTS.map(variant => (
        <div key={variant} style={{ display: 'flex', gap: 8 }}>
          {COLORS.map(color => (
            <Badge key={color} variant={variant} color={color}>
              {color}
            </Badge>
          ))}
        </div>
      ))}
    </div>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <Badge size="xs">xs</Badge>
      <Badge size="sm">sm</Badge>
      <Badge size="md">md</Badge>
      <Badge size="lg">lg</Badge>
    </div>
  ),
};

export const WithIcons: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 8 }}>
      <Badge
        color="success"
        icon={
          <svg
            width="10"
            height="10"
            viewBox="0 0 10 10"
            aria-hidden
            focusable="false"
          >
            <path
              d="M2 5 L4 7 L8 3"
              stroke="currentColor"
              strokeWidth="1.5"
              fill="none"
              strokeLinecap="round"
            />
          </svg>
        }
      >
        Saved
      </Badge>
      <Badge
        color="error"
        icon={
          <svg
            width="10"
            height="10"
            viewBox="0 0 10 10"
            aria-hidden
            focusable="false"
          >
            <circle
              cx="5"
              cy="5"
              r="3.5"
              stroke="currentColor"
              strokeWidth="1.5"
              fill="none"
            />
          </svg>
        }
      >
        Error
      </Badge>
    </div>
  ),
};

export const Removable: Story = {
  args: {
    children: 'feature/foo',
    removable: true,
    color: 'primary',
  },
};

export const CustomColors: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 8 }}>
      <Badge color="#ff6600">orange</Badge>
      <Badge color="#9b59b6" variant="solid">
        purple
      </Badge>
      <Badge color="rgb(0, 180, 200)" variant="outline">
        teal
      </Badge>
    </div>
  ),
};

export const Uppercase: Story = {
  args: { children: 'draft', uppercase: true, color: 'warning' },
};

export const InList: Story = {
  render: () => (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        width: 280,
      }}
    >
      {[
        { name: 'Bake meshes', tag: 'done', color: 'success' },
        { name: 'Normalize UVs', tag: 'running', color: 'warning' },
        { name: 'Compile shaders', tag: 'error', color: 'error' },
      ].map(row => (
        <div
          key={row.name}
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            padding: '6px 10px',
            background: 'var(--etui-color-surface-default)',
            borderRadius: 4,
          }}
        >
          <span>{row.name}</span>
          <Badge color={row.color as 'success' | 'warning' | 'error'}>
            {row.tag}
          </Badge>
        </div>
      ))}
    </div>
  ),
};
