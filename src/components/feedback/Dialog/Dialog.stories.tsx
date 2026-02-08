import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Dialog } from './Dialog';
import { DialogHeader } from './DialogHeader';
import { DialogBody } from './DialogBody';
import { DialogFooter } from './DialogFooter';
import { DialogClose } from './DialogClose';
import { Button } from '@/components/primitives/Button';
import { Input } from '@/components/primitives/Input';
import { Stack } from '@/components/layout/Stack';
import type { DialogSize } from './Dialog.types';

const meta: Meta<typeof Dialog> = {
  title: 'Feedback/Dialog',
  component: Dialog,
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg', 'xl', 'fullscreen'],
    },
    closeOnOverlayClick: { control: 'boolean' },
    closeOnEscape: { control: 'boolean' },
    showOverlay: { control: 'boolean' },
    trapFocus: { control: 'boolean' },
    portal: { control: 'boolean' },
  },
};

export default meta;
type Story = StoryObj<typeof Dialog>;

export const Default: Story = {
  render: args => {
    const [open, setOpen] = useState(false);

    return (
      <>
        <Button onClick={() => setOpen(true)}>Open Dialog</Button>
        <Dialog
          {...args}
          open={open}
          onClose={() => setOpen(false)}
          title="Confirmation"
        >
          <DialogHeader>Confirm Action</DialogHeader>
          <DialogBody>
            Are you sure you want to proceed? This action cannot be undone.
          </DialogBody>
          <DialogFooter align="right">
            <DialogClose>
              <Button>Cancel</Button>
            </DialogClose>
            <Button variant="filled" onClick={() => setOpen(false)}>
              Confirm
            </Button>
          </DialogFooter>
        </Dialog>
      </>
    );
  },
};

export const Sizes: Story = {
  name: 'Sizes',
  render: () => {
    const sizes: DialogSize[] = ['sm', 'md', 'lg', 'xl', 'fullscreen'];
    const [openSize, setOpenSize] = useState<DialogSize | null>(null);

    return (
      <Stack direction="row" spacing={2}>
        {sizes.map(size => (
          <Button key={size} onClick={() => setOpenSize(size)}>
            {size}
          </Button>
        ))}
        {sizes.map(size => (
          <Dialog
            key={size}
            open={openSize === size}
            onClose={() => setOpenSize(null)}
            size={size}
            title={`${size} dialog`}
          >
            <DialogHeader>
              {size.charAt(0).toUpperCase() + size.slice(1)} Dialog
            </DialogHeader>
            <DialogBody>
              This is a <strong>{size}</strong> size dialog.
            </DialogBody>
            <DialogFooter align="right">
              <DialogClose>
                <Button>Close</Button>
              </DialogClose>
            </DialogFooter>
          </Dialog>
        ))}
      </Stack>
    );
  },
};

export const WithForm: Story = {
  name: 'With Form',
  render: () => {
    const [open, setOpen] = useState(false);

    return (
      <>
        <Button onClick={() => setOpen(true)}>Edit Profile</Button>
        <Dialog
          open={open}
          onClose={() => setOpen(false)}
          size="md"
          title="Edit Profile"
        >
          <DialogHeader description="Update your profile information">
            Edit Profile
          </DialogHeader>
          <DialogBody>
            <Stack direction="column" spacing={3}>
              <div>
                <label
                  style={{ display: 'block', marginBottom: 4, fontSize: 11 }}
                >
                  Name
                </label>
                <Input placeholder="Enter your name" />
              </div>
              <div>
                <label
                  style={{ display: 'block', marginBottom: 4, fontSize: 11 }}
                >
                  Email
                </label>
                <Input placeholder="Enter your email" />
              </div>
            </Stack>
          </DialogBody>
          <DialogFooter align="right">
            <DialogClose>
              <Button>Cancel</Button>
            </DialogClose>
            <Button variant="filled" onClick={() => setOpen(false)}>
              Save
            </Button>
          </DialogFooter>
        </Dialog>
      </>
    );
  },
};

export const AlertConfirm: Story = {
  name: 'Alert / Confirm',
  render: () => {
    const [open, setOpen] = useState(false);

    return (
      <>
        <Button onClick={() => setOpen(true)}>Delete Item</Button>
        <Dialog
          open={open}
          onClose={() => setOpen(false)}
          size="sm"
          title="Delete Item"
          description="This action is permanent."
        >
          <DialogHeader showClose={false}>Delete Item?</DialogHeader>
          <DialogBody>
            <div style={{ color: '#f44336', fontSize: 12 }}>
              This will permanently delete the selected item and all its
              children. This action cannot be undone.
            </div>
          </DialogBody>
          <DialogFooter align="right">
            <DialogClose>
              <Button>Cancel</Button>
            </DialogClose>
            <Button
              variant="filled"
              onClick={() => setOpen(false)}
              css={{ background: '#f44336' }}
            >
              Delete
            </Button>
          </DialogFooter>
        </Dialog>
      </>
    );
  },
};

