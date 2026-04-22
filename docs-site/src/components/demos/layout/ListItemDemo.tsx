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
