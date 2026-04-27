import DemoWrapper from '../DemoWrapper';
import { useDisclosure } from '@/hooks/useDisclosure';
import { Button } from '@/components/primitives/Button';
import { Stack } from '@/components/layout/Stack';
import { Flex } from '@/components/layout/Flex';
import { Text } from '@/components/primitives/Text';
import {
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
} from '@/components/feedback';

export default function UseDisclosureDemo() {
  const panel = useDisclosure();

  return (
    <DemoWrapper>
      <Stack spacing={3}>
        <Flex gap={2}>
          <Button onClick={panel.toggle}>
            {panel.isOpen ? 'Hide panel' : 'Show panel'}
          </Button>
          <Button variant="ghost" onClick={panel.close}>
            Force close
          </Button>
        </Flex>
        {panel.isOpen && (
          <div
            style={{
              padding: 12,
              borderRadius: 4,
              background: 'var(--etui-color-surface-default)',
              border: '1px solid var(--etui-color-border-default)',
            }}
          >
            <Text size="sm">Revealed by useDisclosure.</Text>
          </div>
        )}
      </Stack>
    </DemoWrapper>
  );
}

export function UseDisclosureBasic() {
  const { isOpen, open, close, toggle } = useDisclosure();

  return (
    <DemoWrapper>
      <Stack spacing={3}>
        <Text size="sm" color="secondary">
          State: {isOpen ? 'open' : 'closed'}
        </Text>
        <Flex gap={2}>
          <Button onClick={open}>open()</Button>
          <Button onClick={close}>close()</Button>
          <Button onClick={toggle}>toggle()</Button>
        </Flex>
      </Stack>
    </DemoWrapper>
  );
}

export function UseDisclosureWithDialog() {
  const dialog = useDisclosure();

  return (
    <DemoWrapper>
      <Button variant="filled" onClick={dialog.open}>
        Open dialog
      </Button>
      <Dialog open={dialog.isOpen} onClose={dialog.close}>
        <DialogHeader>useDisclosure + Dialog</DialogHeader>
        <DialogBody>
          <Text size="sm">
            The dialog's open state is owned by `useDisclosure`. Calling
            `dialog.close` here mirrors `onClose`.
          </Text>
        </DialogBody>
        <DialogFooter align="right">
          <Button onClick={dialog.close}>Dismiss</Button>
        </DialogFooter>
      </Dialog>
    </DemoWrapper>
  );
}
