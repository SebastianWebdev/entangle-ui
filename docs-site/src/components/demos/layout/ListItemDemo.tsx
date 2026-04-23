import { useState } from 'react';
import DemoWrapper from '../DemoWrapper';
import { ListItem } from '@/components/layout';
import { Stack } from '@/components/layout';
import { Badge } from '@/components/primitives';

const FileGlyph = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 14 14"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    aria-hidden
  >
    <path d="M3 2h5l3 3v7a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1z" />
  </svg>
);

const ChevronGlyph = () => (
  <svg
    width="10"
    height="10"
    viewBox="0 0 10 10"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    aria-hidden
  >
    <path d="M3 2 L7 5 L3 8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const items = [
  { id: 'a', name: 'scene.blend', tag: 'draft', color: 'neutral' as const },
  { id: 'b', name: 'materials.json', tag: 'done', color: 'success' as const },
  {
    id: 'c',
    name: 'anim_rig.blend',
    tag: 'running',
    color: 'warning' as const,
  },
  { id: 'd', name: 'old.obj', tag: 'error', color: 'error' as const },
];

export default function ListItemDemo() {
  const [selected, setSelected] = useState<string>('b');
  return (
    <DemoWrapper>
      <Stack gap={1} style={{ width: '100%', maxWidth: 360 }}>
        {items.map(item => (
          <ListItem
            key={item.id}
            leading={<FileGlyph />}
            trailing={<Badge color={item.color}>{item.tag}</Badge>}
            selected={selected === item.id}
            onClick={() => setSelected(item.id)}
          >
            {item.name}
          </ListItem>
        ))}
        <ListItem disabled leading={<FileGlyph />}>
          .DS_Store (disabled)
        </ListItem>
      </Stack>
    </DemoWrapper>
  );
}

export function ListItemStates() {
  return (
    <DemoWrapper>
      <Stack gap={1} style={{ width: '100%', maxWidth: 320 }}>
        <ListItem onClick={() => {}}>Default (hover me)</ListItem>
        <ListItem onClick={() => {}} selected>
          Selected
        </ListItem>
        <ListItem onClick={() => {}} active>
          Active (pressed)
        </ListItem>
        <ListItem disabled>Disabled</ListItem>
      </Stack>
    </DemoWrapper>
  );
}

export function ListItemClickable() {
  const [count, setCount] = useState(0);
  return (
    <DemoWrapper>
      <Stack gap={2} style={{ width: '100%', maxWidth: 320 }}>
        <div style={{ fontSize: 11, color: 'var(--etui-color-text-muted)' }}>
          Click or press Enter/Space while focused. Clicks: {count}
        </div>
        <Stack gap={1}>
          <ListItem onClick={() => setCount(c => c + 1)}>
            Increment counter
          </ListItem>
          <ListItem
            onClick={() => setCount(c => c + 1)}
            trailing={<ChevronGlyph />}
          >
            With chevron
          </ListItem>
          <ListItem
            onClick={() => setCount(c => c + 1)}
            leading={<FileGlyph />}
          >
            With leading icon
          </ListItem>
        </Stack>
      </Stack>
    </DemoWrapper>
  );
}

export function ListItemDensity() {
  return (
    <DemoWrapper>
      <div style={{ display: 'grid', gap: 16, gridTemplateColumns: '1fr 1fr' }}>
        <Stack gap={1}>
          <div
            style={{
              fontSize: 11,
              color: 'var(--etui-color-text-muted)',
            }}
          >
            comfortable — 32px
          </div>
          <ListItem density="comfortable">Item A</ListItem>
          <ListItem density="comfortable">Item B</ListItem>
          <ListItem density="comfortable">Item C</ListItem>
        </Stack>
        <Stack gap={0}>
          <div
            style={{
              fontSize: 11,
              color: 'var(--etui-color-text-muted)',
            }}
          >
            compact — 24px
          </div>
          <ListItem density="compact">Item A</ListItem>
          <ListItem density="compact">Item B</ListItem>
          <ListItem density="compact">Item C</ListItem>
        </Stack>
      </div>
    </DemoWrapper>
  );
}

export function ListItemSlots() {
  return (
    <DemoWrapper>
      <Stack gap={1} style={{ width: '100%', maxWidth: 360 }}>
        <ListItem leading={<FileGlyph />}>Leading only</ListItem>
        <ListItem trailing={<ChevronGlyph />}>Trailing only</ListItem>
        <ListItem
          leading={<FileGlyph />}
          trailing={<Badge color="success">12</Badge>}
        >
          Both slots
        </ListItem>
        <ListItem
          leading={<FileGlyph />}
          trailing={<Badge color="warning">running</Badge>}
          selected
        >
          Everything + selected
        </ListItem>
      </Stack>
    </DemoWrapper>
  );
}

export function ListItemInList() {
  const [selected, setSelected] = useState('b');
  return (
    <DemoWrapper>
      <Stack gap={1} style={{ width: '100%', maxWidth: 360 }}>
        {items.map(item => (
          <ListItem
            key={item.id}
            leading={<FileGlyph />}
            trailing={<Badge color={item.color}>{item.tag}</Badge>}
            selected={selected === item.id}
            onClick={() => setSelected(item.id)}
          >
            {item.name}
          </ListItem>
        ))}
      </Stack>
    </DemoWrapper>
  );
}
