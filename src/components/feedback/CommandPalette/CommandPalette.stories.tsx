import { useEffect, useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { CommandPalette } from './CommandPalette';
import type { CommandItem } from './CommandPalette.types';

const meta: Meta<typeof CommandPalette> = {
  title: 'Feedback/CommandPalette',
  component: CommandPalette,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Searchable command list shown as a centred floating dialog. Type to fuzzy-filter, ArrowUp/ArrowDown to navigate, Enter to run, Escape to close. The component does not bind a global hotkey — wire `useHotkey` in your app.',
      },
    },
  },
};
export default meta;

type Story = StoryObj<typeof CommandPalette>;

const editorItems: CommandItem[] = [
  {
    id: 'open',
    label: 'Open File',
    description: 'Pick a file from disk',
    shortcut: 'Cmd+O',
    group: 'File',
  },
  { id: 'save', label: 'Save', shortcut: 'Cmd+S', group: 'File' },
  { id: 'save-as', label: 'Save As…', shortcut: 'Shift+Cmd+S', group: 'File' },
  { id: 'close', label: 'Close Tab', shortcut: 'Cmd+W', group: 'File' },
  {
    id: 'find',
    label: 'Find in Files',
    shortcut: 'Shift+Cmd+F',
    group: 'Search',
  },
  {
    id: 'replace',
    label: 'Replace in Files',
    shortcut: 'Shift+Cmd+H',
    group: 'Search',
  },
  {
    id: 'goto',
    label: 'Go to Symbol…',
    description: 'Jump to a symbol in the current file',
    shortcut: 'Cmd+T',
    group: 'Navigation',
  },
  { id: 'split', label: 'Split Editor Right', group: 'Layout' },
  {
    id: 'toggle-sidebar',
    label: 'Toggle Sidebar',
    shortcut: 'Cmd+B',
    group: 'Layout',
  },
  {
    id: 'theme',
    label: 'Switch Theme',
    group: 'Preferences',
    keywords: ['dark', 'light', 'appearance'],
  },
];

export const Default: Story = {
  render: function DefaultStory() {
    const [open, setOpen] = useState(false);
    const [last, setLast] = useState<string | null>(null);
    return (
      <div style={{ padding: 24 }}>
        <button type="button" onClick={() => setOpen(true)}>
          Open command palette
        </button>
        {last && <p>Last command: {last}</p>}
        <CommandPalette
          open={open}
          onClose={() => {
            setOpen(false);
          }}
          items={editorItems}
          onSelect={item => {
            setLast(item.label);
          }}
          recentKey="storybook:command-palette"
        />
      </div>
    );
  },
};

export const WithGlobalHotkey: Story = {
  render: function HotkeyStory() {
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
      <div style={{ padding: 24 }}>
        <p>
          Press <kbd>Cmd</kbd>+<kbd>K</kbd> (or <kbd>Ctrl</kbd>+<kbd>K</kbd>) to
          open.
        </p>
        {last && <p>Last command: {last}</p>}
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
      </div>
    );
  },
};

export const Empty: Story = {
  render: function EmptyStory() {
    const [open, setOpen] = useState(true);
    return (
      <div style={{ padding: 24 }}>
        <button type="button" onClick={() => setOpen(true)}>
          Open
        </button>
        <CommandPalette
          open={open}
          onClose={() => {
            setOpen(false);
          }}
          items={[]}
          emptyState={<span>Nothing to do here yet.</span>}
        />
      </div>
    );
  },
};

export const CustomRenderer: Story = {
  render: function CustomStory() {
    const [open, setOpen] = useState(true);
    return (
      <div style={{ padding: 24 }}>
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
                fontWeight: state.selected ? 600 : 400,
              }}
            >
              <span style={{ flex: 1 }}>{item.label}</span>
              {item.shortcut && (
                <span style={{ fontSize: 12, opacity: 0.6 }}>
                  {item.shortcut}
                </span>
              )}
            </div>
          )}
        />
      </div>
    );
  },
};
