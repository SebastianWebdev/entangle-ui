import { useState } from 'react';
import DemoWrapper from '../DemoWrapper';
import { HoverCard } from '@/components/primitives/HoverCard';
import { Button } from '@/components/primitives/Button';
import { Link } from '@/components/primitives/Link';
import { Text } from '@/components/primitives/Text';
import { Stack } from '@/components/layout/Stack';
import { Flex } from '@/components/layout/Flex';

export default function HoverCardDemo() {
  return (
    <DemoWrapper>
      <Flex
        justify="center"
        align="center"
        style={{ minHeight: 160, width: '100%' }}
      >
        <HoverCard>
          <HoverCard.Trigger>
            <Link href="#">@octocat</Link>
          </HoverCard.Trigger>
          <HoverCard.Content width={280}>
            <Stack gap={2}>
              <Text weight="bold">@octocat</Text>
              <Text size="sm" color="secondary">
                The mascot of GitHub. Open-source maintainer and friend to all
                cats.
              </Text>
              <Flex gap={2}>
                <Text size="xs" color="muted">
                  <strong style={{ color: 'var(--etui-color-text-primary)' }}>
                    1.2k
                  </strong>{' '}
                  followers
                </Text>
                <Text size="xs" color="muted">
                  <strong style={{ color: 'var(--etui-color-text-primary)' }}>
                    32
                  </strong>{' '}
                  repos
                </Text>
              </Flex>
            </Stack>
          </HoverCard.Content>
        </HoverCard>
      </Flex>
    </DemoWrapper>
  );
}

export function HoverCardBasic() {
  return (
    <DemoWrapper>
      <Flex
        justify="center"
        align="center"
        style={{ minHeight: 140, width: '100%' }}
      >
        <HoverCard>
          <HoverCard.Trigger>
            <Button>Hover me</Button>
          </HoverCard.Trigger>
          <HoverCard.Content width={240}>
            <Text size="sm">
              A short preview anchored to the trigger. Move your cursor onto
              this card to keep it open.
            </Text>
          </HoverCard.Content>
        </HoverCard>
      </Flex>
    </DemoWrapper>
  );
}

export function HoverCardPlacements() {
  return (
    <DemoWrapper>
      <Flex
        gap={4}
        justify="center"
        align="center"
        wrap="wrap"
        style={{ minHeight: 160 }}
      >
        <HoverCard placement="top">
          <HoverCard.Trigger>
            <Button>Top</Button>
          </HoverCard.Trigger>
          <HoverCard.Content>
            <Text size="sm">Opens above the trigger.</Text>
          </HoverCard.Content>
        </HoverCard>
        <HoverCard placement="right">
          <HoverCard.Trigger>
            <Button>Right</Button>
          </HoverCard.Trigger>
          <HoverCard.Content>
            <Text size="sm">Opens to the right.</Text>
          </HoverCard.Content>
        </HoverCard>
        <HoverCard placement="bottom">
          <HoverCard.Trigger>
            <Button>Bottom</Button>
          </HoverCard.Trigger>
          <HoverCard.Content>
            <Text size="sm">Opens below the trigger.</Text>
          </HoverCard.Content>
        </HoverCard>
        <HoverCard placement="left">
          <HoverCard.Trigger>
            <Button>Left</Button>
          </HoverCard.Trigger>
          <HoverCard.Content>
            <Text size="sm">Opens to the left.</Text>
          </HoverCard.Content>
        </HoverCard>
      </Flex>
    </DemoWrapper>
  );
}

export function HoverCardDelays() {
  return (
    <DemoWrapper>
      <Flex
        gap={3}
        justify="center"
        align="center"
        style={{ minHeight: 140, width: '100%' }}
      >
        <HoverCard openDelay={0} closeDelay={0}>
          <HoverCard.Trigger>
            <Button>Instant</Button>
          </HoverCard.Trigger>
          <HoverCard.Content>
            <Text size="sm">Zero delay open and close.</Text>
          </HoverCard.Content>
        </HoverCard>
        <HoverCard openDelay={400} closeDelay={150}>
          <HoverCard.Trigger>
            <Button>Default</Button>
          </HoverCard.Trigger>
          <HoverCard.Content>
            <Text size="sm">400ms open, 150ms close.</Text>
          </HoverCard.Content>
        </HoverCard>
        <HoverCard openDelay={800} closeDelay={400}>
          <HoverCard.Trigger>
            <Button>Slow</Button>
          </HoverCard.Trigger>
          <HoverCard.Content>
            <Text size="sm">Waits 800ms before opening.</Text>
          </HoverCard.Content>
        </HoverCard>
      </Flex>
    </DemoWrapper>
  );
}

export function HoverCardControlled() {
  const [open, setOpen] = useState(false);
  return (
    <DemoWrapper>
      <Stack gap={3} style={{ width: '100%' }}>
        <Flex gap={2} justify="center" align="center">
          <Button onClick={() => setOpen(o => !o)}>
            {open ? 'Force close' : 'Force open'}
          </Button>
        </Flex>
        <Flex justify="center" align="center" style={{ minHeight: 120 }}>
          <HoverCard open={open} onOpenChange={setOpen}>
            <HoverCard.Trigger>
              <Button variant="outlined">Controlled trigger</Button>
            </HoverCard.Trigger>
            <HoverCard.Content width={260}>
              <Text size="sm">
                Open state is fully controlled. The button above toggles this
                card explicitly.
              </Text>
            </HoverCard.Content>
          </HoverCard>
        </Flex>
      </Stack>
    </DemoWrapper>
  );
}

export function HoverCardInteractiveContent() {
  return (
    <DemoWrapper>
      <Flex
        justify="center"
        align="center"
        style={{ minHeight: 180, width: '100%' }}
      >
        <HoverCard openDelay={150} closeDelay={300}>
          <HoverCard.Trigger>
            <Button>Profile preview</Button>
          </HoverCard.Trigger>
          <HoverCard.Content width={300}>
            <Stack gap={3}>
              <Stack gap={1}>
                <Text weight="bold">Sebastian Reyes</Text>
                <Text size="xs" color="muted">
                  Senior Technical Artist
                </Text>
              </Stack>
              <Text size="sm" color="secondary">
                Cursor can travel from the trigger onto this card without
                closing it — the safe-polygon keeps the path alive.
              </Text>
              <Flex gap={2}>
                <Button size="sm">Follow</Button>
                <Button size="sm" variant="outlined">
                  Message
                </Button>
              </Flex>
            </Stack>
          </HoverCard.Content>
        </HoverCard>
      </Flex>
    </DemoWrapper>
  );
}

export function HoverCardDisabled() {
  return (
    <DemoWrapper>
      <Flex
        justify="center"
        align="center"
        style={{ minHeight: 120, width: '100%' }}
      >
        <HoverCard disabled>
          <HoverCard.Trigger>
            <Button variant="outlined">Disabled (won't open)</Button>
          </HoverCard.Trigger>
          <HoverCard.Content>
            <Text size="sm">Should never appear.</Text>
          </HoverCard.Content>
        </HoverCard>
      </Flex>
    </DemoWrapper>
  );
}
