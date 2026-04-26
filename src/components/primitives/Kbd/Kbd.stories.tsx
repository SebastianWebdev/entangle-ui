import type { Meta, StoryObj } from '@storybook/react';
import { Kbd } from './Kbd';
import { Button, Tooltip } from '@/components/primitives';

const meta: Meta<typeof Kbd> = {
  title: 'Primitives/Kbd',
  component: Kbd,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'A semantic keyboard shortcut primitive with platform-aware glyph rendering.',
      },
    },
  },
  argTypes: {
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
    variant: {
      control: 'select',
      options: ['solid', 'outline', 'ghost'],
    },
    glyphs: { control: 'boolean' },
    platform: {
      control: 'select',
      options: ['auto', 'mac', 'windows', 'linux'],
    },
  },
};

export default meta;

type Story = StoryObj<typeof Kbd>;

const COMMON_SHORTCUTS = [
  ['Save', 'Cmd+S'],
  ['Copy', 'Cmd+C'],
  ['Paste', 'Cmd+V'],
  ['Find', 'Cmd+F'],
  ['Undo', 'Cmd+Z'],
  ['Redo', 'Cmd+Shift+Z'],
] as const;

export const Default: Story = {
  args: { children: 'Ctrl+S', platform: 'windows' },
};

export const MacGlyphs: Story = {
  args: { children: 'Cmd+S', platform: 'mac', separator: null },
};

export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <Kbd size="sm" platform="windows">
        Ctrl+S
      </Kbd>
      <Kbd size="md" platform="windows">
        Ctrl+S
      </Kbd>
      <Kbd size="lg" platform="windows">
        Ctrl+S
      </Kbd>
    </div>
  ),
};

export const Variants: Story = {
  render: () => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <Kbd variant="solid" platform="windows">
        Ctrl+S
      </Kbd>
      <Kbd variant="outline" platform="windows">
        Ctrl+S
      </Kbd>
      <Kbd variant="ghost" platform="windows">
        Ctrl+S
      </Kbd>
    </div>
  ),
};

export const CommonShortcuts: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 8, width: 220 }}>
      {COMMON_SHORTCUTS.map(([label, shortcut]) => (
        <div
          key={label}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 16,
          }}
        >
          <span>{label}</span>
          <Kbd platform="mac" separator={null}>
            {shortcut}
          </Kbd>
        </div>
      ))}
    </div>
  ),
};

export const MultipleKeys: Story = {
  render: () => (
    <Kbd platform="windows" variant="solid">
      Ctrl+Shift+P
    </Kbd>
  ),
};

export const CustomSeparator: Story = {
  render: () => (
    <Kbd glyphs={false} separator="→">
      Ctrl+S
    </Kbd>
  ),
};

export const NoSeparator: Story = {
  render: () => (
    <Kbd platform="mac" separator={null}>
      Cmd+S
    </Kbd>
  ),
};

export const InTooltip: Story = {
  render: () => (
    <Tooltip
      title={
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          Save{' '}
          <Kbd size="sm" variant="ghost" platform="windows">
            Ctrl+S
          </Kbd>
        </span>
      }
    >
      <Button>Save</Button>
    </Tooltip>
  ),
};

export const InMenuItem: Story = {
  render: () => (
    <div
      style={{
        width: 220,
        padding: '4px 0',
        background: 'var(--etui-color-background-elevated)',
        border: '1px solid var(--etui-color-border-default)',
        borderRadius: 4,
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 16,
          padding: '4px 12px',
        }}
      >
        <span>Save</span>
        <Kbd size="sm" variant="ghost" glyphs={false}>
          Ctrl+S
        </Kbd>
      </div>
    </div>
  ),
};

export const EditorExample: Story = {
  render: () => (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, minmax(180px, 1fr))',
        gap: 8,
        width: 460,
      }}
    >
      {[
        ['Command Palette', 'Cmd+Shift+P'],
        ['Quick Open', 'Cmd+P'],
        ['Save', 'Cmd+S'],
        ['Find', 'Cmd+F'],
        ['Replace', 'Cmd+Alt+F'],
        ['Toggle Terminal', 'Ctrl+Backspace'],
        ['Move Line Up', 'Alt+Up'],
        ['Move Line Down', 'Alt+Down'],
        ['Go to Definition', 'F12'],
        ['Rename Symbol', 'F2'],
      ].map(([label, shortcut]) => (
        <div
          key={label}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
            padding: '6px 8px',
            border: '1px solid var(--etui-color-border-default)',
            borderRadius: 4,
          }}
        >
          <span>{label}</span>
          <Kbd size="sm" platform="mac" separator={null}>
            {shortcut}
          </Kbd>
        </div>
      ))}
    </div>
  ),
};
