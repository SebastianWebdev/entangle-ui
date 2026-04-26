import { useRef, useState, type RefObject } from 'react';
import DemoWrapper from '../DemoWrapper';
import { useClickOutside } from '@/hooks/useClickOutside';
import { Button } from '@/components/primitives/Button';
import { Stack } from '@/components/layout/Stack';
import { Flex } from '@/components/layout/Flex';
import { Text } from '@/components/primitives/Text';

const panelStyle: React.CSSProperties = {
  marginTop: 8,
  padding: 12,
  borderRadius: 4,
  background: 'var(--etui-color-background-elevated)',
  border: '1px solid var(--etui-color-border-default)',
  width: 220,
};

export default function UseClickOutsideDemo() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useClickOutside(ref, () => setOpen(false), { enabled: open });

  return (
    <DemoWrapper>
      <Stack spacing={3}>
        <Text size="sm" color="secondary">
          Click outside the panel to close it.
        </Text>
        <div style={{ position: 'relative' }}>
          <Button onClick={() => setOpen(prev => !prev)}>
            {open ? 'Close panel' : 'Open panel'}
          </Button>
          {open && (
            <div ref={ref} style={panelStyle}>
              <Stack spacing={2}>
                <Text size="sm">I close when you click outside.</Text>
                <Button variant="ghost" onClick={() => setOpen(false)}>
                  Or click here
                </Button>
              </Stack>
            </div>
          )}
        </div>
      </Stack>
    </DemoWrapper>
  );
}

export function UseClickOutsideBasic() {
  const [open, setOpen] = useState(true);
  const ref = useRef<HTMLDivElement>(null);

  useClickOutside(ref, () => setOpen(false), { enabled: open });

  return (
    <DemoWrapper>
      <Stack spacing={3}>
        <Flex gap={2}>
          <Button onClick={() => setOpen(true)}>Reopen</Button>
        </Flex>
        {open && (
          <div ref={ref} style={panelStyle}>
            <Text size="sm">Click anywhere outside this card to close it.</Text>
          </div>
        )}
        {!open && (
          <Text size="sm" color="secondary">
            Card was closed by an outside click.
          </Text>
        )}
      </Stack>
    </DemoWrapper>
  );
}

export function UseClickOutsideMultipleRefs() {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useClickOutside(
    [
      triggerRef as RefObject<HTMLElement | null>,
      panelRef as RefObject<HTMLElement | null>,
    ],
    () => setOpen(false),
    { enabled: open }
  );

  return (
    <DemoWrapper>
      <Stack spacing={3}>
        <Text size="sm" color="secondary">
          Trigger and popover share an "inside" group — clicking either keeps
          the popover open. Click outside both to close.
        </Text>
        <div style={{ position: 'relative' }}>
          <Button ref={triggerRef} onClick={() => setOpen(prev => !prev)}>
            {open ? 'Close popover' : 'Open popover'}
          </Button>
          {open && (
            <div ref={panelRef} style={panelStyle}>
              <Text size="sm">I stay open when you click the trigger.</Text>
            </div>
          )}
        </div>
      </Stack>
    </DemoWrapper>
  );
}