export const NoOverlayClick: Story = {
  name: 'No Overlay Click',
  render: () => {
    const [open, setOpen] = useState(false);

    return (
      <>
        <Button onClick={() => setOpen(true)}>Open (No Overlay Dismiss)</Button>
        <Dialog
          open={open}
          onClose={() => setOpen(false)}
          closeOnOverlayClick={false}
          title="Persistent Dialog"
        >
          <DialogHeader>Persistent Dialog</DialogHeader>
          <DialogBody>
            Clicking the overlay will not close this dialog. Use the close
            button or press Escape.
          </DialogBody>
          <DialogFooter align="right">
            <DialogClose>
              <Button variant="filled">Close</Button>
            </DialogClose>
          </DialogFooter>
        </Dialog>
      </>
    );
  },
};

export const ScrollableBody: Story = {
  name: 'Scrollable Body',
  render: () => {
    const [open, setOpen] = useState(false);

    return (
      <>
        <Button onClick={() => setOpen(true)}>Open Scrollable</Button>
        <Dialog
          open={open}
          onClose={() => setOpen(false)}
          size="md"
          title="License Agreement"
        >
          <DialogHeader>License Agreement</DialogHeader>
          <DialogBody>
            {Array.from({ length: 20 }, (_, i) => (
              <p key={i} style={{ margin: '8px 0', fontSize: 12 }}>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
                eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut
                enim ad minim veniam, quis nostrud exercitation ullamco laboris
                nisi ut aliquip ex ea commodo consequat. Paragraph {i + 1}.
              </p>
            ))}
          </DialogBody>
          <DialogFooter align="right">
            <DialogClose>
              <Button>Decline</Button>
            </DialogClose>
            <Button variant="filled" onClick={() => setOpen(false)}>
              Accept
            </Button>
          </DialogFooter>
        </Dialog>
      </>
    );
  },
};

export const FooterAlignment: Story = {
  name: 'Footer Alignment',
  render: () => {
    const alignments = ['left', 'center', 'right', 'space-between'] as const;
    const [openAlign, setOpenAlign] = useState<string | null>(null);

    return (
      <Stack direction="row" spacing={2}>
        {alignments.map(align => (
          <Button key={align} onClick={() => setOpenAlign(align)}>
            {align}
          </Button>
        ))}
        {alignments.map(align => (
          <Dialog
            key={align}
            open={openAlign === align}
            onClose={() => setOpenAlign(null)}
            size="md"
            title={`Footer: ${align}`}
          >
            <DialogHeader>Footer Alignment: {align}</DialogHeader>
            <DialogBody>
              The footer buttons are aligned to <strong>{align}</strong>.
            </DialogBody>
            <DialogFooter align={align}>
              <Button onClick={() => setOpenAlign(null)}>Cancel</Button>
              <Button variant="filled" onClick={() => setOpenAlign(null)}>
                Save
              </Button>
            </DialogFooter>
          </Dialog>
        ))}
      </Stack>
    );
  },
};

export const EditorDeleteConfirmation: Story = {
  name: 'Editor — Delete Confirmation',
  render: () => {
    const [open, setOpen] = useState(false);

    return (
      <>
        <Button onClick={() => setOpen(true)}>
          Delete &quot;Cube_001&quot;
        </Button>
        <Dialog
          open={open}
          onClose={() => setOpen(false)}
          size="sm"
          title="Delete Object"
        >
          <DialogHeader showClose={false}>Delete Object</DialogHeader>
          <DialogBody>
            <div style={{ fontSize: 12 }}>
              <div style={{ marginBottom: 12 }}>
                Are you sure you want to delete{' '}
                <strong style={{ color: '#007acc' }}>Cube_001</strong> and all
                of its children?
              </div>
              <div
                style={{
                  background: '#2d2d2d',
                  borderRadius: 4,
                  padding: 8,
                  fontSize: 11,
                  color: '#cccccc',
                }}
              >
                <div>Children affected:</div>
                <ul
                  style={{
                    margin: '4px 0 0 16px',
                    padding: 0,
                    listStyle: 'disc',
                  }}
                >
                  <li>Mesh_001</li>
                  <li>Material_PBR</li>
                  <li>Light_Point_001</li>
                </ul>
              </div>
            </div>
          </DialogBody>
          <DialogFooter align="right">
            <DialogClose>
              <Button>Cancel</Button>
            </DialogClose>
            <Button
              variant="filled"
              onClick={() => setOpen(false)}
              css={{ background: '#f44336' }}
            >
              Delete (4 objects)
            </Button>
          </DialogFooter>
        </Dialog>
      </>
    );
  },
};
