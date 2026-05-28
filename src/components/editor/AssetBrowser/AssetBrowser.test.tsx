import { describe, it, expect, vi } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';
import { renderWithTheme } from '@/tests/testUtils';
import { AssetBrowser } from './AssetBrowser';
import type { AssetItem, AssetPathSegment } from './AssetBrowser.types';

const items: AssetItem[] = [
  { id: 'folder1', name: 'Textures', kind: 'folder' },
  {
    id: 'file1',
    name: 'wood.png',
    kind: 'file',
    assetType: 'image',
    size: 2048,
  },
  {
    id: 'file2',
    name: 'stone.png',
    kind: 'file',
    assetType: 'image',
    size: 1024,
  },
  {
    id: 'file3',
    name: 'beep.wav',
    kind: 'file',
    assetType: 'audio',
    size: 512,
  },
];

const path: AssetPathSegment[] = [
  { id: 'root', name: 'Assets' },
  { id: 'env', name: 'Environment' },
];

describe('AssetBrowser', () => {
  describe('Rendering', () => {
    it('renders grid cells for every item by default', () => {
      renderWithTheme(<AssetBrowser items={items} />);
      expect(screen.getAllByRole('gridcell')).toHaveLength(items.length);
      expect(screen.getByText('wood.png')).toBeInTheDocument();
    });

    it('renders the breadcrumb path', () => {
      renderWithTheme(<AssetBrowser items={items} path={path} />);
      expect(screen.getByText('Assets')).toBeInTheDocument();
      expect(screen.getByText('Environment')).toBeInTheDocument();
    });

    it('renders the search field', () => {
      renderWithTheme(<AssetBrowser items={items} />);
      expect(screen.getByPlaceholderText('Search assets…')).toBeInTheDocument();
    });

    it('renders an empty state when there are no items', () => {
      renderWithTheme(<AssetBrowser items={[]} />);
      expect(screen.getByText('This folder is empty.')).toBeInTheDocument();
    });

    it('renders a custom empty state', () => {
      renderWithTheme(
        <AssetBrowser items={[]} emptyState={<div>Nothing here yet</div>} />
      );
      expect(screen.getByText('Nothing here yet')).toBeInTheDocument();
    });

    it('renders list-view column headers when view="list"', () => {
      renderWithTheme(<AssetBrowser items={items} defaultView="list" />);
      expect(screen.getByText('Name')).toBeInTheDocument();
      expect(screen.getByText('Size')).toBeInTheDocument();
      expect(screen.getByText('Modified')).toBeInTheDocument();
    });
  });

  describe('Interactions', () => {
    it('selects an item on click', () => {
      const onSelectionChange = vi.fn();
      renderWithTheme(
        <AssetBrowser items={items} onSelectionChange={onSelectionChange} />
      );
      fireEvent.click(screen.getByText('wood.png'));
      expect(onSelectionChange).toHaveBeenCalledWith(['file1'], {
        reason: 'click',
      });
    });

    it('navigates into a folder on double-click', () => {
      const onNavigate = vi.fn();
      renderWithTheme(<AssetBrowser items={items} onNavigate={onNavigate} />);
      fireEvent.doubleClick(screen.getByText('Textures'));
      expect(onNavigate).toHaveBeenCalledWith('folder1', 'open');
    });

    it('opens a file on double-click', () => {
      const onItemOpen = vi.fn();
      renderWithTheme(<AssetBrowser items={items} onItemOpen={onItemOpen} />);
      fireEvent.doubleClick(screen.getByText('wood.png'));
      expect(onItemOpen).toHaveBeenCalledWith(
        expect.objectContaining({ id: 'file1' })
      );
    });

    it('reports search input changes', () => {
      const onSearchChange = vi.fn();
      renderWithTheme(
        <AssetBrowser items={items} onSearchChange={onSearchChange} />
      );
      fireEvent.change(screen.getByPlaceholderText('Search assets…'), {
        target: { value: 'wood' },
      });
      expect(onSearchChange).toHaveBeenCalledWith('wood');
    });

    it('selects all on Ctrl+A and clears on Escape', () => {
      const onSelectionChange = vi.fn();
      renderWithTheme(
        <AssetBrowser items={items} onSelectionChange={onSelectionChange} />
      );
      const grid = screen.getByRole('grid');
      fireEvent.keyDown(grid, { key: 'a', ctrlKey: true });
      // Displayed order: folder first, then files by name asc (beep, stone, wood).
      expect(onSelectionChange).toHaveBeenLastCalledWith(
        ['folder1', 'file3', 'file2', 'file1'],
        { reason: 'selectAll' }
      );
      fireEvent.keyDown(grid, { key: 'Escape' });
      expect(onSelectionChange).toHaveBeenLastCalledWith([], {
        reason: 'clear',
      });
    });

    it('respects controlled selection', () => {
      renderWithTheme(<AssetBrowser items={items} selection={['file2']} />);
      const cell = screen.getByText('stone.png').closest('[role="gridcell"]');
      expect(cell).toHaveAttribute('aria-selected', 'true');
    });
  });

  describe('History', () => {
    it('shows Back/Forward controls only when history is enabled', () => {
      const { rerender } = renderWithTheme(<AssetBrowser items={items} />);
      expect(
        screen.queryByRole('button', { name: 'Back' })
      ).not.toBeInTheDocument();
      rerender(<AssetBrowser items={items} history />);
      expect(screen.getByRole('button', { name: 'Back' })).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: 'Forward' })
      ).toBeInTheDocument();
    });

    it('tracks a back/forward stack across folder navigation', () => {
      const onNavigate = vi.fn();
      renderWithTheme(
        <AssetBrowser
          items={items}
          history
          currentFolderId="root"
          onNavigate={onNavigate}
        />
      );
      expect(screen.getByRole('button', { name: 'Back' })).toBeDisabled();

      fireEvent.doubleClick(screen.getByText('Textures'));
      expect(onNavigate).toHaveBeenLastCalledWith('folder1', 'open');

      const back = screen.getByRole('button', { name: 'Back' });
      expect(back).toBeEnabled();
      fireEvent.click(back);
      expect(onNavigate).toHaveBeenLastCalledWith('root', 'back');

      const forward = screen.getByRole('button', { name: 'Forward' });
      expect(forward).toBeEnabled();
      fireEvent.click(forward);
      expect(onNavigate).toHaveBeenLastCalledWith('folder1', 'forward');
    });

    it('maps Backspace to "go to parent" when history is enabled', () => {
      const onNavigate = vi.fn();
      renderWithTheme(
        <AssetBrowser
          items={items}
          path={path}
          history
          onNavigate={onNavigate}
        />
      );
      fireEvent.keyDown(screen.getByRole('grid'), { key: 'Backspace' });
      expect(onNavigate).toHaveBeenLastCalledWith('root', 'breadcrumb');
    });
  });

  describe('Custom rendering', () => {
    it('keeps the cell interactive when renderItem is provided', () => {
      const onSelectionChange = vi.fn();
      renderWithTheme(
        <AssetBrowser
          items={items}
          onSelectionChange={onSelectionChange}
          renderItem={item => <div>{item.name} (custom)</div>}
        />
      );
      fireEvent.click(screen.getByText('wood.png (custom)'));
      expect(onSelectionChange).toHaveBeenCalledWith(['file1'], {
        reason: 'click',
      });
    });
  });

  describe('Accessibility', () => {
    it('exposes a multiselectable grid', () => {
      renderWithTheme(<AssetBrowser items={items} />);
      const grid = screen.getByRole('grid');
      expect(grid).toHaveAttribute('aria-multiselectable', 'true');
    });

    it('drops multiselectable in single mode', () => {
      renderWithTheme(<AssetBrowser items={items} selectionMode="single" />);
      const grid = screen.getByRole('grid');
      expect(grid).toHaveAttribute('aria-multiselectable', 'false');
    });

    it('marks grid cells with their selection state', () => {
      renderWithTheme(<AssetBrowser items={items} />);
      const cells = screen.getAllByRole('gridcell');
      cells.forEach(cell =>
        expect(cell).toHaveAttribute('aria-selected', 'false')
      );
    });
  });
});
