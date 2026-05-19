import { useEffect, useState } from 'react';
import DemoWrapper from '../DemoWrapper';
import { CommandPalette } from '@/components/feedback';
import type { CommandItem } from '@/components/feedback';
import { Button, Kbd } from '@/components/primitives';
import { Stack } from '@/components/layout';
import {
  CopyIcon,
  EditIcon,
  FolderOpenIcon,
  SaveIcon,
  SearchIcon,
  SettingsIcon,
  TrashIcon,
} from '@/components/Icons';

const editorItems: CommandItem[] = [
  {
    id: 'open',
    label: 'Open File',
    description: 'Pick a file from disk',
    shortcut: 'Cmd+O',
    icon: <FolderOpenIcon size="sm" />,
    group: 'File',
  },
  {
    id: 'save',
    label: 'Save',
    shortcut: 'Cmd+S',
    icon: <SaveIcon size="sm" />,
    group: 'File',
  },
  {
    id: 'save-as',
    label: 'Save As…',
    shortcut: 'Shift+Cmd+S',
    icon: <SaveIcon size="sm" />,
    group: 'File',
  },
  {
    id: 'duplicate',
    label: 'Duplicate',
    shortcut: 'Cmd+D',
    icon: <CopyIcon size="sm" />,
    group: 'Edit',
  },
  {
    id: 'rename',
    label: 'Rename…',
    shortcut: 'F2',
    icon: <EditIcon size="sm" />,
    group: 'Edit',
  },
  {
    id: 'delete',
    label: 'Delete',
    shortcut: 'Backspace',
    icon: <TrashIcon size="sm" />,
    group: 'Edit',
  },
  {
    id: 'find',
    label: 'Find in Files',
    shortcut: 'Shift+Cmd+F',
    icon: <SearchIcon size="sm" />,
    group: 'Search',
  },
  {
    id: 'preferences',
    label: 'Open Preferences',
    description: 'Edit workspace settings',
    shortcut: 'Cmd+,',
    icon: <SettingsIcon size="sm" />,
    group: 'Preferences',
    keywords: ['settings', 'config'],
  },
];

export default function CommandPaletteDemo() {
  const [open, setOpen] = useState(false);
  const [last, setLast] = useState<string | null>(null);

  return (
    <DemoWrapper>
      <Stack gap={3} align="flex-start">
        <Button variant="filled" onClick={() => setOpen(true)}>
          Open command palette
        </Button>
        <span style={{ fontSize: 12, color: 'var(--etui-color-text-muted)' }}>
          Last run: {last ?? 'nothing yet'}
        </span>
        <CommandPalette
          open={open}
          onClose={() => {
            setOpen(false);
          }}
          items={editorItems}
          onSelect={item => {
            setLast(item.label);
          }}
          recentKey="docs:command-palette-demo"
        />
      </Stack>
    </DemoWrapper>
  );
}

export function CommandPaletteWithHotkey() {
  const [open, setOpen] = useState(false);
  const [last, setLast] = useState<string | null>(null);

  useEffect(() => {
    function handler(e: KeyboardEvent) {
      const isCmdK = (e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k';
      if (isCmdK) {
        e.preventDefault();
        setOpen(o => !o);
      }
    }
    window.addEventListener('keydown', handler);
    return () => {
      window.removeEventListener('keydown', handler);
    };
  }, []);

  return (
    <DemoWrapper>
      <Stack gap={3} align="flex-start">
        <span style={{ fontSize: 13 }}>
          Press <Kbd size="sm">Cmd</Kbd> + <Kbd size="sm">K</Kbd> (or{' '}
          <Kbd size="sm">Ctrl</Kbd> + <Kbd size="sm">K</Kbd>) to open.
        </span>
        <span style={{ fontSize: 12, color: 'var(--etui-color-text-muted)' }}>
          Last run: {last ?? 'nothing yet'}
        </span>
        <CommandPalette
          open={open}
          onClose={() => {
            setOpen(false);
          }}
          items={editorItems}
          onSelect={item => {
            setLast(item.label);
          }}
        />
      </Stack>
    </DemoWrapper>
  );
}

export function CommandPaletteWithGroups() {
  const [open, setOpen] = useState(false);
  return (
    <DemoWrapper>
      <Stack gap={3} align="flex-start">
        <Button onClick={() => setOpen(true)}>Open palette</Button>
        <span style={{ fontSize: 12, color: 'var(--etui-color-text-muted)' }}>
          Items are sectioned by their <code>group</code> field. Items without a
          group fall into the default section.
        </span>
        <CommandPalette
          open={open}
          onClose={() => {
            setOpen(false);
          }}
          items={editorItems}
        />
      </Stack>
    </DemoWrapper>
  );
}

export function CommandPaletteEmpty() {
  const [open, setOpen] = useState(false);
  return (
    <DemoWrapper>
      <Stack gap={3} align="flex-start">
        <Button onClick={() => setOpen(true)}>Open empty palette</Button>
        <CommandPalette
          open={open}
          onClose={() => {
            setOpen(false);
          }}
          items={[]}
          emptyState="Nothing to do here yet."
        />
      </Stack>
    </DemoWrapper>
  );
}

export function CommandPaletteCustomRenderer() {
  const [open, setOpen] = useState(false);
  return (
    <DemoWrapper>
      <Stack gap={3} align="flex-start">
        <Button onClick={() => setOpen(true)}>Open with custom rows</Button>
        <CommandPalette
          open={open}
          onClose={() => {
            setOpen(false);
          }}
          items={editorItems}
          renderItem={(item, state) => (
            <div
              style={{
                display: 'flex',
                gap: 12,
                width: '100%',
                alignItems: 'center',
                fontWeight: state.selected ? 600 : 400,
              }}
            >
              <span style={{ flex: 1 }}>{item.label}</span>
              {item.shortcut && (
                <span
                  style={{
                    fontSize: 11,
                    color: 'var(--etui-color-text-muted)',
                  }}
                >
                  {item.shortcut}
                </span>
              )}
            </div>
          )}
        />
      </Stack>
    </DemoWrapper>
  );
}
