import { describe, it, expect, vi } from 'vitest';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import { useRef } from 'react';
import { renderWithTheme } from '@/tests/testUtils';
import { AssetBrowser } from './AssetBrowser';
import type { AssetBrowserHandle, AssetItem } from './AssetBrowser.types';

const items: AssetItem[] = [
  { id: 'folder1', name: 'Textures', kind: 'folder' },
  { id: 'file1', name: 'wood.png', kind: 'file', assetType: 'image' },
  { id: 'file2', name: 'stone.png', kind: 'file', assetType: 'image' },
];

/** Focus the grid and move roving focus onto the first item (ArrowRight). */
function focusFirstCell(): HTMLElement {
  const grid = screen.getByRole('grid');
  grid.focus();
  fireEvent.keyDown(grid, { key: 'ArrowRight' });
  return grid;
}

describe('AssetBrowser — rename', () => {
  it('F2 opens an inline editor and Enter commits the new name', async () => {
    const onItemRename = vi.fn();
    renderWithTheme(<AssetBrowser items={items} onItemRename={onItemRename} />);
    const grid = focusFirstCell();

    fireEvent.keyDown(grid, { key: 'F2' });
    const input = screen.getByRole('textbox', { name: /rename/i });
    expect(input).toHaveValue('Textures');

    fireEvent.change(input, { target: { value: 'Materials' } });
    fireEvent.keyDown(input, { key: 'Enter' });

    expect(onItemRename).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'folder1' }),
      'Materials'
    );
    // Commit is async (the callback may return a Promise), so the editor closes
    // on the next microtask.
    await waitFor(() => {
      expect(
        screen.queryByRole('textbox', { name: /rename/i })
      ).not.toBeInTheDocument();
    });
  });

  it('Escape cancels without firing onItemRename', () => {
    const onItemRename = vi.fn();
    renderWithTheme(<AssetBrowser items={items} onItemRename={onItemRename} />);
    const grid = focusFirstCell();
    fireEvent.keyDown(grid, { key: 'F2' });
    const input = screen.getByRole('textbox', { name: /rename/i });
    fireEvent.change(input, { target: { value: 'Changed' } });
    fireEvent.keyDown(input, { key: 'Escape' });

    expect(onItemRename).not.toHaveBeenCalled();
    expect(
      screen.queryByRole('textbox', { name: /rename/i })
    ).not.toBeInTheDocument();
  });

  it('an unchanged or empty name closes without firing the callback', () => {
    const onItemRename = vi.fn();
    renderWithTheme(<AssetBrowser items={items} onItemRename={onItemRename} />);
    const grid = focusFirstCell();
    fireEvent.keyDown(grid, { key: 'F2' });
    const input = screen.getByRole('textbox', { name: /rename/i });
    // Commit with the same value.
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(onItemRename).not.toHaveBeenCalled();
  });

  it('keeps the editor open when onItemRename returns false (rejected)', async () => {
    const onItemRename = vi.fn().mockReturnValue(false);
    renderWithTheme(<AssetBrowser items={items} onItemRename={onItemRename} />);
    const grid = focusFirstCell();
    fireEvent.keyDown(grid, { key: 'F2' });
    const input = screen.getByRole('textbox', { name: /rename/i });
    fireEvent.change(input, { target: { value: 'bad/name' } });
    fireEvent.keyDown(input, { key: 'Enter' });

    expect(onItemRename).toHaveBeenCalled();
    // Field stays open for another attempt.
    await waitFor(() => {
      expect(
        screen.getByRole('textbox', { name: /rename/i })
      ).toBeInTheDocument();
    });
  });

  it('does not enable rename (F2 no-op) without onItemRename', () => {
    renderWithTheme(<AssetBrowser items={items} />);
    const grid = focusFirstCell();
    fireEvent.keyDown(grid, { key: 'F2' });
    expect(
      screen.queryByRole('textbox', { name: /rename/i })
    ).not.toBeInTheDocument();
  });
});

