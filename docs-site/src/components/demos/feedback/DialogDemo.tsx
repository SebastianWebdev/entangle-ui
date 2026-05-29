import { useRef, useState } from 'react';
import DemoWrapper from '../DemoWrapper';
import {
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
  DialogClose,
} from '@/components/feedback';
import type { DialogSize } from '@/components/feedback';
import { Button, Text, Input } from '@/components/primitives';
import { Stack } from '@/components/layout';

export default function DialogDemo() {
  const [open, setOpen] = useState(false);

  return (
    <DemoWrapper>
      <Button variant="filled" onClick={() => setOpen(true)}>
        Open Dialog
      </Button>
      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogHeader>Confirm Action</DialogHeader>
        <DialogBody>
          <Text size="sm">
            Are you sure you want to proceed? This action cannot be undone.
          </Text>
        </DialogBody>
        <DialogFooter align="right">
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="filled" onClick={() => setOpen(false)}>
            Confirm
          </Button>
        </DialogFooter>
      </Dialog>
    </DemoWrapper>
  );
}

const SIZES: DialogSize[] = ['sm', 'md', 'lg', 'xl', 'fullscreen'];

export function DialogSizes() {
  const [size, setSize] = useState<DialogSize | null>(null);

  return (
    <DemoWrapper withKeyboard>
      <Stack gap={3} direction="row" style={{ flexWrap: 'wrap' }}>
        {SIZES.map(s => (
          <Button key={s} onClick={() => setSize(s)}>
            {s}
          </Button>
        ))}
      </Stack>
      <Dialog
        open={size !== null}
        onClose={() => setSize(null)}
        size={size ?? 'md'}
      >
        <DialogHeader showClose>Size: {size}</DialogHeader>
        <DialogBody>
          <Text size="sm">
            This dialog uses the <code>{size}</code> size preset.
          </Text>
        </DialogBody>
        <DialogFooter align="right">
          <Button variant="filled" onClick={() => setSize(null)}>
            Close
          </Button>
        </DialogFooter>
      </Dialog>
    </DemoWrapper>
  );
}

export function DialogHeaderDemo() {
  const [open, setOpen] = useState(false);

  return (
    <DemoWrapper withKeyboard>
      <Button variant="filled" onClick={() => setOpen(true)}>
        Open Dialog
      </Button>
      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogHeader
          showClose
          description="This will affect all linked objects."
        >
          Delete Object
        </DialogHeader>
        <DialogBody>
          <Text size="sm">
            The header shows a title, a description line, and a close button.
          </Text>
        </DialogBody>
      </Dialog>
    </DemoWrapper>
  );
}

export function DialogBodyDemo() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('Standard Material');

  return (
    <DemoWrapper withKeyboard>
      <Button variant="filled" onClick={() => setOpen(true)}>
        Rename Material
      </Button>
      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogHeader>Rename Material</DialogHeader>
        <DialogBody>
          <Stack gap={2}>
            <Text size="sm">Enter the new name for this material:</Text>
            <Input value={name} onChange={setName} />
          </Stack>
        </DialogBody>
        <DialogFooter align="right">
          <Button variant="filled" onClick={() => setOpen(false)}>
            Save
          </Button>
        </DialogFooter>
      </Dialog>
    </DemoWrapper>
  );
}

export function DialogFooterDemo() {
  const [open, setOpen] = useState(false);

  return (
    <DemoWrapper withKeyboard>
      <Button variant="filled" onClick={() => setOpen(true)}>
        Open Dialog
      </Button>
      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogHeader>Apply Changes</DialogHeader>
        <DialogBody>
          <Text size="sm">
            The footer uses <code>align="space-between"</code> to push the reset
            action to the left.
          </Text>
        </DialogBody>
        <DialogFooter align="space-between">
          <Button variant="ghost" onClick={() => setOpen(false)}>
            Reset
          </Button>
          <Stack gap={2} direction="row">
            <Button onClick={() => setOpen(false)}>Cancel</Button>
            <Button variant="filled" onClick={() => setOpen(false)}>
              Apply
            </Button>
          </Stack>
        </DialogFooter>
      </Dialog>
    </DemoWrapper>
  );
}

