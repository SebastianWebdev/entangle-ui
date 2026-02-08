import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Popover } from './Popover';
import { PopoverTrigger } from './PopoverTrigger';
import { PopoverContent } from './PopoverContent';
import { PopoverClose } from './PopoverClose';
import { Button } from '@/components/primitives/Button';
import { Input } from '@/components/primitives/Input';
import { Text } from '@/components/primitives/Text';
import { Stack } from '@/components/layout/Stack';
import type { PopoverPlacement } from './Popover.types';

const meta: Meta<typeof Popover> = {
  title: 'Primitives/Popover',
  component: Popover,
  parameters: {
    layout: 'centered',
  },
};

export default meta;
type Story = StoryObj<typeof Popover>;

// --- Stories ---

export const Default: Story = {
  render: () => (
    <Popover>
      <PopoverTrigger>
        <Button>Open Popover</Button>
      </PopoverTrigger>
      <PopoverContent width={240}>
        <Text size="sm">
          This is popover content. It can contain any elements.
        </Text>
      </PopoverContent>
    </Popover>
  ),
};

export const WithCloseButton: Story = {
  render: () => (
    <Popover>
      <PopoverTrigger>
        <Button>Settings</Button>
      </PopoverTrigger>
      <PopoverContent width={260} padding="lg">
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 8,
          }}
        >
          <Text size="sm" weight="semibold">
            Quick Settings
          </Text>
          <PopoverClose />
        </div>
        <Text size="xs" color="muted">
          Adjust your preferences here.
        </Text>
      </PopoverContent>
    </Popover>
  ),
};

export const Placements: Story = {
  render: () => {
    const placements: PopoverPlacement[] = [
      'top',
      'top-start',
      'top-end',
      'bottom',
      'bottom-start',
      'bottom-end',
      'left',
      'left-start',
      'left-end',
      'right',
      'right-start',
      'right-end',
    ];

    return (
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 16,
          padding: 100,
        }}
      >
        {placements.map(p => (
          <Popover key={p} placement={p}>
            <PopoverTrigger>
              <Button variant="ghost" size="sm">
                {p}
              </Button>
            </PopoverTrigger>
            <PopoverContent width={160} padding="sm">
              <Text size="xs">{p}</Text>
            </PopoverContent>
          </Popover>
        ))}
      </div>
    );
  },
};

export const Controlled: Story = {
  render: () => {
    const [open, setOpen] = useState(false);

    return (
      <Stack spacing={3}>
        <Text size="xs" color="muted">
          Open: {String(open)}
        </Text>
        <Stack direction="row" spacing={2}>
          <Button size="sm" onClick={() => setOpen(true)}>
            Open externally
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setOpen(false)}>
            Close externally
          </Button>
        </Stack>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger>
            <Button>Toggle Popover</Button>
          </PopoverTrigger>
          <PopoverContent width={200}>
            <Text size="sm">Controlled popover</Text>
          </PopoverContent>
        </Popover>
      </Stack>
    );
  },
};

export const MatchTriggerWidth: Story = {
  render: () => (
    <Popover matchTriggerWidth>
      <PopoverTrigger>
        <Button style={{ width: 300 }}>Dropdown-like trigger</Button>
      </PopoverTrigger>
      <PopoverContent padding="sm">
        <Stack spacing={1}>
          <Text size="sm">Option A</Text>
          <Text size="sm">Option B</Text>
          <Text size="sm">Option C</Text>
        </Stack>
      </PopoverContent>
    </Popover>
  ),
};

export const RichContent: Story = {
  render: () => (
    <Popover>
      <PopoverTrigger>
        <Button>Edit Name</Button>
      </PopoverTrigger>
      <PopoverContent width={280} padding="lg">
        <Stack spacing={3}>
          <Text size="sm" weight="semibold">
            Rename Item
          </Text>
          <Input size="sm" placeholder="Enter name..." />
          <Stack direction="row" spacing={2} justify="flex-end">
            <PopoverClose>
              <Button size="sm" variant="ghost">
                Cancel
              </Button>
            </PopoverClose>
            <Button size="sm">Save</Button>
          </Stack>
        </Stack>
      </PopoverContent>
    </Popover>
  ),
};

export const NoPortal: Story = {
  render: () => (
    <Popover portal={false}>
      <PopoverTrigger>
        <Button>Inline Popover</Button>
      </PopoverTrigger>
      <PopoverContent width={200}>
        <Text size="sm">This renders inline (no portal).</Text>
      </PopoverContent>
    </Popover>
  ),
};

export const PaddingVariants: Story = {
  render: () => (
    <Stack direction="row" spacing={3}>
      {(['none', 'sm', 'md', 'lg'] as const).map(p => (
        <Popover key={p}>
          <PopoverTrigger>
            <Button size="sm" variant="ghost">
              {p}
            </Button>
          </PopoverTrigger>
          <PopoverContent width={160} padding={p}>
            <Text size="xs">padding=&quot;{p}&quot;</Text>
          </PopoverContent>
        </Popover>
      ))}
    </Stack>
  ),
};

export const NestedPopovers: Story = {
  render: () => (
    <Popover>
      <PopoverTrigger>
        <Button>First Level</Button>
      </PopoverTrigger>
      <PopoverContent width={240} padding="lg">
        <Stack spacing={2}>
          <Text size="sm">First level content</Text>
          <Popover placement="right-start">
            <PopoverTrigger>
              <Button size="sm" variant="ghost">
                Open Nested
              </Button>
            </PopoverTrigger>
            <PopoverContent width={200}>
              <Text size="sm">Nested popover content</Text>
            </PopoverContent>
          </Popover>
        </Stack>
      </PopoverContent>
    </Popover>
  ),
};

export const EditorQuickSettings: Story = {
  render: () => (
    <Popover>
      <PopoverTrigger>
        <Button size="sm" variant="ghost">
          Settings
        </Button>
      </PopoverTrigger>
      <PopoverContent width={260} padding="lg">
        <Stack spacing={3}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <Text size="sm" weight="semibold">
              Quick Settings
            </Text>
            <PopoverClose />
          </div>
          <Stack spacing={2}>
            <Stack direction="row" justify="space-between" align="center">
              <Text size="xs">Grid Size</Text>
              <Input size="sm" style={{ width: 60 }} placeholder="16" />
            </Stack>
            <Stack direction="row" justify="space-between" align="center">
              <Text size="xs">Snap</Text>
              <Input size="sm" style={{ width: 60 }} placeholder="1" />
            </Stack>
            <Stack direction="row" justify="space-between" align="center">
              <Text size="xs">Zoom</Text>
              <Input size="sm" style={{ width: 60 }} placeholder="100%" />
            </Stack>
          </Stack>
        </Stack>
      </PopoverContent>
    </Popover>
  ),
};
