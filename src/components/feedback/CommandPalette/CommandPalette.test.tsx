import React from 'react';
import { fireEvent, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { renderWithTheme } from '@/tests/testUtils';
import { CommandPalette } from './CommandPalette';
import type { CommandItem } from './CommandPalette.types';

const items: CommandItem[] = [
  { id: 'open', label: 'Open File', shortcut: 'Cmd+O', group: 'File' },
  { id: 'save', label: 'Save', shortcut: 'Cmd+S', group: 'File' },
  { id: 'close', label: 'Close Tab', shortcut: 'Cmd+W', group: 'File' },
  { id: 'find', label: 'Find in Files', group: 'Search' },
  { id: 'replace', label: 'Replace', group: 'Search', disabled: true },
];

function renderCmd(
  props: Partial<React.ComponentProps<typeof CommandPalette>> = {}
) {
  const onClose = props.onClose ?? vi.fn();
  const onSelect = props.onSelect ?? vi.fn();
  return {
    ...renderWithTheme(
      <CommandPalette
        open
        onClose={onClose}
        onSelect={onSelect}
        items={items}
        testId="cmd"
        {...props}
      />
    ),
    onClose,
    onSelect,
  };
}

beforeEach(() => {
  // Force a clean localStorage between tests because useRecentItems persists.
  if (typeof window !== 'undefined') {
    window.localStorage.clear();
  }
});

describe('CommandPalette', () => {
  describe('Rendering', () => {
    it('renders nothing when closed', () => {
      const onClose = vi.fn();
      renderWithTheme(
        <CommandPalette open={false} onClose={onClose} items={items} />
      );
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('renders dialog and combobox when open', () => {
      renderCmd();
      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByRole('combobox')).toBeInTheDocument();
    });

    it('renders all items grouped', () => {
      renderCmd();
      expect(screen.getByText('Open File')).toBeInTheDocument();
      expect(screen.getByText('Save')).toBeInTheDocument();
      expect(screen.getByText('Find in Files')).toBeInTheDocument();
      // Group headers
      expect(screen.getByText('File')).toBeInTheDocument();
      expect(screen.getByText('Search')).toBeInTheDocument();
    });

    it('renders the empty state when nothing matches', () => {
      renderCmd();
      const input = screen.getByRole('combobox');
      fireEvent.change(input, { target: { value: 'zzzzzz' } });
      expect(screen.getByTestId('cmd-empty')).toBeInTheDocument();
    });
  });

  describe('Filtering', () => {
    it('narrows results as the user types', () => {
      renderCmd();
      const input = screen.getByRole('combobox');
      fireEvent.change(input, { target: { value: 'open' } });
      // Open File matches; Save and Replace do not.
      expect(screen.getByText('Open File')).toBeInTheDocument();
      expect(screen.queryByText('Save')).not.toBeInTheDocument();
    });

    it('matches by description and keywords', () => {
      const extra: CommandItem[] = [
        {
          id: 'ai',
          label: 'AI',
          description: 'Ask the assistant',
          keywords: ['chat', 'gpt'],
        },
      ];
      renderCmd({ items: extra });
      const input = screen.getByRole('combobox');
      fireEvent.change(input, { target: { value: 'gpt' } });
      expect(screen.getByText('AI')).toBeInTheDocument();
    });
  });

  describe('Keyboard navigation', () => {
    it('ArrowDown moves selection forward', () => {
      renderCmd();
      const dialog = screen.getByRole('dialog');
      const first = screen.getByTestId('cmd-item-open');
      expect(first).toHaveAttribute('aria-selected', 'true');
      fireEvent.keyDown(dialog, { key: 'ArrowDown' });
      const second = screen.getByTestId('cmd-item-save');
      expect(second).toHaveAttribute('aria-selected', 'true');
    });

    it('ArrowUp wraps to the last item from the first', () => {
      renderCmd();
      const dialog = screen.getByRole('dialog');
      fireEvent.keyDown(dialog, { key: 'ArrowUp' });
      // Last is 'replace' (disabled is still selectable for navigation? No — it's
      // included in selectableItems unless filtered out. We include disabled in the
      // list, so wrap goes to 'replace'.)
      // Actually disabled items are kept in the list (just non-selectable when chosen).
      const last = screen.getByTestId('cmd-item-replace');
      expect(last).toHaveAttribute('aria-selected', 'true');
    });

    it('Enter selects the active item, calls onSelect, and closes', () => {
      const onSelect = vi.fn();
      const onClose = vi.fn();
      renderCmd({ onSelect, onClose });
      const dialog = screen.getByRole('dialog');
      fireEvent.keyDown(dialog, { key: 'ArrowDown' }); // -> save
      fireEvent.keyDown(dialog, { key: 'Enter' });
      expect(onSelect).toHaveBeenCalledTimes(1);
      expect(onSelect.mock.calls[0]?.[0]).toMatchObject({ id: 'save' });
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('Escape closes the palette', () => {
      const onClose = vi.fn();
      renderCmd({ onClose });
      const dialog = screen.getByRole('dialog');
      fireEvent.keyDown(dialog, { key: 'Escape' });
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('Home/End jump to first and last selectable items', () => {
      renderCmd();
      const dialog = screen.getByRole('dialog');
      fireEvent.keyDown(dialog, { key: 'End' });
      expect(screen.getByTestId('cmd-item-replace')).toHaveAttribute(
        'aria-selected',
        'true'
      );
      fireEvent.keyDown(dialog, { key: 'Home' });
      expect(screen.getByTestId('cmd-item-open')).toHaveAttribute(
        'aria-selected',
        'true'
      );
    });
  });

  describe('Mouse', () => {
    it('clicking an item calls onSelect (or item.onSelect) and closes', () => {
      const onSelect = vi.fn();
      const onClose = vi.fn();
      renderCmd({ onSelect, onClose });
      fireEvent.click(screen.getByTestId('cmd-item-find'));
      expect(onSelect).toHaveBeenCalledWith(
        expect.objectContaining({ id: 'find' })
      );
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('hover updates the active selection to mirror keyboard', () => {
      renderCmd();
      fireEvent.mouseEnter(screen.getByTestId('cmd-item-find'));
      expect(screen.getByTestId('cmd-item-find')).toHaveAttribute(
        'aria-selected',
        'true'
      );
    });

    it('disabled items do not fire onSelect on click', () => {
      const onSelect = vi.fn();
      renderCmd({ onSelect });
      fireEvent.click(screen.getByTestId('cmd-item-replace'));
      expect(onSelect).not.toHaveBeenCalled();
    });

    it('item-level onSelect overrides the top-level one', () => {
      const itemSelect = vi.fn();
      const topSelect = vi.fn();
      renderCmd({
        items: [{ id: 'one', label: 'One', onSelect: itemSelect }],
        onSelect: topSelect,
      });
      fireEvent.click(screen.getByTestId('cmd-item-one'));
      expect(itemSelect).toHaveBeenCalledTimes(1);
      expect(topSelect).not.toHaveBeenCalled();
    });

    it('overlay click closes the palette', () => {
      const onClose = vi.fn();
      renderCmd({ onClose });
      fireEvent.click(screen.getByTestId('cmd-overlay'));
      expect(onClose).toHaveBeenCalledTimes(1);
    });
  });

  describe('Recent items', () => {
    it('shows a Recent group when recentKey is set and items have been used', () => {
      const onSelect = vi.fn();
      const { rerender } = renderWithTheme(
        <CommandPalette
          open
          onClose={vi.fn()}
          onSelect={onSelect}
          items={items}
          recentKey="test:recent"
          testId="cmd"
        />
      );
      // Pick "save" so it gets remembered.
      fireEvent.click(screen.getByTestId('cmd-item-save'));
      // Re-open the palette.
      rerender(
        <CommandPalette
          open
          onClose={vi.fn()}
          onSelect={onSelect}
          items={items}
          recentKey="test:recent"
          testId="cmd"
        />
      );
      expect(screen.getByText('Recent')).toBeInTheDocument();
      // The first selectable item is Save under Recent now.
      expect(screen.getAllByText('Save').length).toBeGreaterThanOrEqual(1);
    });

    it('does not render the recent group when no key is provided', () => {
      renderCmd();
      expect(screen.queryByText('Recent')).not.toBeInTheDocument();
    });
  });

  describe('Custom renderer', () => {
    it('calls renderItem when provided', () => {
      const renderItem = vi.fn((it: CommandItem) => <span>R:{it.label}</span>);
      renderCmd({ renderItem });
      expect(screen.getByText('R:Open File')).toBeInTheDocument();
      expect(renderItem).toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    it('combobox has aria-controls pointing at the listbox', () => {
      renderCmd();
      const input = screen.getByRole('combobox');
      const listbox = screen.getByRole('listbox');
      expect(input).toHaveAttribute('aria-controls', listbox.id);
    });

    it('aria-activedescendant tracks the active option', () => {
      renderCmd();
      const input = screen.getByRole('combobox');
      const dialog = screen.getByRole('dialog');
      const first = screen.getByTestId('cmd-item-open');
      expect(input).toHaveAttribute('aria-activedescendant', first.id);
      fireEvent.keyDown(dialog, { key: 'ArrowDown' });
      const second = screen.getByTestId('cmd-item-save');
      expect(input).toHaveAttribute('aria-activedescendant', second.id);
    });
  });
});