export function DialogCloseDemo() {
  const [open, setOpen] = useState(false);

  return (
    <DemoWrapper withKeyboard>
      <Button variant="filled" onClick={() => setOpen(true)}>
        Open Dialog
      </Button>
      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogHeader>Success</DialogHeader>
        <DialogBody>
          <Stack gap={3}>
            <Text size="sm">Operation completed successfully.</Text>
            <DialogClose>
              <Button variant="filled">Done</Button>
            </DialogClose>
          </Stack>
        </DialogBody>
      </Dialog>
    </DemoWrapper>
  );
}

export function DialogOverlay() {
  const [open, setOpen] = useState(false);

  return (
    <DemoWrapper withKeyboard>
      <Button variant="filled" onClick={() => setOpen(true)}>
        Open Dialog
      </Button>
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        closeOnOverlayClick={false}
      >
        <DialogHeader>Unsaved Changes</DialogHeader>
        <DialogBody>
          <Text size="sm">
            Clicking the overlay will not close this dialog — you must use a
            button below.
          </Text>
        </DialogBody>
        <DialogFooter align="right">
          <Button onClick={() => setOpen(false)}>Discard</Button>
          <Button variant="filled" onClick={() => setOpen(false)}>
            Save
          </Button>
        </DialogFooter>
      </Dialog>
    </DemoWrapper>
  );
}

export function DialogEscape() {
  const [open, setOpen] = useState(false);

  return (
    <DemoWrapper withKeyboard>
      <Button variant="filled" onClick={() => setOpen(true)}>
        Open Dialog
      </Button>
      <Dialog open={open} onClose={() => setOpen(false)} closeOnEscape={false}>
        <DialogHeader>Escape Disabled</DialogHeader>
        <DialogBody>
          <Text size="sm">
            Pressing Escape does nothing here. Use the button to close.
          </Text>
        </DialogBody>
        <DialogFooter align="right">
          <Button variant="filled" onClick={() => setOpen(false)}>
            Close
          </Button>
        </DialogFooter>
      </Dialog>
    </DemoWrapper>
  );
}

export function DialogFocus() {
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(
    null
  ) as React.RefObject<HTMLInputElement>;

  return (
    <DemoWrapper withKeyboard>
      <Button variant="filled" onClick={() => setOpen(true)}>
        Open Dialog
      </Button>
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        initialFocusRef={inputRef}
      >
        <DialogHeader>Focus Management</DialogHeader>
        <DialogBody>
          <Stack gap={2}>
            <Text size="sm">The input below receives focus on open:</Text>
            <Input ref={inputRef} placeholder="Auto-focused input" />
          </Stack>
        </DialogBody>
        <DialogFooter align="right">
          <Button variant="filled" onClick={() => setOpen(false)}>
            Close
          </Button>
        </DialogFooter>
      </Dialog>
    </DemoWrapper>
  );
}

export function DialogPortal() {
  const [open, setOpen] = useState(false);

  return (
    <DemoWrapper withKeyboard>
      <Button variant="filled" onClick={() => setOpen(true)}>
        Open Dialog
      </Button>
      <Dialog open={open} onClose={() => setOpen(false)} portal={false}>
        <DialogHeader showClose>Rendered In Place</DialogHeader>
        <DialogBody>
          <Text size="sm">
            With <code>portal={'{false}'}</code> the dialog renders inside the
            component tree rather than at <code>document.body</code>.
          </Text>
        </DialogBody>
      </Dialog>
    </DemoWrapper>
  );
}

export function DialogAria() {
  const [open, setOpen] = useState(false);

  return (
    <DemoWrapper withKeyboard>
      <Button variant="filled" onClick={() => setOpen(true)}>
        Open Dialog
      </Button>
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        title="Confirm deletion"
        description="This will permanently remove the selected item."
      >
        <DialogBody>
          <Text size="sm">Delete "Cube"?</Text>
        </DialogBody>
        <DialogFooter align="right">
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="filled" onClick={() => setOpen(false)}>
            Delete
          </Button>
        </DialogFooter>
      </Dialog>
    </DemoWrapper>
  );
}
