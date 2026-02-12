import { useState } from 'react';
import DemoWrapper from '../DemoWrapper';
import {
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
  DialogClose,
} from '@/components/feedback';
import { Button, Text } from '@/components/primitives';

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
