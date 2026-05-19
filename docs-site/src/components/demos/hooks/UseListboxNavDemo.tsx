import { useState } from 'react';
import DemoWrapper from '../DemoWrapper';
import { useListboxNav } from '@/hooks/useListboxNav';
import { Stack } from '@/components/layout/Stack';
import { Text } from '@/components/primitives/Text';

interface Option {
  label: string;
  disabled?: boolean;
}

const FRUITS: Option[] = [
  { label: 'Apple' },
  { label: 'Banana' },
  { label: 'Cherry' },
  { label: 'Date' },
  { label: 'Elderberry' },
];

function Listbox({
  items,
  loop = true,
  onPick,
}: {
  items: Option[];
  loop?: boolean;
  onPick?: (item: Option) => void;
}) {
  const { activeIndex, handleKeyDown } = useListboxNav<Option>({
    items,
    isItemDisabled: item => item.disabled ?? false,
    loop,
    onSelect: item => onPick?.(item),
  });

  return (
    <ul
      role="listbox"
      tabIndex={0}
      onKeyDown={handleKeyDown}
      style={{
        listStyle: 'none',
        padding: 4,
        margin: 0,
        borderRadius: 4,
        border: '1px solid var(--etui-color-border-default)',
        background: 'var(--etui-color-surface-default)',
        outline: 'none',
        minWidth: 180,
      }}
    >
      {items.map((item, index) => {
        const isActive = index === activeIndex;
        const isDisabled = item.disabled;
        return (
          <li
            key={item.label}
            role="option"
            aria-selected={isActive}
            aria-disabled={isDisabled || undefined}
            style={{
              padding: '6px 10px',
              borderRadius: 3,
              fontFamily: 'var(--etui-typography-fontFamily-sans)',
              fontSize: 13,
              color: isDisabled
                ? 'var(--etui-color-text-disabled)'
                : 'var(--etui-color-text-primary)',
              background: isActive
                ? 'var(--etui-color-action-primary)'
                : 'transparent',
              cursor: isDisabled ? 'not-allowed' : 'default',
            }}
          >
            {item.label}
          </li>
        );
      })}
    </ul>
  );
}

export default function UseListboxNavDemo() {
  const [picked, setPicked] = useState<string | null>(null);

  return (
    <DemoWrapper>
      <Stack spacing={3}>
        <Text size="sm" color="secondary">
          Focus the list, then use Arrow keys / Home / End / Enter.
        </Text>
        <Listbox items={FRUITS} onPick={item => setPicked(item.label)} />
        <Text size="sm">Picked: {picked ?? 'none'}</Text>
      </Stack>
    </DemoWrapper>
  );
}

const WITH_DISABLED: Option[] = [
  { label: 'Available 1' },
  { label: 'Disabled', disabled: true },
  { label: 'Available 2' },
  { label: 'Also disabled', disabled: true },
  { label: 'Available 3' },
];

export function UseListboxNavWithDisabled() {
  const [picked, setPicked] = useState<string | null>(null);

  return (
    <DemoWrapper>
      <Stack spacing={3}>
        <Text size="sm" color="secondary">
          Arrow keys skip disabled items entirely.
        </Text>
        <Listbox items={WITH_DISABLED} onPick={item => setPicked(item.label)} />
        <Text size="sm">Picked: {picked ?? 'none'}</Text>
      </Stack>
    </DemoWrapper>
  );
}

export function UseListboxNavNoLoop() {
  return (
    <DemoWrapper>
      <Stack spacing={3}>
        <Text size="sm" color="secondary">
          With `loop: false`, ArrowDown stops at the last item and ArrowUp at
          the first.
        </Text>
        <Listbox items={FRUITS} loop={false} />
      </Stack>
    </DemoWrapper>
  );
}
