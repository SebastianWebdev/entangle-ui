import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { ListItem } from './ListItem';
import { Badge } from '@/components/primitives/Badge';

const meta: Meta<typeof ListItem> = {
  title: 'Layout/ListItem',
  component: ListItem,
  parameters: { layout: 'centered' },
  argTypes: {
    density: { control: 'select', options: ['compact', 'comfortable'] },
    selected: { control: 'boolean' },
    active: { control: 'boolean' },
    disabled: { control: 'boolean' },
  },
};
export default meta;
type Story = StoryObj<typeof ListItem>;

export const Default: Story = {
  args: { children: 'scene.blend' },
};

export const Clickable: Story = {
  args: { children: 'Click me', onClick: () => {} },
};

export const Selected: Story = {
  args: { children: 'Selected', selected: true },
};
export const Active: Story = { args: { children: 'Active', active: true } };
export const Disabled: Story = {
  args: { children: 'Disabled', disabled: true },
};

const FileGlyph = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 14 14"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    aria-hidden
  >
    <path d="M3 2h5l3 3v7a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1z" />
  </svg>
);

export const InList: Story = {
  render: () => {
    const [selected, setSelected] = useState<string | null>('b');
    const items = [
      { id: 'a', name: 'scene.blend', tag: 'draft' },
      { id: 'b', name: 'materials.json', tag: 'done' },
      { id: 'c', name: 'anim_rig.blend', tag: 'running' },
      { id: 'd', name: 'old.obj', tag: 'error' },
    ];
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
          width: 320,
        }}
      >
        {items.map(item => (
          <ListItem
            key={item.id}
            leading={<FileGlyph />}
            trailing={
              <Badge
                color={
                  item.tag === 'done'
                    ? 'success'
                    : item.tag === 'error'
                      ? 'error'
                      : item.tag === 'running'
                        ? 'warning'
                        : 'neutral'
                }
              >
                {item.tag}
              </Badge>
            }
            selected={selected === item.id}
            onClick={() => setSelected(item.id)}
          >
            {item.name}
          </ListItem>
        ))}
      </div>
    );
  },
};

export const Dense: Story = {
  render: () => (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 1,
        width: 240,
      }}
    >
      <ListItem density="compact">Compact row A</ListItem>
      <ListItem density="compact">Compact row B</ListItem>
      <ListItem density="compact">Compact row C</ListItem>
    </div>
  ),
};
