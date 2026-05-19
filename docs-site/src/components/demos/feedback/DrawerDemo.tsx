import { useState } from 'react';
import DemoWrapper from '../DemoWrapper';
import { Drawer } from '@/components/feedback';
import type { DrawerAnchor } from '@/components/feedback';
import { Button, Text } from '@/components/primitives';
import { Stack, Flex } from '@/components/layout';

export default function DrawerDemo() {
  const [open, setOpen] = useState(false);
  return (
    <DemoWrapper>
      <Stack gap={3} align="flex-start">
        <Button variant="filled" onClick={() => setOpen(true)}>
          Open drawer
        </Button>
        <Drawer
          open={open}
          onClose={() => {
            setOpen(false);
          }}
          anchor="right"
          size="md"
        >
          <Drawer.Header description="Refine the list below.">
            Filters
          </Drawer.Header>
          <Drawer.Body>
            <Stack gap={2}>
              <Text size="sm">
                Choose criteria and apply your changes. The page behind is
                blocked while modal is on.
              </Text>
              <Text size="sm" color="muted">
                Press Escape or click the backdrop to close.
              </Text>
            </Stack>
          </Drawer.Body>
          <Drawer.Footer>
            <Button onClick={() => setOpen(false)}>Cancel</Button>
            <Button variant="filled" onClick={() => setOpen(false)}>
              Apply
            </Button>
          </Drawer.Footer>
        </Drawer>
      </Stack>
    </DemoWrapper>
  );
}

export function DrawerAnchors() {
  const [anchor, setAnchor] = useState<DrawerAnchor | null>(null);
  const anchors: DrawerAnchor[] = ['left', 'right', 'top', 'bottom'];
  return (
    <DemoWrapper>
      <Flex gap={2} wrap="wrap">
        {anchors.map(a => (
          <Button
            key={a}
            onClick={() => {
              setAnchor(a);
            }}
          >
            Open {a}
          </Button>
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
            <Drawer.Body>
              <Text size="sm">Drawer anchored at {anchor}.</Text>
            </Drawer.Body>
          </Drawer>
        )}
      </Flex>
    </DemoWrapper>
  );
}

export function DrawerSizes() {
  const [size, setSize] = useState<string | number | null>(null);
  const sizes: (string | number)[] = ['sm', 'md', 'lg', 'xl', 480, '60vw'];
  return (
    <DemoWrapper>
      <Flex gap={2} wrap="wrap">
        {sizes.map(s => (
          <Button
            key={String(s)}
            onClick={() => {
              setSize(s);
            }}
          >
            size = {String(s)}
          </Button>
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
            <Drawer.Body>
              <Text size="sm">Pick another size from the buttons.</Text>
            </Drawer.Body>
          </Drawer>
        )}
      </Flex>
    </DemoWrapper>
  );
}

export function DrawerNonModal() {
  const [open, setOpen] = useState(false);
  return (
    <DemoWrapper>
      <Stack gap={3} align="flex-start">
        <Text size="sm" color="muted">
          The page behind stays interactive when <code>modal=false</code>.
        </Text>
        <Button onClick={() => setOpen(true)}>Open non-modal</Button>
        <Drawer
          open={open}
          modal={false}
          onClose={() => {
            setOpen(false);
          }}
        >
          <Drawer.Header>Inspector</Drawer.Header>
          <Drawer.Body>
            <Text size="sm">
              No backdrop, no focus trap. Use for persistent side panels.
            </Text>
          </Drawer.Body>
        </Drawer>
      </Stack>
    </DemoWrapper>
  );
}

export function DrawerCompound() {
  const [open, setOpen] = useState(false);
  return (
    <DemoWrapper>
      <Stack gap={3} align="flex-start">
        <Button onClick={() => setOpen(true)}>Open compound drawer</Button>
        <Drawer
          open={open}
          onClose={() => {
            setOpen(false);
          }}
          anchor="right"
        >
          <Drawer.Header description="Adjust scene-wide settings." showClose>
            Scene Settings
          </Drawer.Header>
          <Drawer.Body>
            <Stack gap={3}>
              <Text size="sm">
                Compose richer drawers with the compound members:
              </Text>
              <ul style={{ paddingLeft: 18, fontSize: 13 }}>
                <li>
                  <code>Drawer.Header</code>
                </li>
                <li>
                  <code>Drawer.Body</code>
                </li>
                <li>
                  <code>Drawer.Footer</code>
                </li>
                <li>
                  <code>Drawer.CloseButton</code>
                </li>
              </ul>
            </Stack>
          </Drawer.Body>
          <Drawer.Footer align="space-between">
            <Drawer.CloseButton>Reset</Drawer.CloseButton>
            <Flex gap={2}>
              <Button onClick={() => setOpen(false)}>Cancel</Button>
              <Button variant="filled" onClick={() => setOpen(false)}>
                Save
              </Button>
            </Flex>
          </Drawer.Footer>
        </Drawer>
      </Stack>
    </DemoWrapper>
  );
}