describe('AssetBrowser — delete & duplicate', () => {
  it('Delete fires onItemsDelete with the selection', () => {
    const onItemsDelete = vi.fn();
    renderWithTheme(
      <AssetBrowser
        items={items}
        selection={['file1', 'file2']}
        onItemsDelete={onItemsDelete}
      />
    );
    const grid = screen.getByRole('grid');
    fireEvent.keyDown(grid, { key: 'Delete' });
    expect(onItemsDelete).toHaveBeenCalledTimes(1);
    const arg = onItemsDelete.mock.lastCall?.[0] as AssetItem[];
    expect(arg.map(i => i.id).sort()).toEqual(['file1', 'file2']);
  });

  it('Backspace does NOT delete (reserved for parent-nav)', () => {
    const onItemsDelete = vi.fn();
    renderWithTheme(
      <AssetBrowser
        items={items}
        selection={['file1']}
        onItemsDelete={onItemsDelete}
      />
    );
    fireEvent.keyDown(screen.getByRole('grid'), { key: 'Backspace' });
    expect(onItemsDelete).not.toHaveBeenCalled();
  });

  it('Ctrl/Cmd+D fires onItemsDuplicate with the selection', () => {
    const onItemsDuplicate = vi.fn();
    renderWithTheme(
      <AssetBrowser
        items={items}
        selection={['file1']}
        onItemsDuplicate={onItemsDuplicate}
      />
    );
    fireEvent.keyDown(screen.getByRole('grid'), { key: 'd', ctrlKey: true });
    expect(onItemsDuplicate).toHaveBeenCalledTimes(1);
    const arg = onItemsDuplicate.mock.lastCall?.[0] as AssetItem[];
    expect(arg.map(i => i.id)).toEqual(['file1']);
  });
});

describe('AssetBrowser — imperative beginRename', () => {
  it('opens the inline editor for the given id', () => {
    function Harness() {
      const ref = useRef<AssetBrowserHandle>(null);
      return (
        <>
          <button
            type="button"
            onClick={() => ref.current?.beginRename('file1')}
          >
            rename-file1
          </button>
          <AssetBrowser ref={ref} items={items} onItemRename={vi.fn()} />
        </>
      );
    }
    renderWithTheme(<Harness />);
    fireEvent.click(screen.getByText('rename-file1'));
    const input = screen.getByRole('textbox', { name: /rename/i });
    expect(input).toHaveValue('wood.png');
  });
});

describe('AssetBrowser — default item actions menu', () => {
  it('auto-builds Rename/Duplicate/Delete entries from the callbacks', () => {
    renderWithTheme(
      <AssetBrowser
        items={items}
        defaultItemActions
        onItemRename={vi.fn()}
        onItemsDelete={vi.fn()}
        onItemsDuplicate={vi.fn()}
      />
    );
    // Right-click opens the menu; base-ui renders it into a portal.
    fireEvent.contextMenu(screen.getByText('wood.png'));
    expect(screen.getByText('Rename')).toBeInTheDocument();
    expect(screen.getByText('Duplicate')).toBeInTheDocument();
    expect(screen.getByText('Delete')).toBeInTheDocument();
  });

  it('passes an actions object to a custom renderItemContextMenu', () => {
    const renderItemContextMenu = vi.fn(() => <div>custom-menu</div>);
    renderWithTheme(
      <AssetBrowser
        items={items}
        onItemRename={vi.fn()}
        renderItemContextMenu={renderItemContextMenu}
      />
    );
    fireEvent.contextMenu(screen.getByText('wood.png'));
    expect(renderItemContextMenu).toHaveBeenCalled();
    const lastCall = renderItemContextMenu.mock.lastCall as
      | [AssetItem[], { rename: unknown; delete: unknown; duplicate: unknown }]
      | undefined;
    const actions = lastCall?.[1];
    expect(typeof actions?.rename).toBe('function');
    expect(typeof actions?.delete).toBe('function');
    expect(typeof actions?.duplicate).toBe('function');
  });
});

describe('AssetBrowser — create folder (empty-area menu)', () => {
  it('auto-builds a New folder entry when onCreateFolder is set', () => {
    const onCreateFolder = vi.fn();
    renderWithTheme(
      <AssetBrowser
        items={items}
        defaultItemActions
        currentFolderId="root"
        onCreateFolder={onCreateFolder}
      />
    );
    // Right-click the grid surface (empty area).
    fireEvent.contextMenu(screen.getByRole('grid'));
    const entry = screen.getByText('New folder');
    fireEvent.click(entry);
    expect(onCreateFolder).toHaveBeenCalledWith('root');
  });
});
