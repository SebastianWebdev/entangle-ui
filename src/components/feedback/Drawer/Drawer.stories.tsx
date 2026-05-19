import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Drawer } from './Drawer';

const meta: Meta<typeof Drawer> = {
  title: 'Feedback/Drawer',
  component: Drawer,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Anchored sliding panel for filters, secondary navigation, or detail views. Modal mode renders an overlay and traps focus; non-modal mode leaves the rest of the page interactive. Anchors: left, right, top, bottom.',
      },
    },
  },
  argTypes: {
    anchor: { control: 'select', options: ['left', 'right', 'top', 'bottom'] },
    size: { control: 'select', options: ['sm', 'md', 'lg', 'xl'] },
    modal: { control: 'boolean' },
    closeOnOverlayClick: { control: 'boolean' },
    closeOnEscape: { control: 'boolean' },
  },
};
export default meta;

type Story = StoryObj<typeof Drawer>;

export const Default: Story = {
  render: function DefaultStory(args) {
    const [open, setOpen] = useState(false);
    return (
      <div style={{ padding: 24 }}>
        <button type="button" onClick={() => setOpen(true)}>
          Open Drawer
        </button>
        <Drawer
          {...args}
          open={open}
          onClose={() => {
            setOpen(false);
          }}
        >
          <Drawer.Header>Filters</Drawer.Header>
          <Drawer.Body>
            <p>Refine the list below.</p>
            <p>Use the controls and apply your changes.</p>
          </Drawer.Body>
          <Drawer.Footer>
            <button type="button" onClick={() => setOpen(false)}>
              Cancel
            </button>
            <button type="button" onClick={() => setOpen(false)}>
              Apply
            </button>
          </Drawer.Footer>
        </Drawer>
      </div>
    );
  },
};

export const Anchors: Story = {
  render: function AnchorsStory() {
    const [anchor, setAnchor] = useState<
      'left' | 'right' | 'top' | 'bottom' | null
    >(null);
    return (
      <div style={{ padding: 24, display: 'flex', gap: 8 }}>
        {(['left', 'right', 'top', 'bottom'] as const).map(a => (
          <button key={a} type="button" onClick={() => setAnchor(a)}>
            Open {a}
          </button>
        ))}
        {anchor && (
          <Drawer
            open
            anchor={anchor}
            onClose={() => {
              setAnchor(null);
            }}
          >
            <Drawer.Header>{anchor.toUpperCase()}</Drawer.Header>
            <Drawer.Body>Drawer anchored at {anchor}.</Drawer.Body>
          </Drawer>
        )}
      </div>
    );
  },
};

export const NonModal: Story = {
  render: function NonModalStory() {
    const [open, setOpen] = useState(false);
    return (
      <div style={{ padding: 24 }}>
        <p>The page below stays interactive when modal is false.</p>
        <button type="button" onClick={() => setOpen(true)}>
          Open non-modal
        </button>
        <Drawer
          open={open}
          modal={false}
          onClose={() => {
            setOpen(false);
          }}
        >
          <Drawer.Header>Inspector</Drawer.Header>
          <Drawer.Body>Click outside — the page below still works.</Drawer.Body>
        </Drawer>
      </div>
    );
  },
};

export const SizesAndCustom: Story = {
  render: function SizesAndCustomStory() {
    const [size, setSize] = useState<string | number | null>(null);
    return (
      <div style={{ padding: 24, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {(['sm', 'md', 'lg', 'xl', 480, '50vw'] as const).map(s => (
          <button key={String(s)} type="button" onClick={() => setSize(s)}>
            size = {String(s)}
          </button>
        ))}
        {size != null && (
          <Drawer
            open
            size={size}
            onClose={() => {
              setSize(null);
            }}
          >
            <Drawer.Header>Size: {String(size)}</Drawer.Header>
            <Drawer.Body>Choose another size from the buttons.</Drawer.Body>
          </Drawer>
        )}
      </div>
    );
  },
};
